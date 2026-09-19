// src/components/Other_lesson5-13.tsx
import React, { useState, useEffect } from 'react';
import { StickyNote, X, Check, XCircle, RotateCcw } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText'; // +++ ดึงกระดานลอยมาใช้ +++

export interface GameCard {
  id: string;
  imageUrl: string;
}

export interface OtherLesson5_13Data {
  id?: string;
  patternType: 'other_lesson5-13';
  mainTitle: string;
  subTitle: string;
  cards: GameCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_13Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student'; 
  roomPin?: string | null;
}

const rotations = ['-rotate-3', 'rotate-2', '-rotate-6', 'rotate-6', '-rotate-2', 'rotate-3'];

export default function OtherLesson5_13({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');
  
  // Game States
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'none' | 'correct' | 'wrong'>('none');

  // +++ ระบบ Firebase Real-time Sync ให้นักเรียนกับครูคุยกัน +++
  useEffect(() => {
    if (!roomPin) return; // ถ้าไม่ได้อยู่ในห้องเรียน ไม่ต้องซิงค์
    
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const fbData = docSnap.data();
        if (fbData.selectedCardId !== undefined) setSelectedCardId(fbData.selectedCardId);
        if (fbData.answerStatus !== undefined) setAnswerStatus(fbData.answerStatus);
      }
    });

    return () => unsub();
  }, [roomPin]);

  const handleCardClick = async (cardId: string) => {
    // ล็อกระบบ: ถ้าระบบเฉลยไปแล้ว จะไม่สามารถกดได้
    if (answerStatus !== 'none') return;
    
    const newCardId = selectedCardId === cardId ? null : cardId;
    setSelectedCardId(newCardId); // เปลี่ยนสีการ์ดที่หน้าจอตัวเองทันที
    
    // อัปเดตข้อมูลขึ้น Firebase ให้จออีกฝั่งเห็น
    if (roomPin) {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          selectedCardId: newCardId,
          answerStatus: 'none'
        });
      } catch (e) { console.error("Error updating card", e); }
    }
  };

  const handleTeacherEval = async (status: 'correct' | 'wrong') => {
    // ต้องเป็นครูเท่านั้นถึงตรวจได้
    if (userRole !== 'teacher' || !selectedCardId) return;
    setAnswerStatus(status); // โชว์เฉลยที่หน้าจอครูทันที

    // อัปเดตเฉลยขึ้น Firebase ให้หน้าจอนักเรียนเด้งขึ้นมา
    if (roomPin) {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          answerStatus: status
        });
      } catch (e) { console.error("Error evaluating", e); }
    }
  };

  const handleReset = async () => {
    if (userRole !== 'teacher') return;
    setSelectedCardId(null);
    setAnswerStatus('none');
    
    // เคลียร์กระดานใน Firebase
    if (roomPin) {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          selectedCardId: null,
          answerStatus: 'none'
        });
      } catch (e) { console.error("Error resetting", e); }
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[600px] flex flex-col">
        
        <div className="absolute top-6 right-6 flex items-center gap-3 z-[30]">
          <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`p-1.5 rounded transition-all ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
            <StickyNote size={22} />
          </button>
        </div>

        {/* 1. Header */}
        <div className="mb-8 pl-4 flex items-center gap-4">
          <div className="text-[20px] md:text-[24px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {data.mainTitle || '3. 词语速递游戏。 เกมใครไวใครได้'}
          </div>
        </div>

        {/* 2. Game Board (โต๊ะเรียน) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[1000px] mx-auto relative pb-24">
          
          <div className="absolute bottom-16 left-[5%] w-[4%] h-12 bg-[#704627] rounded-b"></div>
          <div className="absolute bottom-16 right-[5%] w-[4%] h-12 bg-[#704627] rounded-b"></div>

          <div className="relative w-full bg-[#cca787] border-[10px] border-[#915e38] rounded-t-xl rounded-b-md shadow-xl p-8 md:p-12 min-h-[400px] flex flex-wrap content-center justify-center gap-6 z-10">
            
            {(data.cards || []).map((card, idx) => {
              const isSelected = selectedCardId === card.id;
              const isCorrect = isSelected && answerStatus === 'correct';
              const isWrong = isSelected && answerStatus === 'wrong';
              const rotation = rotations[idx % rotations.length];

              return (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] bg-white rounded-lg shadow-md flex items-center justify-center p-2 cursor-pointer transition-all duration-300 select-none
                    ${rotation} hover:rotate-0 hover:scale-110 hover:shadow-xl hover:z-20
                    ${isSelected && answerStatus === 'none' ? 'ring-4 ring-blue-400 scale-110 z-20 shadow-blue-200' : ''}
                    ${isCorrect ? 'ring-4 ring-emerald-500 scale-110 z-20' : ''}
                    ${isWrong ? 'ring-4 ring-red-500 scale-110 z-20' : ''}
                  `}
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt="Card" className="max-w-full max-h-full object-contain pointer-events-none" />
                  ) : (
                    <span className="text-slate-300 text-xs">ไม่มีรูป</span>
                  )}

                  {isCorrect && (
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-lg flex items-center justify-center animate-fade-in pointer-events-none">
                      <div className="bg-white rounded-full p-2 shadow-lg scale-150">
                        <Check size={40} className="text-emerald-500" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                  {isWrong && (
                    <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center animate-fade-in pointer-events-none">
                      <div className="bg-white rounded-full p-2 shadow-lg scale-150">
                        <XCircle size={40} className="text-red-500" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {userRole === 'teacher' && (
                    <div className="absolute top-1 left-2 text-[10px] text-slate-300 font-bold pointer-events-none">{idx + 1}</div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* 3. Teacher Control Panel (ซ่อนถ้าเป็นนักเรียน) */}
        {userRole === 'teacher' && (
          <div 
            className={`fixed bottom-12 md:bottom-16 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 
            ${selectedCardId ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'}`}
          >
            <div className="bg-white/95 backdrop-blur-md px-8 py-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] border-2 border-slate-200 pointer-events-auto flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมสำหรับคุณครู (Teacher Control)</span>
                
                {/* +++ เพิ่มปุ่มกระดานศัพท์ลอยตัวแบบฝังอยู่ในแผงควบคุม +++ */}
                <div className="flex border-l border-slate-200 pl-4 ml-2">
                   <FloatingLiveText roomPin={roomPin} userRole={userRole} />
                </div>
              </div>
              
              {answerStatus === 'none' ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleTeacherEval('correct')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105"
                  >
                    <Check size={20} strokeWidth={3} /> ถูกต้อง
                  </button>
                  <button 
                    onClick={() => handleTeacherEval('wrong')}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105"
                  >
                    <X size={20} strokeWidth={3} /> ผิด
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold ml-4 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105 animate-pulse"
                >
                  <RotateCcw size={20} /> เริ่มคำถามข้อใหม่ (Reset)
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* +++ กระดานศัพท์สำหรับเด็ก จะโชว์เมื่อครูกดเปิดเท่านั้น +++ */}
      {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

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