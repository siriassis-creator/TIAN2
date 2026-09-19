// src/components/SharedTeacherPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronUp, GripVertical, Keyboard, RotateCcw, X, Edit3, Eraser, Trash2, Pencil, PenTool, Brush } from 'lucide-react';

interface SharedTeacherPanelProps {
  userRole: 'teacher' | 'student';
  roomPin: string | null;
  isSlideVisible: boolean;      // ตัวเซ็นเซอร์เช็คว่าหน้าจอแสดงอยู่ไหม
  onOpenLiveEx?: () => void;    // ฟังก์ชันเปิดแบบฝึกหัด
  onReset?: () => void;         // ฟังก์ชันล้างกระดาน
  customTools?: React.ReactNode; // ส่วนเสริมสำหรับบางบทเรียน (เช่น เครื่องเล่นเสียง)
}

export const SharedTeacherPanel: React.FC<SharedTeacherPanelProps> = ({ userRole, roomPin, isSlideVisible, onOpenLiveEx, onReset, customTools }) => {
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasDragged: false });

  // === Drawing States ===
  const [drawMode, setDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTool, setDrawTool] = useState<'pen'|'highlight'|'eraser'>('pen');
  const [penStyle, setPenStyle] = useState<'normal'|'brush'>('normal'); 
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(4);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Set Default Position
  useEffect(() => {
    const startY = window.innerHeight - 150;
    setPanelPos({ x: window.innerWidth / 2 - 200, y: startY > 0 ? startY : 0 });
  }, []);

  // === Canvas Init & Resize ===
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
  }, [isSlideVisible]);

  // === Drawing Logic ===
  const startDrawing = (e: React.PointerEvent) => {
    if (!drawMode || !ctxRef.current) return;
    const isRightClick = e.button === 2 || e.buttons === 2 || e.buttons === 32;
    if (e.pointerType === 'eraser' || isRightClick) setDrawTool('eraser');
    ctxRef.current.beginPath(); ctxRef.current.moveTo(e.clientX, e.clientY); setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !drawMode || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const isRightClick = e.buttons === 2 || e.buttons === 32;
    let activeTool = drawTool;
    if (isRightClick || e.pointerType === 'eraser') activeTool = 'eraser';

    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    if (activeTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = penColor;
      let pressure = 0.5; if (e.pointerType === 'pen') pressure = e.pressure > 0 ? e.pressure : 0.1;
      if (penStyle === 'brush') { ctx.globalAlpha = 0.9; ctx.lineWidth = penSize * (pressure * 3.5); } 
      else { ctx.globalAlpha = 1.0; ctx.lineWidth = penSize; }
    } else if (activeTool === 'highlight') {
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.35; ctx.strokeStyle = penColor; ctx.lineWidth = penSize * 4;
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1.0; ctx.lineWidth = penSize * 8;
    }
    ctx.lineTo(e.clientX, e.clientY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.clientX, e.clientY);
  };

  const stopDrawing = () => { if (ctxRef.current) { ctxRef.current.closePath(); setIsDrawing(false); } };
  const clearCanvas = () => { if (canvasRef.current && ctxRef.current) ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); };

  // Exit Fullscreen -> Turn off drawing
  useEffect(() => {
    const handleFullscreenExit = () => { if (!document.fullscreenElement) setDrawMode(false); };
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenExit);
  }, []);

  // Hotkeys
  useEffect(() => {
    if (userRole !== 'teacher' || !isSlideVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;
      if (e.key === 'Escape') { setDrawMode(false); return; }
      if (!document.fullscreenElement) return;
      const key = e.key.toLowerCase();
      if (key === 'p' || key === 'b') { setDrawTool('pen'); setDrawMode(true); } 
      else if (key === 'e') { setDrawTool('eraser'); setDrawMode(true); } 
      else if (key === 'h') { setDrawTool('highlight'); setDrawMode(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userRole, isSlideVisible]);

  // Drag Logic
  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDraggingPanel(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: panelPos.x, initialY: panelPos.y, hasDragged: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPanel) return; e.stopPropagation();
    const dx = e.clientX - dragRef.current.startX; const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.hasDragged = true;
    let newX = dragRef.current.initialX + dx; let newY = dragRef.current.initialY + dy;
    if (newX < 0) newX = 0; if (newY < 0) newY = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    if (newY > window.innerHeight - 80) newY = window.innerHeight - 80;
    setPanelPos({ x: newX, y: newY });
  };
  const onPointerUp = (e: React.PointerEvent) => { e.stopPropagation(); setIsDraggingPanel(false); (e.target as HTMLElement).releasePointerCapture(e.pointerId); };

  if (userRole !== 'teacher' || !roomPin || !isSlideVisible) return null;

  return (
    <>
      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerOut={stopDrawing} onContextMenu={(e) => e.preventDefault()} 
        className={`fixed top-0 left-0 w-full h-full z-[4000] touch-none transition-all ${drawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Draggable Panel */}
      <div className="fixed z-[9999] pointer-events-auto touch-none" style={{ left: panelPos.x, top: panelPos.y }}>
        {isControlPanelOpen ? (
          <div className="bg-white/95 backdrop-blur-md pl-2 pr-5 py-3 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex flex-col md:flex-row flex-wrap justify-center items-center gap-4 relative animate-fade-in">
            <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} className="cursor-move p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors" title="ลากเพื่อย้าย">
                <GripVertical size={20} />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            {/* Custom Tools (เช่น เครื่องเล่นเสียง) */}
            {customTools && (
              <>
                {customTools}
                <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              </>
            )}
            
            {/* Main Tools */}
            <div className="flex flex-wrap justify-center items-center gap-2 shrink-0">
              {/* เปิดโหมดวาดรูป */}
              <button onClick={() => setDrawMode(!drawMode)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border ${drawMode ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}>
                {drawMode ? <X size={14}/> : <Edit3 size={14}/>} {drawMode ? 'ปิดวาด' : 'เปิดวาด'}
              </button>

              {/* เครื่องมือวาด (แสดงเมื่อ Draw Mode ON) */}
              {drawMode && (
                <>
                  <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setDrawTool('pen')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'pen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Pencil size={16}/></button>
                    <button onClick={() => setDrawTool('highlight')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'highlight' ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-500 hover:text-slate-700'}`}><Edit3 size={16}/></button>
                    <button onClick={() => setDrawTool('eraser')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'eraser' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`}><Eraser size={16}/></button>
                  </div>
                  {drawTool === 'pen' && (
                    <div className="flex items-center gap-1 bg-indigo-50 p-1 rounded-xl mx-1 border border-indigo-100">
                      <button onClick={() => setPenStyle('normal')} className={`p-1 rounded-lg transition-all ${penStyle === 'normal' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}><PenTool size={14}/></button>
                      <button onClick={() => setPenStyle('brush')} className={`p-1 rounded-lg transition-all ${penStyle === 'brush' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-400'}`}><Brush size={14}/></button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mx-1">
                    {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'].map(color => (
                      <button key={color} onClick={() => { setPenColor(color); if (drawTool === 'eraser') setDrawTool('pen'); }} className={`w-4 h-4 rounded-full shadow-sm border transition-all ${penColor === color && drawTool !== 'eraser' ? 'scale-125 border-slate-400' : 'border-slate-200 hover:scale-110'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 w-16 mx-1">
                    <input type="range" min="1" max="20" value={penSize} onChange={(e) => setPenSize(parseInt(e.target.value))} className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <button onClick={clearCanvas} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="ล้างหน้ากระดาน"><Trash2 size={16}/></button>
                </>
              )}

              {/* ปุ่มอื่นๆ (แสดงเมื่อ Draw Mode OFF) */}
              {!drawMode && (
                <>
                  {onOpenLiveEx && (
                    <>
                      <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                      <button onClick={onOpenLiveEx} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm border border-indigo-200"><Keyboard size={14} /> แบบฝึกหัด</button>
                    </>
                  )}
                  {onReset && (
                    <>
                      <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                      <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"><RotateCcw size={14} /> ล้างกระดาน</button>
                    </>
                  )}
                </>
              )}
              
              <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>
              <button onClick={() => setIsControlPanelOpen(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"><ChevronUp size={14} /> เก็บ</button>
            </div>
          </div>
        ) : (
          <button onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onClick={(e) => { if(dragRef.current.hasDragged) { e.preventDefault(); return; } setIsControlPanelOpen(true); }} className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-all hover:scale-105 cursor-move animate-fade-in" title="ลากเพื่อย้าย หรือคลิกเพื่อเปิด">
            <Settings size={24} />
          </button>
        )}
      </div>
    </>
  );
};