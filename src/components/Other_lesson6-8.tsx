// src/components/Other_lesson6-8.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Search, X, Pencil, Maximize2, CheckCircle2, RotateCw, Repeat } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_8 { id: string; imageUrl: string; noun: string; pinyin: string; priceNumber: string; priceSpoken: string; }
export interface OtherLesson6_8Data { id?: string; patternType: 'other_lesson6-8'; mainTitle: string; subTitle: string; cards: Card6_8[]; }
interface Props { data: OtherLesson6_8Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

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
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>▶ ลำดับ</button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1 ${size <= 40 ? 'text-[11px]' : 'text-[15px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

const HanziWordWriter = ({ text, align = 'center', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split(''); const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  return (
    <div className={`flex ${flexWrap} items-end gap-1 ${justifyClass} relative z-20`}>
      {chars.map((char: string, idx: number) => (
         /[\u4e00-\u9fa5]/.test(char) ? (
           <SingleHanziWriter key={idx + char} character={char} size={size} pinyin={showPinyin ? pinyinConverter(char) : undefined} showControls={showControls} hideQuiz={hideQuiz} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor} />
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0 mb-1">
             {showControls && layout === 'col-top' && <div className={`w-full ${hideQuiz ? 'h-[28px]' : 'h-[62px]'}`}></div>}
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-2" style={{ fontSize: size * 0.6, width: size/2, height: size }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};

export default function OtherLesson6_8({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_8Data);
  
  const defaultCards: Card6_8[] = [
    { id: `c_def_1`, imageUrl: '', noun: '面包', pinyin: 'miànbāo', priceNumber: '5.80', priceSpoken: '五块八' },
    { id: `c_def_2`, imageUrl: '', noun: '橡皮', pinyin: 'xiàngpí', priceNumber: '1.80', priceSpoken: '一块八' },
    { id: `c_def_3`, imageUrl: '', noun: '可乐', pinyin: 'kělè', priceNumber: '3.80', priceSpoken: '三块八' },
    { id: `c_def_4`, imageUrl: '', noun: '果汁', pinyin: 'guǒzhī', priceNumber: '5.00', priceSpoken: '五块' },
    { id: `c_def_5`, imageUrl: '', noun: '牛奶', pinyin: 'niúnǎi', priceNumber: '3.50', priceSpoken: '三块五' },
    { id: `c_def_6`, imageUrl: '', noun: '铅笔', pinyin: 'qiānbǐ', priceNumber: '5.00', priceSpoken: '五块' },
    { id: `c_def_7`, imageUrl: '', noun: '山竹', pinyin: 'shānzhú', priceNumber: '6.80', priceSpoken: '六块八' },
    { id: `c_def_8`, imageUrl: '', noun: '香蕉', pinyin: 'xiāngjiāo', priceNumber: '6.80', priceSpoken: '六块八' },
    { id: `c_def_9`, imageUrl: '', noun: '书包', pinyin: 'shūbāo', priceNumber: '399.00', priceSpoken: '三百九十九块' },
    { id: `c_def_10`, imageUrl: '', noun: '课本', pinyin: 'kèběn', priceNumber: '120.00', priceSpoken: '一百二十块' },
    { id: `c_def_11`, imageUrl: '', noun: '书', pinyin: 'shū', priceNumber: '52.00', priceSpoken: '五十二块' },
    { id: `c_def_12`, imageUrl: '', noun: '裙子', pinyin: 'qúnzi', priceNumber: '129.00', priceSpoken: '一百二十九块' },
    { id: `c_def_13`, imageUrl: '', noun: '椅子', pinyin: 'yǐzi', priceNumber: '599.00', priceSpoken: '五百九十九块' },
    { id: `c_def_14`, imageUrl: '', noun: '桌子', pinyin: 'zhuōzi', priceNumber: '799.00', priceSpoken: '七百九十九块' },
    { id: `c_def_15`, imageUrl: '', noun: '菠萝', pinyin: 'bōluó', priceNumber: '10.00', priceSpoken: '十块' },
    { id: `c_def_16`, imageUrl: '', noun: '笔记本', pinyin: 'bǐjìběn', priceNumber: '8.90', priceSpoken: '八块九' },
    { id: `c_def_17`, imageUrl: '', noun: '笔袋', pinyin: 'bǐdài', priceNumber: '19.80', priceSpoken: '十九块八' },
    { id: `c_def_18`, imageUrl: '', noun: '梨', pinyin: 'lí', priceNumber: '6.80', priceSpoken: '六块八' }
  ];
  
  const mainTitle = safeData.mainTitle || '3. 扔橡皮游戏。';
  const subTitle = safeData.subTitle || 'เกมโยนยางลบ';
  const allCards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  // Firebase Keys
  const fbKeySlots = `other6_8_slots_${safeData.id || 'default'}`;       
  const fbKeyNextDraw = `other6_8_ndraw_${safeData.id || 'default'}`;     
  const fbKeyFlipped = `other6_8_flipped_${safeData.id || 'default'}`;    
  const fbKeyActive = `other6_8_active_${safeData.id || 'default'}`;      
  const fbKeyRevealed = `other6_8_revealed_${safeData.id || 'default'}`;  
  const fbKeyWriteModal = `other6_8_wmodal_${safeData.id || 'default'}`; 
  const fbKeyWriteAnim = `other6_8_wanim_${safeData.id || 'default'}`;

  // Local States
  const [boardSlots, setBoardSlots] = useState<string[]>([]);
  const [nextDrawIndex, setNextDrawIndex] = useState<number>(6);
  const [flippedSlots, setFlippedSlots] = useState<Record<number, boolean>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);

  // Initialize Board
  useEffect(() => {
    if (!roomPin) {
      if (boardSlots.length === 0) {
        setBoardSlots(allCards.slice(0, 6).map(c => c.id));
        setNextDrawIndex(6);
      }
      return;
    }

    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (userRole === 'teacher' && (!d[fbKeySlots] || d[fbKeySlots].length === 0)) {
          const initSlots = allCards.slice(0, 6).map(c => c.id);
          updateDoc(doc(db, 'live_sessions', roomPin), { 
            [fbKeySlots]: initSlots, [fbKeyNextDraw]: 6, [fbKeyFlipped]: {}, [fbKeyActive]: null, [fbKeyRevealed]: false 
          }).catch(()=>{});
        }
        if (d[fbKeySlots]) setBoardSlots(d[fbKeySlots]);
        if (d[fbKeyNextDraw] !== undefined) setNextDrawIndex(d[fbKeyNextDraw]);
        if (d[fbKeyFlipped]) setFlippedSlots(d[fbKeyFlipped]);
        if (d[fbKeyActive] !== undefined) setActiveCardId(d[fbKeyActive]);
        if (d[fbKeyRevealed] !== undefined) setIsRevealed(d[fbKeyRevealed]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, allCards, userRole]);

  // --- Actions ---
  // เมื่อคลิกที่การ์ด จะทำการล็อคสถานะ Flip และเปลี่ยนบทสนทนา (Active)
  const handleCardInteraction = async (slotIndex: number, cardId: string) => {
    if (userRole !== 'teacher') return;

    const currentFlipped = !!flippedSlots[slotIndex];
    const newFlipped = { ...flippedSlots, [slotIndex]: !currentFlipped };
    setFlippedSlots(newFlipped);

    // ถ้ากดให้หงาย (Flip) ให้เซ็ตเป็น Active ด้วย
    if (!currentFlipped) {
      setActiveCardId(cardId);
      setIsRevealed(false);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFlipped]: newFlipped, [fbKeyActive]: cardId, [fbKeyRevealed]: false }); } catch(e){}
      }
    } else {
      // ถ้ากดให้คว่ำ (Unflip) แค่คว่ำการ์ด แต่ยังให้บทสนทนาคงอยู่
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFlipped]: newFlipped }); } catch(e){}
      }
    }
  };

  // จั่วการ์ดใบใหม่มาแทนที่ใบเดิม
  const handleDrawNewCard = async (e: React.MouseEvent, slotIndex: number) => {
    e.stopPropagation();
    if (userRole !== 'teacher') return;

    const newCardToDraw = allCards[nextDrawIndex % allCards.length];
    const newSlots = [...boardSlots];
    newSlots[slotIndex] = newCardToDraw.id;
    const newNextDraw = nextDrawIndex + 1;
    
    const newFlipped = { ...flippedSlots };
    newFlipped[slotIndex] = false;

    let newActive = activeCardId;
    if (activeCardId === boardSlots[slotIndex]) {
      newActive = null;
      setIsRevealed(false);
    }

    setBoardSlots(newSlots);
    setNextDrawIndex(newNextDraw);
    setFlippedSlots(newFlipped);
    setActiveCardId(newActive);

    if (roomPin) {
      try { 
        await updateDoc(doc(db, 'live_sessions', roomPin), { 
          [fbKeySlots]: newSlots, [fbKeyNextDraw]: newNextDraw, [fbKeyFlipped]: newFlipped, [fbKeyActive]: newActive, [fbKeyRevealed]: false 
        }); 
      } catch(e){}
    }
  };

  const toggleReveal = async () => {
    if (userRole !== 'teacher' || !activeCardId) return;
    const newState = !isRevealed;
    setIsRevealed(newState);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: newState }); } catch(e){} }
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

  // ข้อมูลบทสนทนาที่กำลังใช้งาน
  const activeCardObj = allCards.find(c => c.id === activeCardId);
  const questionText = activeCardObj ? `${activeCardObj.noun}多少钱？` : '面包多少钱？';
  const answerText = activeCardObj ? `${activeCardObj.noun}${activeCardObj.priceSpoken}。` : '面包五块八。';

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-6 pb-24">
        
        {/* Header */}
        <div className="w-full mb-8">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl font-bold text-white tracking-wide">{mainTitle}</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] font-bold text-slate-700 flex-1">{subTitle}</div>
            
            {/* ปุ่มรีเซ็ตกระดานเล็กๆ สำหรับครู */}
            {userRole === 'teacher' && (
              <button 
                onClick={() => {
                  if(window.confirm('รีเซ็ตการ์ดทั้งหมดกลับเป็นค่าเริ่มต้น?')){
                    setBoardSlots(allCards.slice(0, 6).map(c=>c.id)); setNextDrawIndex(6); setFlippedSlots({}); setActiveCardId(null); setIsRevealed(false);
                    if(roomPin) updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySlots]: allCards.slice(0,6).map(c=>c.id), [fbKeyNextDraw]: 6, [fbKeyFlipped]: {}, [fbKeyActive]: null, [fbKeyRevealed]: false }).catch(()=>{});
                  }
                }} 
                className="ml-4 px-3 py-1.5 bg-slate-100 text-slate-500 hover:text-red-500 rounded-full text-xs font-bold shadow-sm"
              >
                🔄 รีเซ็ต
              </button>
            )}
          </div>
        </div>

        {/* Content Area: ซ้าย (สนทนา) / ขวา (การ์ด) ใช้ items-stretch เพื่อให้สูงเท่ากัน */}
        <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full">
          
          {/* ==================== 1. MAIN DIALOGUE ==================== */}
          <div className="w-full lg:w-[55%] flex flex-col relative">
            <div className="w-full h-full bg-slate-50/70 p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-10 relative min-h-[400px]">
               
               <div className={`flex items-end gap-4 w-full md:w-[90%] relative transition-opacity duration-300 ${!activeCardId ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                  <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-4xl">👦🏻</div>
                  <div className="bg-green-100 border-2 border-green-200 p-6 rounded-3xl rounded-bl-none shadow-sm relative flex-1 group">
                     <div className="absolute w-5 h-5 bg-green-100 border-b-2 border-l-2 border-green-200 -left-3 bottom-4 rotate-45"></div>
                     <div className="flex flex-col items-center">
                       <HanziWordWriter text={questionText} size={48} showControls={false} />
                     </div>
                     <div className="absolute -top-4 -right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {userRole === 'teacher' && <button onClick={() => openWritingModal(questionText)} className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:scale-110"><Maximize2 size={18}/></button>}
                        <button onClick={(e)=>{e.stopPropagation(); speakChinese(questionText);}} className="p-3 bg-white text-orange-500 rounded-full shadow-md hover:scale-110"><Volume2 size={18}/></button>
                     </div>
                  </div>
               </div>

               <div className={`flex items-end gap-4 w-full md:w-[90%] justify-end relative transition-opacity duration-300 ${!activeCardId ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                  <div className="relative flex-1 group">
                    <div className="bg-orange-100 border-2 border-orange-200 p-6 rounded-3xl rounded-br-none shadow-sm relative w-full h-full">
                       <div className="absolute w-5 h-5 bg-orange-100 border-t-2 border-r-2 border-orange-200 -right-3 bottom-4 rotate-45"></div>
                       <div className={`flex flex-col items-center transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                         <HanziWordWriter text={answerText} size={48} showControls={false} />
                       </div>
                       {isRevealed && (
                         <div className="absolute -top-4 -left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {userRole === 'teacher' && <button onClick={() => openWritingModal(answerText)} className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:scale-110"><Maximize2 size={18}/></button>}
                            <button onClick={(e)=>{e.stopPropagation(); speakChinese(answerText);}} className="p-3 bg-white text-orange-500 rounded-full shadow-md hover:scale-110"><Volume2 size={18}/></button>
                         </div>
                       )}
                    </div>
                    {!isRevealed && activeCardId && (
                      <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-sm rounded-3xl rounded-br-none border-2 border-slate-200 flex flex-col items-center justify-center z-10">
                        <span className="text-slate-400 font-bold mb-2">รอคำตอบ...</span>
                        {userRole === 'teacher' && (
                          <button onClick={toggleReveal} className="px-6 py-2 bg-emerald-500 text-white rounded-full font-bold shadow-md hover:scale-105 flex items-center gap-2">
                            <CheckCircle2 size={18} /> กดเพื่อเฉลย
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-4xl">👧🏻</div>
               </div>

            </div>
          </div>

          {/* ==================== 2. CARDS GRID (Aspect Ratio 1:1) ==================== */}
          <div className="w-full lg:w-[45%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {boardSlots.map((cardId, slotIdx) => {
              const card = allCards.find(c => c.id === cardId);
              if (!card) return <div key={slotIdx} className="aspect-square bg-slate-50 rounded-3xl"></div>;
              
              const isFlipped = !!flippedSlots[slotIdx];
              const isSelected = activeCardId === cardId;

              // ตัด Hover ออก ให้ควบคุมผ่าน state เท่านั้น
              const flipClass = isFlipped ? '[transform:rotateY(180deg)]' : '';

              return (
                <div key={slotIdx} className="relative w-full aspect-square [perspective:1000px]">
                  <div className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${flipClass}`}>
                    
                    {/* ---------------- FRONT ---------------- */}
                    <div 
                      onClick={() => handleCardInteraction(slotIdx, cardId)}
                      className={`absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-3xl border-4 flex flex-col items-center justify-center p-4 transition-all cursor-pointer hover:scale-105
                        ${isSelected ? 'border-orange-400 shadow-xl' : 'border-slate-100 hover:border-orange-200 shadow-sm'}
                      `}
                    >
                      {card.imageUrl ? <img src={card.imageUrl} className="max-w-[80%] max-h-[80%] object-contain mix-blend-multiply" alt="item"/> : <span className="text-4xl">🛍️</span>}
                    </div>

                    {/* ---------------- BACK ---------------- */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-3xl border-4 border-orange-400 shadow-xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                      
                      <div className="flex-1 flex flex-col items-center justify-center scale-90 w-full pb-4 pointer-events-none">
                        <HanziWordWriter text={card.noun} size={42} showControls={false} showPinyin={false} />
                        <div className="font-sans font-bold text-slate-500 text-lg mt-2 tracking-wider">
                           {card.pinyin || pinyinConverter(card.noun)}
                        </div>
                      </div>

                      {/* Controls Area */}
                      <div className="w-full bg-slate-50 rounded-2xl p-2 flex justify-around items-center border border-slate-100 shadow-inner mt-auto shrink-0 z-20">
                         {/* ลำโพง */}
                         <button onClick={(e)=>{e.stopPropagation(); speakChinese(card.noun);}} className="p-2.5 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110" title="ฟังเสียง">
                            <Volume2 size={16}/>
                         </button>
                         
                         {/* ✅ พลิกกลับ (แทนที่ไมค์) */}
                         {userRole === 'teacher' && (
                           <button onClick={(e)=>handleCardInteraction(slotIdx, cardId)} className="p-2.5 bg-white text-emerald-600 rounded-full shadow-sm hover:scale-110 transition-colors" title="พลิกดูรูป/ราคาด้านหน้า">
                              <Repeat size={16} />
                           </button>
                         )}

                         {/* เปลี่ยนการ์ดใบใหม่ (Refresh) */}
                         {userRole === 'teacher' && (
                           <button onClick={(e)=>handleDrawNewCard(e, slotIdx)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors" title="เปลี่ยนเป็นคำศัพท์ใหม่">
                              <RotateCw size={16} />
                           </button>
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

      {/* Modal ฝึกเขียนเต็มจอ */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              <HanziWordWriter text={writingModalText} size={90} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}