// src/components/Other_lesson5-7.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones, Volume2, Mic, MicOff, CheckCircle2, XCircle, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface SequenceCardData {
  id: string;
  imageUrl: string;
  chinese: string;
  pinyin: string;
  correctNumber: string; 
}

export interface OtherLesson5_7Data {
  id?: string;
  patternType: 'other_lesson5-7';
  mainTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: SequenceCardData[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_7Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_7({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_7Data);
  const fbKeyAnswers = `other5_7_answers_${safeData.id || 'default'}`;
  const fbKeyReveals = `other5_7_reveals_${safeData.id || 'default'}`;
  const fbKeySpeech = `other5_7_speech_${safeData.id || 'default'}`;
  const fbKeyAudio = `other5_7_audio_${safeData.id || 'default'}`; 

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Audio Player State
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  // Speech Assessment State
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string, transcriptPinyin: string }>>({});
  const recognitionRef = useRef<any>(null);

  // User Answers State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedItems, setRevealedItems] = useState<string[]>([]);

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
        if (d[fbKeyAnswers] !== undefined) setUserAnswers(d[fbKeyAnswers]);
        if (d[fbKeyReveals] !== undefined) setRevealedItems(d[fbKeyReveals]);
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        
        // รับคำสั่งเล่นเสียงจากครู (Broadcast)
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
  }, [roomPin, fbKeyAnswers, fbKeyReveals, fbKeySpeech, fbKeyAudio, safeData.audioUrl]);

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
    setRecordingId(null);
    setProcessingId(null);
  };

  const startListening = (expectedChinese: string, cardId: string) => {
    if (!expectedChinese) return;
    stopListening();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง"); return; }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false; 
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
        setRecordingId(cardId);
        setProcessingId(null);
    };

    recognition.onspeechend = () => {
      setRecordingId(null);
      setProcessingId(cardId);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();
      
      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) { if (cleanExpected.includes(cleanTranscript[i])) matchCount++; }
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;
      
      const newScores = { ...speechScores, [cardId]: { score: calculatedScore, transcript, transcriptPinyin } };
      setSpeechScores(newScores);
      setProcessingId(null);
      
      if (roomPin) {
         try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch(e) {}
      }
    };
    
    recognition.onerror = () => {
        setRecordingId(null);
        setProcessingId(null);
    };

    recognition.onend = () => {
        setRecordingId(null);
        setTimeout(() => setProcessingId(null), 1500); 
    };

    try { recognition.start(); } catch (e) { setRecordingId(null); setProcessingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleAnswerChange = async (cardId: string, value: string) => {
    const newAnswers = { ...userAnswers, [cardId]: value };
    setUserAnswers(newAnswers);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e) {}
    }
  };

  // Teacher Controls
  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    const newReveals = [...revealedItems, cardId];
    setRevealedItems(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyReveals]: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    setRevealedItems(['ALL']);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyReveals]: ['ALL'] }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคำตอบและการเฉลยทั้งหมดใช่หรือไม่?')) {
      setRevealedItems([]);
      setUserAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: {}, [fbKeyReveals]: [] }); } catch (e) {}
      }
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header & Audio Control */}
        <div className="mb-10 pl-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.mainTitle || '3. 听录音，排序。 ฟังแล้วเขียนตัวเลขตามลำดับ'}
          </div>
          
          {/* +++ STUDENT AUDIO CONTROLS (เหมือนหน้า 5-5) +++ */}
          {userRole !== 'teacher' && (
            <div className="flex flex-col gap-2 min-w-[250px] relative z-[30] pointer-events-auto">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm px-4 py-1.5 w-fit">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs tracking-wide">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || '05-03'))}
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

        {/* 2. Cards Grid (ใช้ flex-wrap จัดกึ่งกลางให้เหมือนหนังสือ) */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 py-4">
          {(safeData.cards || []).map((card) => {
            const userAnswer = userAnswers[card.id] || '';
            const isCorrect = userAnswer.trim() === card.correctNumber.trim();
            const isRevealed = revealedItems.includes(card.id) || revealedItems.includes('ALL');
            
            const isRecording = recordingId === card.id;
            const isProcessing = processingId === card.id;
            const scoreData = speechScores[card.id];

            return (
              <div key={card.id} className="relative bg-white rounded-[20px] border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center justify-start min-h-[220px] w-[260px] group">
                
                {/* --- ไอคอนตรวจคำตอบ (ขวาบน) แสดงเมื่อมีการเฉลย --- */}
                {isRevealed && (
                  <div className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-0.5 shadow-sm animate-fade-in flex flex-col items-center">
                    {isCorrect ? (
                      <CheckCircle2 className="text-emerald-500" size={36} fill="#ecfdf5" />
                    ) : (
                      <div className="relative flex flex-col items-center">
                        <XCircle className="text-red-500" size={36} fill="#fef2f2" />
                        <span className="absolute -top-3 -right-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full text-xs shadow-md">
                          {card.correctNumber}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ปุ่มเฉลยรายข้อ สำหรับครู (ซ้ายบน) */}
                {userRole === 'teacher' && !isRevealed && (
                  <button 
                    onClick={() => handleTeacherReveal(card.id)}
                    className="absolute -top-3 -left-3 bg-white border border-indigo-200 text-indigo-600 rounded-full p-1.5 shadow-sm hover:bg-indigo-50 z-30 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="เฉลยข้อนี้"
                  >
                    <Eye size={16} />
                  </button>
                )}

                {/* --- ช่องใส่ตัวเลข (ขวาล่าง) --- */}
                <input
                  type="text"
                  maxLength={2}
                  value={userAnswer}
                  onChange={(e) => handleAnswerChange(card.id, e.target.value)}
                  disabled={isRevealed}
                  className={`absolute -bottom-4 -right-4 w-[50px] h-[50px] rounded-full bg-white border-[3px] shadow-sm text-center text-2xl font-bold transition-colors focus:outline-none focus:border-orange-400 z-10 ${
                    isRevealed ? (isCorrect ? 'border-emerald-400 text-emerald-600' : 'border-red-400 text-red-600') : 'border-slate-200 text-slate-700'
                  }`}
                  placeholder="?"
                />

                {/* รูปภาพ (mix-blend-multiply) */}
                <div className="w-[110px] h-[110px] flex items-center justify-center mb-6">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.chinese} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="text-slate-300 text-xs">ไม่มีรูป</div>
                  )}
                </div>

                {/* ภาษาจีน + ไมโครโฟน */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[26px] font-serif text-slate-800 leading-tight">
                    {card.chinese}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (isRecording) stopListening(); else startListening(card.chinese, card.id); }}
                    disabled={(recordingId !== null && !isRecording) || isProcessing}
                    className={`p-1.5 rounded-full border shadow-sm flex items-center justify-center w-[28px] h-[28px] ${
                        isProcessing ? 'bg-amber-100 text-amber-600 border-amber-300 cursor-wait'
                        : isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                        : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200' 
                    }`}
                    title={isProcessing ? "กำลังประมวลผล" : isRecording ? "คลิกเพื่อหยุด" : "คลิกเพื่อฝึกพูด"}
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : isRecording ? <Mic size={14} /> : <MicOff size={14} />}
                  </button>
                </div>

                {/* Pinyin + ลำโพง */}
                <div 
                  className="flex items-center gap-1.5 text-[16px] text-indigo-600 font-sans cursor-pointer hover:text-indigo-800 transition-colors group"
                  onClick={() => speakChinese(card.chinese || card.pinyin)}
                  title="ฟังเสียง"
                >
                  <span className="tracking-wide">{card.pinyin}</span>
                  <Volume2 size={16} className="opacity-50 group-hover:opacity-100" />
                </div>

                {/* แสดงผลคะแนนไมโครโฟน */}
                {scoreData && !isRecording && (
                  <div className={`mt-3 flex items-center gap-2 w-full justify-center px-2 py-1 rounded border text-[11px] font-medium animate-fade-in ${getScoreColor(scoreData.score)}`}>
                    <div className="font-bold text-sm">{scoreData.score}%</div>
                    <div className="border-l pl-1.5 border-current/20 truncate">"{scoreData.transcriptPinyin || scoreData.transcript}"</div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* Teacher Control Panel (ใช้ดีไซน์ลอยด้านล่างแบบ 5-5/5-6) */}
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
                onClick={handleTeacherRevealAll} 
                disabled={revealedItems.includes('ALL')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedItems.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
              >
                <Eye size={14} /> เฉลยทั้งหมด
              </button>
              
              <button 
                onClick={handleTeacherReset} 
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
              >
                <RotateCcw size={14} /> ล้างกระดาน
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