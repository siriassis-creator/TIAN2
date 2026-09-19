// src/components/Other_lesson6-11.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Search, X, Pencil, PauseCircle, Repeat } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Flashcard6_11 { id: string; character: string; word: string; }
export interface RadicalInfo6_11 { radical: string; nameZh: string; pinyin: string; descZh: string; descTh: string; }
export interface OtherLesson6_11Data { id?: string; patternType: 'other_lesson6-11'; mainTitle1: string; subTitle1: string; part1Cards: Flashcard6_11[]; mainTitle2: string; subTitle2: string; radicalInfo: RadicalInfo6_11; part2Cards: Flashcard6_11[]; }
interface Props { data: OtherLesson6_11Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === กระดาน Hanzi ตัวเดียว ===
const SingleHanziWriter = ({ character, size = 100, pinyin, showControls = false, hideQuiz = false, layout = 'col', userRole, remoteAnimCmd, onBroadcastAnim, customStrokeColor, customPinyinColor }: any) => {
  const containerRef = useRef<HTMLDivElement>(null); const writerRef = useRef<any>(null);
  const [animState, setAnimState] = useState<'idle'|'playing'|'paused'>('idle');
  const lastAnimTs = useRef(0);
  const isStudentSynced = userRole === 'student' && onBroadcastAnim !== undefined;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; 
    writerRef.current = HanziWriter.create(containerRef.current, character, { width: size, height: size, padding: size > 40 ? 4 : 2, showOutline: true, strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300, strokeColor: customStrokeColor || '#334155', radicalColor: customStrokeColor || '#334155', outlineColor: '#e2e8f0', drawingColor: '#f97316' });
    setAnimState('idle');
  }, [character, size, customStrokeColor]);

  useEffect(() => {
    if (remoteAnimCmd && remoteAnimCmd.char === character && remoteAnimCmd.ts !== lastAnimTs.current) {
      lastAnimTs.current = remoteAnimCmd.ts; if (!writerRef.current || userRole === 'teacher') return;
      if (remoteAnimCmd.action === 'animate') { setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') }); }
      else if (remoteAnimCmd.action === 'pause') { writerRef.current.pauseAnimation(); setAnimState('paused'); }
      else if (remoteAnimCmd.action === 'resume') { writerRef.current.resumeAnimation(); setAnimState('playing'); }
    }
  }, [remoteAnimCmd, character, userRole]);

  const handleAnimate = (e: React.MouseEvent) => {
    e.stopPropagation(); if (!writerRef.current || isStudentSynced) return;
    let act = animState === 'idle' ? 'animate' : (animState === 'playing' ? 'pause' : 'resume');
    if (userRole === 'teacher' && onBroadcastAnim) onBroadcastAnim(character, act);
    if (act === 'animate') { setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') }); }
    else if (act === 'pause') { writerRef.current.pauseAnimation(); setAnimState('paused'); }
    else if (act === 'resume') { writerRef.current.resumeAnimation(); setAnimState('playing'); }
  };
  const handleQuiz = (e: React.MouseEvent) => { e.stopPropagation(); if (!writerRef.current || isStudentSynced) return; setAnimState('idle'); writerRef.current.quiz(); };

  const hideBg = !showControls; 

  return (
    <div className={`flex flex-col items-center z-20 relative shrink-0`} style={{ width: size }}>
      {showControls && layout === 'col-top' && (
        <div className="flex flex-col gap-1 w-full px-1 mb-2">
          {/* ปุ่ม Pause / Resume / ลำดับ */}
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1.5 ${size <= 40 ? 'text-[11px] md:text-[12px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

const HanziWordWriter = ({ text, align = 'center', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split(''); const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  const pinyins = pinyinConverter(text, { type: 'array' });
  return (
    <div className={`flex ${flexWrap} items-start gap-y-4 ${justifyClass} relative z-20`}>
      {chars.map((char: string, idx: number) => {
         const isChinese = /[\u4e00-\u9fa5]/.test(char);
         return isChinese ? (
           <div key={idx} className="mr-1 md:mr-1.5">
             <SingleHanziWriter 
               character={char} size={size} pinyin={showPinyin ? pinyins[idx] : undefined} 
               showControls={showControls} hideQuiz={hideQuiz} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor} 
             />
           </div>
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0 mr-1">
             {showControls && layout === 'col-top' && <div className={`w-full ${hideQuiz ? 'h-[28px]' : 'h-[62px]'}`}></div>}
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-2" style={{ fontSize: size * 0.6, width: size/2, height: size }}>{char}</div>
             {showPinyin && <div className="h-3 mt-1.5"></div>}
           </div>
         )
      })}
    </div>
  );
};

export default function OtherLesson6_11({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_11Data);
  
  const defaultData: Partial<OtherLesson6_11Data> = {
    mainTitle1: '1. 读一读，认一认。',
    subTitle1: 'ฝึกอ่านและจำตัวอักษรจีน',
    part1Cards: [{ id: 'p1_1', character: '钱', word: '多少钱' }, { id: 'p1_2', character: '贵', word: '真贵' }, { id: 'p1_3', character: '百', word: '一百块' }],
    mainTitle2: '2. 偏旁学习。',
    subTitle2: 'เรียนรู้หมวดอักษร',
    radicalInfo: { radical: '钅', nameZh: '金字旁', pinyin: 'jīnzìpáng', descZh: '含有“钅”的字大多和金属有关。', descTh: 'ตัวอักษรที่มีหมวด 钅 ส่วนใหญ่จะเกี่ยวข้องกับโลหะ' },
    part2Cards: [{ id: 'p2_1', character: '钱', word: '多少钱' }, { id: 'p2_2', character: '镜', word: '眼镜 镜子' }, { id: 'p2_3', character: '铅', word: '铅笔' }]
  };

  const mainTitle1 = safeData.mainTitle1 || defaultData.mainTitle1;
  const subTitle1 = safeData.subTitle1 || defaultData.subTitle1;
  const part1Cards = Array.isArray(safeData.part1Cards) && safeData.part1Cards.length > 0 ? safeData.part1Cards : (defaultData.part1Cards as Flashcard6_11[]);
  
  const mainTitle2 = safeData.mainTitle2 || defaultData.mainTitle2;
  const subTitle2 = safeData.subTitle2 || defaultData.subTitle2;
  const radicalInfo = safeData.radicalInfo || defaultData.radicalInfo;
  const part2Cards = Array.isArray(safeData.part2Cards) && safeData.part2Cards.length > 0 ? safeData.part2Cards : (defaultData.part2Cards as Flashcard6_11[]);

  // Firebase Keys
  const fbKeyP1Flipped = `other6_11_p1flip_${safeData.id || 'default'}`; 
  const fbKeyP2Flipped = `other6_11_p2flip_${safeData.id || 'default'}`; 
  const fbKeyWriteModal = `other6_11_wmodal_${safeData.id || 'default'}`; 
  const fbKeyWriteAnim = `other6_11_wanim_${safeData.id || 'default'}`;

  // Local States
  const [p1Flipped, setP1Flipped] = useState<Record<number, boolean>>({});
  const [p2Flipped, setP2Flipped] = useState<Record<number, boolean>>({});
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyP1Flipped]) setP1Flipped(d[fbKeyP1Flipped]);
        if (d[fbKeyP2Flipped]) setP2Flipped(d[fbKeyP2Flipped]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyP1Flipped, fbKeyP2Flipped, fbKeyWriteModal, fbKeyWriteAnim]);

  // Actions
  const toggleFlipP1 = async (index: number) => {
    if (userRole !== 'teacher') return;
    const newFlipped = { ...p1Flipped, [index]: !p1Flipped[index] };
    setP1Flipped(newFlipped);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP1Flipped]: newFlipped }); } catch(e){} }
  };

  const toggleFlipP2 = async (index: number) => {
    if (userRole !== 'teacher') return;
    const newFlipped = { ...p2Flipped, [index]: !p2Flipped[index] };
    setP2Flipped(newFlipped);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP2Flipped]: newFlipped }); } catch(e){} }
  };

  const openWritingModal = async (text: string | null) => {
    setWritingModalText(text);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: text }); } catch(e){} }
  };

  const speakChinese = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[。，？！、.,?!]/g, ''));
    utterance.lang = 'zh-CN'; utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const broadcastAnimCmd = async (char: string, action: string) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){}
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-8 pb-16">
        
        {/* ==================== ส่วนที่ 1: ฝึกอ่านและจำตัวอักษร ==================== */}
        <div className="mb-12">
          {/* Header 1 */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle1}</span>
            <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle1}</span>
          </div>

          {/* Cards 1 */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {part1Cards.map((card, idx) => {
              const isFlipped = !!p1Flipped[idx];
              return (
                <div key={card.id} className="relative w-40 md:w-48 aspect-[3/4] [perspective:1000px] group">
                  <div className={`absolute inset-0 w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRONT: อักษรจีน */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center rounded-2xl overflow-hidden hover:border-orange-300 transition-colors">
                       <div className="text-6xl md:text-[80px] font-serif font-black text-slate-800 leading-none">{card.character}</div>
                       <div className="text-lg md:text-xl font-serif text-slate-600 mt-4">{card.word}</div>
                       
                       {/* ควบคุมด้านล่าง */}
                       <div className="absolute bottom-0 left-0 w-full bg-slate-50 p-2 flex justify-around border-t border-slate-100">
                         <button onClick={() => speakChinese(card.word)} className="p-2 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110" title="ฟังเสียง"><Volume2 size={16}/></button>
                         {userRole === 'teacher' && (
                           <>
                             <button onClick={() => openWritingModal(card.word)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:scale-110" title="ขยายเพื่อฝึกเขียน"><Search size={16}/></button>
                             <button onClick={() => toggleFlipP1(idx)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full shadow-sm hover:scale-110" title="พลิกดูพินอิน"><Repeat size={16}/></button>
                           </>
                         )}
                       </div>
                    </div>

                    {/* BACK: พินอิน (Pinyin) */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-orange-50 border-2 border-orange-200 shadow-sm flex flex-col items-center justify-center rounded-2xl overflow-hidden">
                       <div className="text-3xl md:text-4xl font-mono font-bold text-orange-600 mb-4 tracking-wider">{pinyinConverter(card.character)}</div>
                       <div className="text-lg md:text-xl font-mono text-slate-600">{pinyinConverter(card.word)}</div>
                       
                       {/* ควบคุมด้านล่าง */}
                       <div className="absolute bottom-0 left-0 w-full bg-white/50 p-2 flex justify-around border-t border-orange-100">
                         <button onClick={() => speakChinese(card.word)} className="p-2 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110" title="ฟังเสียง"><Volume2 size={16}/></button>
                         {userRole === 'teacher' && (
                           <>
                             <button onClick={() => openWritingModal(card.word)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:scale-110" title="ขยายเพื่อฝึกเขียน"><Search size={16}/></button>
                             <button onClick={() => toggleFlipP1(idx)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full shadow-sm hover:scale-110" title="พลิกกลับ"><Repeat size={16}/></button>
                           </>
                         )}
                       </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-10"></div>

        {/* ==================== ส่วนที่ 2: เรียนรู้หมวดอักษร ==================== */}
        <div>
          {/* Header 2 */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle2}</span>
            <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle2}</span>
          </div>

          {/* ตาราง 4 คอลัมน์ */}
          <div className="w-full border-2 border-[#b5e0d3] bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-sm">
             
             {/* Column 1: หมวดอักษร (Radical Info) */}
             <div className="w-full lg:w-[35%] bg-emerald-50/50 p-6 md:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-dashed border-[#b5e0d3]">
                <div className="text-6xl md:text-7xl font-serif font-black text-emerald-600 mb-2">{radicalInfo.radical}</div>
                <div className="flex flex-col mb-4">
                   <span className="text-emerald-700 font-bold text-lg">{radicalInfo.nameZh}</span>
                   <span className="text-emerald-600 font-mono text-sm">{radicalInfo.pinyin}</span>
                </div>
                <p className="text-slate-600 font-serif text-base mb-1 leading-relaxed">{radicalInfo.descZh}</p>
                <p className="text-slate-500 text-sm">{radicalInfo.descTh}</p>
             </div>

             {/* Column 2-4: Cards ในตาราง */}
             <div className="w-full lg:w-[65%] grid grid-cols-1 md:grid-cols-3">
               {part2Cards.map((card, idx) => {
                 const isFlipped = !!p2Flipped[idx];
                 return (
                   <div key={card.id} className="relative w-full h-full min-h-[220px] p-6 border-b md:border-b-0 md:border-r border-dashed border-[#b5e0d3] last:border-0 flex flex-col items-center justify-center [perspective:1000px] group">
                      
                      <div className={`absolute inset-0 w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                         
                         {/* FRONT: อักษรจีน */}
                         <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white flex flex-col items-center justify-center">
                            <div className="text-5xl md:text-6xl font-serif font-black text-slate-800 mb-4">{card.character}</div>
                            <div className="text-base md:text-lg font-serif text-slate-600 text-center px-2">{card.word}</div>
                            
                            {/* เมนูลอยเมื่อ Hover (สำหรับครู) */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                              <button onClick={() => speakChinese(card.word)} className="p-2 bg-slate-50 text-orange-500 rounded-full shadow-sm hover:scale-110 border border-slate-100"><Volume2 size={14}/></button>
                              {userRole === 'teacher' && (
                                <>
                                  <button onClick={() => openWritingModal(card.word)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:scale-110 border border-indigo-100"><Search size={14}/></button>
                                  <button onClick={() => toggleFlipP2(idx)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full shadow-sm hover:scale-110 border border-emerald-100"><Repeat size={14}/></button>
                                </>
                              )}
                            </div>
                         </div>

                         {/* BACK: พินอิน (Pinyin) */}
                         <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-emerald-50 flex flex-col items-center justify-center">
                            <div className="text-2xl md:text-3xl font-mono font-bold text-emerald-600 mb-4 tracking-wider">{pinyinConverter(card.character)}</div>
                            <div className="text-sm md:text-base font-mono text-emerald-700 text-center px-2 leading-relaxed">{pinyinConverter(card.word)}</div>

                            {/* เมนูลอยเมื่อ Hover (สำหรับครู) */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                              <button onClick={() => speakChinese(card.word)} className="p-2 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110 border border-slate-100"><Volume2 size={14}/></button>
                              {userRole === 'teacher' && (
                                <>
                                  <button onClick={() => openWritingModal(card.word)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:scale-110 border border-indigo-100"><Search size={14}/></button>
                                  <button onClick={() => toggleFlipP2(idx)} className="p-2 bg-white text-emerald-600 rounded-full shadow-sm hover:scale-110 border border-emerald-100"><Repeat size={14}/></button>
                                </>
                              )}
                            </div>
                         </div>

                      </div>

                   </div>
                 );
               })}
             </div>
          </div>
        </div>

      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (มีลำโพง พัก เล่นต่อ และเขียนครบชุด) === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <div className="flex gap-2">
                <button onClick={() => speakChinese(writingModalText)} className="px-4 py-2 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full font-bold flex items-center gap-2 transition-colors"><Volume2 size={18}/> ฟังเสียง</button>
                <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              {/* หน้าต่างขยายเต็มจอ ให้มีทั้งลำดับและเขียน (hideQuiz=false) */}
              <HanziWordWriter text={writingModalText} size={110} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}