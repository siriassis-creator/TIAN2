// src/components/Other_lesson5-6.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones, Volume2, Mic, MicOff, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface SideCardData {
  id: string;
  imageUrl: string;
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface CenterCardData {
  id: string;
  chinese: string;
  pinyin: string;
  translation: string;
  matchId: string; // เก็บ ID ที่ถูกต้อง (1-8)
}

export interface OtherLesson5_6Data {
  id?: string;
  patternType: 'other_lesson5-6';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  leftCards: SideCardData[];
  rightCards: SideCardData[];
  centerCards: CenterCardData[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_6Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_6({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_6Data);
  const fbKeyLines = `other5_6_lines_${safeData.id || 'default'}`;
  const fbKeyReveals = `other5_6_reveals_${safeData.id || 'default'}`;
  const fbKeySpeech = `other5_6_speech_${safeData.id || 'default'}`;
  const fbKeyAudio = `other5_6_audio_${safeData.id || 'default'}`; 
  
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // +++ Audio Player State +++
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  // Speech Assessment State (Mic)
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null); // +++ เพิ่ม State โหลดหมุนๆ +++
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string, transcriptPinyin: string }>>({});
  const recognitionRef = useRef<any>(null);

  // --- Drawing Lines State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ from: string; to: string; isCorrect: boolean }[]>([]);
  const [activeLine, setActiveLine] = useState<{ from: string; x: number; y: number } | null>(null);
  const [updateTick, setUpdateTick] = useState(0);
  
  const [revealedItems, setRevealedItems] = useState<string[]>([]); // Center IDs

