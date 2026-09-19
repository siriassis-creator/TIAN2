// src/components/Other_lesson6-15.tsx
import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, RotateCcw } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface ExercisePart6_15 { id: string; prefix: string; answer: string; suffix: string; }
export interface OtherLesson6_15Data { id?: string; patternType: 'other_lesson6-15'; mainTitle: string; subTitle: string; leftParagraphs: string[]; rightExercises: ExercisePart6_15[]; }
interface Props { data: OtherLesson6_15Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === Component ช่วยแปลง Text ให้มี Pinyin ด้านบน (แยกเป็นคำๆ) ===
const AutoPinyinText = ({ text, highlight = false }: { text: string, highlight?: boolean }) => {
  if (!text) return null;
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });

  return (
    <div className="flex flex-wrap items-end">
      {chars.map((char, i) => {
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunctuation = /[。，？！、.,?!]/.test(char);
        
        return (
          <div key={i} className={`flex flex-col items-center ${isPunctuation ? '-ml-1 md:-ml-2' : 'mr-0.5 md:mr-1'} mb-1`}>
            {isChinese && !isPunctuation ? (
              <span className={`text-[11px] md:text-xs font-sans mb-0.5 leading-none ${highlight ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                {pinyins[i]}
              </span>
            ) : (
              <span className="h-[14px] md:h-[16px] mb-0.5"></span>
            )}
            <span className={`text-2xl md:text-3xl leading-none ${highlight ? 'font-sans font-bold text-emerald-600' : 'font-serif font-black text-slate-800'}`}>
              {char}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function OtherLesson6_15({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_15Data);
  
  const mainTitle = safeData.mainTitle || '2. 仿照示例，写一写，说一说。';
  const subTitle = safeData.subTitle || 'ฝึกเขียนและพูดตามตัวอย่าง';
  
  // 🎯 ข้อมูลสำรอง (Fallback)
  const defaultLeft = [
    '中国的钱叫人民币。',
    '人民币有1块、5块、10块、20块、50块和100块。',
    '100块人民币是450泰铢。'
  ];
  
  const defaultRight = [
    { id: 'ex1', prefix: '泰国的钱叫', answer: '泰铢', suffix: '。' },
    { id: 'ex2', prefix: '有', answer: '1铢、2铢、5铢、10铢、20铢、50铢', suffix: '' },
    { id: 'ex3', prefix: '和', answer: '100铢、500铢、1000铢', suffix: '。' },
    { id: 'ex4', prefix: '100泰铢是', answer: '22', suffix: '块人民币。' }
  ];

  const leftParagraphs = Array.isArray(safeData.leftParagraphs) && safeData.leftParagraphs.length > 0 ? safeData.leftParagraphs : defaultLeft;
  const rightExercises = Array.isArray(safeData.rightExercises) && safeData.rightExercises.length > 0 ? safeData.rightExercises : defaultRight;

  // Firebase Keys
  const fbKeyRevealed = `other6_15_rev_${safeData.id || 'default'}`;

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

  // Click Handlers
  const toggleReveal = async (id: string) => {
    if (userRole !== 'teacher') return;
    const newRevealed = { ...revealed, [id]: !revealed[id] };
    setRevealed(newRevealed);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: newRevealed }); } catch(e){} }
  };

  const revealAll = async () => {
    if (userRole !== 'teacher') return;
    const allRev: Record<string, boolean> = {};
    rightExercises.forEach(ex => allRev[ex.id] = true);
    setRevealed(allRev);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: allRev }); } catch(e){} }
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

  const getFullRightSentence = (ex: ExercisePart6_15) => {
    return `${ex.prefix}${ex.answer}${ex.suffix}`;
  };

  return (
    <div className="flex flex-col w-full font-sans text-left relative bg-white/50 rounded-3xl p-4 md:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-end gap-3">
          <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle}</span>
          <span className="text-lg md:text-xl font-bold text-slate-500 mb-0.5">{subTitle}</span>
        </div>
        {userRole === 'teacher' && (
          <div className="flex gap-2">
            <button onClick={resetAll} className="px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full text-xs font-bold transition-colors flex items-center gap-1"><RotateCcw size={14}/> ล้าง</button>
            <button onClick={revealAll} className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-full text-xs font-bold transition-colors flex items-center gap-1"><CheckCircle2 size={14}/> เฉลยทั้งหมด</button>
          </div>
        )}
      </div>

      {/* Content Layout: แบ่งครึ่งซ้ายขวาด้วย Dashed Line (ลดระยะห่างลงเพื่อให้พอดีจอ) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col lg:flex-row overflow-hidden">
         
         {/* ฝั่งซ้าย: ประโยคตัวอย่าง */}
         <div className="flex-1 p-5 md:p-8 lg:border-r-2 lg:border-dashed lg:border-slate-300 bg-slate-50/50 flex flex-col justify-center gap-6">
            {leftParagraphs.map((para, idx) => (
               <div key={idx} className="flex flex-row items-center gap-3 group">
                  <button onClick={() => speakChinese(para)} className="p-2 shrink-0 bg-white text-orange-400 hover:bg-orange-500 hover:text-white border border-slate-200 rounded-full shadow-sm transition-all opacity-50 group-hover:opacity-100">
                     <Volume2 size={18} />
                  </button>
                  <div className="flex-1">
                     <AutoPinyinText text={para} />
                  </div>
               </div>
            ))}
         </div>

         {/* ฝั่งขวา: แบบฝึกหัดเติมคำ */}
         <div className="flex-1 p-5 md:p-8 flex flex-col justify-center gap-6">
            {rightExercises.map((ex) => {
               const isRev = revealed[ex.id];

               return (
                 <div key={ex.id} className="flex flex-row items-center gap-3 group">
                    <button onClick={() => speakChinese(getFullRightSentence(ex))} className="p-2 shrink-0 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white border border-slate-200 rounded-full shadow-sm transition-all opacity-50 group-hover:opacity-100">
                       <Volume2 size={18} />
                    </button>
                    
                    <div className="flex-1 flex flex-wrap items-end leading-none gap-y-3">
                       
                       {/* Prefix (หน้าช่องว่าง) */}
                       {ex.prefix && <AutoPinyinText text={ex.prefix} />}

                       {/* ช่องว่างสำหรับคลิกเฉลย */}
                       <div 
                         onClick={() => toggleReveal(ex.id)}
                         className={`mx-1.5 border-b-2 flex flex-col items-center justify-end pb-0.5 transition-all duration-300 cursor-pointer group/blank
                           ${isRev ? 'border-emerald-400 min-w-[50px]' : 'border-slate-400 min-w-[80px] md:min-w-[100px] hover:border-emerald-400'}
                         `}
                       >
                          {isRev ? (
                             <div className="animate-fade-in -mb-1 px-1.5">
                                <AutoPinyinText text={ex.answer} highlight={true} />
                             </div>
                          ) : (
                             <div className="h-[30px] md:h-[40px] w-full flex items-center justify-center opacity-0 group-hover/blank:opacity-100 transition-opacity">
                               {userRole === 'teacher' && <span className="text-[10px] font-bold text-slate-400 tracking-wider">คลิกเฉลย</span>}
                             </div>
                          )}
                       </div>

                       {/* Suffix (หลังช่องว่าง) */}
                       {ex.suffix && <AutoPinyinText text={ex.suffix} />}

                    </div>
                 </div>
               );
            })}
         </div>

      </div>

    </div>
  );
}