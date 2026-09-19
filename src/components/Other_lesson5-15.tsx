// src/components/Other_lesson5-15.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Edit3, Volume2, Mic, MicOff, CheckCircle2, XCircle, EyeOff, RotateCcw } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText'; 

export interface TrueFalseLine {
  chinese: string;
  pinyin: string;
  correctAnswer: 'true' | 'false';
}

export interface OtherLesson5_15Data {
  id?: string;
  patternType: 'other_lesson5-15';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  imageUrl?: string; // +++ รองรับรูปภาพประกอบด้านขวา +++
  lines: TrueFalseLine[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_15Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_15({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_15Data);
  const safeLines = safeData.lines || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Speech Assessment State
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  // Interactive Game State
  const [studentAnswers, setStudentAnswers] = useState<Record<number, 'true' | 'false' | null>>({});
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Firebase Real-time Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_15_answers !== undefined) setStudentAnswers(d.other5_15_answers);
        if (d.other5_15_revealed !== undefined) setIsRevealed(d.other5_15_revealed);
      }
    });
    return () => unsub();
  }, [roomPin]);

  const handleToggleAnswer = async (idx: number) => {
    if (userRole !== 'student') return; 

    const current = studentAnswers[idx];
    let next: 'true' | 'false' | null = null;
    
    if (!current) next = 'true';
    else if (current === 'true') next = 'false';
    else next = null;

    const newAnswers = { ...studentAnswers, [idx]: next };
    setStudentAnswers(newAnswers);

    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_15_answers: newAnswers }); } 
      catch (e) {}
    }
  };

  const handleToggleReveal = async () => {
    if (userRole !== 'teacher') return;
    const newState = !isRevealed;
    setIsRevealed(newState);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_15_revealed: newState }); } 
      catch (e) {}
    }
  };

  const handleClearAnswers = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างคำตอบทั้งหมดของนักเรียน?")) {
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_15_answers: {} }); } 
        catch (e) {}
      }
    }
  };

  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; utterance.rate = 0.8;
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
    recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingIdx(idx);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      setSpeechScores(prev => ({ ...prev, [idx]: { score: calculatedScore, transcript } }));
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

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลข้อสอบ...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px]">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* Header */}
        <div className="mb-6 pl-4 flex flex-wrap items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-orange-400 border-2 border-orange-100 shrink-0">
            <Edit3 size={28} />
          </div>
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm relative overflow-hidden shrink-0">
            <span className="relative text-xl md:text-2xl font-bold text-white tracking-wide font-sans drop-shadow-md">
              {safeData.mainTitle || '读一读，判断对错'}
            </span>
          </div>
          <div className="text-[16px] md:text-[18px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || 'ฝึกอ่านแล้วพิจารณาว่าถูกหรือผิด'}
          </div>
        </div>

        {/* Main Content (แบ่ง 2 คอลัมน์เหมือนหน้า 5-14: เนื้อหา ซ้าย / รูปภาพ ขวา) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 pb-20">
          
          {/* ฝั่งซ้าย: รายการข้อสอบ */}
          <div className="flex-1 space-y-2 relative z-[20] pointer-events-auto">
            {safeLines.map((line, idx) => {
              const isRecording = recordingIdx === idx;
              const scoreData = speechScores[idx];
              const ans = studentAnswers[idx];
              const isCorrect = ans === line.correctAnswer;

              return (
                <div key={idx} className="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-orange-200 transition-all">
                  
                  {/* Text & Tools */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <div className="text-[20px] md:text-[22px] font-serif text-slate-800 leading-tight tracking-wide">
                          {line.chinese}
                        </div>
                        <div className="text-[12px] md:text-[13px] text-slate-500 font-sans mt-0.5">
                          {line.pinyin}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => speakChinese(line.chinese)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors" title="ฟังเสียง">
                          <Volume2 size={16} />
                        </button>
                        <button onClick={() => { if (isRecording) stopListening(); else startListening(line.chinese, idx); }} className={`p-1.5 rounded-lg transition-all border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`} title="ฝึกพูด">
                          {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>
                        {scoreData && !isRecording && (
                          <div className={`px-1.5 py-0.5 rounded border text-[11px] font-bold ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interactive True/False */}
                  <div className="flex items-center gap-2 shrink-0 pl-10 md:pl-0 mt-2 md:mt-0">
                    <div 
                      onClick={() => handleToggleAnswer(idx)}
                      className={`flex items-center justify-center text-2xl md:text-3xl font-sans tracking-[0.15em] select-none transition-all px-3 py-1 rounded-xl
                        ${userRole === 'student' ? 'cursor-pointer hover:bg-orange-50 active:scale-95 border border-transparent hover:border-orange-200' : ''}
                      `}
                      title={userRole === 'student' ? "คลิกเพื่อตอบ/แก้ไขคำตอบ" : ""}
                    >
                      <span className="text-slate-400 font-light">(</span>
                      <span className={`w-6 text-center font-bold mx-1 ${ans === 'true' ? 'text-emerald-500' : ans === 'false' ? 'text-red-500' : 'text-transparent'}`}>
                        {ans === 'true' ? '✓' : ans === 'false' ? '✗' : '-'}
                      </span>
                      <span className="text-slate-400 font-light">)</span>
                    </div>

                    <div className="w-8 flex items-center justify-center">
                      {isRevealed && ans && (
                        <div className="animate-bounce-in">
                          {isCorrect ? (
                            <CheckCircle2 size={28} className="text-emerald-500 drop-shadow-md" />
                          ) : (
                            <XCircle size={28} className="text-red-500 drop-shadow-md" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* ฝั่งขวา: รูปภาพประกอบ (ขนาดและความสูงเท่ากับหน้า 5-14) */}
          <div className="w-full lg:w-[450px] shrink-0 flex flex-col items-center pt-2 relative z-[10] pointer-events-none">
            {safeData.imageUrl ? (
              <img 
                src={safeData.imageUrl} 
                alt="Illustration" 
                className="w-full h-auto max-h-[400px] rounded-3xl shadow-lg border-4 border-white object-contain"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพประกอบ
              </div>
            )}
          </div>

        </div>

        {/* กระดานศัพท์สำหรับเด็ก */}
        {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

        {/* Teacher Control Panel */}
        {userRole === 'teacher' && (
          <div className={`fixed bottom-12 md:bottom-16 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
                <span className="text-sm font-bold text-slate-800">ระบบตรวจคำตอบ</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              
              <FloatingLiveText roomPin={roomPin} userRole={userRole} />

              <button 
                onClick={handleToggleReveal} 
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all ${isRevealed ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                {isRevealed ? <EyeOff size={16} /> : <CheckCircle2 size={16} />} 
                {isRevealed ? 'ซ่อนเฉลย' : 'เปิดระบบตรวจคำตอบ'}
              </button>
              
              <button 
                onClick={handleClearAnswers} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-xl text-sm font-bold transition-all"
                title="ล้างคำตอบของนักเรียนทั้งหมด"
              >
                <RotateCcw size={16} /> ล้างกระดาน
              </button>
            </div>
          </div>
        )}

      </div>

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