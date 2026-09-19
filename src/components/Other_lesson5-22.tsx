// src/components/Other_lesson5-22.tsx
import React, { useState, useEffect } from 'react';
import { StickyNote, X, Edit3 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface WritingGroup {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
}

export interface OtherLesson5_22Data {
  id?: string;
  patternType: 'other_lesson5-22';
  mainTitle: string;
  subTitle: string;
  groups: WritingGroup[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_22Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

const isPunctuation = (char: string) => /[。，？！、.,?!()（）]/.test(char);

// ฟังก์ชันแปลงข้อความที่มี * ให้เป็นสีแดง (เช่น 给（*给*我） -> 给（<span class="text-red-500">给</span>我）)
const renderHighlightedTitle = (title: string) => {
  if (!title) return null;
  const parts = title.split(/\*(.*?)\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <span key={i} className="text-red-500 font-bold">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function OtherLesson5_22({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_22Data);
  const safeGroups = safeData.groups || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  // State: เก็บว่ากล่องไหนถูกกดเขียนแล้ว { "group1_0": true }
  const [tracedBoxes, setTracedBoxes] = useState<Record<string, boolean>>({});

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_22_answers !== undefined) setTracedBoxes(d.other5_22_answers);
      }
    });
    return () => unsub();
  }, [roomPin]);

  // ให้ครูและนักเรียนกดเขียนร่วมกันได้
  const handleTraceBox = async (groupId: string, charIndex: number) => {
    const key = `${groupId}_${charIndex}`;
    const newAnswers = { ...tracedBoxes, [key]: !tracedBoxes[key] };
    setTracedBoxes(newAnswers);

    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_22_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานการเขียนทั้งหมดใช่หรือไม่?')) {
      setTracedBoxes({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_22_answers: {} }); } catch (e) {}
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
             <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={20} />
             </div>
             {safeData.mainTitle || '6. 描一描，写一写。'}
          </div>
          <div className="text-[13px] md:text-[15px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'ฝึกเขียนตามลายเส้น'}
          </div>
        </div>

        {/* 2. Content Groups */}
        <div className="flex flex-col gap-12 pb-24">
          {safeGroups.map((group) => {
            const chars = group.text.split('');

            return (
              <div key={group.id} className="flex flex-col relative w-full">
                
                {/* Title above the boxes (e.g. 给（给我 给妹妹）) */}
                {group.title && (
                  <div className="text-[18px] md:text-[24px] font-serif text-slate-700 mb-5 ml-2 tracking-wide">
                    {renderHighlightedTitle(group.title)}
                  </div>
                )}

                {/* Tracing Boxes Area */}
                {/* ปรับ gap ให้กว้างขึ้นเล็กน้อยเพื่อความสบายตาเวลาเขียน */}
                <div className="flex flex-wrap items-end gap-3 md:gap-4">
                  
                  {chars.map((char, i) => {
                    const isPunc = isPunctuation(char);
                    const isTraced = tracedBoxes[`${group.id}_${i}`];

                    if (isPunc) {
                      return (
                        <div key={i} className="text-[24px] md:text-[36px] font-serif text-slate-800 pb-3 flex items-end">
                          {char}
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={i} 
                        // +++ ขยายขนาดกล่องให้ใหญ่ขึ้น: w-16 h-16 (มือถือ) / w-24 h-24 (คอม/ไอแพด) +++
                        className={`relative w-16 h-16 md:w-24 md:h-24 shrink-0 cursor-pointer transition-transform active:scale-95`}
                        onClick={() => handleTraceBox(group.id, i)}
                        title="คลิกเพื่อเขียน/ลบ"
                      >
                        {/* สมุดคัดลายมือ (田字格) */}
                        <div 
                          className={`absolute inset-0 w-full h-full bg-white border flex items-center justify-center transition-all duration-300
                            ${isTraced ? 'border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'border-red-200 shadow-sm'}
                          `}
                        >
                          {/* เส้นประภายในกล่อง */}
                          <div className="absolute inset-0 border-b border-dashed border-red-200/80 top-1/2 -translate-y-[1px]" />
                          <div className="absolute inset-0 border-r border-dashed border-red-200/80 left-1/2 -translate-x-[1px]" />
                          
                          {/* ตัวอักษร */}
                          {/* +++ ขยายขนาดตัวอักษรให้ใหญ่ตามกล่อง: text-[36px] (มือถือ) / text-[52px] (คอม/ไอแพด) +++ */}
                          <span className={`relative z-10 text-[36px] md:text-[52px] font-serif transition-colors duration-300
                            ${isTraced ? 'text-red-500' : 'text-slate-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'}
                          `}>
                            {char}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Image at the end of the row (if exists) */}
                  {group.imageUrl && (
                    <div className="ml-4 w-20 h-20 md:w-28 md:h-28 shrink-0">
                      <img src={group.imageUrl} alt="illustration" className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>
                  )}

                </div>
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
                <span className="text-xs font-bold text-slate-800">ระบบคัดลายมือ</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              
              <button 
                onClick={handleTeacherReset} 
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
                title="ล้างกระดานให้เด็กๆ เขียนใหม่"
              >
                ล้างกระดาน (เขียนใหม่)
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