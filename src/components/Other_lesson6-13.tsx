// src/components/Other_lesson6-13.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pencil, PauseCircle, X, Search, Edit3, Eraser, Trash2, Settings, ChevronUp, GripVertical, Brush, PenTool, Keyboard } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Part1Item6_13 { id: string; character: string; word: string; }
export interface Part2Item6_13 { id: string; sentence: string; imageUrl: string; }
export interface OtherLesson6_13Data { id?: string; patternType: 'other_lesson6-13'; mainTitle1: string; subTitle1: string; part1Items: Part1Item6_13[]; mainTitle2: string; subTitle2: string; part2Items: Part2Item6_13[]; }
interface Props { data: OtherLesson6_13Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

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

// === กระดาน Hanzi ตัวเดียว (ใช้ทั่วไป และใช้ในส่วนที่ 1 ด้วย) ===
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
        <div className="flex flex-col gap-1.5 w-full px-1 mb-3">
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1 border-2 transition-colors shadow-sm ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
            {animState === 'playing' ? <PauseCircle size={14}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1 border-2 transition-colors shadow-sm ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200'}`}><Pencil size={12}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-2xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-emerald-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-2 ${size <= 60 ? 'text-sm' : 'text-lg'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

// === Component กระดานเขียนคำ ===
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

// === Component สร้างประโยคแบบ Grid Box ===
const SentenceBoxRenderer = ({ text }: { text: string }) => {
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });

  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2">
       {chars.map((char, i) => {
          const isChinese = /[\u4e00-\u9fa5]/.test(char);
          return (
             <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] md:text-[11px] text-slate-500 font-mono tracking-wide leading-none mb-1">{isChinese ? pinyins[i] : ' '}</span>
                <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-slate-200 bg-white flex items-center justify-center rounded-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]">
                   <span className={`text-2xl md:text-3xl font-serif font-black ${isChinese ? 'text-slate-800' : 'text-slate-400'}`}>{char}</span>
                </div>
             </div>
          )
       })}
    </div>
  );
};