  // +++ ฟังก์ชันเตรียมไฟล์เสียง +++
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
        if (d[fbKeyLines] !== undefined) setLines(d[fbKeyLines]);
        if (d[fbKeyReveals] !== undefined) setRevealedItems(d[fbKeyReveals]);
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        
        // รับคำสั่งเล่นเสียงจากครู (Broadcast) พร้อมเวลา
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
                // +++ เลื่อนแถบตามครู +++
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
  }, [roomPin, fbKeyLines, fbKeyReveals, fbKeySpeech, fbKeyAudio, safeData.audioUrl]);

  useEffect(() => {
    const handleResize = () => setUpdateTick(t => t + 1);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []);

  // +++ ปุ่มที่ 1: ฟังเองคนเดียว (Local Play / Pause) +++
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

  // +++ ปุ่มที่ 2: ครูสั่ง Broadcast ไปหานักเรียนทั้งห้อง (Play / Pause) +++
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

  // +++ ฟังก์ชันเลื่อน Slider ของไฟล์เสียง +++
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

  // +++ อัปเดตระบบไมค์ (แก้บั๊กหมุนค้าง) +++
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
      // เอา recognition.stop() ออก เพื่อให้ระบบฟังจบจริงๆ แล้วค่อยคิดคะแนน
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

    recognition.onnomatch = () => {
      setProcessingId(null);
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

  // --- Line Drawing Logic ---
  const getDotPos = (dotId: string) => {
    const el = document.getElementById(dotId);
    const cont = containerRef.current;
    if (!el || !cont) return null;
    const rect = el.getBoundingClientRect();
    const contRect = cont.getBoundingClientRect();
    return { x: rect.left - contRect.left + rect.width / 2, y: rect.top - contRect.top + rect.height / 2 };
  };

  const handlePointerDown = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    if (revealedItems.includes('ALL')) return;
    const cont = containerRef.current;
    if (!cont) return;
    const contRect = cont.getBoundingClientRect();
    setActiveLine({ from: sourceId, x: e.clientX - contRect.left, y: e.clientY - contRect.top });
  };

  const handleTargetPointerDown = (e: React.PointerEvent, targetId: string, side: 'left' | 'right') => {
    if (revealedItems.includes('ALL') || revealedItems.includes(targetId)) return;

    const connectedLine = lines.find(l => l.to === targetId && (
      (side === 'left' && ['1', '2', '3', '4'].includes(l.from)) ||
      (side === 'right' && ['5', '6', '7', '8'].includes(l.from))
    ));
    
    if (connectedLine) {
      e.stopPropagation();
      e.preventDefault();
      
      const newLines = lines.filter(l => l !== connectedLine);
      setLines(newLines);
      
      if (roomPin) {
         updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: newLines }).catch(()=>{});
      }
      
      const cont = containerRef.current;
      if (!cont) return;
      const contRect = cont.getBoundingClientRect();
      setActiveLine({ from: connectedLine.from, x: e.clientX - contRect.left, y: e.clientY - contRect.top });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeLine) return;
    const cont = containerRef.current;
    if (!cont) return;
    const contRect = cont.getBoundingClientRect();
    setActiveLine({ ...activeLine, x: e.clientX - contRect.left, y: e.clientY - contRect.top });
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!activeLine) return;
    
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = targetElement?.closest('[data-drop-id]');
    
    if (dropZone) {
      const targetId = dropZone.getAttribute('data-drop-id'); 
      const targetSide = dropZone.getAttribute('data-drop-side'); 
      const isLeftCard = ['1', '2', '3', '4'].includes(activeLine.from);
      
      if (targetId && ((isLeftCard && targetSide === 'left') || (!isLeftCard && targetSide === 'right'))) {
        const centerCard = safeData.centerCards?.find(c => c.id === targetId);
        if (centerCard) {
          const isCorrect = centerCard.matchId === activeLine.from;
          const newLines = lines.filter(l => {
              if (l.from === activeLine.from) return false;
              const lIsLeft = ['1', '2', '3', '4'].includes(l.from);
              if (l.to === targetId && lIsLeft === isLeftCard) return false;
              return true;
          });
          newLines.push({ from: activeLine.from, to: targetId, isCorrect });
          
          setLines(newLines);
          if (roomPin) {
             try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: newLines }); } catch(err){}
          }
        }
      }
    }
    setActiveLine(null);
  };
  
  // Teacher Reveal
  const handleTeacherReveal = async (centerId: string) => {
    if (userRole !== 'teacher') return;
    const newReveals = [...revealedItems, centerId];
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
    if (window.confirm('ต้องการล้างเส้นและการพูดทั้งหมดใช่หรือไม่?')) {
      setLines([]);
      setRevealedItems([]);
      setSpeechScores({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: [], [fbKeyReveals]: [], [fbKeySpeech]: {} }); } catch (e) {}
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
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header & Student Audio Control */}
        <div className="mb-10 pl-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || '2. 听录音，连一连。 ฝึกฟังแล้วโยงเส้นจับคู่'}
          </div>
          
          {/* +++ AUDIO CONTROLS (STUDENT ONLY) +++ */}
          {userRole !== 'teacher' && (
            <div className="flex flex-col gap-2 min-w-[250px] relative z-[30] pointer-events-auto">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm px-4 py-1.5 w-fit">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs tracking-wide">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || '05-02'))}
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
        
        {/* Instruction */}
        {!revealedItems.includes('ALL') && (
          <div className="text-center text-orange-500 text-[11px] md:text-[12px] font-bold animate-pulse mb-6 bg-orange-50 py-1.5 rounded-lg max-w-md mx-auto">
            👆 แตะที่จุดวงกลม แล้วลากเส้นไปหาคำตอบที่ถูกต้อง
          </div>
        )}

        {/* 2. Game Board (3 Columns + SVG Overlay) */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-full max-w-[1000px] mx-auto grid grid-cols-[1.2fr_1.5fr_1.2fr] gap-6 md:gap-12 touch-none select-none z-[20]"
        >
          {/* SVG OVERLAY FOR LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[10] overflow-visible">
            
            {/* Completed Lines (พร้อมไอคอนตรวจคำตอบกลางเส้น) */}
            {lines.map((line, i) => {
              const isLeft = ['1', '2', '3', '4'].includes(line.from);
              const startPos = getDotPos(`dot-start-${line.from}`);
              const endPos = getDotPos(`dot-target-${isLeft ? 'left' : 'right'}-${line.to}`);
              if (!startPos || !endPos) return null;
              
              const isRevealed = revealedItems.includes('ALL') || revealedItems.includes(line.to);
              let strokeColor = '#94a3b8'; // default (not revealed)
              if (isRevealed) {
                 strokeColor = line.isCorrect ? '#34d399' : '#f87171'; // เขียว ถูก / แดง ผิด
              }
              
              // คำนวณจุดกึ่งกลางของเส้น สำหรับวางไอคอน (เฉพาะตอนเฉลย)
              const midX = (startPos.x + endPos.x) / 2;
              const midY = (startPos.y + endPos.y) / 2;
              
              return (
                <g key={i}>
                  {/* เส้นหลัก */}
                  <line 
                    x1={startPos.x} y1={startPos.y} 
                    x2={endPos.x} y2={endPos.y} 
                    stroke={strokeColor} 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="drop-shadow-sm transition-colors duration-300"
                  />
                  
                  {/* ไอคอนตรวจคำตอบ กลางเส้น */}
                  {isRevealed && (
                    <g transform={`translate(${midX}, ${midY})`} className="drop-shadow-md transition-all duration-300">
                      {/* วงกลมพื้นหลัง */}
                      <circle cx="0" cy="0" r="12" fill="white" stroke={strokeColor} strokeWidth="2" />
                      {/* เครื่องหมายถูก / ผิด */}
                      {line.isCorrect ? (
                        <path d="M-4.5 1 L-1.5 4.5 L5.5 -3.5" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <path d="M-4 -4 L4 4 M-4 4 L4 -4" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Active Drawing Line */}
            {activeLine && (() => {
              const startPos = getDotPos(`dot-start-${activeLine.from}`);
              if (!startPos) return null;
              return (
                <line 
                  x1={startPos.x} y1={startPos.y} 
                  x2={activeLine.x} y2={activeLine.y} 
                  stroke="#f97316" 
                  strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8"
                />
              );
            })()}
          </svg>

          {/* COLUMN 1 (Left: IDs 1-4) */}
          <div className="flex flex-col gap-6">
            {(safeData.leftCards || []).map(card => (
              <div key={card.id} className="relative bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[200px] transition-transform hover:-translate-y-1">
                <div className="w-[120px] h-[120px] flex items-center justify-center mb-3">
                  {card.imageUrl && <img src={card.imageUrl} alt={card.chinese} className="max-w-full max-h-full object-contain mix-blend-multiply pointer-events-none" />}
                </div>
                {card.chinese && <div className="text-[26px] font-serif text-slate-800 leading-tight">{card.chinese}</div>}
                {card.pinyin && <div className="text-[16px] text-slate-500 mt-1 tracking-wide">{card.pinyin}</div>}
                
                {/* Source Dot (Right Side) */}
                <div 
                  id={`dot-start-${card.id}`}
                  onPointerDown={(e) => handlePointerDown(e, card.id)}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-50 border-[3px] border-indigo-300 flex items-center justify-center cursor-crosshair z-[20] shadow-sm hover:scale-125 transition-transform pointer-events-auto"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMN 2 (Center: IDs A-H) */}
          <div className="flex flex-col gap-4 justify-between py-2 pointer-events-auto">
            {(safeData.centerCards || []).map((card) => {
              const connectedLines = lines.filter(l => l.to === card.id);
              
              const isRevealed = revealedItems.includes('ALL') || revealedItems.includes(card.id);
              let cardBg = 'bg-white border-slate-200';
              if (connectedLines.length > 0) {
                if (isRevealed) {
                    const isAllCorrect = connectedLines.every(l => l.isCorrect);
                    cardBg = isAllCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300';
                } else {
                    cardBg = 'bg-indigo-50/30 border-indigo-200';
                }
              }
              
              const isRecording = recordingId === card.id;
              const isProcessing = processingId === card.id;
              const scoreData = speechScores[card.id];

              return (
                <div key={card.id} className={`relative rounded-xl border shadow-sm p-3 flex flex-col items-center justify-center min-h-[75px] transition-colors duration-300 ${cardBg}`}>
                  
                  {/* Drop Zone Left (รับเส้นจาก Col 1 ซ้าย) */}
                  <div 
                    data-drop-id={card.id} 
                    data-drop-side="left"
                    onPointerDown={(e) => handleTargetPointerDown(e, card.id, 'left')}
                    className="absolute -left-6 top-0 bottom-0 w-10 flex items-center justify-center z-[20] cursor-pointer hover:scale-125 transition-transform"
                  >
                    <div id={`dot-target-left-${card.id}`} className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm pointer-events-none"></div>
                  </div>

                  {/* Drop Zone Right (รับเส้นจาก Col 3 ขวา) */}
                  <div 
                    data-drop-id={card.id} 
                    data-drop-side="right"
                    onPointerDown={(e) => handleTargetPointerDown(e, card.id, 'right')}
                    className="absolute -right-6 top-0 bottom-0 w-10 flex items-center justify-center z-[20] cursor-pointer hover:scale-125 transition-transform"
                  >
                    <div id={`dot-target-right-${card.id}`} className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm pointer-events-none"></div>
                  </div>

                  {/* เนื้อหาการ์ดตรงกลาง */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2 relative z-[5] w-full">
                    <div className="text-[22px] font-serif text-slate-800 leading-tight flex items-center justify-center gap-2 w-full text-center">
                      {card.chinese}
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
                    <div 
                      className="text-[16px] mt-1 text-indigo-600 font-sans cursor-pointer hover:text-indigo-800 flex items-center justify-center gap-1.5 w-full text-center"
                      onClick={() => speakChinese(card.chinese || card.pinyin)}
                      title="ฟังเสียง"
                    >
                      {card.pinyin} <Volume2 size={14} className="opacity-60" />
                    </div>

                    {/* แสดงผลคะแนน */}
                    {!isRecording && scoreData && (
                      <div className={`mt-2 flex items-center justify-center gap-2 w-full px-2 py-0.5 rounded border text-[11px] font-medium animate-fade-in ${getScoreColor(scoreData.score)}`}>
                        <div className="font-bold">{scoreData.score}%</div>
                        <div className="border-l pl-1.5 border-current/20 truncate max-w-[100px]">"{scoreData.transcriptPinyin || scoreData.transcript}"</div>
                      </div>
                    )}
                  </div>

                  {/* ปุ่มเฉลยรายข้อ สำหรับครู (แสดงตรงมุมขวาบนของการ์ด) */}
                  {userRole === 'teacher' && !isRevealed && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTeacherReveal(card.id); }}
                      className="absolute -top-3 -right-2 bg-white border border-indigo-200 text-indigo-600 rounded-full p-1 shadow-sm hover:bg-indigo-50 z-30 transition-transform hover:scale-110"
                      title="เฉลยข้อนี้"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* COLUMN 3 (Right: IDs 5-8) */}
          <div className="flex flex-col gap-6">
            {(safeData.rightCards || []).map(card => (
              <div key={card.id} className="relative bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[200px] transition-transform hover:-translate-y-1">
                <div className="w-[120px] h-[120px] flex items-center justify-center mb-3">
                  {card.imageUrl && <img src={card.imageUrl} alt={card.chinese} className="max-w-full max-h-full object-contain mix-blend-multiply pointer-events-none" />}
                </div>
                {card.chinese && <div className="text-[26px] font-serif text-slate-800 leading-tight">{card.chinese}</div>}
                {card.pinyin && <div className="text-[16px] text-slate-500 mt-1 tracking-wide">{card.pinyin}</div>}
                
                {/* Source Dot (Left Side) */}
                <div 
                  id={`dot-start-${card.id}`}
                  onPointerDown={(e) => handlePointerDown(e, card.id)}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-sky-50 border-[3px] border-sky-300 flex items-center justify-center cursor-crosshair z-[20] shadow-sm hover:scale-125 transition-transform pointer-events-auto"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>

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