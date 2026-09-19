// src/components/Other_lesson6-2.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PauseCircle, ChevronDown, PlayCircle, Headphones, Volume2, Mic, MicOff, RotateCcw, Hand, Settings, X, Search, ArrowLeft, Pencil, Keyboard, CheckCircle2, Maximize2, Edit3, Eraser, Trash2, Brush, PenTool, ChevronUp, GripVertical } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_2 {
  id: string;
  imageUrl: string;
  prefix: string;
  blankAnswer: string;
  suffix: string;
}

export interface OtherLesson6_2Data {
  id?: string;
  patternType: 'other_lesson6-2';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: Card6_2[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson6_2Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

// === พจนานุกรมแปลอัตโนมัติ สำหรับ Live Exercise ===
const LOCAL_DICT: Record<string, string> = {
  "多少钱": "ราคาเท่าไหร่", "太贵了": "แพงเกินไปแล้ว", "一共": "ทั้งหมด", "多少": "เท่าไหร่",
  "谢谢": "ขอบคุณ", "你好": "สวัสดี", "老师": "คุณครู", "再见": "ลาก่อน",
  "橡皮": "ยางลบ", "笔记本": "สมุดโน้ต", "汉语书": "หนังสือภาษาจีน", "铅笔": "ดินสอ", "书包": "กระเป๋านักเรียน", "笔袋": "กระเป๋าดินสอ",
  "块": "หยวน (พูด)", "元": "หยวน (เขียน)", "毛": "เหมา (พูด)", "角": "เจี่ยว (เขียน)", "分": "เฟิน (สตางค์)",
  "钱": "เงิน", "买": "ซื้อ", "卖": "ขาย", "贵": "แพง", "便宜": "ถูก",
  "一": "หนึ่ง", "二": "สอง", "两": "สอง", "三": "สาม", "四": "สี่", "五": "ห้า", "六": "หก", "七": "เจ็ด", "八": "แปด", "九": "เก้า", "十": "สิบ", "百": "ร้อย"
};

const tokenizeLiveText = (text: string) => {
  let result = [];
  let i = 0;
  let colorIndex = 0;
  const colors = [
    { hex: '#2563eb', tw: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { hex: '#16a34a', tw: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { hex: '#db2777', tw: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { hex: '#9333ea', tw: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { hex: '#ea580c', tw: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  while (i < text.length) {
    let matched = false;
    for (let len = 4; len > 0; len--) {
      if (i + len <= text.length) {
        const word = text.substring(i, i + len);
        if (LOCAL_DICT[word]) {
          const isCompound = len >= 2;
          const colorObj = isCompound ? colors[colorIndex % colors.length] : { hex: '#475569', tw: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
          if (isCompound) colorIndex++;
          result.push({ word, translation: LOCAL_DICT[word], isCompound, ...colorObj });
          i += len;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      result.push({ word: text[i], translation: '', isCompound: false, hex: '#475569', tw: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' });
      i++;
    }
  }
  return result;
};

// 🎯 Component ช่วยเรนเดอร์ข้อความปกติ (ไม่ใช่ Hand write) ปรับให้ตัวใหญ่ขึ้นและบังคับบรรทัดเดียว
const NormalPinyinText = ({ text, colorClass = "text-slate-800", pinyinColorClass = "text-slate-500" }: { text: string, colorClass?: string, pinyinColorClass?: string }) => {
  if (!text) return null;
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });
  return (
    <div className="flex flex-nowrap items-end gap-0.5 shrink-0 whitespace-nowrap">
      {chars.map((char, i) => {
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunc = /[。，？！、.,?!]/.test(char);
        return (
          <div key={i} className={`flex flex-col items-center leading-none ${isPunc ? '-ml-1 md:-ml-1.5' : ''}`}>
            {!isPunc && isChinese ? (
              <span className={`text-[11px] md:text-sm font-sans mb-1 ${pinyinColorClass}`}>{pinyins[i]}</span>
            ) : (
              <span className="h-[16px] md:h-[20px] mb-1"></span>
            )}
            <span className={`text-3xl md:text-4xl font-serif font-black ${isChinese ? colorClass : 'text-slate-400'}`}>{char}</span>
          </div>
        );
      })}
    </div>
  );
};

// === COMPONENT สำหรับกระดานเขียนอักษรจีนทีละ 1 ตัว ===
const SingleHanziWriter = ({ 
  character, size = 100, pinyin, showControls = false, layout = 'col',
  onSpeak, onRecord, isRecording = false, userRole = 'student', remoteAnimCmd = null, onBroadcastAnim,
  customStrokeColor, customPinyinColor
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [animState, setAnimState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const lastAnimTs = useRef<number>(0);

  const isSyncedMode = onBroadcastAnim !== undefined;
  const isStudentSynced = userRole === 'student' && isSyncedMode;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; 
    writerRef.current = HanziWriter.create(containerRef.current, character, {
      width: size, height: size, padding: size > 40 ? 4 : 2, showOutline: true, strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300,
      strokeColor: customStrokeColor || '#334155', radicalColor: customStrokeColor || '#334155', outlineColor: '#e2e8f0', drawingColor: '#f97316',
    });
    setAnimState('idle');
  }, [character, size, customStrokeColor]);

  useEffect(() => {
    if (remoteAnimCmd && remoteAnimCmd.char === character && remoteAnimCmd.ts !== lastAnimTs.current) {
      lastAnimTs.current = remoteAnimCmd.ts;
      if (!writerRef.current || userRole === 'teacher') return;
      if (remoteAnimCmd.action === 'animate') { setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') }); }
      else if (remoteAnimCmd.action === 'pause') { writerRef.current.pauseAnimation(); setAnimState('paused'); }
      else if (remoteAnimCmd.action === 'resume') { writerRef.current.resumeAnimation(); setAnimState('playing'); }
    }
  }, [remoteAnimCmd, character, userRole]);

  const handleAnimate = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!writerRef.current || isStudentSynced) return;
    let nextAction = animState === 'idle' ? 'animate' : (animState === 'playing' ? 'pause' : 'resume');
    if (userRole === 'teacher' && onBroadcastAnim) onBroadcastAnim(character, nextAction);
    if (nextAction === 'animate') { setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') }); }
    else if (nextAction === 'pause') { writerRef.current.pauseAnimation(); setAnimState('paused'); }
    else if (nextAction === 'resume') { writerRef.current.resumeAnimation(); setAnimState('playing'); }
  };

  const handleQuiz = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!writerRef.current || isStudentSynced) return;
    setAnimState('idle'); writerRef.current.quiz();
  };

  const hideBg = !showControls; 

  return (
    <div className={`flex flex-col items-center z-20 relative shrink-0`} style={{ width: size }}>
      {showControls && layout === 'col-top' && (
        <div className="flex flex-col gap-1 w-full px-1 mb-2">
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-sm border ${isStudentSynced ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100/50'}`}>
            {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-sm border ${isStudentSynced ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100/50'}`}>
            <Pencil size={12}/> เขียน
          </button>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : 'bg-white border-2 border-dashed rounded-xl shadow-sm'} overflow-hidden transition-colors ${!hideBg && (isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : 'border-slate-300 cursor-crosshair hover:border-indigo-400')} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }}
        onClick={isStudentSynced || hideBg ? undefined : handleQuiz}
        title={!hideBg && !isStudentSynced ? "คลิกเพื่อฝึกเขียน" : undefined}
      ></div>
      {pinyin && (
        <div className={`font-sans font-bold text-center leading-none whitespace-nowrap ${size <= 40 ? 'text-[11px] mt-0.5' : 'text-[14px] mt-1.5'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>
      )}
    </div>
  );
};

// === COMPONENT ตัวจัดการแยกคำศัพท์ ===
const HanziWordWriter = ({ text, align = 'center', size, gap = 'gap-0.5', padding = 'p-0', showControls = false, showPinyin = true, userRole = 'student', remoteAnimCmd = null, onBroadcastAnim, layout = 'col', flexWrap = 'flex-nowrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split('');
  const resolvedSize = size ?? 36; 
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  
  return (
    <div className={`flex ${flexWrap} items-end ${gap} ${padding} relative z-20 ${justifyClass}`}>
      {chars.map((char: string, idx: number) => (
         /[\u4e00-\u9fa5]/.test(char) ? (
           <SingleHanziWriter 
             key={idx + char} character={char} size={resolvedSize} pinyin={showPinyin ? pinyinConverter(char) : undefined} 
             showControls={showControls} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim}
             customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor}
           />
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0 mb-1">
             {showControls && layout === 'col-top' && <div className="w-full h-[66px]"></div>}
             <div className="flex items-center justify-center font-serif font-black text-slate-700" style={{ fontSize: resolvedSize * 0.6, width: resolvedSize, height: resolvedSize }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};

export default function OtherLesson6_2({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_2Data);
  const safeCards = safeData.cards || [];

  // 🎯 เซ็นเซอร์เช็คว่าสไลด์มองเห็นหรือไม่ ป้องกันแผงควบคุมเด้งซ้อนทับกัน
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { setIsSlideVisible(entries[0].isIntersecting); }, { threshold: 0.1 });
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const fbKeyAudio = `other6_2_audio_${safeData.id || 'default'}`; 
  const fbKeyHighlight = `other6_2_highlight_${safeData.id || 'default'}`; 
  const fbKeyFocus = `other6_2_focus_${safeData.id || 'default'}`;
  const fbKeyAnswers = `other6_2_answers_${safeData.id || 'default'}`;
  
  const fbKeyLiveExModal = `other6_2_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_2_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyLiveExTrans = `other6_2_live_ex_trans_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_2_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_2_write_modal_${safeData.id || 'default'}`;

  // States
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null); 
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  
  // States สำหรับเกมเติมคำ
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // States สำหรับแบบฝึกหัด และ โหมดขยายเขียน
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [liveExTranslation, setLiveExTranslation] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<{char: string, action: string, ts: number} | null>(null);
  const [isWritingExpanded, setIsWritingExpanded] = useState(false);

  // 🎯 States สำหรับระบบวาดภาพบนกระดาน (Canvas Drawing)
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

  const allChoices = useMemo(() => {
    const choices = safeCards.map(c => c.blankAnswer).filter(Boolean);
    return Array.from(new Set(choices)); 
  }, [safeCards]);

  useEffect(() => {
    const startY = window.innerHeight - 150;
    setPanelPos({ x: window.innerWidth / 2 - 250, y: startY > 0 ? startY : 0 });
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

  // ปิดโหมดวาดอัตโนมัติ เมื่อออกจากการนำเสนอ (Fullscreen)
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

  // KEYBOARD SHORTCUTS FOR PEN TABLET
  useEffect(() => {
    if (userRole !== 'teacher' || !isSlideVisible) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;

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
  }, [userRole, isSlideVisible]);

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
    
    if (newX < 0) newX = 0; if (newY < 0) newY = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    if (newY > window.innerHeight - 80) newY = window.innerHeight - 80;
    setPanelPos({ x: newX, y: newY });
  };
  const onPanelPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDraggingPanel(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // ฟังก์ชันเตรียมไฟล์เสียง
  const initAudio = () => {
    if (!audioRef.current && safeData.audioUrl) {
      const audio = new Audio(safeData.audioUrl);
      audio.loop = false;
      audio.onended = () => { setPlaybackState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
      audio.onerror = () => { setPlaybackState('idle'); audioRef.current = null; };
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // === Firebase Sync ===
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        
        if (d[fbKeyHighlight] !== undefined) setActiveCardId(d[fbKeyHighlight]);
        if (d[fbKeyFocus] !== undefined) setFocusedCardId(d[fbKeyFocus]);
        if (d[fbKeyAnswers] !== undefined) setAnswers(d[fbKeyAnswers]);
        
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);
        if (d[fbKeyLiveExTrans] !== undefined) setLiveExTranslation(d[fbKeyLiveExTrans]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyWriteModal] !== undefined) setIsWritingExpanded(d[fbKeyWriteModal]);

        const audioCmd = d[fbKeyAudio];
        if (audioCmd && audioCmd.ts !== lastSignalTs.current) {
          lastSignalTs.current = audioCmd.ts;
          const audio = initAudio();
          if (audio) {
            if (audioCmd.action === 'PLAY') {
              if (Math.abs(audio.currentTime - (audioCmd.currentTime || 0)) > 1) audio.currentTime = audioCmd.currentTime || 0;
              if (audio.currentTime === audio.duration) audio.currentTime = 0;
              audio.play().then(() => setPlaybackState('broadcast_playing')).catch(e => {}); 
            } else if (audioCmd.action === 'PAUSE') {
              audio.pause();
              if (audioCmd.currentTime !== undefined) {
                audio.currentTime = audioCmd.currentTime;
                if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
              }
              setPlaybackState('idle');
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAudio, fbKeyHighlight, fbKeyFocus, fbKeyAnswers, fbKeyLiveExModal, fbKeyLiveExText, fbKeyLiveExTrans, fbKeyWriteAnim, fbKeyWriteModal, userRole, safeData.audioUrl]);

  // ป้องกันการแครชหรือค้างหน้า Focus หากคำตอบถูกเปลี่ยนให้ผิดในระหว่างเปิด
  useEffect(() => {
    if (focusedCardId) {
       const card = safeCards.find(c => c.id === focusedCardId);
       if (card && answers[focusedCardId] !== card.blankAnswer) {
          setFocusedCardId(null);
       }
    }
  }, [answers, focusedCardId, safeCards]);

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }; }, []);

  // === Audio Controls ===
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value); setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      if (playbackState === 'broadcast_playing' && userRole === 'teacher' && roomPin) {
        updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAudio]: { action: 'PLAY', ts: Date.now(), currentTime: newTime } }).catch(()=>{});
      }
    }
  };

  const toggleLocalAudio = () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    const audio = initAudio(); if (!audio) return;
    if (playbackState === 'local_playing') { audio.pause(); setPlaybackState('idle'); } 
    else { if (audio.currentTime === audio.duration) audio.currentTime = 0; audio.play().then(() => setPlaybackState('local_playing')); }
  };

  const toggleBroadcastAudio = async () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    if (userRole !== 'teacher' || !roomPin) return;
    const newAction = playbackState === 'broadcast_playing' ? 'PAUSE' : 'PLAY';
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0; 
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAudio]: { action: newAction, ts: Date.now(), currentTime } }); } catch(e) {}
  };

  // === Game Logic Actions ===
  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(selectedChoice === choice ? null : choice);
  };

  const handleBlankClick = async (cardId: string) => {
    let newAnswers = { ...answers };
    if (newAnswers[cardId]) {
      delete newAnswers[cardId];
    } else if (selectedChoice) {
      newAnswers[cardId] = selectedChoice;
      setSelectedChoice(null); 
    } else {
      return; 
    }
    setAnswers(newAnswers);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){}
    }
  };

