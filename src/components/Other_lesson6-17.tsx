// src/components/Other_lesson6-17.tsx
import React, { useState, useEffect } from 'react';
import { Volume2, Check, RotateCcw } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface Card6_17 { id: string; num: number; sentence: string; img1Url: string; img2Url: string; correctAnswer: 1 | 2; }
export interface OtherLesson6_17Data { id?: string; patternType: 'other_lesson6-17'; mainTitle: string; subTitle: string; cards: Card6_17[]; }
interface Props { data: OtherLesson6_17Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === Component ช่วยแปลง Text ให้มี Pinyin ด้านบน ===
const AutoPinyinText = ({ text }: { text: string }) => {
  if (!text) return null;
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });

  return (
    <div className="flex flex-wrap items-end">
      {chars.map((char, i) => {
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunctuation = /[。，？！、.,?!]/.test(char);
        
        return (
          <div key={i} className={`flex flex-col items-center ${isPunctuation ? '-ml-1 md:-ml-1.5' : 'mr-0.5'} mb-1`}>
            {isChinese && !isPunctuation ? (
              <span className={`text-[10px] md:text-xs font-sans mb-0.5 leading-none text-slate-500`}>{pinyins[i]}</span>
            ) : (
              <span className="h-[12px] md:h-[14px] mb-0.5"></span> 
            )}
            <span className={`text-xl md:text-2xl leading-none font-serif font-black text-slate-800`}>{char}</span>
          </div>
        );
      })}
    </div>
  );
};

// สีพื้นหลังของการ์ด
const CARD_BG_COLORS = ['bg-[#fdf3eb]', 'bg-[#eef8f2]', 'bg-[#faeded]', 'bg-[#ebf4fa]'];

export default function OtherLesson6_17({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_17Data);
  
  const mainTitle = safeData.mainTitle || '2. 读一读，选择正确的图片。';
  const subTitle = safeData.subTitle || 'ฝึกอ่านแล้วเลือกรูปภาพที่ตรงกับความหมายของประโยค';
  
  // ข้อมูลสำรอง (Fallback)
  const defaultCards: Card6_17[] = [
    { id: 'c1', num: 1, sentence: '这个杯子十块钱。', img1Url: '', img2Url: '', correctAnswer: 2 },
    { id: 'c2', num: 2, sentence: '这支笔真贵啊！', img1Url: '', img2Url: '', correctAnswer: 2 },
    { id: 'c3', num: 3, sentence: '那块橡皮多少钱？', img1Url: '', img2Url: '', correctAnswer: 2 },
    { id: 'c4', num: 4, sentence: '一百泰铢是二十二块人民币。', img1Url: '', img2Url: '', correctAnswer: 1 }
  ];

  const cards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  // Firebase Key
  const fbKeyRevealed = `other6_17_rev_${safeData.id || 'default'}`;

  // Local State
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyRevealed]) setRevealed(d[fbKeyRevealed]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyRevealed]);

  // Actions
  const toggleReveal = async (id: string) => {
    if (userRole !== 'teacher') return;
    const newRevealed = { ...revealed, [id]: !revealed[id] };
    setRevealed(newRevealed);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: newRevealed }); } catch(e){} }
  };

  const resetAll = async () => {
    if (userRole !== 'teacher') return;
    setRevealed({});
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: {} }); } catch(e){} }
  };

  const speakChinese = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[_。，？！、.,?!“”]/g, ''));
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    // 🎯 เอา min-h-screen ออก และปรับ Padding ให้พอดีเนื้อหา (ไม่ดันปุ่มด้านล่าง)
    <div className="flex flex-col w-full font-sans text-left relative bg-white rounded-3xl p-4 md:p-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pl-2 md:pl-4">
        <div className="flex items-end gap-3">
          <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle}</span>
          <span className="text-lg md:text-xl font-bold text-slate-500 mb-0.5">{subTitle}</span>
        </div>
        {userRole === 'teacher' && (
          <button onClick={resetAll} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 self-start md:self-auto"><RotateCcw size={14}/> ล้างเฉลยทั้งหมด</button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
         {cards.map((card, index) => {
            const isRev = revealed[card.id];
            const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length]; 

            return (
               <div key={card.id} className={`${bgColor} rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row items-center relative shadow-sm border border-white/50 group`}>
                  
                  {/* Number Badge */}
                  <div className="absolute -left-2 -top-2 w-7 h-7 rounded-full bg-[#e8a156] text-white flex items-center justify-center font-bold text-xs shadow-sm border-2 border-white">
                     {card.num}
                  </div>

                  {/* Left: Speaker & Sentence */}
                  <div className="flex-1 flex flex-row items-center gap-3 sm:pr-4 sm:border-r-2 sm:border-white/60 mb-4 sm:mb-0 w-full">
                     <button onClick={() => speakChinese(card.sentence)} className="p-2 shrink-0 bg-white/60 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full shadow-sm transition-all border border-white opacity-70 group-hover:opacity-100">
                        <Volume2 size={18}/>
                     </button>
                     <div className="flex-1">
                        <AutoPinyinText text={card.sentence} />
                     </div>
                  </div>

                  {/* Right: Images and Checkboxes */}
                  <div className="flex-1 flex items-center justify-around sm:pl-4 gap-2 w-full">
                     
                     {/* Option 1 */}
                     <div className="flex flex-col items-center gap-3 w-1/2 cursor-pointer" onClick={() => toggleReveal(card.id)}>
                        <div className="h-20 md:h-24 flex items-end justify-center w-full">
                           {card.img1Url ? <img src={card.img1Url} alt="1" className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" /> : <div className="text-slate-300/50 text-5xl">?</div>}
                        </div>
                        <div className={`w-6 h-6 md:w-7 md:h-7 border-[2.5px] flex items-center justify-center rounded transition-all duration-300
                          ${isRev && card.correctAnswer === 1 ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-sm' : 'bg-white border-slate-300'}
                        `}>
                           {isRev && card.correctAnswer === 1 && <Check size={16} strokeWidth={4} />}
                        </div>
                     </div>

                     {/* Option 2 */}
                     <div className="flex flex-col items-center gap-3 w-1/2 cursor-pointer" onClick={() => toggleReveal(card.id)}>
                        <div className="h-20 md:h-24 flex items-end justify-center w-full">
                           {card.img2Url ? <img src={card.img2Url} alt="2" className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" /> : <div className="text-slate-300/50 text-5xl">?</div>}
                        </div>
                        <div className={`w-6 h-6 md:w-7 md:h-7 border-[2.5px] flex items-center justify-center rounded transition-all duration-300
                          ${isRev && card.correctAnswer === 2 ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-sm' : 'bg-white border-slate-300'}
                        `}>
                           {isRev && card.correctAnswer === 2 && <Check size={16} strokeWidth={4} />}
                        </div>
                     </div>

                  </div>

               </div>
            );
         })}
      </div>

    </div>
  );
}