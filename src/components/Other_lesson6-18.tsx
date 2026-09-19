// src/components/Other_lesson6-18.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Search, X, PauseCircle, Pencil, Edit3, Eraser, Trash2, Settings, ChevronUp, GripVertical, Brush, PenTool } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Line6_18 { id: string; chineseText: string; displayMode: 'pinyin' | 'chinese'; }
export interface Card6_18 { id: string; num: number; fullWidth: boolean; lines: Line6_18[]; }
export interface OtherLesson6_18Data { id?: string; patternType: 'other_lesson6-18'; mainTitle: string; subTitle: string; cardHeaderTitle: string; cardHeaderSub: string; cards: Card6_18[]; }
interface Props { data: OtherLesson6_18Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === กระดาน Hanzi ตัวเดียว (ใช้ใน Modal) ===
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

  return (
    <div className={`flex flex-col items-center z-20 relative shrink-0`} style={{ width: size }}>
      {showControls && layout === 'col-top' && (
        <div className="flex flex-col gap-1 w-full px-1 mb-2">
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border transition-colors shadow-sm ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
            {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border transition-colors shadow-sm ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`bg-white border-2 border-slate-200 rounded-2xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-emerald-400' : ''} overflow-hidden transition-colors ${isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-2 text-[14px] ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

// === Component กระดานเขียนคำ สำหรับประโยคยาว ===
const HanziWordWriter = ({ text, align = 'center', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split(''); 
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  const pinyins = pinyinConverter(text, { type: 'array' });
  return (
    <div className={`flex ${flexWrap} items-start gap-y-8 gap-x-1 md:gap-x-2 ${justifyClass} relative z-20`}>
      {chars.map((char: string, idx: number) => {
         const isChinese = /[\u4e00-\u9fa5]/.test(char);
         return isChinese ? (
           <div key={idx}>
             <SingleHanziWriter 
               character={char} size={size} pinyin={showPinyin ? pinyins[idx] : undefined} 
               showControls={showControls} hideQuiz={hideQuiz} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor} 
             />
           </div>
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0">
             {showControls && layout === 'col-top' && <div className={`w-full ${hideQuiz ? 'h-[28px]' : 'h-[62px]'}`}></div>}
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-2" style={{ fontSize: size * 0.6, width: size * 0.5, height: size }}>{char}</div>
             {showPinyin && <div className="h-4 mt-2"></div>}
           </div>
         )
      })}
    </div>
  );
};

export default function OtherLesson6_18({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_18Data);
  
  const mainTitle = safeData.mainTitle || '1. 问题闯关。';
  const subTitle = safeData.subTitle || 'วัดสมองประลองความรู้';
  const cardHeaderTitle = safeData.cardHeaderTitle || '怎么读？';
  const cardHeaderSub = safeData.cardHeaderSub || 'อ่านว่าอะไร';
  
  const defaultCards: Card6_18[] = [
    { id: 'c1', num: 1, fullWidth: false, lines: [{ id: 'l1-1', chineseText: '一支笔 一本笔记本', displayMode: 'pinyin' }, { id: 'l1-2', chineseText: '一本漫画书 一件上衣', displayMode: 'pinyin' }, { id: 'l1-3', chineseText: '一条裙子 一只熊猫', displayMode: 'pinyin' }, { id: 'l1-4', chineseText: '一个书包 一条鱼', displayMode: 'pinyin' }] },
    { id: 'c2', num: 2, fullWidth: false, lines: [{ id: 'l2-1', chineseText: '一双筷子 一个勺子', displayMode: 'pinyin' }, { id: 'l2-2', chineseText: '一块蛋糕 一杯果汁', displayMode: 'pinyin' }, { id: 'l2-3', chineseText: '一个叉子 一个杯子', displayMode: 'pinyin' }, { id: 'l2-4', chineseText: '一个盘子 一块面包', displayMode: 'pinyin' }] },
    { id: 'c3', num: 3, fullWidth: true, lines: [{ id: 'l3-1', chineseText: '一百块 五十块 二十块 十块 五块 一块', displayMode: 'pinyin' }, { id: 'l3-2', chineseText: '五毛 一毛 人民币 泰铢 钱', displayMode: 'pinyin' }] },
    { id: 'c4', num: 4, fullWidth: true, lines: [{ id: 'l4-1', chineseText: '有 裙子 本 笔记本 漫画书 条 支 只 件', displayMode: 'chinese' }] },
    { id: 'c5', num: 5, fullWidth: true, lines: [{ id: 'l5-1', chineseText: '给 双 块 筷子 勺子 杯 叉子 杯子 盘子', displayMode: 'chinese' }] }
  ];
  const cards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  // Firebase Keys
  const fbKeyModalText = `other6_18_modal_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_18_wanim_${safeData.id || 'default'}`;

  // Local States
  const [modalText, setModalText] = useState<string | null>(null);
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);

  // === Canvas Drawing & Control Panel Drag States ===
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTool, setDrawTool] = useState<'pen'|'highlight'|'eraser'>('pen');
  const [penStyle, setPenStyle] = useState<'normal'|'brush'>('normal'); 
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(4);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasDragged: false });

  // ปรับจุดเริ่มต้นแผงควบคุม
  useEffect(() => {
    const startY = window.innerHeight - 150;
    setPanelPos({ x: window.innerWidth / 2 - 150, y: startY > 0 ? startY : 0 });
  }, []);

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyModalText] !== undefined) setModalText(d[fbKeyModalText]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyModalText, fbKeyWriteAnim]);

  // === 🎯 ปิดโหมดวาดอัตโนมัติ เมื่อออกจากการนำเสนอ (Fullscreen) ===
  useEffect(() => {
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement) {
        setDrawMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenExit);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenExit);
    };
  }, []);

  // === KEYBOARD SHORTCUTS FOR PEN TABLET ===
  useEffect(() => {
    if (userRole !== 'teacher') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return; // ป้องกันการกดรัวๆ จากฮาร์ดแวร์ปากกา

      if (e.key === 'Escape') {
        setDrawMode(false);
        return;
      }

      if (!document.fullscreenElement) return;

      const key = e.key.toLowerCase();
      if (key === 'p' || key === 'b') {
        setDrawTool('pen'); 
        setDrawMode(true);
      } else if (key === 'e') {
        setDrawTool('eraser'); 
        setDrawMode(true);
      } else if (key === 'h') {
        setDrawTool('highlight'); 
        setDrawMode(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userRole]);

  // === Initialize Canvas ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.drawImage(tempCanvas, 0, 0);
        ctxRef.current = ctx;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // === Drawing Logic ===
  const startDrawing = (e: React.PointerEvent) => {
    if (!drawMode || !ctxRef.current) return;
    const isRightClick = e.button === 2 || e.buttons === 2 || e.buttons === 32;
    if (e.pointerType === 'eraser' || isRightClick) {
      setDrawTool('eraser');
    }
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !drawMode || !ctxRef.current) return;
    const ctx = ctxRef.current;

    const isRightClick = e.buttons === 2 || e.buttons === 32;
    let activeTool = drawTool;

    if (isRightClick || e.pointerType === 'eraser') {
      activeTool = 'eraser';
      if (drawTool !== 'eraser') setDrawTool('eraser'); 
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (activeTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      
      let pressure = 0.5; 
      if (e.pointerType === 'pen') {
        pressure = e.pressure > 0 ? e.pressure : 0.1;
      }

      if (penStyle === 'brush') {
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = penSize * (pressure * 3.5); 
      } else {
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = penSize;
      }

    } else if (activeTool === 'highlight') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * 4;
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = penSize * 8;
    }

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  };

  const stopDrawing = () => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleColorSelect = (color: string) => {
    setPenColor(color);
    if (drawTool === 'eraser') setDrawTool('pen');
  };

  // === Dragging Logic for Control Panel ===
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
    
    // ป้องกันลากตกขอบจอ
    if (newX < 0) newX = 0; if (newY < 0) newY = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    if (newY > window.innerHeight - 80) newY = window.innerHeight - 80;
    setPanelPos({ x: newX, y: newY });
  };
  const onPanelPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDraggingPanel(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };


  // Actions Modal
  const openModal = async (text: string | null) => {
    if (userRole !== 'teacher') return;
    setModalText(text);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyModalText]: text }); } catch(e){} }
  };

  const speakChinese = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[_。，？！、.,?!“” ]/g, ''));
    utterance.lang = 'zh-CN'; utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const broadcastAnimCmd = async (char: string, action: string) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){}
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    // 🎯 เอา min-h-screen ออก เพื่อไม่ให้เกิดช่องว่างขนาดใหญ่ด้านล่าง
    <div className={`flex flex-col w-full font-sans text-left relative bg-white/50 rounded-3xl p-4 md:p-6 lg:p-8 ${drawMode ? 'select-none' : ''}`}>
      
      {/* === Drawing Canvas Overlay === */}
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerOut={stopDrawing}
        onContextMenu={(e) => e.preventDefault()} 
        className={`fixed top-0 left-0 w-full h-full z-[4000] touch-none transition-all ${drawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* ==================== CONTROL PANEL (DRAGGABLE) เอาเฉพาะวาดรูป ==================== */}
      {userRole === 'teacher' && roomPin && (
        <div className="fixed z-[5000] pointer-events-auto touch-none" style={{ left: panelPos.x, top: panelPos.y }}>
          {isControlPanelOpen ? (
            <div className="bg-white/95 backdrop-blur-md pl-2 pr-5 py-3 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex flex-col md:flex-row items-center gap-4 relative animate-fade-in">
               <div onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp} onPointerCancel={onPanelPointerUp} className="cursor-move p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors" title="ลากเพื่อย้ายแผงควบคุม">
                  <GripVertical size={20} />
               </div>
               
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setDrawMode(!drawMode)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${drawMode ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {drawMode ? <X size={16}/> : <Edit3 size={16}/>}
                    {drawMode ? 'ปิดโหมดวาดรูป' : 'เปิดโหมดวาดรูป'}
                  </button>
               </div>

               {drawMode && (
                 <>
                   <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                   
                   <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                     <button onClick={() => setDrawTool('pen')} className={`p-2 rounded-lg transition-all ${drawTool === 'pen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} title="ปากกา (กด P/B)"><Pencil size={18}/></button>
                     <button onClick={() => setDrawTool('highlight')} className={`p-2 rounded-lg transition-all ${drawTool === 'highlight' ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-500 hover:text-slate-700'}`} title="ไฮไลต์ (กด H)"><Edit3 size={18}/></button>
                     <button onClick={() => setDrawTool('eraser')} className={`p-2 rounded-lg transition-all ${drawTool === 'eraser' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`} title="ยางลบ (กด E หรือคลิกขวา)"><Eraser size={18}/></button>
                   </div>

                   {drawTool === 'pen' && (
                     <div className="flex items-center gap-1 bg-indigo-50 p-1 rounded-xl ml-1 border border-indigo-100">
                       <button onClick={() => setPenStyle('normal')} className={`p-1.5 rounded-lg transition-all ${penStyle === 'normal' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`} title="ปากกาปกติ"><PenTool size={16}/></button>
                       <button onClick={() => setPenStyle('brush')} className={`p-1.5 rounded-lg transition-all ${penStyle === 'brush' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-400'}`} title="พู่กัน (รับรู้แรงกด)"><Brush size={16}/></button>
                     </div>
                   )}

                   <div className="flex items-center gap-1 ml-1">
                     {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'].map(color => (
                       <button 
                         key={color} onClick={() => handleColorSelect(color)}
                         className={`w-5 h-5 rounded-full shadow-sm border-2 transition-all ${penColor === color && drawTool !== 'eraser' ? 'scale-125 border-slate-400' : 'border-slate-200 hover:scale-110'}`}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>

                   <div className="flex items-center gap-2 w-20 ml-2">
                      <input type="range" min="1" max="20" value={penSize} onChange={(e) => setPenSize(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                   </div>

                   <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                   <button onClick={clearCanvas} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="ล้างหน้ากระดานทั้งหมด">
                     <Trash2 size={18}/>
                   </button>
                 </>
               )}
               
               {!drawMode && <div className="w-px h-8 bg-slate-200 hidden md:block"></div>}
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
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-end gap-3 mb-6 pl-2 md:pl-4">
          <span className="text-2xl md:text-3xl font-bold text-slate-800">{mainTitle}</span>
          <span className="text-xl md:text-2xl font-bold text-slate-500 mb-0.5">{subTitle}</span>
        </div>

        {/* 🎯 Cards Grid (เอา pb-20 ออก และบีบ gap ลง) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           {cards.map(card => (
              <div key={card.id} className={`bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-sm border-2 border-slate-100 relative transition-all hover:border-indigo-100 ${card.fullWidth ? 'md:col-span-2' : 'col-span-1'}`}>
                 
                 {/* Card Header */}
                 <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-50">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">{card.num}</div>
                    <span className="text-lg md:text-xl font-serif font-bold text-orange-600 tracking-wide">{cardHeaderTitle}</span>
                    <span className="text-xs md:text-sm font-sans text-orange-500">{cardHeaderSub}</span>
                 </div>
                 
                 {/* Card Lines */}
                 <div className="flex flex-col gap-2 md:gap-3">
                    {card.lines.map(line => (
                       <div key={line.id} className="flex flex-row items-center justify-between group rounded-xl hover:bg-orange-50/50 p-2 md:p-3 -mx-2 md:-mx-3 transition-colors border border-transparent hover:border-orange-100/50">
                          
                          {/* Text Content */}
                          <div className="flex-1 pr-4">
                             {line.displayMode === 'pinyin' ? (
                               <span className="font-sans font-semibold text-slate-700 text-base md:text-xl tracking-wider leading-relaxed">
                                 {pinyinConverter(line.chineseText, { nonZh: 'consecutive' })}
                               </span>
                             ) : (
                               <span className="font-serif font-black text-slate-800 text-xl md:text-2xl tracking-[0.25em] leading-relaxed">
                                 {line.chineseText}
                               </span>
                             )}
                          </div>

                          {/* Actions (Speaker & Magnifier) */}
                          <div className="flex items-center gap-2 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => speakChinese(line.chineseText)} className="p-2 md:p-2.5 bg-white text-orange-400 hover:bg-orange-500 hover:text-white rounded-full shadow-sm border border-slate-200 transition-all">
                                <Volume2 size={18} className="md:w-5 md:h-5" />
                             </button>
                             {userRole === 'teacher' && (
                               <button onClick={() => openModal(line.chineseText)} className="p-2 md:p-2.5 bg-white text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-full shadow-sm border border-slate-200 transition-all">
                                  <Search size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                               </button>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (เปิดเมื่อกดแว่นขยาย) === */}
      {modalText && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-3"><Pencil className="text-emerald-500" size={28}/> ฝึกเขียนอักษรจีน</h3>
              <div className="flex gap-3">
                <button onClick={() => speakChinese(modalText)} className="px-5 py-2.5 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm"><Volume2 size={20}/> ฟังเสียง</button>
                <button onClick={() => { if(userRole==='teacher') openModal(null); else setModalText(null); }} className="p-2.5 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
              </div>
            </div>

            {/* Modal Content (Hand write Board) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center bg-slate-100/50">
              <div className="w-full flex justify-center">
                 <HanziWordWriter 
                    text={modalText} 
                    size={100} 
                    showControls={true} 
                    hideQuiz={false} 
                    showPinyin={true} 
                    layout="col-top" 
                    userRole={userRole} 
                    remoteAnimCmd={remoteAnimCmd} 
                    onBroadcastAnim={broadcastAnimCmd} 
                    flexWrap="flex-wrap" 
                 />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}