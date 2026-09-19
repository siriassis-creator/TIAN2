// src/components/Other_lesson5-24.tsx
import React, { useState, useEffect } from 'react';
import { StickyNote, X, Edit3, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface ChoiceItem {
  chinese: string;
  pinyin: string;
}

export interface VocabCard {
  id: string;
  imageUrl: string;
  correctChoiceIdx: number; // เก็บ Index (0 = A, 1 = B, 2 = C...)
}

export interface OtherLesson5_24Data {
  id?: string;
  patternType: 'other_lesson5-24';
  mainTitle: string;
  subTitle: string;
  choices: ChoiceItem[];
  cards: VocabCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_24Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_24({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_24Data);
  const safeChoices = safeData.choices || [];
  const safeCards = safeData.cards || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  // State: เก็บคำตอบของนักเรียน { "card1": "A", "card2": "C" }
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  // State: เก็บ Card ID ที่ครูเปิดเฉลยแล้ว
  const [revealedCards, setRevealedCards] = useState<string[]>([]);

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_24_answers !== undefined) setStudentAnswers(d.other5_24_answers);
        if (d.other5_24_reveals !== undefined) setRevealedCards(d.other5_24_reveals);
      }
    });
    return () => unsub();
  }, [roomPin]);

  const handleInputChange = async (cardId: string, value: string) => {
    if (userRole !== 'student') return;
    const cleanValue = value.toUpperCase().trim().substring(0, 1); // รับแค่ 1 ตัวอักษรและเป็นตัวใหญ่
    
    const newAnswers = { ...studentAnswers, [cardId]: cleanValue };
    setStudentAnswers(newAnswers);

    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_24_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    const newReveals = [...revealedCards, cardId];
    setRevealedCards(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_24_reveals: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const allReveals = ['ALL'];
    setRevealedCards(allReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_24_reveals: allReveals }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานและคำตอบทั้งหมดใช่หรือไม่?')) {
      setRevealedCards([]);
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_24_reveals: [], other5_24_answers: {} }); } catch (e) {}
      }
    }
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
             <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={20} />
             </div>
             {safeData.mainTitle || '1. 看图片，选择正确的答案。'}
          </div>
          <div className="text-[13px] md:text-[15px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'ดูภาพแล้วเลือกคำศัพท์ที่ถูกต้อง'}
          </div>
        </div>

        {/* 2. Choices Panel (A, B, C...) */}
        <div className="bg-emerald-50/70 p-4 md:p-6 rounded-2xl border border-emerald-100 mb-8 mx-auto w-full max-w-5xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {safeChoices.map((choice, idx) => {
              const letter = String.fromCharCode(65 + idx); // 0=A, 1=B, 2=C...
              return (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-[18px] md:text-[22px] font-bold text-emerald-800 leading-none mt-1">{letter}</span>
                  <div className="flex flex-col">
                    <span className="text-[20px] md:text-[24px] font-serif text-slate-800 leading-none">{choice.chinese}</span>
                    <span className="text-[11px] md:text-[13px] font-sans text-slate-500 mt-1">{choice.pinyin}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instruction for students */}
        {userRole === 'student' && !revealedCards.includes('ALL') && (
          <div className="text-center text-orange-500 text-[12px] font-bold animate-pulse mb-6 bg-orange-50 py-2 rounded-xl mx-auto w-full max-w-lg">
            👆 พิมพ์ตัวอักษร A, B, C... ลงในวงกลมให้ตรงกับรูปภาพ
          </div>
        )}

        {/* 3. Image Cards Grid (+++ ปรับเป็น 4 คอลัมน์ และขยายความกว้าง +++) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 pb-24 w-full max-w-5xl mx-auto px-2">
          {safeCards.map((card, idx) => {
            const studentAns = studentAnswers[card.id] || '';
            const correctLetter = String.fromCharCode(65 + card.correctChoiceIdx);
            const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');
            const isCorrect = studentAns === correctLetter;

            return (
              <div key={card.id} className="relative aspect-square bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center p-3 md:p-5 group">
                
                {/* Number Badge */}
                <div className="absolute -top-3 -left-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-[12px] md:text-sm shadow-md ring-4 ring-[#fcfaf7]">
                  {idx + 1}
                </div>

                {/* Image */}
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt="Vocab" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-slate-300 text-[10px] md:text-xs">ไม่มีรูป</span>
                )}

                {/* Input Circle (วงกลมสำหรับตอบ - ย่อขนาดลงนิดนึงให้สมดุลกับ 4 แถว) */}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-50 border-2 border-slate-200 shadow-sm flex items-center justify-center z-10 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <input
                    type="text"
                    maxLength={1}
                    value={studentAns}
                    onChange={(e) => handleInputChange(card.id, e.target.value)}
                    disabled={userRole !== 'student' || isRevealed}
                    className={`w-full h-full text-center bg-transparent outline-none text-[20px] md:text-[24px] font-bold font-sans rounded-full transition-colors
                      ${isRevealed ? (isCorrect ? 'text-emerald-600' : 'text-red-500') : 'text-slate-700'}
                    `}
                    placeholder=""
                  />
                </div>

                {/* เฉลยข้อผิด (แสดงติ๊กถูก / กากบาท) */}
                {isRevealed && (
                  <div className="absolute -bottom-2 right-10 md:right-12 animate-bounce-in z-20">
                    {isCorrect ? (
                      <CheckCircle2 size={24} className="text-emerald-500 bg-white rounded-full drop-shadow-md" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle size={22} className="text-red-500 bg-white rounded-full drop-shadow-md" />
                        <span className="bg-white border-2 border-emerald-400 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full text-[12px] shadow-md leading-none">
                          {correctLetter}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ปุ่มเฉลยสำหรับครู */}
                {userRole === 'teacher' && !isRevealed && (
                  <button 
                    onClick={() => handleTeacherReveal(card.id)}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm border bg-white/90 text-indigo-500 border-slate-200 hover:bg-indigo-50 z-20 opacity-0 group-hover:opacity-100"
                  >
                    <Eye size={12}/> เฉลย
                  </button>
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
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedCards.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
              >
                <Eye size={14} /> เฉลยทุกข้อ
              </button>
              
              <button 
                onClick={handleTeacherReset} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
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