  // === Teacher Controls: Reveal ===
  const handleRevealOne = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    const card = safeCards.find(c => c.id === cardId);
    if (!card || !card.blankAnswer) return;
    const newAnswers = { ...answers, [cardId]: card.blankAnswer };
    setAnswers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){} }
  };

  const handleRevealAll = async () => {
    if (userRole !== 'teacher') return;
    if (!window.confirm('ต้องการเฉลยข้อที่เหลือทั้งหมดใช่หรือไม่?')) return;
    const newAnswers = { ...answers };
    safeCards.forEach(c => {
       if (c.blankAnswer) newAnswers[c.id] = c.blankAnswer;
    });
    setAnswers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){} }
  };

  const handleHighlightCard = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    const newHighlight = activeCardId === cardId ? null : cardId;
    setActiveCardId(newHighlight);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyHighlight]: newHighlight }); } catch(e){} }
  };

  const handleFocusCard = async (cardId: string | null) => {
    if (userRole !== 'teacher') return;
    if (cardId) {
      const card = safeCards.find(c => c.id === cardId);
      if (!card || answers[cardId] !== card.blankAnswer) {
        alert('❌ ต้องตอบข้อนี้ให้ถูกต้องก่อน จึงจะสามารถขยายกระดานได้ครับ');
        return;
      }
    }
    setFocusedCardId(cardId);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFocus]: cardId }); } catch(e){} }
  };

  const toggleWritingModal = async (isOpen: boolean) => {
    setIsWritingExpanded(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: isOpen }); } catch(e){} }
  };

  const toggleLiveExerciseModal = async (isOpen: boolean) => {
    setIsLiveExOpen(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} }
  };

  const handleLiveExTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value; setLiveExText(newText);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExText]: newText }); } catch(e){} }
  };

  const handleLiveExTransChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value; setLiveExTranslation(newText);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExTrans]: newText }); } catch(e){} }
  };

  const broadcastAnimCmd = async (char: string, action: string) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){}
  };

  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคำตอบ กระดานแบบฝึกหัด และไฮไลต์ทั้งหมดใช่หรือไม่?')) {
      setActiveCardId(null);
      setFocusedCardId(null);
      setAnswers({});
      setLiveExText('');
      setLiveExTranslation('');
      setIsWritingExpanded(false);
      if (roomPin) {
        try { 
          await updateDoc(doc(db, 'live_sessions', roomPin), { 
            [fbKeyHighlight]: null, [fbKeyFocus]: null, [fbKeyAnswers]: {}, 
            [fbKeyLiveExModal]: false, [fbKeyLiveExText]: '', [fbKeyLiveExTrans]: '', [fbKeyWriteModal]: false
          }); 
        } catch (e) {}
      }
    }
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-white border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลการ์ด...</span>
      </div>
    );
  }

  const focusedCard = focusedCardId ? safeCards.find(c => c.id === focusedCardId) : null;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    // 🎯 เอา min-h-screen และ pb-24 ออก เพื่อให้ Layout พอดี ไม่ดันปุ่ม Slide Show
    <div ref={mainContainerRef} className={`flex w-full transition-all duration-500 items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200 ${drawMode ? 'select-none' : ''}`}>
      
      {/* === Drawing Canvas Overlay === */}
      {isSlideVisible && (
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          onContextMenu={(e) => e.preventDefault()} 
          className={`fixed top-0 left-0 w-full h-full z-[5500] touch-none transition-all ${drawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
        />
      )}

      {/* 🎯 ปรับ padding bottom เหลือ pb-4 เพื่อลดช่องว่างด้านล่าง */}
      <div className="flex-1 w-full p-4 md:p-6 relative z-[1] pb-4">
        
        {/* 1. Header & Subtitle */}
        <div className="w-full mb-4">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-md">
              {safeData.mainTitle || '2. 听录音，选择正确的词语。'}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] md:text-[20px] font-bold text-slate-700 leading-tight flex-1">
              {safeData.subTitle || 'ฟังแล้วเลือกคำศัพท์ที่ถูกต้อง'}
            </div>
            
            {/* Audio Controls */}
            {userRole !== 'teacher' && (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-orange-600 transition-all w-fit">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || 'Track 02'))}
                  </span>
                </button>
                <input 
                    type="range" min="0" max="100" value={progress} onChange={handleSeek}
                    disabled={playbackState === 'broadcast_playing'} 
                    className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ${playbackState === 'broadcast_playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* === Choices Bar === */}
        <div className="w-full bg-orange-50 p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 border border-orange-100">
          {allChoices.map((choice, index) => {
            const isUsed = Object.values(answers).includes(choice);
            const isSelected = selectedChoice === choice;

            return (
              <div 
                key={index} 
                onClick={() => !isUsed && handleChoiceClick(choice)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer border-2
                  ${isUsed ? 'opacity-30 grayscale cursor-not-allowed border-transparent' : 
                    isSelected ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-110' : 'bg-white hover:bg-orange-100 border-orange-200 hover:border-orange-400 shadow-sm'}
                `}
              >
                <span className={`text-lg font-bold ${isSelected ? 'text-orange-200' : 'text-orange-500'}`}>{letters[index] || ''}</span>
                <div className="flex flex-col items-center">
                  <span className={`text-2xl font-serif leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>{choice}</span>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>{pinyinConverter(choice)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Content Area */}
        <div className="w-full transition-all duration-500">
          
          {/* ======================= FOCUS MODE ======================= */}
          {focusedCard ? (
            <div className="w-full animate-fade-in mb-6 flex flex-col items-center">
              {/* ปุ่มย้อนกลับสำหรับครู */}
              {userRole === 'teacher' && (
                <button onClick={() => handleFocusCard(null)} className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-full transition-colors w-fit shadow-sm border border-indigo-200 self-start">
                  <ArrowLeft size={18} /> กลับไปหน้าหลัก
                </button>
              )}

              {/* Layout โหมด Focus */}
              <div className="flex flex-col gap-6 items-center justify-center bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 w-full max-w-4xl relative group mx-auto shadow-sm">
                
                {/* Maximize Button for Teacher */}
                {userRole === 'teacher' && (
                  <button 
                    onClick={() => toggleWritingModal(true)}
                    className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-slate-200 hover:border-indigo-200 z-30 opacity-0 group-hover:opacity-100"
                    title="ขยายเต็มจอเพื่อฝึกเขียน"
                  >
                    <Maximize2 size={20} />
                  </button>
                )}

                <div className="w-full flex items-center justify-center bg-white min-h-[120px]">
                   {focusedCard.imageUrl ? (
                     <img src={focusedCard.imageUrl} alt="Card Image" className="max-w-full max-h-[160px] object-contain transition-transform duration-500 hover:scale-105" />
                   ) : (
                     <span className="text-slate-300">ไม่มีรูปภาพ</span>
                   )}
                </div>

                <div className="w-full flex flex-col justify-center items-center gap-3 relative">
                   
                   <div className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-4">
                     ประโยคที่สมบูรณ์
                     {/* ปุ่มฟังเสียงแบบเนียนๆ */}
                     <button 
                       onClick={(e) => { e.stopPropagation(); speakChinese(focusedCard.prefix + (answers[focusedCard.id] || '') + focusedCard.suffix); }}
                       className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                       title="ฟังเสียงทั้งประโยค"
                     >
                       <Volume2 size={24} />
                     </button>
                   </div>
                   
                   <div className="flex flex-row flex-wrap items-end justify-center w-full gap-1.5">
                      {/* Prefix */}
                      {focusedCard.prefix && <HanziWordWriter text={focusedCard.prefix} size={56} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />}
                      
                      {/* Blank Slot */}
                      <div className="mx-2 pb-1 border-b-4 border-orange-500 bg-orange-50/50 rounded-t-2xl px-2 min-w-[100px] flex justify-center">
                         {answers[focusedCard.id] && (
                           <HanziWordWriter text={answers[focusedCard.id]} size={56} showControls={true} layout="col-top" customStrokeColor="#ea580c" customPinyinColor="text-orange-600" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                         )}
                      </div>

                      {/* Suffix */}
                      {focusedCard.suffix && <HanziWordWriter text={focusedCard.suffix} size={56} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />}
                   </div>

                </div>
              </div>
            </div>
          ) : (
            // ======================= GRID MODE =======================
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 animate-fade-in w-full">
              {safeCards.map((card, idx) => {
                const isHighlighted = activeCardId === card.id;
                const hasAnswer = !!answers[card.id];
                const isCorrect = answers[card.id] === card.blankAnswer;

                return (
                  <div 
                    key={card.id} 
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden group hover:border-orange-300
                      ${isHighlighted ? 'border-orange-400 shadow-md ring-2 ring-orange-100 scale-[1.02] z-10' : 'border-slate-200'}
                    `}
                  >
                    {/* Badge เลขข้อ */}
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center text-xs shadow-sm z-20">
                      {idx + 1}
                    </div>

                    {/* ปุ่มสำหรับครู */}
                    {userRole === 'teacher' && (
                      <div className="absolute top-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRevealOne(card.id); }} 
                          className="p-1.5 rounded-full bg-emerald-50 text-emerald-500 shadow-sm hover:bg-emerald-500 hover:text-white transition-all hover:scale-110"
                          title="เฉลยข้อนี้"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleHighlightCard(card.id); }} 
                          className={`p-1.5 rounded-full shadow-sm transition-all hover:scale-110 ${isHighlighted ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white'}`}
                          title="ไฮไลต์การ์ดนี้"
                        >
                          <Hand size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleFocusCard(card.id); }} 
                          className={`p-1.5 rounded-full shadow-sm transition-all hover:scale-110 ${isCorrect ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          title={isCorrect ? "ขยายดูกระดานเขียน (Focus Mode)" : "ต้องตอบให้ถูกก่อนจึงจะขยายได้"}
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    )}

                    {/* ส่วนรูปภาพ */}
                    <div className="w-full h-[120px] bg-white p-4 flex items-center justify-center relative mt-4">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt="Card image" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-slate-300 text-xs">ไม่มีรูปภาพ</span>
                      )}
                    </div>

                    <div className="px-3 pb-6 pt-2 flex flex-col relative w-full items-center overflow-hidden">
                       <div className="flex flex-row flex-nowrap items-end justify-center w-full gap-0.5 whitespace-nowrap overflow-x-auto pb-1 no-scrollbar">
                         
                         {/* 🎯 นำ NormalPinyinText มาใช้แทนกระดานวาด */}
                         {card.prefix && <NormalPinyinText text={card.prefix} />}
                         
                         {/* Blank Slot */}
                         <div 
                            onClick={() => handleBlankClick(card.id)}
                            className={`relative min-w-[60px] md:min-w-[80px] h-[50px] md:h-[60px] flex items-end justify-center pb-1 cursor-pointer transition-all duration-300 border-b-[3px] mx-1 bg-white shrink-0
                              ${hasAnswer ? (isCorrect ? 'border-emerald-500' : 'border-red-400') : 
                                selectedChoice ? 'border-indigo-400 border-dashed animate-pulse' : 'border-slate-300 hover:border-slate-400'}
                            `}
                            title="คลิกเพื่อวางหรือลบคำตอบ"
                          >
                            {hasAnswer && (
                              <div className="animate-fade-in -mb-1">
                                <NormalPinyinText text={answers[card.id]} colorClass={isCorrect ? 'text-emerald-600' : 'text-red-500'} pinyinColorClass={isCorrect ? 'text-emerald-500' : 'text-red-400'} />
                              </div>
                            )}
                            {hasAnswer && (
                              <div className="absolute -top-1 -right-2 bg-white rounded-full text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-30">
                                <X size={12} />
                              </div>
                            )}
                          </div>

                         {/* 🎯 นำ NormalPinyinText มาใช้แทนกระดานวาด */}
                         {card.suffix && <NormalPinyinText text={card.suffix} />}
                       </div>
                       
                       <div className="absolute bottom-1.5 right-1.5 z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); speakChinese(card.prefix + (answers[card.id] || '') + card.suffix); }}
                            className="p-1.5 text-slate-300 hover:text-orange-500 transition-colors"
                            title="ฟังเสียง"
                          >
                            <Volume2 size={16} />
                          </button>
                       </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* === Modal ขยายเต็มจอสำหรับฝึกเขียน (โชว์ทั้งครูและนักเรียน) === */}
      {isWritingExpanded && focusedCard && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-slate-700 flex items-center gap-2">
                <Pencil className="text-orange-500" /> ฝึกเขียนประโยคสมบูรณ์ (โหมดเต็มจอ)
              </h3>
              <button 
                onClick={() => {
                  if (userRole === 'teacher') toggleWritingModal(false);
                  else setIsWritingExpanded(false);
                }}
                className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center bg-slate-100/50">
              <HanziWordWriter 
                text={focusedCard.prefix + (answers[focusedCard.id] || '') + focusedCard.suffix} 
                size={90} showControls={true} showPinyin={true} layout="col-top"
                userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd}
              />
            </div>
          </div>
        </div>
      )}

      {/* === Modal แบบฝึกหัดสด (Live Exercise) === */}
      {isLiveExOpen && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-slate-700 flex items-center gap-2">
                <Keyboard className="text-indigo-500" /> แบบฝึกหัดสด (Live Exercise)
              </h3>
              <button 
                onClick={() => {
                  if (userRole === 'teacher') toggleLiveExerciseModal(false);
                  else setIsLiveExOpen(false);
                }}
                className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 bg-slate-100/50">
              
              {/* Input สำหรับครูพิมพ์ */}
              {userRole === 'teacher' && (
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-500 pl-2">ครูพิมพ์อักษรจีนที่นี่ (แปลไทย/จับคู่สีคำอัตโนมัติ):</label>
                  <input
                    type="text"
                    value={liveExText}
                    onChange={handleLiveExTextChange}
                    placeholder="เช่น 多少钱, 谢谢, 你好..."
                    className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none shadow-sm"
                  />
                  <div className="text-xs text-slate-400 pl-2 mt-1">* ระบบแปลอัตโนมัติตามพจนานุกรมในระบบ (รองรับคำศัพท์บทที่ 6 และคำพื้นฐาน)</div>
                </div>
              )}

              {/* Display Area */}
              {liveExText.trim() ? (
                <div className="flex flex-col items-center bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 w-full min-h-[300px] gap-8">
                  
                  {/* กระดานเขียน Hanzi Writer แบบจัดกลุ่มสีและใส่คำแปลอัตโนมัติ */}
                  <div className="w-full flex justify-center mt-4">
                    <div className="flex flex-wrap justify-center items-start gap-4 md:gap-8">
                      {tokenizeLiveText(liveExText).map((token, tIdx) => (
                        <div key={tIdx} className="flex flex-col items-center gap-1.5 border-b-2 border-transparent hover:border-slate-200 pb-2 rounded-xl transition-colors">
                          <div className="flex gap-1.5 md:gap-2">
                            {token.word.split('').map((char, cIdx) => (
                              /[\u4e00-\u9fa5]/.test(char) ? (
                                <SingleHanziWriter
                                  key={cIdx} character={char} size={80} pinyin={pinyinConverter(char)}
                                  showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd}
                                  customStrokeColor={token.hex} customPinyinColor={token.tw}
                                />
                              ) : (
                                <div key={cIdx} className="flex flex-col items-center shrink-0">
                                  <div className="w-full h-[66px]"></div>
                                  <div className="flex items-center justify-center font-serif font-black text-slate-700" style={{ fontSize: 80 * 0.6, width: 80, height: 80 }}>{char}</div>
                                </div>
                              )
                            ))}
                          </div>
                          {token.translation && (
                            <div className={`text-[13px] md:text-sm font-bold mt-0.5 ${token.tw} w-full text-center px-2 py-0.5 bg-slate-50/50 rounded-md`}>
                              {token.translation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ปุ่มควบคุมรวมสำหรับทั้งประโยค */}
                  <div className="flex items-center gap-4 mt-auto">
                    <button onClick={(e) => { e.stopPropagation(); speakChinese(liveExText); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all shadow-sm font-bold text-lg">
                      <Volume2 size={24} /> ฟังเสียง
                    </button>
                  </div>

                </div>
              ) : (
                userRole === 'student' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[300px]">
                     <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                     <span className="font-bold text-xl animate-pulse">รอคุณครูพิมพ์แบบฝึกหัด...</span>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      )}

      {/* 🎯 Teacher Control Panel (ลากได้) */}
      {userRole === 'teacher' && roomPin && isSlideVisible && (
        <>
          <div className={`fixed bottom-24 md:bottom-28 left-4 z-[6000] transition-all duration-500 ${isControlPanelOpen ? '-translate-x-32 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <button onClick={() => setIsControlPanelOpen(true)} className="bg-white/95 backdrop-blur-md p-3 md:px-4 md:py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-105">
              <Settings size={20} />
              <span className="text-xs font-bold hidden md:inline-block uppercase tracking-wider">แผงควบคุม</span>
            </button>
          </div>

          {/* 🎯 ปรับให้กล่องแผงควบคุมอิงตาม panelPos โดยไม่ถูกดึงตรงกลาง (ลบ flex justify-center) */}
          <div className={`fixed z-[6000] pointer-events-auto touch-none transition-opacity duration-500 ${isControlPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ left: panelPos.x, top: panelPos.y }}>
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-indigo-200 flex flex-col md:flex-row items-center gap-4 relative">
              
              <div onPointerDown={onPanelPointerDown} onPointerMove={onPanelPointerMove} onPointerUp={onPanelPointerUp} onPointerCancel={onPanelPointerUp} className="cursor-move p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors" title="ลากเพื่อย้ายแผงควบคุม">
                  <GripVertical size={20} />
              </div>
              
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>

              <div className="flex flex-col gap-1 w-full md:w-[260px]">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-inner">
                    <button onClick={toggleLocalAudio} className={`flex items-center justify-center gap-1 px-3 py-1 flex-1 rounded-full transition-all ${playbackState === 'local_playing' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>
                      {playbackState === 'local_playing' ? <PauseCircle size={14}/> : <Headphones size={14}/>}
                      <span className="text-[10px] font-bold">ฟังเอง</span>
                    </button>
                    <button onClick={toggleBroadcastAudio} className={`flex items-center justify-center gap-1 px-3 py-1 flex-1 rounded-full transition-all ${playbackState === 'broadcast_playing' ? 'bg-orange-500 text-white font-bold shadow-md' : 'text-orange-600 hover:bg-orange-100 font-bold'}`}>
                      {playbackState === 'broadcast_playing' ? <Volume2 size={14} className="animate-pulse"/> : <PlayCircle size={14}/>}
                      <span className="text-[10px]">กระจายเสียง</span>
                    </button>
                </div>
                <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500 px-2" />
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              
              <div className="flex items-center gap-2 shrink-0">
                
                {/* 🎯 เปิดโหมดวาดรูป */}
                <button 
                  onClick={() => setDrawMode(!drawMode)} 
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border ${drawMode ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
                >
                  {drawMode ? <X size={14}/> : <Edit3 size={14}/>}
                  {drawMode ? 'ปิดวาด' : 'เปิดวาด'}
                </button>

                {/* ซ่อน/แสดงเครื่องมือวาด เมื่อโหมดวาดเปิดอยู่ */}
                {drawMode && (
                  <>
                    <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button onClick={() => setDrawTool('pen')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'pen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} title="ปากกา (กด P/B)"><Pencil size={16}/></button>
                      <button onClick={() => setDrawTool('highlight')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'highlight' ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-500 hover:text-slate-700'}`} title="ไฮไลต์ (กด H)"><Edit3 size={16}/></button>
                      <button onClick={() => setDrawTool('eraser')} className={`p-1.5 rounded-lg transition-all ${drawTool === 'eraser' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`} title="ยางลบ (กด E หรือคลิกขวา)"><Eraser size={16}/></button>
                    </div>

                    {drawTool === 'pen' && (
                      <div className="flex items-center gap-1 bg-indigo-50 p-1 rounded-xl mx-1 border border-indigo-100">
                        <button onClick={() => setPenStyle('normal')} className={`p-1 rounded-lg transition-all ${penStyle === 'normal' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`} title="ปากกาปกติ"><PenTool size={14}/></button>
                        <button onClick={() => setPenStyle('brush')} className={`p-1 rounded-lg transition-all ${penStyle === 'brush' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-400'}`} title="พู่กัน (รับรู้แรงกด)"><Brush size={14}/></button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mx-1">
                      {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'].map(color => (
                        <button 
                          key={color} onClick={() => handleColorSelect(color)}
                          className={`w-4 h-4 rounded-full shadow-sm border transition-all ${penColor === color && drawTool !== 'eraser' ? 'scale-125 border-slate-400' : 'border-slate-200 hover:scale-110'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-16 mx-1">
                      <input type="range" min="1" max="20" value={penSize} onChange={(e) => setPenSize(parseInt(e.target.value))} className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>

                    <button onClick={clearCanvas} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="ล้างหน้ากระดานทั้งหมด">
                      <Trash2 size={16}/>
                    </button>
                  </>
                )}

                {!drawMode && (
                  <>
                    <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                    <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm border border-indigo-200" title="เปิดแบบฝึกหัดสด">
                      <Keyboard size={14} /> แบบฝึกหัด
                    </button>
                    <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                    
                    <button onClick={handleRevealAll} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-sm border border-emerald-200" title="เฉลยข้อที่เหลือทั้งหมด">
                      <CheckCircle2 size={14} /> เฉลยทั้งหมด
                    </button>
                    <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>

                    <button onClick={handleTeacherReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm" title="ล้างคำตอบและหน้าจอ">
                      <RotateCcw size={14} /> ล้างกระดาน
                    </button>
                  </>
                )}
                
                <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>
                <button 
                  onClick={() => setIsControlPanelOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                  title="ย่อแผงควบคุม"
                >
                  <ChevronDown size={14} /> เก็บ
                </button>
              </div>
              
            </div>
          </div>
        </>
      )}

      {/* Style สำหรับซ่อน Scrollbar แต่ยังเลื่อนซ้ายขวาได้ */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

    </div>
  );
}