export default function OtherLesson6_13({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_13Data);
  
  const mainTitle1 = safeData.mainTitle1 || '5. 描一描，写一写。';
  const subTitle1 = safeData.subTitle1 || 'ฝึกเขียนตามลายเส้น';
  const part1Items = Array.isArray(safeData.part1Items) ? safeData.part1Items : [];
  
  const mainTitle2 = safeData.mainTitle2 || '6. 描句子。';
  const subTitle2 = safeData.subTitle2 || 'ฝึกเขียนประโยคตามลายเส้น';
  const part2Items = Array.isArray(safeData.part2Items) ? safeData.part2Items : [];

  // Firebase Keys
  const fbKeyWriteModal = `other6_13_wmodal_${safeData.id || 'default'}`; 
  const fbKeyWriteAnim = `other6_13_wanim_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_13_livex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_13_livex_text_${safeData.id || 'default'}`;

  // Local States
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');

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

  useEffect(() => {
    const startY = window.innerHeight - 120;
    setPanelPos({ x: window.innerWidth / 2 - 250, y: startY > 0 ? startY : 0 });
  }, []);

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyWriteModal, fbKeyWriteAnim, fbKeyLiveExModal, fbKeyLiveExText]);

  // === ปิดโหมดวาดอัตโนมัติ เมื่อออกจากการนำเสนอ (Fullscreen) ===
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
    e.stopPropagation();
    setIsDraggingPanel(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: panelPos.x, initialY: panelPos.y, hasDragged: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPanelPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPanel) return;
    e.stopPropagation();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.hasDragged = true;
    
    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;
    
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    if (newY > window.innerHeight - 80) newY = window.innerHeight - 80;

    setPanelPos({ x: newX, y: newY });
  };

  const onPanelPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingPanel(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Actions Live Exercise & Modals
  const toggleLiveExerciseModal = async (isOpen: boolean) => {
    setIsLiveExOpen(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} }
  };

  const handleLiveExTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value; setLiveExText(newText);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExText]: newText }); } catch(e){} }
  };

  const openWritingModal = async (text: string | null) => {
    setWritingModalText(text);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: text }); } catch(e){} }
  };

  const broadcastAnimCmd = async (char: string, action: string) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){}
  };

  const speakChinese = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[_。，？！、.,?!]/g, ''));
    utterance.lang = 'zh-CN'; utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200 min-h-screen">
      
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

      {/* ==================== CONTROL PANEL (DRAGGABLE) ==================== */}
      {userRole === 'teacher' && roomPin && (
        <div 
          className="fixed z-[5000] pointer-events-auto touch-none"
          style={{ left: panelPos.x, top: panelPos.y }}
        >
          {isControlPanelOpen ? (
            <div className="bg-white/95 backdrop-blur-md pl-2 pr-5 py-3 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-2 border-slate-200 flex flex-col md:flex-row items-center gap-4 relative animate-fade-in">
               
               <div 
                 onPointerDown={onPanelPointerDown}
                 onPointerMove={onPanelPointerMove}
                 onPointerUp={onPanelPointerUp}
                 onPointerCancel={onPanelPointerUp}
                 className="cursor-move p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors"
                 title="ลากเพื่อย้ายแผงควบคุม"
               >
                  <GripVertical size={20} />
               </div>

               {/* ปุ่มแบบฝึกหัดสด (Live Exercise) */}
               <div className="flex items-center gap-2">
                 <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-sm font-bold shadow-sm transition-colors"><Keyboard size={16} /> แบบฝึกหัด</button>
               </div>

               <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

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
               <button onClick={() => setIsControlPanelOpen(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105">
                 <ChevronUp size={14} /> เก็บ
               </button>

            </div>
          ) : (
            <button 
               onPointerDown={onPanelPointerDown}
               onPointerMove={onPanelPointerMove}
               onPointerUp={onPanelPointerUp}
               onPointerCancel={onPanelPointerUp}
               onClick={(e) => { 
                 if(dragRef.current.hasDragged) { e.preventDefault(); return; } 
                 setIsControlPanelOpen(true); 
               }}
               className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-2 border-slate-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-all hover:scale-105 cursor-move animate-fade-in"
               title="ลากเพื่อย้าย หรือคลิกเพื่อเปิดแผงควบคุม"
            >
              <Settings size={24} />
            </button>
          )}
        </div>
      )}

      {/* ==================== เนื้อหาหลัก ==================== */}
      <div className={`flex-1 w-full p-4 md:p-8 pb-32 ${drawMode ? 'select-none' : ''}`}>
        
        {/* ==================== ส่วนที่ 1: ฝึกเขียนตามลายเส้น (แยกซ้าย-ขวา ตัวใหญ่) ==================== */}
        <div className="mb-12 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle1}</span>
            <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle1}</span>
          </div>

          {/* 🎯 แสดงผลแบบแบ่งครึ่ง ซ้าย-ขวา (Grid 2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
             {part1Items.map((item) => (
                <div key={item.id} className="bg-white border-2 border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center hover:border-indigo-200 transition-colors group">
                   
                   {/* ส่วนบน: คำศัพท์และลำโพง */}
                   <div className="flex items-center justify-center gap-3 mb-8 w-full border-b border-slate-100 pb-4">
                      <span className="text-3xl md:text-4xl font-serif font-black text-slate-800">{item.character}</span>
                      <span className="text-xl md:text-2xl text-slate-500 font-sans">({item.word})</span>
                      <button onClick={() => speakChinese(item.word)} className="ml-2 p-2.5 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full transition-all border border-orange-100 shadow-sm">
                        <Volume2 size={20}/>
                      </button>
                   </div>

                   {/* ส่วนล่าง: กระดานตัวใหญ่ พร้อมปุ่มลำดับและเขียน */}
                   <div className="bg-slate-50/80 p-6 rounded-[2rem] border-2 border-slate-200 shadow-inner group-hover:bg-indigo-50/30 transition-colors">
                     <SingleHanziWriter 
                       character={item.character} 
                       size={200} 
                       pinyin={pinyinConverter(item.character)}
                       showControls={true} 
                       hideQuiz={false} 
                       layout="col-top" 
                       userRole={userRole} 
                       remoteAnimCmd={remoteAnimCmd} 
                       onBroadcastAnim={broadcastAnimCmd} 
                       customStrokeColor="#334155" // สีปกติ
                     />
                   </div>

                </div>
             ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-12 relative z-10"></div>

        {/* ==================== ส่วนที่ 2: ฝึกเขียนประโยค ==================== */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle2}</span>
            <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle2}</span>
          </div>

          <div className="flex flex-col gap-6 w-full">
             {part2Items.map((item) => (
                <div key={item.id} className="bg-white border-2 border-slate-100 shadow-sm rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-200 transition-colors group">
                   
                   <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1 w-full">
                      <div className="flex gap-2 shrink-0">
                         <button onClick={() => speakChinese(item.sentence)} className="p-3 bg-slate-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full shadow-sm transition-all border border-slate-100">
                            <Volume2 size={20}/>
                         </button>
                         {userRole === 'teacher' && (
                           <button onClick={() => openWritingModal(item.sentence)} className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full shadow-sm transition-all border border-indigo-100">
                              <Search size={20}/>
                           </button>
                         )}
                      </div>
                      
                      <div className="flex-1 w-full overflow-x-auto pb-2">
                         <SentenceBoxRenderer text={item.sentence} />
                      </div>
                   </div>

                   {item.imageUrl && (
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center self-end md:self-auto">
                         <img src={item.imageUrl} alt="img" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                   )}
                </div>
             ))}
          </div>
        </div>

      </div>

      {/* === Modal ฝึกเขียนเต็มจอ สำหรับประโยค === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-emerald-500" /> ฝึกเขียนประโยค</h3>
              <div className="flex gap-2">
                <button onClick={() => speakChinese(writingModalText)} className="px-4 py-2 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full font-bold flex items-center gap-2 transition-colors"><Volume2 size={18}/> ฟังเสียง</button>
                <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              <HanziWordWriter text={writingModalText} size={90} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>

          </div>
        </div>
      )}

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
                        <div className="flex gap-2">
                          {token.word.split('').map((char, cIdx) => (
                            /[\u4e00-\u9fa5]/.test(char) ? (
                              <SingleHanziWriter key={cIdx} character={char} size={80} pinyin={pinyinConverter(char)} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} customStrokeColor={token.hex} customPinyinColor={token.tw} />
                            ) : (
                              <div key={cIdx} className="flex items-end justify-center font-serif font-black text-slate-700 h-[100px] pb-4" style={{ fontSize: 48, width: 40 }}>{char}</div>
                            )
                          ))}
                        </div>
                        {token.trans && <div className={`text-sm font-bold mt-1 ${token.tw} bg-slate-50 px-3 py-1 rounded-md`}>{token.trans}</div>}
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