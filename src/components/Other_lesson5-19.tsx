// src/components/Other_lesson5-19.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, CheckCircle2, XCircle, Eye, Edit3 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface MultipleChoiceCard {
  id: string;
  sentence: string; // ใช้ ___ เพื่อระบุช่องว่าง
  choices: string[];
  correctIndex: number;
  imageUrl: string;
}

export interface OtherLesson5_19Data {
  id?: string;
  patternType: 'other_lesson5-19';
  mainTitle: string;
  subTitle: string;
  cards: MultipleChoiceCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_19Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_19({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_19Data);
  const safeCards = safeData.cards || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Speech Assessment State
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  // Interactive Game State
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({}); // cardId -> choiceIndex
  const [revealedCards, setRevealedCards] = useState<string[]>([]); // array of cardIds

  useEffect(() => {
    return () => { stopListening(); };
  }, []);

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_19_answers !== undefined) setStudentAnswers(d.other5_19_answers);
        if (d.other5_19_reveals !== undefined) setRevealedCards(d.other5_19_reveals);
      }
    });
    return () => unsub();
  }, [roomPin]);

  const handleSelectChoice = async (cardId: string, choiceIndex: number) => {
    if (userRole !== 'student' || revealedCards.includes(cardId) || revealedCards.includes('ALL')) return;

    const newAnswers = { ...studentAnswers, [cardId]: choiceIndex };
    setStudentAnswers(newAnswers);

    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_19_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    let newReveals = [...revealedCards];
    if (!newReveals.includes(cardId)) newReveals.push(cardId);
    
    setRevealedCards(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_19_reveals: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const allReveals = ['ALL'];
    setRevealedCards(allReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_19_reveals: allReveals }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานและคำตอบทั้งหมดใช่หรือไม่?')) {
      setRevealedCards([]);
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_19_reveals: [], other5_19_answers: {} }); } catch (e) {}
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
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, cardId: string) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(cardId);
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

      setSpeechScores(prev => ({ ...prev, [cardId]: { score: calculatedScore, transcript } }));
    };
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);

    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
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
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px] flex flex-col">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-4 right-4 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={20} />
        </button>

        {/* 1. Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
             <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={20} />
             </div>
             {safeData.mainTitle || '3. 圈出正确的汉字，然后读一读。'}
          </div>
          <div className="text-[13px] md:text-[15px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'วงกลมล้อมรอบตัวอักษรจีนที่ถูกต้อง จากนั้นฝึกอ่าน'}
          </div>
        </div>

        {/* 2. Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-24 px-2">
          {safeCards.map((card, idx) => {
            const studentAnsIdx = studentAnswers[card.id];
            const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');
            const isCorrect = studentAnsIdx === card.correctIndex;
            
            // ประมวลผลประโยค (หาช่องว่าง ___)
            const parts = (card.sentence || '').split('___');
            const beforeBlank = parts[0] || '';
            const afterBlank = parts.length > 1 ? parts.slice(1).join('___') : '';
            
            // คำที่เติมลงไป
            const filledWord = studentAnsIdx !== undefined ? card.choices[studentAnsIdx] : '';
            const fullSentenceStr = beforeBlank + (filledWord || card.choices[card.correctIndex]) + afterBlank;

            const isRecording = recordingId === card.id;
            const scoreData = speechScores[card.id];

            return (
              <div key={card.id} className="bg-white rounded-3xl border-2 border-orange-200/60 p-4 md:p-6 flex flex-col items-center shadow-sm relative transition-all hover:border-orange-300">
                
                {/* Number Badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">
                  {idx + 1}
                </div>

                {/* Sentence & Blank */}
                <div className="text-[22px] md:text-[26px] font-serif text-slate-800 leading-relaxed mb-6 mt-2 text-center break-words flex flex-wrap items-center justify-center">
                  <span>{beforeBlank}</span>
                  <span className={`inline-block border-b-2 min-w-[40px] text-center mx-1 pb-1 transition-all
                    ${!filledWord ? 'border-slate-300 text-transparent' : 'border-indigo-400 text-indigo-600'}
                    ${isRevealed && isCorrect ? 'border-emerald-500 text-emerald-600 font-bold' : ''}
                    ${isRevealed && !isCorrect && filledWord ? 'border-red-500 text-red-500 line-through decoration-2' : ''}
                  `}>
                    {filledWord || '_'}
                  </span>
                  <span>{afterBlank}</span>
                </div>

                {/* 3 Choices */}
                <div className="flex gap-4 md:gap-8 mb-6">
                  {card.choices.map((choice, cIdx) => {
                    const isSelected = studentAnsIdx === cIdx;
                    let btnClass = "border-transparent bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600";
                    
                    if (isSelected) btnClass = "border-indigo-400 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-200";
                    
                    if (isRevealed) {
                      if (cIdx === card.correctIndex) {
                        btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-200 scale-110";
                      } else if (isSelected && cIdx !== card.correctIndex) {
                        btnClass = "border-red-500 bg-red-50 text-red-600 font-bold opacity-60";
                      } else {
                        btnClass = "border-transparent bg-slate-50 text-slate-400 opacity-50";
                      }
                    }

                    return (
                      <div 
                        key={cIdx}
                        onClick={() => handleSelectChoice(card.id, cIdx)}
                        className={`text-[20px] md:text-[24px] font-serif w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border-2 cursor-pointer transition-all shadow-sm select-none ${btnClass}`}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>

                {/* Image (เอา drop-shadow ออกแล้ว ให้พื้นหลังเป็นสีเดียวกับการ์ด) */}
                <div className="flex-1 flex items-center justify-center w-full min-h-[100px] mb-4 bg-transparent">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt="Vocab" className="max-w-full max-h-[100px] object-contain" />
                  ) : (
                    <div className="text-slate-300 text-xs">ไม่มีรูปภาพ</div>
                  )}
                </div>

                {/* === ถ้านักเรียนตอบถูก และ ครูเฉลยแล้ว -> แสดงพินอิน + ลำโพง + ไมค์ === */}
                {isRevealed && isCorrect && (
                  <div className="w-full border-t border-emerald-100 pt-4 mt-2 flex flex-col items-center animate-fade-in">
                    <div className="text-[14px] md:text-[16px] text-emerald-600 font-sans mb-3 text-center font-bold tracking-wide bg-emerald-50 px-4 py-1.5 rounded-full">
                      {pinyinConverter(fullSentenceStr)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => speakChinese(fullSentenceStr)} 
                        className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors shadow-sm" 
                        title="ฟังเสียงประโยคเต็ม"
                      >
                        <Volume2 size={18} />
                      </button>
                      <button 
                        onClick={() => { if (isRecording) stopListening(); else startListening(fullSentenceStr, card.id); }} 
                        className={`p-2 rounded-full transition-all shadow-sm border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' : 'bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50 hover:scale-105'}`} 
                        title="ฝึกพูดประโยคเต็ม"
                      >
                        {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
                      </button>
                      {scoreData && !isRecording && (
                        <div className={`px-2 py-1 rounded border text-xs font-bold animate-fade-in ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ปุ่มเฉลยสำหรับครู */}
                {userRole === 'teacher' && !isRevealed && (
                  <div className="absolute bottom-4 right-4">
                    <button 
                      onClick={() => handleTeacherReveal(card.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                    >
                      <Eye size={14}/> เฉลยข้อนี้
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Teacher Control Panel */}
        {userRole === 'teacher' && (
          <div className={`fixed bottom-8 md:bottom-12 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
                <span className="text-xs font-bold text-slate-800">ระบบตรวจคำตอบ</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              
              <button 
                onClick={handleTeacherRevealAll} 
                disabled={revealedCards.includes('ALL')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedCards.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                <Eye size={14} /> เฉลยทุกข้อ
              </button>
              
              <button 
                onClick={handleTeacherReset} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100"
                title="ล้างกระดานและคำตอบทั้งหมด"
              >
                ล้างกระดาน
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