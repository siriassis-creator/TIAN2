// src/components/Other_lesson5-10.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, User, RotateCcw, Loader2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText'; // +++ ดึงกระดานเข้ามาใช้เฉพาะในสไลด์ +++

export interface DialogueNode {
  id: string;
  speaker: 'left' | 'right';
  chinese: string;
  pinyin: string;
  avatarUrl?: string; 
  colorTheme: 'green' | 'orange';
}

export interface WebNode {
  id: string;
  chinese: string;
  pinyin: string;
  imageUrl?: string;
  imagePos?: 'right' | 'bottom';
}

export interface WordRowData {
  id: string;
  center: { chinese: string; pinyin: string; };
  nodes: WebNode[];
}

export interface OtherLesson5_10Data {
  id?: string;
  patternType: 'other_lesson5-10';
  mainTitle: string;
  dialogues: DialogueNode[];
  wordRows: WordRowData[]; 
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_10Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_10({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_10Data);
  const fbKeySelection = `other5_10_selection_${safeData.id || 'default'}`;
  const fbKeySpeech = `other5_10_speech_${safeData.id || 'default'}`;

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  const [activeSelections, setActiveSelections] = useState<{ cl: string, clPy: string, noun: string, nounPy: string } | null>(null);

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeySelection] !== undefined) setActiveSelections(d[fbKeySelection]);
        else setActiveSelections(null);

        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        else setSpeechScores({});
      }
    });
    return () => unsub();
  }, [roomPin, fbKeySelection, fbKeySpeech]);

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

  const handleCardClick = async (node: WebNode, center: any) => {
    if (userRole !== 'teacher') return;
    speakChinese(node.chinese); 
    
    const newSelection = { cl: center.chinese, clPy: center.pinyin, noun: node.chinese, nounPy: node.pinyin };
    setActiveSelections(newSelection);
    
    if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySelection]: newSelection }); } catch (e) {}
    }
  };

  const handleCircleClick = async (center: any) => {
    if (userRole !== 'teacher') return;
    speakChinese(center.chinese);
    
    const newSelection = { cl: center.chinese, clPy: center.pinyin, noun: currentNoun, nounPy: currentNounPy };
    setActiveSelections(newSelection);
    
    if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySelection]: newSelection }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างค่าที่เลือกและคะแนนการพูดทั้งหมดใช่หรือไม่?')) {
      setActiveSelections(null); 
      setSpeechScores({});
      if (roomPin) {
          try { 
            await updateDoc(doc(db, 'live_sessions', roomPin), { 
              [fbKeySelection]: null, 
              [fbKeySpeech]: {} 
            }); 
          } catch (e) {}
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
    setProcessingId(null);
  };

  const startListening = (expectedChinese: string, boxId: string) => {
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
      setRecordingId(boxId);
      setProcessingId(null);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setRecordingId(null);
      setProcessingId(boxId);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();
      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) { if (cleanExpected.includes(cleanTranscript[i])) matchCount++; }
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;
      
      const newScores = { ...speechScores, [boxId]: { score: calculatedScore, transcript } };
      setSpeechScores(newScores);
      setProcessingId(null);

      if (roomPin) {
         try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch(e) {}
      }
    };
    
    recognition.onerror = () => { setRecordingId(null); setProcessingId(null); };
    recognition.onend = () => { setRecordingId(null); setTimeout(() => setProcessingId(null), 1500); };

    try { recognition.start(); } catch (e) { setRecordingId(null); setProcessingId(null); }
  };

  const firstRow = safeData.wordRows?.[0];
  const defaultCL = firstRow?.center?.chinese || '双';
  const defaultCLPy = firstRow?.center?.pinyin || 'shuāng';
  const defaultNoun = firstRow?.nodes?.[0]?.chinese || '筷子';
  const defaultNounPy = firstRow?.nodes?.[0]?.pinyin || 'kuàizi';

  const currentCL = activeSelections?.cl || defaultCL;
  const currentCLPy = activeSelections?.clPy || defaultCLPy;
  const currentNoun = activeSelections?.noun || defaultNoun;
  const currentNounPy = activeSelections?.nounPy || defaultNounPy;

  const renderUnderlinedText = (text: string) => {
      const parts = text.split(/(双|筷子)/g);
      return parts.map((part, i) => {
          if (part === '双') return <u key={i} className="underline underline-offset-4 decoration-2 decoration-orange-500 font-bold mx-0.5 text-orange-600 transition-colors duration-300">{currentCL}</u>;
          if (part === '筷子') return <u key={i} className="underline underline-offset-4 decoration-2 decoration-orange-500 font-bold mx-0.5 text-orange-600 transition-colors duration-300">{currentNoun}</u>;
          return <span key={i}>{part}</span>;
      });
  };

  const renderUnderlinedPinyin = (text: string) => {
      const parts = text.split(/(shuāng|kuàizi)/gi);
      return parts.map((part, i) => {
          if (part.toLowerCase() === 'shuāng') return <u key={i} className="underline underline-offset-4 decoration-2 decoration-orange-500 font-bold mx-0.5 text-orange-600 transition-colors duration-300">{currentCLPy}</u>;
          if (part.toLowerCase() === 'kuàizi') return <u key={i} className="underline underline-offset-4 decoration-2 decoration-orange-500 font-bold mx-0.5 text-orange-600 transition-colors duration-300">{currentNounPy}</u>;
          return <span key={i}>{part}</span>;
      });
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[600px] pb-28">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        <div className="mb-10 pl-4 flex items-center gap-4">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.mainTitle}
          </div>
        </div>

        <div className="w-full max-w-[900px] mx-auto mb-12 flex flex-col md:flex-row items-center justify-between gap-8 px-4">
          {(safeData.dialogues || []).map((dialogue) => {
            const isLeft = dialogue.speaker === 'left';
            const isGreen = dialogue.colorTheme === 'green';
            const bgClass = isGreen ? 'bg-[#e0f2e9]' : 'bg-[#fef0d8]';
            const textClass = isGreen ? 'text-emerald-900' : 'text-orange-900';
            const pinyinClass = isGreen ? 'text-emerald-700' : 'text-orange-700';
            const isRecording = recordingId === dialogue.id;
            const isProcessing = processingId === dialogue.id;
            const scoreData = speechScores[dialogue.id];

            const displayChineseStr = dialogue.chinese.replace(/双/g, currentCL).replace(/筷子/g, currentNoun);

            return (
              <div key={dialogue.id} className={`flex items-start gap-4 w-full md:w-auto ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                
                <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                  {dialogue.avatarUrl ? (
                    <img src={dialogue.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-slate-300" size={32} />
                  )}
                </div>

                <div className={`relative ${bgClass} rounded-2xl p-4 md:p-6 shadow-sm max-w-[400px] flex flex-col transition-all duration-300`}>
                  
                  <div className={`absolute top-6 w-4 h-4 ${bgClass} transform rotate-45 ${isLeft ? '-left-2' : '-right-2'}`}></div>

                  <div className="relative z-10 flex flex-col gap-1">
                    <span className={`text-[22px] md:text-[26px] font-serif leading-tight ${textClass}`}>
                        {renderUnderlinedText(dialogue.chinese)}
                    </span>
                    <span className={`text-[14px] md:text-[16px] font-sans ${pinyinClass}`}>
                        {renderUnderlinedPinyin(dialogue.pinyin)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 relative z-10">
                    <button 
                      onClick={() => speakChinese(displayChineseStr)}
                      className="p-1.5 rounded-full bg-white/50 hover:bg-white text-slate-600 transition-colors shadow-sm"
                      title="ฟังเสียง"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button 
                      onClick={() => { if (isRecording) stopListening(); else startListening(displayChineseStr, dialogue.id); }}
                      disabled={(recordingId !== null && !isRecording) || isProcessing}
                      className={`p-1.5 rounded-full transition-all shadow-sm border flex items-center justify-center w-[34px] h-[34px] ${
                        isProcessing ? 'bg-amber-100 text-amber-600 border-amber-300 cursor-wait'
                        : isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                        : 'bg-white text-slate-600 border-white hover:border-slate-200'
                      }`}
                      title={isProcessing ? "กำลังประมวลผล..." : isRecording ? "คลิกเพื่อหยุด" : "ฝึกพูด"}
                    >
                      {isProcessing ? <Loader2 size={18} className="animate-spin" /> : isRecording ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                  </div>

                  {scoreData && !isRecording && (
                    <div className="mt-3 flex items-center gap-2 w-full justify-center px-2 py-1 rounded bg-white/60 text-[11px] font-medium animate-fade-in relative z-10">
                      <div className={`font-bold ${scoreData.score >= 60 ? 'text-emerald-600' : 'text-red-600'}`}>{scoreData.score}%</div>
                      <div className="border-l pl-2 border-slate-300 text-slate-600 truncate">"{scoreData.transcript}"</div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-[1200px] mx-auto pb-12 relative z-[20] pointer-events-auto">
          {(safeData.wordRows || []).map((row) => {
            const hasValidNodes = row.nodes.filter(n => n.chinese.trim() !== '').length > 0;
            if (!hasValidNodes) return null;

            const isCircleActive = currentCL === row.center.chinese;

            return (
              <div key={row.id} className="flex flex-col xl:flex-row items-center xl:items-start gap-4 border border-slate-200 bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md transition-all">
                
                <div 
                  onClick={() => {
                      if (userRole === 'teacher') handleCircleClick(row.center);
                      else speakChinese(row.center.chinese);
                  }}
                  className={`w-[100px] h-[100px] rounded-full border-4 flex flex-col items-center justify-center shrink-0 shadow-sm transition-all select-none cursor-pointer
                    ${userRole === 'teacher' ? 'hover:scale-105' : 'hover:scale-105'}
                    ${isCircleActive ? 'bg-orange-500 border-orange-600 text-white' : 'bg-white border-orange-200 text-slate-800 hover:bg-orange-50'}
                  `}
                  title={userRole === 'teacher' ? "คลิกเพื่อเลือกคำนี้" : "คลิกเพื่อฟังเสียง"}
                >
                  <span className={`text-[32px] font-serif leading-none ${isCircleActive ? 'text-white' : 'text-slate-800'}`}>{row.center.chinese}</span>
                  <span className={`text-[12px] font-sans mt-0.5 ${isCircleActive ? 'text-orange-100' : 'text-slate-500'}`}>{row.center.pinyin}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 flex-1">
                  {row.nodes.filter(n => n.chinese.trim() !== '').map(node => {
                    const isNodeActive = currentNoun === node.chinese && isCircleActive; 
                    const baseBorder = isNodeActive ? "border-orange-500 ring-2 ring-orange-200 shadow-md" : "border-slate-200 hover:border-orange-300";

                    return (
                      <div 
                        key={node.id}
                        onClick={() => {
                            if (userRole === 'teacher') handleCardClick(node, row.center);
                            else speakChinese(node.chinese);
                        }}
                        className="group/card [perspective:1000px] w-[90px] h-[90px] z-20 cursor-pointer select-none hover:-translate-y-1 transition-transform"
                        title={userRole === 'teacher' ? "คลิกเพื่อเลือกคำนี้" : "คลิกเพื่อฟังเสียง / วางเมาส์เพื่อดูรูป"}
                      >
                        <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                          
                          <div className={`absolute inset-0 [backface-visibility:hidden] rounded-[16px] border-[2px] flex flex-col items-center justify-center p-1 transition-all ${baseBorder} ${isNodeActive ? 'bg-orange-500' : 'bg-white'}`}>
                            <span className={`text-[22px] font-serif leading-tight mb-0.5 text-center px-1 break-words ${isNodeActive ? 'text-white' : 'text-slate-800'}`}>{node.chinese}</span>
                            <span className={`text-[11px] font-sans tracking-wide leading-tight text-center px-1 break-words ${isNodeActive ? 'text-orange-100' : 'text-indigo-600'}`}>{node.pinyin}</span>
                          </div>
                          
                          <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[16px] border-[2px] flex items-center justify-center p-2 overflow-hidden transition-colors ${isNodeActive ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-emerald-300 bg-white hover:bg-emerald-50'}`}>
                            {node.imageUrl ? (
                              <img src={node.imageUrl} alt={node.chinese} className="w-full h-full object-contain mix-blend-multiply pointer-events-none" />
                            ) : (
                              <span className="text-slate-300 text-[10px]">ไม่มีรูป</span>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
                
              </div>
            );
          })}
        </div>

        {/* === กระดานคำศัพท์เสริม (สำหรับแสดงบนหน้าจอเด็ก) === */}
        {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

      </div>

      {userRole === 'teacher' && (
        <div className={`fixed bottom-8 md:bottom-12 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">ระบบแทนที่คำศัพท์</span>
            </div>
            
            <div className="w-px h-6 bg-slate-200"></div>
            
            {/* +++ ย้ายปุ่มเปิดกระดานมาไว้ในแผงควบคุมครู +++ */}
            <FloatingLiveText roomPin={roomPin} userRole={userRole} />
            
            <button 
              onClick={handleTeacherReset} 
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
              title="ล้างค่ากลับเป็นค่าเริ่มต้น"
            >
              <RotateCcw size={14} /> รีเซ็ตการตั้งค่า
            </button>
          </div>
        </div>
      )}

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