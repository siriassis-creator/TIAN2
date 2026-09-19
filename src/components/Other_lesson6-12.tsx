// src/components/Other_lesson6-12.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, Pencil, PauseCircle, X, Repeat, Edit3, Eraser, Trash2, Settings, ChevronUp, GripVertical, Brush, PenTool } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Question6_12 { id: string; number: number; sentenceTemplate: string; choices: string[]; correctAnswer: string; imageUrl: string; }
export interface Part2Item6_12 { id: string; fullChar: string; missingPart: string; }
export interface OtherLesson6_12Data { id?: string; patternType: 'other_lesson6-12'; mainTitle1: string; subTitle1: string; questions: Question6_12[]; mainTitle2: string; subTitle2: string; part2Items: Part2Item6_12[]; part2ChoicesBank: string[]; }
interface Props { data: OtherLesson6_12Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === กระดาน Hanzi ตัวเดียว ===
const SingleHanziWriter = ({ character, size = 100, pinyin, showControls = false, hideQuiz = false, layout = 'col', userRole, remoteAnimCmd, onBroadcastAnim, customStrokeColor, customRadicalColor, customPinyinColor }: any) => {
  const containerRef = useRef<HTMLDivElement>(null); const writerRef = useRef<any>(null);
  const [animState, setAnimState] = useState<'idle'|'playing'|'paused'>('idle');
  const lastAnimTs = useRef(0);
  const isStudentSynced = userRole === 'student' && onBroadcastAnim !== undefined;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; 
    writerRef.current = HanziWriter.create(containerRef.current, character, { 
      width: size, height: size, padding: size > 40 ? 4 : 2, showOutline: true, strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300, 
      strokeColor: customStrokeColor || '#334155', radicalColor: customRadicalColor || customStrokeColor || '#334155', outlineColor: '#e2e8f0', drawingColor: '#f97316' 
    });
    setAnimState('idle');
  }, [character, size, customStrokeColor, customRadicalColor]);

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

