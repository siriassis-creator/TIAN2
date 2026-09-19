// src/components/Other_lesson5-14.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, BookOpen, Volume2, Mic, MicOff, RotateCcw, Headphones, MessageSquareText } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText'; // +++ Import FloatingLiveText

export interface StoryLine {
  chinese: string;
  pinyin: string;
}

export interface OtherLesson5_14Data {
  id?: string;
  patternType: 'other_lesson5-14';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  imageUrl: string;
  lines: StoryLine[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_14Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_14({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_14Data);
  const safeLines = safeData.lines || [];

  const fbKeyAudio = `other5_14_audio_${safeData.id || 'default'}`; 
  const fbKeySpeech = `other5_14_speech_${safeData.id || 'default'}`;
  const fbKeyHighlight = `other5_14_highlight_${safeData.id || 'default'}`; 

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Audio Player State
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  // Speech & Highlight State
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, any>>({});
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const speechScoresRef = useRef(speechScores);

  useEffect(() => {
    speechScoresRef.current = speechScores;
  }, [speechScores]);

  // ฟังก์ชันเตรียมไฟล์เสียง
  const initAudio = () => {
    if (!audioRef.current && safeData.audioUrl) {
      const audio = new Audio(safeData.audioUrl);
      audio.loop = false;
      audio.onended = () => {
        setPlaybackState('idle');
        setProgress(0);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onerror = () => {
        setPlaybackState('idle');
        audioRef.current = null;
        console.error('Audio load error');
      };
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        
        // Sync Scores & Highlight
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        if (d[fbKeyHighlight] !== undefined) setActiveHighlight(d[fbKeyHighlight]);
        
        // Sync Audio Broadcast
        const audioCmd = d[fbKeyAudio];
        if (audioCmd && audioCmd.ts !== lastSignalTs.current) {
          lastSignalTs.current = audioCmd.ts;
          const audio = initAudio();
          if (audio) {
            if (audioCmd.action === 'PLAY') {
              if (Math.abs(audio.currentTime - (audioCmd.currentTime || 0)) > 1) {
                audio.currentTime = audioCmd.currentTime || 0;
              }
              if (audio.currentTime === audio.duration) audio.currentTime = 0;
              
              audio.play().then(() => {
                setPlaybackState('broadcast_playing');
              }).catch(e => console.log('Autoplay error:', e)); 
            } else if (audioCmd.action === 'PAUSE') {
              audio.pause();
              if (audioCmd.currentTime !== undefined) {
                audio.currentTime = audioCmd.currentTime;
                if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
              }
              setPlaybackState('idle');
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAudio, fbKeySpeech, fbKeyHighlight, safeData.audioUrl]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []);

  // ฟังก์ชันเลื่อนเวลา (Scrubbing)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      
      // ถ้ากำลัง Broadcast อยู่ แล้วครูเลื่อนเวลา ให้ส่งเวลาใหม่ไปให้เด็กๆ ด้วย
      if (playbackState === 'broadcast_playing' && userRole === 'teacher' && roomPin) {
        updateDoc(doc(db, 'live_sessions', roomPin), {
          [fbKeyAudio]: { action: 'PLAY', ts: Date.now(), currentTime: newTime }
        }).catch(err => console.error(err));
      }
    }
  };

  // ปุ่มที่ 1: ฟังเองคนเดียว (Local Play / Pause)
  const toggleLocalAudio = () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    const audio = initAudio();
    if (!audio) return;
    
    if (playbackState === 'local_playing') {
      audio.pause();
      setPlaybackState('idle');
    } else {
      if (audio.currentTime === audio.duration) audio.currentTime = 0;
      audio.play().then(() => setPlaybackState('local_playing'));
    }
  };

  // ปุ่มที่ 2: ครูสั่ง Broadcast ไปหานักเรียนทั้งห้อง (Play / Pause)
  const toggleBroadcastAudio = async () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    if (userRole !== 'teacher' || !roomPin) return;

    const newAction = playbackState === 'broadcast_playing' ? 'PAUSE' : 'PLAY';
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0; 
    
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), {
        [fbKeyAudio]: { action: newAction, ts: Date.now(), currentTime }
      });
    } catch(e) {
      console.error("Broadcast audio error", e);
    }
  };

  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingIdx(null);
  };

  const startListening = (expectedChinese: string, idx: number) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingIdx(idx);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      const newScoreData = { score: calculatedScore, transcript, transcriptPinyin };
      const currentIdxScores = speechScoresRef.current[idx] || {};
      
      const newScores = { 
        ...speechScoresRef.current, 
        [idx]: { ...currentIdxScores, [userRole]: newScoreData }
      };

      setSpeechScores(newScores);

      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch (e) {}
      }
    };
    
    recognition.onerror = () => setRecordingIdx(null);
    recognition.onend = () => setRecordingIdx(null);

    try { recognition.start(); } catch (e) { setRecordingIdx(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // ฟังก์ชันสำหรับครูกดไฮไลต์บรรทัด
  const handleTeacherHighlight = async (idx: number) => {
    if (userRole !== 'teacher') return;
    
    // ถ้ากดซ้ำบรรทัดเดิม ให้เอาไฮไลต์ออก
    const newHighlight = activeHighlight === idx ? null : idx;
    setActiveHighlight(newHighlight);
    
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyHighlight]: newHighlight }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคะแนนและไฮไลต์ทั้งหมดใช่หรือไม่?')) {
      setSpeechScores({});
      setActiveHighlight(null);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: {}, [fbKeyHighlight]: null }); } catch (e) {}
      }
    }
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลบทอ่าน...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24 min-h-[600px]">
        
        {/* 1. Header 1 (ป้ายส้ม) */}
        <div className="mb-4 pl-4 flex items-center gap-4 relative z-[30] pointer-events-auto">
          <div className="bg-white p-2 rounded-full shadow-sm text-orange-400 border-2 border-orange-100">
            <BookOpen size={30} />
          </div>
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm relative overflow-hidden">
            <span className="relative text-xl md:text-2xl font-bold text-white tracking-wide font-sans drop-shadow-md">
              {safeData.mainTitle || '读一读 สนุกกับการอ่าน'}
            </span>
          </div>
        </div>

        {/* 2. Subtitle & Student Audio Control */}
        <div className="mb-10 pl-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || '1. 读一读，判断对错。 ฝึกอ่านแล้วพิจารณาว่าถูกหรือผิด'}
          </div>
          
          {/* AUDIO CONTROLS (STUDENT ONLY) */}
          {userRole !== 'teacher' && (
            <div className="flex flex-col gap-2 min-w-[250px] relative z-[30] pointer-events-auto">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm px-4 py-1.5 w-fit">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs tracking-wide">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || '05-14'))}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2 px-2">
                  <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress} 
                      onChange={handleSeek}
                      disabled={playbackState === 'broadcast_playing'} 
                      className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500
                          ${playbackState === 'broadcast_playing' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                  />
              </div>
            </div>
          )}
        </div>

        {/* 3. Main Content (แบ่ง 2 คอลัมน์: เนื้อเรื่อง ซ้าย / รูปภาพ ขวา) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 pb-4">
          
          {/* ฝั่งซ้าย: เนื้อเรื่องทีละบรรทัด (ลดช่องไฟ) */}
          <div className="flex-1 space-y-1 relative z-[20] pointer-events-auto">
            {safeLines.map((line, idx) => {
              const isRecording = recordingIdx === idx;
              const scoreData = speechScores[idx] || {};
              const isHighlighted = activeHighlight === idx; 

              return (
                <div 
                  key={idx} 
                  onClick={() => handleTeacherHighlight(idx)} 
                  className={`group relative flex items-center justify-between gap-3 py-1.5 px-3 rounded-xl border transition-all ${userRole === 'teacher' ? 'cursor-pointer' : ''} ${
                    isHighlighted 
                    ? 'bg-orange-50 border-orange-200 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'
                  }`}
                >
                  
                  {/* Text */}
                  <div className="flex-1">
                    <div className="text-[22px] md:text-[24px] font-serif text-slate-800 leading-tight tracking-wide">
                      {line.chinese}
                    </div>
                    <div className="text-[13px] md:text-[14px] text-slate-500 font-sans mt-0.5">
                      {line.pinyin}
                    </div>
                  </div>

                  {/* Actions (Speaker & Mic & Scores) */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    
                    {/* ผลคะแนน (แยกครู/นักเรียน) */}
                    <div className="flex gap-1 mr-1">
                      {scoreData.teacher && userRole === 'teacher' && (
                        <div className={`px-2 py-0.5 rounded border text-[11px] font-bold animate-fade-in ${getScoreColor(scoreData.teacher.score)}`}>
                          👩‍🏫 {scoreData.teacher.score}%
                        </div>
                      )}
                      {scoreData.student && (
                        <div className={`px-2 py-0.5 rounded border text-[11px] font-bold animate-fade-in ${getScoreColor(scoreData.student.score)}`}>
                          🧒 {scoreData.student.score}%
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakChinese(line.chinese); }}
                      className={`p-2 rounded-full transition-colors shadow-sm ${isHighlighted ? 'bg-orange-200 text-orange-700 hover:bg-orange-300' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}`}
                      title="ฟังเสียง"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (isRecording) stopListening(); else startListening(line.chinese, idx); }}
                      disabled={recordingIdx !== null && !isRecording}
                      className={`p-2 rounded-full transition-all shadow-sm border ${
                        isRecording 
                        ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' 
                        : recordingIdx !== null 
                          ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                          : isHighlighted
                            ? 'bg-white text-orange-600 border-orange-300 hover:bg-orange-100 hover:scale-105'
                            : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:scale-105'
                      }`}
                      title="ฝึกพูดประโยคนี้"
                    >
                      {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* ฝั่งขวา: รูปภาพประกอบ */}
          <div className="w-full lg:w-[450px] shrink-0 flex flex-col items-center pt-2 relative z-[10] pointer-events-none">
            {safeData.imageUrl ? (
              <img 
                src={safeData.imageUrl} 
                alt="Story Illustration" 
                className="w-full h-auto max-h-[400px] rounded-3xl shadow-lg border-4 border-white object-contain"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพประกอบ
              </div>
            )}
          </div>

        </div>

      </div>

      {/* +++ กระดานศัพท์สำหรับนักเรียน +++ */}
      {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

      {/* +++ Teacher Control Panel +++ */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-24 md:bottom-28 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 md:py-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
            
            {/* โซนที่ 1: ชื่อแผงควบคุม */}
            <div className="flex flex-col items-center md:items-start shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">เครื่องมือจัดการห้องเรียน</span>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>

            {/* โซนที่ 2: เครื่องมือเสียงครู */}
            <div className="flex flex-col gap-2 w-full md:w-[280px]">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-inner">
                  <button 
                    onClick={toggleLocalAudio} 
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 flex-1 rounded-full transition-all ${playbackState === 'local_playing' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
                  >
                    {playbackState === 'local_playing' ? <PauseCircle size={14}/> : <Headphones size={14}/>}
                    <span className="text-[10px] font-bold">
                      {progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : 'ฟังเอง'}
                    </span>
                  </button>
                  <button 
                    onClick={toggleBroadcastAudio} 
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 flex-1 rounded-full transition-all ${playbackState === 'broadcast_playing' ? 'bg-orange-500 text-white font-bold shadow-md' : 'text-orange-600 hover:bg-orange-100 font-bold'}`}
                  >
                    {playbackState === 'broadcast_playing' ? <Volume2 size={14} className="animate-pulse"/> : <PlayCircle size={14}/>}
                    <span className="text-[10px]">
                      {playbackState === 'broadcast_playing' ? 'กระจายเสียง...' : (progress > 0 && progress < 100 ? 'กระจายต่อ' : 'เปิดให้ทุกคน')}
                    </span>
                  </button>
              </div>
              <div className="flex items-center px-3">
                  <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress || 0} 
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            
            {/* โซนที่ 3: กระดาน และ ล้างข้อมูล */}
            <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <FloatingLiveText roomPin={roomPin} userRole={userRole} />

              <button 
                onClick={handleTeacherReset} 
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
                title="ล้างคะแนนการพูดและไฮไลต์"
              >
                <RotateCcw size={14} /> ล้างกระดาน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}