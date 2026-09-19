// src/components/Other_lesson6-16.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, X, Settings, ChevronUp, GripVertical, Keyboard, RotateCcw, PauseCircle, Pencil } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Option6_16 { letter: string; text: string; }
export interface Card6_16 { id: string; num: number; imageUrl: string; answer: string; }
export interface OtherLesson6_16Data { id?: string; patternType: 'other_lesson6-16'; headerTitle: string; headerSub: string; mainTitle: string; subTitle: string; options: Option6_16[]; cards: Card6_16[]; }
interface Props { data: OtherLesson6_16Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const LOCAL_DICT: Record<string, string> = { "多少钱": "ราคาเท่าไหร่", "一共": "ทั้งหมด", "商店": "ร้านค้า", "东西": "สิ่งของ", "钢笔": "ปากกาหมึกซึม", "什么": "อะไร" };

const tokenizeLiveText = (text: string) => {
  let result = [], i = 0, colorIndex = 0;
  const colors = [{ hex: '#2563eb', tw: 'text-blue-600' }, { hex: '#16a34a', tw: 'text-green-600' }, { hex: '#db2777', tw: 'text-pink-600' }, { hex: '#ea580c', tw: 'text-orange-600' }];
  while (i < text.length) {
    let matched = false;
    for (let len = 4; len > 0; len--) {
      if (i + len <= text.length) {
        const word = text.substring(i, i + len);
        if (LOCAL_DICT[word]) {
          const isComp = len >= 2; const c = isComp ? colors[colorIndex % colors.length] : { hex: '#475569', tw: 'text-slate-600' };
          if (isComp) colorIndex++; result.push({ word, trans: LOCAL_DICT[word], ...c }); i += len; matched = true; break;
        }
      }
    }
    if (!matched) { result.push({ word: text[i], trans: '', hex: '#475569', tw: 'text-slate-600' }); i++; }
  }
  return result;
};

// === กระดาน Hanzi ตัวเดียว (สำหรับ Live Exercise) ===
const SingleHanziWriter = ({ character, size = 100, pinyin, showControls = false, hideQuiz = false, layout = 'col', userRole, remoteAnimCmd, onBroadcastAnim, customStrokeColor, customPinyinColor }: any) => {
  const containerRef = useRef<HTMLDivElement>(null); const writerRef = useRef<any>(null);
  const [animState, setAnimState] = useState<'idle'|'playing'|'paused'>('idle');
  const lastAnimTs = useRef(0);
  const isStudentSynced = userRole === 'student' && onBroadcastAnim !== undefined;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; 
    writerRef.current = HanziWriter.create(containerRef.current, character, { 
      width: size, height: size, padding: size > 40 ? 4 : 2, showOutline: true, strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300, 
      strokeColor: customStrokeColor || '#334155', radicalColor: customStrokeColor || '#334155', outlineColor: '#e2e8f0', drawingColor: '#f97316' 
    });
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
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border transition-colors ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
            {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border transition-colors ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-emerald-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1.5 ${size <= 40 ? 'text-[11px] md:text-[12px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

export default function OtherLesson6_16({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_16Data);
  
  const headerTitle = safeData.headerTitle || '测一测';
  const headerSub = safeData.headerSub || 'ทดสอบความจำ';
  const mainTitle = safeData.mainTitle || '1. 看图片，选择正确的答案。';
  const subTitle = safeData.subTitle || 'ดูภาพแล้วเลือกคำตอบที่ถูกต้อง';
  const options = Array.isArray(safeData.options) ? safeData.options : [];
  const cards = Array.isArray(safeData.cards) ? safeData.cards : [];

  // Firebase Keys
  const fbKeyRevealed = `other6_16_rev_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_16_livex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_16_livex_text_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_16_wanim_${safeData.id || 'default'}`;

  // States
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);

  // Control Panel States
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasDragged: false });

  useEffect(() => {
    const startY = window.innerHeight - 150;
    setPanelPos({ x: window.innerWidth / 2 - 150, y: startY > 0 ? startY : 0 });
  }, []);

  // Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyRevealed]) setRevealed(d[fbKeyRevealed]);
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyRevealed, fbKeyLiveExModal, fbKeyLiveExText, fbKeyWriteAnim]);

  // Actions
  const toggleReveal = async (id: string) => {
    if (userRole !== 'teacher') return;
    const newRevealed = { ...revealed, [id]: !revealed[id] };
    setRevealed(newRevealed);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: newRevealed }); } catch(e){} }
  };

  const revealAll = async () => {
    if (userRole !== 'teacher') return;
    const allRev: Record<string, boolean> = {};
    cards.forEach(c => allRev[c.id] = true);
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
    utterance.lang = 'zh-CN'; utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const broadcastAnimCmd = async (char: string, action: string) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){}
  };

  // Drag logic
  const onPanelPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDraggingPanel(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: panelPos.x, initialY: panelPos.y, hasDragged: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPanelPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPanel) return; e.stopPropagation();
    const dx = e.clientX - dragRef.current.startX; const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.hasDragged = true;
    let newX = dragRef.current.initialX + dx; let newY = dragRef.current.initialY + dy;
    
    if (newX < 0) newX = 0; if (newY < 0) newY = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    if (newY > window.innerHeight - 80) newY = window.innerHeight - 80;
    setPanelPos({ x: newX, y: newY });
  };
  const onPanelPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDraggingPanel(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const toggleLiveExerciseModal = async (isOpen: boolean) => {
    setIsLiveExOpen(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} }
  };

  const handleLiveExTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value; setLiveExText(newText);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExText]: newText }); } catch(e){} }
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex flex-col w-full font-sans text-left relative bg-white rounded-3xl min-h-screen p-4 md:p-8">
      
      {/* ==================== CONTROL PANEL (DRAGGABLE) ==================== */}
      {userRole === 'teacher' && roomPin && (
        <div className="fixed z-[9999] pointer-events-auto touch-none" style={{ left: panelPos.x, top: panelPos.y }}>
          {isControlPanelOpen ? (
            <div className="bg-white/95 backdrop-blur-md pl-2 pr-5 py-3 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex flex-col md:flex-row items-center gap-4 relative animate-fade-in">
               <div onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp} onPointerCancel={onPanelPointerUp} className="cursor-move p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors" title="ลากเพื่อย้ายแผงควบคุม">
                  <GripVertical size={20} />
               </div>
               
               <div className="flex items-center gap-2">
                 <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-sm font-bold shadow-sm transition-colors"><Keyboard size={16} /> แบบฝึกหัด</button>
               </div>
               <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
               
               <div className="flex items-center gap-2">
                 <button onClick={resetAll} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"><RotateCcw size={16}/> ล้าง</button>
                 <button onClick={revealAll} className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"><CheckCircle2 size={16}/> เฉลยทั้งหมด</button>
               </div>
               
               <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
               <button onClick={() => setIsControlPanelOpen(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105"><ChevronUp size={14} /> เก็บ</button>
            </div>
          ) : (
            <button onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp} onPointerCancel={onPanelPointerUp} onClick={(e) => { if(dragRef.current.hasDragged) { e.preventDefault(); return; } setIsControlPanelOpen(true); }} className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-all hover:scale-105 cursor-move animate-fade-in" title="ลากเพื่อย้าย หรือคลิกเพื่อเปิดแผงควบคุม">
              <Settings size={24} />
            </button>
          )}
        </div>
      )}

      {/* ==================== CONTENT ==================== */}
      <div className="pb-32">
        {/* Header Ribbon */}
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-orange-400 text-white px-4 py-2 rounded-r-full rounded-l-lg font-bold text-xl md:text-2xl shadow-sm flex items-center gap-2">
              <span className="text-2xl">🎯</span> {headerTitle} <span className="font-sans text-lg opacity-90">{headerSub}</span>
           </div>
        </div>

        <div className="flex items-end gap-3 mb-8 pl-4">
           <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle}</span>
           <span className="text-lg md:text-xl font-bold text-slate-500 mb-0.5">{subTitle}</span>
        </div>

        {/* Options Box (Pink) */}
        <div className="bg-pink-50/80 border border-pink-200 rounded-3xl p-6 md:p-8 mb-10 shadow-sm z-10 relative">
           <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-6">
              {options.map((opt, i) => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => speakChinese(opt.text)}>
                    <span className="text-xl md:text-2xl font-black text-slate-700">{opt.letter}</span>
                    <div className="flex flex-col">
                       <span className="text-xl md:text-2xl font-serif font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{opt.text}</span>
                       <span className="text-[11px] md:text-sm text-slate-500 font-sans leading-none mt-1">{pinyinConverter(opt.text)}</span>
                    </div>
                    <button className="p-2 ml-1 bg-white text-orange-400 rounded-full shadow-sm opacity-60 group-hover:opacity-100 group-hover:bg-orange-500 group-hover:text-white transition-all">
                       <Volume2 size={16} />
                    </button>
                 </div>
              ))}
           </div>
        </div>

        {/* 🎯 Cards Grid (บีบความกว้างลงเหลือ 75% เพื่อให้การ์ดเล็กลง 30%) */}
        <div className="w-full lg:w-[85%] xl:w-[75%] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
           {cards.map((card) => {
              const isRev = revealed[card.id];

              return (
                 <div key={card.id} className="relative aspect-[4/3] bg-slate-50/50 border-2 border-slate-200 rounded-2xl md:rounded-3xl shadow-sm hover:border-indigo-200 transition-all flex flex-col items-center justify-center p-3 group">
                    
                    {/* Number Badge (ลดขนาดลงเล็กน้อย) */}
                    <div className="absolute -left-2.5 -top-2.5 w-6 h-6 md:w-7 md:h-7 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm border-[1.5px] border-white z-10">
                       {card.num}
                    </div>

                    {/* Image Placeholder */}
                    <div className="w-full h-full flex items-center justify-center pb-4">
                       {card.imageUrl ? (
                          <img src={card.imageUrl} alt="img" className="max-w-full max-h-[85%] object-contain mix-blend-multiply" />
                       ) : (
                          <div className="text-slate-300 text-5xl md:text-6xl opacity-50">?</div>
                       )}
                    </div>

                    {/* Answer Box (ลดขนาดกล่องสี่เหลี่ยมด้านล่างขวา) */}
                    <div 
                      onClick={() => toggleReveal(card.id)}
                      className={`absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 border-2 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${userRole === 'teacher' ? 'cursor-pointer hover:scale-105' : ''}
                        ${isRev ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-300 hover:border-indigo-300'}
                      `}
                    >
                       {isRev ? (
                          <span className="text-lg md:text-2xl font-black text-indigo-600 animate-fade-in">{card.answer}</span>
                       ) : (
                          userRole === 'teacher' && <span className="text-[9px] md:text-[10px] font-bold text-slate-300 leading-none">เฉลย</span>
                       )}
                    </div>
                 </div>
              );
           })}
        </div>
      </div>

      {/* === Modal Live Exercise === */}
      {isLiveExOpen && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Keyboard className="text-indigo-500" /> แบบฝึกหัดสด (Live Exercise)</h3>
              <button onClick={() => { if(userRole==='teacher') toggleLiveExerciseModal(false); else setIsLiveExOpen(false); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 bg-slate-100/50">
              {userRole === 'teacher' && (
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-500 pl-2">ครูพิมพ์อักษรจีนที่นี่:</label>
                  <input type="text" value={liveExText} onChange={handleLiveExTextChange} placeholder="เช่น 熊猫" className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 outline-none shadow-sm" />
                </div>
              )}
              {liveExText.trim() ? (
                <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-sm border border-slate-200 w-full min-h-[300px] gap-8">
                  <div className="flex flex-wrap justify-center items-start gap-8">
                    {tokenizeLiveText(liveExText).map((token, tIdx) => (
                      <div key={tIdx} className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-1.5">
                          {token.word.split('').map((char, cIdx) => (
                            <div key={cIdx} className="flex flex-col items-center">
                              {/[\u4e00-\u9fa5]/.test(char) ? (
                                <SingleHanziWriter 
                                  character={char} 
                                  size={80} 
                                  pinyin={pinyinConverter(char)} 
                                  showControls={true} 
                                  layout="col-top" 
                                  userRole={userRole} 
                                  remoteAnimCmd={remoteAnimCmd} 
                                  onBroadcastAnim={broadcastAnimCmd} 
                                  customStrokeColor={token.hex || '#334155'} 
                                  customPinyinColor={token.tw} 
                                />
                              ) : (
                                <span className={`text-5xl md:text-7xl font-serif font-black text-slate-700 mt-6`}>{char}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {token.trans && <div className={`text-sm font-bold mt-2 ${token.tw} bg-slate-50 px-3 py-1 rounded-md`}>{token.trans}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-4"><button onClick={() => speakChinese(liveExText)} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-lg shadow-sm"><Volume2 size={24} /> ฟังเสียง</button></div>
                </div>
              ) : (
                userRole === 'student' && <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4"><div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div><span className="font-bold text-xl animate-pulse">รอคุณครูพิมพ์...</span></div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}