// === Component สร้างประโยคแบบอัจฉริยะ ===
const SentenceRenderer = ({ template, answer, isCorrect }: { template: string, answer: string, isCorrect: boolean }) => {
  const parts = template.split('_');
  return (
    <div className="flex items-end gap-0.5 md:gap-1 flex-wrap">
      {parts[0].split('').map((char, i) => (
         <div key={`p1-${i}`} className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-slate-500 font-sans leading-none mb-1.5">{pinyinConverter(char)}</span>
            <span className="text-2xl md:text-3xl font-serif text-slate-800 leading-none">{char}</span>
         </div>
      ))}
      <div className={`mx-2 min-w-[40px] md:min-w-[50px] border-b-2 flex flex-col items-center justify-end pb-1 transition-colors duration-300 h-[50px] md:h-[60px] relative
        ${answer ? (isCorrect ? 'border-emerald-500' : 'border-red-500') : 'border-slate-400'}
      `}>
         {answer && (
            <div className="absolute bottom-1 w-full flex flex-col items-center animate-fade-in">
               {isCorrect ? (
                 <span className="text-[10px] md:text-xs text-emerald-600 font-bold font-sans leading-none mb-1">{pinyinConverter(answer)}</span>
               ) : (
                 <span className="text-[10px] md:text-xs text-transparent font-sans leading-none mb-1">_</span>
               )}
               <span className={`text-2xl md:text-3xl font-serif font-black leading-none ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{answer}</span>
            </div>
         )}
      </div>
      {parts[1] && parts[1].split('').map((char, i) => {
         const isPunc = /[。，？！、.,?!]/.test(char);
         return (
           <div key={`p2-${i}`} className={`flex flex-col items-center ${isPunc ? '-ml-1 md:-ml-2' : ''}`}>
              {!isPunc && <span className="text-[10px] md:text-xs text-slate-500 font-sans leading-none mb-1.5">{pinyinConverter(char)}</span>}
              <span className="text-2xl md:text-3xl font-serif text-slate-800 leading-none">{char}</span>
           </div>
         );
      })}
    </div>
  );
};

export default function OtherLesson6_12({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_12Data);
  
  const mainTitle1 = safeData.mainTitle1 || '3. 圈出正确的汉字，然后读一读。';
  const subTitle1 = safeData.subTitle1 || 'วงกลมล้อมรอบตัวอักษรจีนที่ถูกต้อง จากนั้นฝึกอ่าน';
  const questions = Array.isArray(safeData.questions) ? safeData.questions : [];
  
  const mainTitle2 = safeData.mainTitle2 || '4. 写出缺失的部分。';
  const subTitle2 = safeData.subTitle2 || 'เขียนส่วนประกอบที่หายไป';
  const part2Items = Array.isArray(safeData.part2Items) ? safeData.part2Items : [];
  const part2ChoicesBank = Array.isArray(safeData.part2ChoicesBank) ? safeData.part2ChoicesBank : [];

  // Firebase Keys
  const fbKeyP1Answers = `other6_12_p1ans_${safeData.id || 'default'}`; 
  const fbKeyP2Revealed = `other6_12_p2rev_${safeData.id || 'default'}`; 
  const fbKeyP2Flipped = `other6_12_p2flip_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_12_wanim_${safeData.id || 'default'}`;

  // Local States
  const [p1Answers, setP1Answers] = useState<Record<string, string>>({}); 
  const [p2Revealed, setP2Revealed] = useState<Record<string, boolean>>({}); 
  const [p2Flipped, setP2Flipped] = useState<Record<string, boolean>>({});
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
        if (d[fbKeyP1Answers]) setP1Answers(d[fbKeyP1Answers]);
        if (d[fbKeyP2Revealed]) setP2Revealed(d[fbKeyP2Revealed]);
        if (d[fbKeyP2Flipped]) setP2Flipped(d[fbKeyP2Flipped]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyP1Answers, fbKeyP2Revealed, fbKeyP2Flipped, fbKeyWriteAnim]);

  // === 🎯 KEYBOARD SHORTCUTS FOR PEN TABLET (ปลดล็อค Fullscreen ออก) ===
  useEffect(() => {
    if (userRole !== 'teacher') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // ป้องกันการส่งคำสั่งซ้ำรัวๆ เวลาที่ผู้ใช้หรือบอร์ดกดปุ่มค้างไว้
      if (e.repeat) return;

      if (e.key === 'Escape') {
        setDrawMode(false);
        return;
      }

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

  // Actions Part 1 & 2
  const handleP1ChoiceClick = async (qId: string, choice: string) => {
    if (userRole !== 'teacher') return;
    const newAnswers = { ...p1Answers, [qId]: choice };
    setP1Answers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP1Answers]: newAnswers }); } catch(e){} }
  };
  const revealAllP1 = async () => {
    if (userRole !== 'teacher') return;
    const correctAns: Record<string, string> = {}; questions.forEach(q => correctAns[q.id] = q.correctAnswer);
    setP1Answers(correctAns);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP1Answers]: correctAns }); } catch(e){} }
  };
  const resetAllP1 = async () => {
    if (userRole !== 'teacher') return;
    setP1Answers({});
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP1Answers]: {} }); } catch(e){} }
  };
  const toggleFlipP2 = async (itemId: string) => {
    if (userRole !== 'teacher') return;
    const newFlipped = { ...p2Flipped, [itemId]: !p2Flipped[itemId] };
    setP2Flipped(newFlipped);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP2Flipped]: newFlipped }); } catch(e){} }
  };
  const handleToggleReveal = async (itemId: string, reveal: boolean) => {
    if (userRole !== 'teacher') return;
    const newRevealed = { ...p2Revealed, [itemId]: reveal }; setP2Revealed(newRevealed);
    const newFlipped = { ...p2Flipped, [itemId]: false }; setP2Flipped(newFlipped);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP2Revealed]: newRevealed, [fbKeyP2Flipped]: newFlipped }); } catch(e){} }
  };
  const resetAllP2 = async () => {
    if (userRole !== 'teacher') return;
    setP2Revealed({}); setP2Flipped({});
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyP2Revealed]: {}, [fbKeyP2Flipped]: {} }); } catch(e){} }
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

               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setDrawMode(!drawMode)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${drawMode ? 'bg-red-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                  >
                    {drawMode ? <X size={16}/> : <Edit3 size={16}/>}
                    {drawMode ? 'ปิดโหมดวาดรูป' : 'เปิดโหมดวาดรูป'}
                  </button>
               </div>

               {drawMode && (
                 <>
                   <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                   
                   {/* โซนเลือกเครื่องมือหลัก */}
                   <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                     <button onClick={() => setDrawTool('pen')} className={`p-2 rounded-lg transition-all ${drawTool === 'pen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} title="ปากกา (กด P/B)"><Pencil size={18}/></button>
                     <button onClick={() => setDrawTool('highlight')} className={`p-2 rounded-lg transition-all ${drawTool === 'highlight' ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-500 hover:text-slate-700'}`} title="ไฮไลต์ (กด H)"><Edit3 size={18}/></button>
                     <button onClick={() => setDrawTool('eraser')} className={`p-2 rounded-lg transition-all ${drawTool === 'eraser' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`} title="ยางลบ (กด E หรือคลิกขวา)"><Eraser size={18}/></button>
                   </div>

                   {/* 🎯 โซนเลือกหัวปากกา */}
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

      <div className={`flex-1 w-full p-4 md:p-8 pb-16 ${drawMode ? 'select-none' : ''}`}>
        
        {/* ==================== ส่วนที่ 1: เติมคำในช่องว่าง ==================== */}
        <div className="mb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-16 md:mt-0">
            <div className="flex items-center gap-4">
              <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle1}</span>
              <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle1}</span>
            </div>
            {userRole === 'teacher' && (
              <div className="flex gap-2">
                <button onClick={resetAllP1} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full text-sm font-bold transition-colors">ล้างคำตอบ</button>
                <button onClick={revealAllP1} className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-full text-sm font-bold transition-colors flex items-center gap-2"><CheckCircle2 size={16}/> เฉลยทั้งหมด</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
             {questions.map((q) => {
                const answer = p1Answers[q.id];
                const isCorrect = answer === q.correctAnswer;
                const fullSentenceForAudio = answer && isCorrect ? q.sentenceTemplate.replace('_', answer) : q.sentenceTemplate;

                return (
                  <div key={q.id} className="bg-white border-2 border-slate-100 shadow-sm rounded-3xl p-5 md:p-6 flex flex-col relative group hover:border-orange-200 transition-colors">
                     <div className="flex items-start justify-between gap-4 w-full mb-6">
                        <div className="flex items-start gap-4 flex-1">
                           <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-1">{q.number}</div>
                           <div className="flex-col w-full cursor-pointer" onClick={() => speakChinese(fullSentenceForAudio)}>
                              <SentenceRenderer template={q.sentenceTemplate} answer={answer} isCorrect={isCorrect} />
                           </div>
                        </div>
                        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center">
                           {q.imageUrl ? <img src={q.imageUrl} alt="img" className="max-w-full max-h-full object-contain mix-blend-multiply" /> : <div className="text-slate-200 text-4xl">?</div>}
                        </div>
                     </div>

                     <div className="flex items-center justify-center gap-4 md:gap-6 mt-auto">
                        {q.choices.map((choice, cIdx) => {
                          const isSelected = answer === choice;
                          const choiceIsCorrect = choice === q.correctAnswer;
                          
                          let btnClass = "border-slate-200 text-slate-600 bg-white hover:bg-slate-50";
                          if (isSelected) {
                            btnClass = choiceIsCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-600 scale-110 shadow-md ring-2 ring-emerald-100" : "border-red-500 bg-red-50 text-red-600 scale-105 shadow-sm";
                          }

                          return (
                            <button 
                              key={cIdx}
                              onClick={() => handleP1ChoiceClick(q.id, choice)}
                              disabled={userRole !== 'teacher'}
                              className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl border-2 font-serif font-bold text-2xl md:text-3xl transition-all duration-300 ${btnClass} ${userRole === 'teacher' ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                               {choice}
                            </button>
                          );
                        })}
                     </div>
                  </div>
                );
             })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-12 relative z-10"></div>

        {/* ==================== ส่วนที่ 2: ประกอบอักษรจีน ==================== */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-xl md:text-2xl font-bold text-slate-800">{mainTitle2}</span>
              <span className="text-lg md:text-xl font-bold text-slate-500">{subTitle2}</span>
            </div>
            {userRole === 'teacher' && (
              <button onClick={resetAllP2} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full text-sm font-bold transition-colors">ล้างกระดาน</button>
            )}
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 md:p-10 max-w-5xl mx-auto shadow-sm relative">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                {part2Items.map((item) => {
                   const isRevealed = p2Revealed[item.id];
                   const isFlipped = p2Flipped[item.id];

                   let strokeColor = '#334155'; 
                   let radicalColor = '#334155';
                   
                   if (item.fullChar === '块') { radicalColor = '#ef4444'; strokeColor = '#334155'; }
                   else if (item.fullChar === '贵') { radicalColor = '#334155'; strokeColor = '#ef4444'; }
                   else if (item.fullChar === '钱') { radicalColor = '#ef4444'; strokeColor = '#334155'; }
                   else if (item.fullChar === '百') { radicalColor = '#334155'; strokeColor = '#ef4444'; }

                   return (
                     <div key={item.id} className="relative w-full aspect-[3/4] [perspective:1000px] group">
                        
                        {isRevealed ? (
                           <div className="absolute inset-0 w-full h-full bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 flex flex-col items-center justify-center shadow-md animate-fade-in z-10">
                               <SingleHanziWriter 
                                  character={item.fullChar} size={90} pinyin={pinyinConverter(item.fullChar)}
                                  showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} 
                                  customStrokeColor={strokeColor} customRadicalColor={radicalColor} customPinyinColor="text-emerald-600"
                               />
                               {userRole === 'teacher' && (
                                 <button 
                                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleReveal(item.id, false); }} 
                                   onPointerDown={(e) => e.stopPropagation()}
                                   className="absolute -top-3 -right-3 bg-white text-slate-300 hover:text-red-500 rounded-full shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                   title="ยกเลิกการเฉลย"
                                 >
                                    <X size={18} className="pointer-events-none" />
                                 </button>
                               )}
                           </div>
                        ) : (
                           <div className={`absolute inset-0 w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                              
                              {/* FRONT: ชิ้นส่วนตั้งต้น (ดำ) */}
                              <div 
                                className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border-2 border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center hover:border-emerald-300 transition-colors cursor-pointer" 
                                onClick={() => handleToggleReveal(item.id, true)}
                                title={userRole === 'teacher' ? "คลิกการ์ดเพื่อเฉลยประกอบร่าง" : ""}
                              >
                                 <div className="pointer-events-none">
                                   <SingleHanziWriter character={item.missingPart} size={80} showControls={false} hideQuiz={true} customStrokeColor="#334155" />
                                 </div>
                                 {userRole === 'teacher' && (
                                    <div className="absolute bottom-4 right-4 z-20">
                                       <button 
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFlipP2(item.id); }} 
                                         onPointerDown={(e) => e.stopPropagation()}
                                         className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                                       >
                                          <Repeat size={16} className="pointer-events-none" />
                                       </button>
                                    </div>
                                 )}
                              </div>

                              {/* BACK: Pinyin */}
                              <div 
                                className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-sm flex flex-col items-center justify-center cursor-pointer" 
                                onClick={() => handleToggleReveal(item.id, true)}
                              >
                                 <span className="text-4xl font-mono font-bold text-indigo-600 mb-6 pointer-events-none">{pinyinConverter(item.missingPart)}</span>
                                 <div className="flex gap-4 z-20">
                                    <button 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); speakChinese(item.missingPart); }} 
                                      onPointerDown={(e) => e.stopPropagation()}
                                      className="p-3 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110 transition-transform"
                                    >
                                      <Volume2 size={20} className="pointer-events-none" />
                                    </button>
                                    {userRole === 'teacher' && (
                                       <button 
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFlipP2(item.id); }} 
                                         onPointerDown={(e) => e.stopPropagation()}
                                         className="p-3 bg-white text-indigo-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                                       >
                                         <Repeat size={20} className="pointer-events-none" />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}

                     </div>
                   );
                })}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}