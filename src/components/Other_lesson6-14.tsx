// src/components/Other_lesson6-14.tsx
import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface CardItem6_14 { id: string; symbol: string; chineseText: string; }
export interface VocabItem6_14 { id: string; chinese: string; thai: string; }
export interface OtherLesson6_14Data { id?: string; patternType: 'other_lesson6-14'; mainTitle: string; subTitle: string; cards: CardItem6_14[]; vocabTitle: string; vocabs: VocabItem6_14[]; }
interface Props { data: OtherLesson6_14Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

export default function OtherLesson6_14({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_14Data);
  
  const mainTitle = safeData.mainTitle || '1. 你知道吗？';
  const subTitle = safeData.subTitle || 'รู้หรือไม่';
  const cards = Array.isArray(safeData.cards) ? safeData.cards : [];
  const vocabTitle = safeData.vocabTitle || '';
  const vocabs = Array.isArray(safeData.vocabs) ? safeData.vocabs : [];

  // Firebase Key สำหรับจัดการสถานะ Active Card
  const fbKeyActiveCard = `other6_14_active_${safeData.id || 'default'}`;

  // Local State
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyActiveCard] !== undefined) setActiveCardId(d[fbKeyActiveCard]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyActiveCard]);

  // Click Handler
  const handleCardClick = async (cardId: string) => {
    if (userRole !== 'teacher') return; // เฉพาะครูที่กดสั่งการได้
    
    const newActiveId = activeCardId === cardId ? null : cardId; // กดซ้ำเพื่อยกเลิก
    setActiveCardId(newActiveId);

    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyActiveCard]: newActiveId }); } 
      catch (e) { console.error(e); }
    }
  };

  const speakChinese = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // ไม่ให้คลิกลำโพงแล้วทะลุไปคลิกการ์ด
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[_。，？！、.,?!“”]/g, ''));
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex flex-col w-full font-sans text-left relative bg-white/50 rounded-3xl min-h-screen p-4 md:p-10">
      
      {/* Header */}
      <div className="flex items-end gap-4 mb-10">
        <span className="text-2xl md:text-3xl font-bold text-slate-800">{mainTitle}</span>
        <span className="text-xl md:text-2xl font-bold text-slate-500 mb-0.5">{subTitle}</span>
      </div>

      {/* Content Area (Background สมุดเหมือนในรูป) */}
      <div className="bg-[#f5f1e8] rounded-3xl border-4 border-[#d1c5b4] p-6 md:p-10 shadow-inner mb-12">
         
         {/* Grid 2 Columns สำหรับการ์ด */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {cards.map((card) => {
               const isActive = activeCardId === card.id;
               const pinyinText = pinyinConverter(card.chineseText);

               return (
                  <div 
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`flex items-stretch bg-white rounded-2xl border-4 transition-all duration-300 shadow-sm
                      ${isActive 
                        ? 'border-indigo-400 bg-indigo-50/50 scale-105 shadow-xl ring-4 ring-indigo-100' 
                        : 'border-white hover:border-slate-200'}
                      ${userRole === 'teacher' ? 'cursor-pointer' : ''}
                    `}
                  >
                     {/* Left: Symbol */}
                     <div className={`w-24 md:w-32 flex items-center justify-center shrink-0 border-r-2 border-slate-100 rounded-l-xl
                        ${isActive ? 'bg-indigo-100/50' : 'bg-slate-50/50'}
                     `}>
                        <span className="text-5xl md:text-6xl font-black text-yellow-500 drop-shadow-md" style={{ textShadow: '2px 2px 0px #b45309' }}>
                           {card.symbol}
                        </span>
                     </div>

                     {/* Right: Text Content */}
                     <div className="flex-1 p-5 md:p-6 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                           {/* จีนอยู่บน Pinyin อยู่ล่าง ตามที่ต้องการ */}
                           <span className={`text-2xl md:text-3xl font-serif font-black tracking-wide ${isActive ? 'text-indigo-800' : 'text-slate-800'}`}>
                             {card.chineseText}
                           </span>
                           <span className={`text-sm md:text-base font-sans ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>
                             {pinyinText}
                           </span>
                        </div>

                        {/* Speaker Button */}
                        <button 
                          onClick={(e) => speakChinese(e, card.chineseText)}
                          className={`p-3 md:p-4 rounded-full shrink-0 transition-colors border-2 shadow-sm
                            ${isActive ? 'bg-indigo-500 text-white border-indigo-600 hover:bg-indigo-600 hover:scale-110' : 'bg-white text-orange-400 border-orange-100 hover:bg-orange-50 hover:border-orange-200'}
                          `}
                        >
                           <Volume2 size={24} />
                        </button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Vocabulary Box (กล่องโพสต์อิทด้านล่าง) */}
      <div className="flex justify-center md:justify-end mt-auto">
         <div className="bg-[#fef8e7] border-2 border-[#e8dcb9] rounded-2xl p-6 shadow-md max-w-3xl w-full rotate-1 hover:rotate-0 transition-transform">
            
            <h4 className="text-slate-600 font-bold mb-4 border-b border-[#e8dcb9] pb-2 text-sm md:text-base">
               {vocabTitle}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
               {vocabs.map((vocab) => (
                  <div key={vocab.id} className="flex items-center gap-4 group">
                     <span className="text-xl md:text-2xl font-serif font-bold text-slate-800 group-hover:text-indigo-600 transition-colors w-16">
                        {vocab.chinese}
                     </span>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-500">{pinyinConverter(vocab.chinese)}</span>
                        <span className="text-sm text-slate-600">{vocab.thai}</span>
                     </div>
                  </div>
               ))}
            </div>

         </div>
      </div>

    </div>
  );
}