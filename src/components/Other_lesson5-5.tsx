// src/components/Other_lesson5-5.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones, Volume2, Mic, MicOff, Loader2, RotateCcw } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface FlipCardData {
  imageUrl: string;
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface OtherLesson5_5Data {
  id?: string;
  patternType: 'other_lesson5-5';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: FlipCardData[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_5Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

interface ScoreData {
  score: number;
  transcript: string;
  transcriptPinyin: string;
}

export default function OtherLesson5_5({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_5Data);
  const safeCards = safeData.cards || [];

  const firebaseKey = `other5_5_scores_${safeData.id || 'default'}`;
  const fbKeyAudio = `other5_5_audio_${safeData.id || 'default'}`; 

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Audio Player State
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  // Speech Assessment State
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [processingIdx, setProcessingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, { teacher?: ScoreData, student?: ScoreData }>>({});
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
        
        // Sync Scores
        if (d[firebaseKey] !== undefined) setSpeechScores(d[firebaseKey]);
        
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
            } else if (audioCmd.action === 'SEEK') {
              if (audioCmd.currentTime !== undefined) {
                  audio.currentTime = audioCmd.currentTime;
                  if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
              }
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, firebaseKey, fbKeyAudio, safeData.audioUrl]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []);

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

  const toggleBroadcastAudio = async () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    if (userRole !== 'teacher' || !roomPin) return;

    const newAction = playbackState === 'broadcast_playing' ? 'PAUSE' : 'PLAY';
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0; 
    
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), {
        [fbKeyAudio]: { action: newAction, ts: Date.now(), currentTime }
      });
    } catch(e) {}
  };

  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = Number(e.target.value);
      setProgress(newProgress);

      const audio = initAudio();
      if (audio && audio.duration) {
          const newTime = (newProgress / 100) * audio.duration;
          audio.currentTime = newTime;
          
          if (userRole === 'teacher' && roomPin && playbackState === 'broadcast_playing') {
              try {
                  await updateDoc(doc(db, 'live_sessions', roomPin), {
                      [fbKeyAudio]: { action: 'SEEK', ts: Date.now(), currentTime: newTime }
                  });
              } catch (err) {}
          }
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
    setProcessingIdx(null);
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
    recognition.continuous = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecordingIdx(idx);
      setProcessingIdx(null);
    };

    recognition.onspeechend = () => {
      recognition.stop(); 
      setRecordingIdx(null);
      setProcessingIdx(idx); 
    };

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
      
      const currentCardScores = speechScoresRef.current[idx] || {};
      const newScores = { 
        ...speechScoresRef.current, 
        [idx]: { ...currentCardScores, [userRole]: newScoreData }
      };
      
      setSpeechScores(newScores);
      setProcessingIdx(null);

      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [firebaseKey]: newScores }); } catch (e) {}
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Error:", e.error);
      setRecordingIdx(null);
      setProcessingIdx(null);
    };

    recognition.onend = () => {
      setRecordingIdx(null);
      setTimeout(() => setProcessingIdx(null), 1500); 
    };

    try { recognition.start(); } catch (e) { 
        setRecordingIdx(null); 
        setProcessingIdx(null); 
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคะแนนการพูดทั้งหมดใช่หรือไม่?')) {
      setSpeechScores({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [firebaseKey]: {} }); } catch (e) {}
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลการ์ดคำศัพท์...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header 1 (ป้ายส้ม) */}
        <div className="mb-6 pl-4 flex items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-orange-400 border-2 border-orange-100">
            <Headphones size={36} />
          </div>
          <div className="inline-flex items-center justify-center bg-orange-300/80 rounded-full px-8 py-2.5 shadow-sm relative overflow-hidden">
            <span className="relative text-2xl font-bold text-white tracking-wide font-sans drop-shadow-md">
              {safeData.mainTitle || '听一听 มาฝึกฟังกัน'}
            </span>
          </div>
        </div>

        {/* 2. Subtitle & Student Audio Control */}
        <div className="mb-10 pl-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || '1. 听录音，跟读，熟读下列词语。 ฟังแล้วอ่านตาม จากนั้นเรียนรู้คำศัพท์'}
          </div>
          
          {/* AUDIO CONTROLS (STUDENT ONLY) */}
          {userRole !== 'teacher' && (
            <div className="flex flex-col gap-2 min-w-[250px] relative z-[30] pointer-events-auto">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm px-4 py-1.5 w-fit">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs tracking-wide">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || '05-01'))}
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

        {/* 3. Cards Section (Grid 4 Columns) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 pb-4 relative z-[20] pointer-events-auto">
          {safeCards.map((card, idx) => {
            const isRecording = recordingIdx === idx;
            const isProcessing = processingIdx === idx;
            const scoreData = speechScores[idx];
            
            const flipClass = isRecording || isProcessing ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]';

            return (
              <div key={idx} className="group [perspective:1000px] h-[340px] w-full cursor-pointer">
                <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${flipClass} shadow-md hover:shadow-xl rounded-2xl`}>
                  
                  {/* === FRONT OF CARD === */}
                  <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-between p-6">
                    
                    {/* ป้ายคะแนนด้านหน้าการ์ด */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                      {scoreData?.teacher && (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold shadow-sm bg-white/90 backdrop-blur-sm ${getScoreColor(scoreData.teacher.score)}`} title="คะแนนของคุณครู">
                          <span className="text-sm leading-none">👩‍🏫</span> 
                          <span>{scoreData.teacher.score}%</span>
                        </div>
                      )}
                      {scoreData?.student && (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold shadow-sm bg-white/90 backdrop-blur-sm ${getScoreColor(scoreData.student.score)}`} title="คะแนนของนักเรียน">
                          <span className="text-sm leading-none">🧒</span> 
                          <span>{scoreData.student.score}%</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-[160px] flex items-center justify-center overflow-hidden mb-4 mt-2">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt="vocab" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-slate-300 text-sm">ไม่มีรูปภาพ</div>
                      )}
                    </div>
                    <div className="text-[32px] font-serif text-slate-800 leading-none text-center w-full">
                      {card.chinese}
                    </div>
                    <div className="text-[12px] text-slate-400 font-sans mt-2 animate-pulse">
                      Hover to flip ↺
                    </div>
                  </div>

                  {/* === BACK OF CARD === */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-orange-50 to-white rounded-2xl border border-orange-200 flex flex-col items-center justify-center p-4 md:p-6 gap-3 md:gap-4">
                    
                    <div className="flex flex-col items-center gap-1.5 md:gap-2 mt-2">
                      <div className="text-[28px] md:text-[32px] font-serif text-slate-800 leading-none text-center">
                        {card.chinese}
                      </div>
                      <button 
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full"
                        onClick={(e) => { e.stopPropagation(); speakChinese(card.chinese || card.pinyin); }}
                        title="ฟังเสียงคำศัพท์"
                      >
                        <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[16px] md:text-[20px] font-sans tracking-wide leading-none">{card.pinyin}</span>
                      </button>
                    </div>

                    <div className="text-[14px] md:text-[16px] font-sans text-slate-700 font-medium text-center leading-tight">
                      {card.translation}
                    </div>

                    {/* Mic Assessment */}
                    <div className="flex flex-col items-center w-full gap-2 mt-auto pb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isRecording) {
                            stopListening();
                          } else {
                            startListening(card.chinese, idx);
                          }
                        }}
                        disabled={(recordingIdx !== null && !isRecording) || isProcessing}
                        className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all border shadow-sm ${
                          isProcessing
                          ? 'bg-amber-100 text-amber-600 border-amber-300 cursor-wait'
                          : isRecording 
                          ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' 
                          : recordingIdx !== null 
                            ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                            : 'bg-white text-emerald-500 hover:bg-emerald-50 border-emerald-200 hover:scale-105'
                        }`}
                        title={isProcessing ? "กำลังประมวลผล..." : isRecording ? "กำลังบันทึกเสียง (คลิกเพื่อหยุด)" : "คลิกเพื่อฝึกออกเสียง"}
                      >
                        {isProcessing ? <Loader2 size={20} className="animate-spin md:w-6 md:h-6" /> : isRecording ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
                      </button>

                      {/* Score Result Container */}
                      {!isRecording && scoreData && (
                        <div className="flex w-full gap-2 mt-1 px-1 overflow-hidden">
                          {scoreData.teacher && (
                            <div className={`flex-1 flex flex-col items-center p-1.5 md:p-2 rounded-lg border text-sm font-medium animate-fade-in bg-white/50 ${getScoreColor(scoreData.teacher.score)}`}>
                              <div className="flex items-center gap-1 font-bold text-sm md:text-base leading-none mb-1">
                                <span>👩‍🏫</span> {scoreData.teacher.score}%
                              </div>
                              <div className="text-[10px] md:text-[11px] leading-tight text-center line-clamp-2">
                                "{scoreData.teacher.transcriptPinyin}"
                              </div>
                            </div>
                          )}
                          {scoreData.student && (
                            <div className={`flex-1 flex flex-col items-center p-1.5 md:p-2 rounded-lg border text-sm font-medium animate-fade-in bg-white/50 ${getScoreColor(scoreData.student.score)}`}>
                              <div className="flex items-center gap-1 font-bold text-sm md:text-base leading-none mb-1">
                                <span>🧒</span> {scoreData.student.score}%
                              </div>
                              <div className="text-[10px] md:text-[11px] leading-tight text-center line-clamp-2">
                                "{scoreData.student.transcriptPinyin}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

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
            
            {/* โซนที่ 3: เฉลยและล้างกระดาน */}
            <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <button 
                onClick={handleTeacherReset} 
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
              >
                <RotateCcw size={14} /> ล้างคะแนนการพูดทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Sidebar */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden z-[40] ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
        <div className="flex items-center justify-between mb-4 shrink-0 text-left">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Note</span>
          <button onClick={() => setIsNoteOpen(false)} className="text-amber-300 hover:text-amber-600"><X size={16} /></button>
        </div>
        <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="จดบันทึก..." className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4" />
        <button onClick={() => { onUpdateNote?.(tempNote); alert('Saved'); }} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm">SAVE NOTE</button>
      </div>
    </div>
  );
}