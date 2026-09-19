// src/components/Other_lesson6-3.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PauseCircle, ChevronDown, PlayCircle, Headphones, Volume2, Mic, MicOff, RotateCcw, Hand, Settings, X, Search, ArrowLeft, Pencil, Keyboard, CheckCircle2, Maximize2, BookOpen, Edit3, Eraser, Trash2, Brush, PenTool, ChevronUp, GripVertical } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_3 {
  id: string;
  imageUrl: string;
  chinese: string;
  correctOrder: string;
}

export interface OtherLesson6_3Data {
  id?: string;
  patternType: 'other_lesson6-3';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: Card6_3[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson6_3Data;
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
  "一": "หนึ่ง", "二": "สอง", "两": "สอง", "三": "สาม", "四": "สี่", "五": "ห้า", "六": "หก", "七": "เจ็ด", "八": "แปด", "九": "เก้า", "十": "สิบ", "百": "ร้อย", "零": "ศูนย์"
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

// 🎯 Component เรนเดอร์ข้อความปกติสำหรับหน้าแรก (ย่อขนาดลงเล็กน้อยให้เหมาะกับ Card เล็ก)
const NormalPinyinText = ({ text, colorClass = "text-slate-800", pinyinColorClass = "text-slate-500", sizeClass = "text-2xl md:text-3xl" }: { text: string, colorClass?: string, pinyinColorClass?: string, sizeClass?: string }) => {
  if (!text) return null;
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });
  return (
    <div className="flex flex-nowrap items-end justify-center gap-0.5 shrink-0 whitespace-nowrap w-full">
      {chars.map((char, i) => {
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunc = /[。，？！、.,?!]/.test(char);
        return (
          <div key={i} className={`flex flex-col items-center leading-none ${isPunc ? '-ml-1' : ''}`}>
            {!isPunc && isChinese ? (
              <span className={`text-[10px] md:text-xs font-sans mb-0.5 ${pinyinColorClass}`}>{pinyins[i]}</span>
            ) : (
              <span className="h-[14px] md:h-[18px] mb-0.5"></span>
            )}
            <span className={`${sizeClass} font-serif font-black ${isChinese ? colorClass : 'text-slate-400'}`}>{char}</span>
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

export default function OtherLesson6_3({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_3Data);
  const safeCards = safeData.cards || [];

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { setIsSlideVisible(entries[0].isIntersecting); }, { threshold: 0.1 });
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const fbKeyAudio = `other6_3_audio_${safeData.id || 'default'}`; 
  const fbKeyHighlight = `other6_3_highlight_${safeData.id || 'default'}`; 
  const fbKeyFocus = `other6_3_focus_${safeData.id || 'default'}`;
  const fbKeyAnswers = `other6_3_answers_${safeData.id || 'default'}`;
  const fbKeySpeech = `other6_3_speech_${safeData.id || 'default'}`;
  
  const fbKeyLiveExModal = `other6_3_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_3_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyLiveExTrans = `other6_3_live_ex_trans_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_3_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_3_write_modal_${safeData.id || 'default'}`;

  // States
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null); 
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  
  // Game States (จัดลำดับ)
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [showNumberPickerFor, setShowNumberPickerFor] = useState<string | null>(null);

  // Focus Mode & Speech
  const [speechScores, setSpeechScores] = useState<Record<string, any>>({});
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechScoresRef = useRef(speechScores);
  useEffect(() => { speechScoresRef.current = speechScores; }, [speechScores]);

  // Live Exercise
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
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        
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
  }, [roomPin, fbKeyAudio, fbKeyHighlight, fbKeyFocus, fbKeyAnswers, fbKeySpeech, fbKeyLiveExModal, fbKeyLiveExText, fbKeyLiveExTrans, fbKeyWriteAnim, fbKeyWriteModal, userRole, safeData.audioUrl]);

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } stopListening(); }; }, []);

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
  const handleSetAnswer = async (cardId: string, val: string) => {
    if (userRole !== 'teacher') return;
    const newAnswers = { ...answers };
    if (val === '') {
       delete newAnswers[cardId];
    } else {
       newAnswers[cardId] = val;
    }
    setAnswers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){} }
  };

  const handleRevealOne = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    const card = safeCards.find(c => c.id === cardId);
    if (!card || !card.correctOrder) return;
    const newAnswers = { ...answers, [cardId]: card.correctOrder };
    setAnswers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){} }
  };

  const handleRevealAll = async () => {
    if (userRole !== 'teacher') return;
    if (!window.confirm('ต้องการเฉลยลำดับทั้งหมดใช่หรือไม่?')) return;
    const newAnswers = { ...answers };
    safeCards.forEach(c => {
       if (c.correctOrder) newAnswers[c.id] = c.correctOrder;
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
    // ล็อกถ้ายังตอบไม่ถูก
    if (cardId) {
      const card = safeCards.find(c => c.id === cardId);
      if (!card || answers[cardId] !== card.correctOrder) {
        alert('❌ ต้องตอบลำดับข้อนี้ให้ถูกต้องก่อน จึงจะขยายกระดานได้ครับ');
        return;
      }
    }
    setFocusedCardId(cardId);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFocus]: cardId }); } catch(e){} }
  };

  // Modals & Controls
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

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, cardId: string) => {
    if (!expectedChinese) return;
    stopListening();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(cardId);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      const newScoreData = { score: calculatedScore, transcript, transcriptPinyin };
      const currentCardScores = speechScoresRef.current[cardId] || {};
      const newScores = { ...speechScoresRef.current, [cardId]: { ...currentCardScores, [userRole]: newScoreData } };

      setSpeechScores(newScores);
      if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch (e) {} }
    };
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);
    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคำตอบ กระดานแบบฝึกหัด และไฮไลต์ทั้งหมดใช่หรือไม่?')) {
      setActiveCardId(null);
      setFocusedCardId(null);
      setAnswers({});
      setSpeechScores({});
      setLiveExText('');
      setLiveExTranslation('');
      setIsWritingExpanded(false);
      setShowNumberPickerFor(null);
      if (roomPin) {
        try { 
          await updateDoc(doc(db, 'live_sessions', roomPin), { 
            [fbKeyHighlight]: null, [fbKeyFocus]: null, [fbKeyAnswers]: {}, [fbKeySpeech]: {}, 
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
  const focusedScoreData = focusedCard ? (speechScores[focusedCard.id] || {}) : {};
  const isFocusedRecording = focusedCard ? (recordingId === focusedCard.id) : false;

  return (
    // 🎯 ไม่บังคับ min-h-screen เพื่อไม่ให้มีช่องว่างด้านล่างดันปุ่ม Slide Show
    <div ref={mainContainerRef} className={`flex w-full transition-all duration-500 items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200 ${drawMode ? 'select-none' : ''}`} onClick={() => setShowNumberPickerFor(null)}>
      
      {/* 🎯 กระดานวาดเขียน Overlay ตั้ง z-[5500] ให้อยู่เหนือ Modal เขียน แต่ใต้แผงควบคุม */}
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

      <div className="flex-1 w-full p-4 md:p-6 relative z-[1] pb-8">
        
        {/* 1. Header & Subtitle */}
        <div className="w-full mb-8">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-md">
              {safeData.mainTitle || '3. 听录音，排序。'}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] md:text-[20px] font-bold text-slate-700 leading-tight flex-1">
              {safeData.subTitle || 'ฟังแล้วเขียนตัวเลขตามลำดับ'}
            </div>
            
            {/* Audio Controls */}
            {userRole !== 'teacher' && (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-orange-600 transition-all w-fit">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || 'Track 03'))}
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

        {/* 2. Content Area */}
        <div className="w-full transition-all duration-500">
          
          {/* ======================= FOCUS MODE (โหมดขยาย) แบบใหม่ ใช้ HanziWordWriter วาดเส้น ======================= */}
          {focusedCard ? (
            <div className="w-full animate-fade-in mb-6 flex flex-col items-center">
              {userRole === 'teacher' && (
                <button onClick={() => handleFocusCard(null)} className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-full transition-colors w-fit shadow-sm border border-indigo-200 self-start">
                  <ArrowLeft size={18} /> กลับไปหน้าหลัก
                </button>
              )}

              {/* Layout โหมด Focus: ซ้าย (รูป+กระดานเขียน) | ขวา (กฎการอ่านตัวเลข) */}
              <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 w-full max-w-5xl shadow-sm relative group mx-auto">
                
                {/* ฝั่งซ้าย: รูปภาพและกระดานเขียน */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative min-w-[50%]">
                  
                  {/* Scores Corner */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-30 pointer-events-none">
                    {focusedScoreData.teacher && userRole === 'teacher' && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold shadow-sm bg-white/90 ${getScoreColor(focusedScoreData.teacher.score)}`}>
                        👩‍🏫 {focusedScoreData.teacher.score}%
                      </div>
                    )}
                    {focusedScoreData.student && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold shadow-sm bg-white/90 ${getScoreColor(focusedScoreData.student.score)}`}>
                        🧒 {focusedScoreData.student.score}%
                      </div>
                    )}
                  </div>

                  {userRole === 'teacher' && (
                    <button 
                      onClick={() => toggleWritingModal(true)}
                      className="absolute top-4 left-4 p-2 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-slate-200 hover:border-indigo-200 z-30"
                      title="ขยายเต็มจอเพื่อฝึกเขียน"
                    >
                      <Maximize2 size={20} />
                    </button>
                  )}

                  {/* Image */}
                  <div className="w-full flex items-center justify-center min-h-[160px]">
                     {focusedCard.imageUrl ? (
                       <img src={focusedCard.imageUrl} alt="Card Image" className="max-w-full max-h-[180px] object-contain transition-transform duration-500 hover:scale-105 mix-blend-multiply" />
                     ) : (
                       <span className="text-slate-300">ไม่มีรูปภาพ</span>
                     )}
                  </div>

                  {/* HanziWriter with Controls */}
                  <div className="w-full flex flex-col items-center gap-4">
                     <HanziWordWriter text={focusedCard.chinese} size={64} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
                     
                     {/* Audio / Mic Controls for this card */}
                     <div className="flex gap-4 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); speakChinese(focusedCard.chinese); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all shadow-sm font-bold">
                          <Volume2 size={20} /> ฟังเสียง
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (isFocusedRecording) stopListening(); else startListening(focusedCard.chinese, focusedCard.id); }}
                          disabled={recordingId !== null && !isFocusedRecording}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all shadow-sm font-bold border-2 ${
                            isFocusedRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {isFocusedRecording ? <Mic size={20} /> : <MicOff size={20} />}
                          {isFocusedRecording ? 'หยุดพูด' : 'ฝึกพูด'}
                        </button>
                     </div>
                  </div>
                </div>

                {/* ฝั่งขวา: กฎการอ่านตัวเลข (ภาษาพูด) */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-orange-50/50 p-6 md:p-8 rounded-3xl border border-orange-100 shadow-sm h-full flex flex-col justify-center">
                    <h4 className="text-xl font-bold text-orange-700 mb-6 flex items-center gap-2 border-b border-orange-200 pb-3">
                      <BookOpen className="text-orange-500" /> กฎการอ่านเงิน (ภาษาพูด)
                    </h4>
                    <ul className="space-y-4 text-base text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span> 
                          <span><b>ทศนิยม 2 ตำแหน่ง:</b> X.YZ ให้อ่าน <b>X块Y毛Z</b><br/><span className="text-sm text-slate-500 font-normal">เช่น 3.58 = 三块五毛八</span></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span> 
                          <span><b>ทศนิยม 1 ตำแหน่ง:</b> X.Y0 ให้อ่าน <b>X块Y</b><br/><span className="text-sm text-slate-500 font-normal">เช่น 19.90 = 十九块九 (ไม่ต้องอ่านศูนย์ข้างหลัง)</span></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span> 
                          <span><b>ไม่มีทศนิยม:</b> X.00 ให้อ่าน <b>X块</b><br/><span className="text-sm text-slate-500 font-normal">เช่น 105.00 = 一百零五块</span></span>
                        </li>
                        <li className="flex items-start gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100 mt-2">
                          <span className="mt-0.5">💡</span> 
                          <span><b>ข้อควรระวัง:</b><br/>- เลข 2 หน้า 毛 มักอ่านว่า <b>两 (liǎng)</b> (เช่น 35.25 = 三十五块<b>两</b>毛五)<br/>- เลข 0 ที่อยู่ตรงกลาง ให้อ่าน <b>零 (líng)</b> ด้วย (เช่น 105 = 一百<b>零</b>五块)</span>
                        </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // 🎯 ======================= GRID MODE การ์ดจัดลำดับ (ปรับเล็กลง 30% / สี่เหลี่ยมมน) =======================
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 animate-fade-in w-full px-2">
              {safeCards.map((card, idx) => {
                const isHighlighted = activeCardId === card.id;
                const hasAnswer = answers[card.id] !== undefined;
                const isCorrect = answers[card.id] === card.correctOrder;

                return (
                  <div 
                    key={card.id} 
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col group
                      ${isHighlighted ? 'border-orange-400 shadow-xl ring-4 ring-orange-100 scale-105 z-10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
                    `}
                  >
                    {/* ปุ่มสำหรับครู (เฉลย/ไฮไลต์/โฟกัส) */}
                    {userRole === 'teacher' && (
                      <div className="absolute top-2 left-2 z-30 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleRevealOne(card.id); }} className="p-1.5 rounded-full bg-emerald-50 text-emerald-500 shadow-sm hover:bg-emerald-500 hover:text-white transition-all hover:scale-110" title="เฉลยข้อนี้">
                          <CheckCircle2 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleHighlightCard(card.id); }} className={`p-1.5 rounded-full shadow-sm transition-all hover:scale-110 ${isHighlighted ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white'}`} title="ไฮไลต์การ์ดนี้">
                          <Hand size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleFocusCard(card.id); }} className={`p-1.5 rounded-full shadow-sm transition-all hover:scale-110 ${isCorrect ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`} title={isCorrect ? "ขยายดูกระดานเขียน (Focus Mode)" : "ต้องตอบให้ถูกก่อนจึงจะขยายได้"}>
                          <Search size={14} />
                        </button>
                      </div>
                    )}

                    {/* ส่วนรูปภาพ ลดความสูงเหลือ 110px */}
                    <div className="w-full h-[110px] p-3 flex items-center justify-center relative rounded-t-2xl overflow-hidden bg-slate-50/30 border-b border-slate-100">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt="Card image" className="max-w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-slate-300 text-xs">ไม่มีรูปภาพ</span>
                      )}
                    </div>

                    {/* 🎯 ส่วนประโยคภาษาจีนและ Pinyin ใช้ NormalPinyinText ตัวปกติ (ขนาดเล็กลง) */}
                    <div className="px-3 pb-12 pt-3 flex flex-col items-center w-full min-h-[90px] overflow-x-auto no-scrollbar">
                       <NormalPinyinText text={card.chinese} sizeClass="text-2xl md:text-3xl" />
                    </div>

                    {/* 🎯 ช่องใส่ตัวเลข (ปรับเป็นสี่เหลี่ยม Rounded-xl และไว้ด้านในกรอบ) */}
                    <div className="absolute bottom-2 right-2 z-40 flex flex-col items-end">
                       <div 
                         onClick={(e) => { e.stopPropagation(); if(userRole === 'teacher') setShowNumberPickerFor(showNumberPickerFor === card.id ? null : card.id); }}
                         className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-[3px] shadow-sm flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:scale-110 bg-white
                           ${hasAnswer ? (isCorrect ? 'border-emerald-400 text-emerald-600' : 'border-red-400 text-red-500') : 'border-slate-200 text-slate-400 hover:border-indigo-400'}
                         `}
                         title={userRole === 'teacher' ? "คลิกเพื่อเลือกลำดับ" : "รอลำดับจากครู"}
                       >
                         {answers[card.id] || ''}
                       </div>

                       {/* Pop-up Number Picker สำหรับครู (เด้งขึ้นด้านบน เพื่อไม่ให้ตกขอบล่าง) */}
                       {userRole === 'teacher' && showNumberPickerFor === card.id && (
                         <div className="absolute bottom-full right-0 mb-2 bg-white shadow-xl border border-slate-200 p-2 rounded-2xl grid grid-cols-4 gap-1.5 z-[100] animate-fade-in w-44" onClick={e => e.stopPropagation()}>
                            <div className="col-span-4 text-[10px] font-bold text-slate-400 text-center mb-1">เลือกลำดับ</div>
                            {Array.from({length: Math.max(8, safeCards.length)}, (_, i) => i + 1).map(n => (
                               <button 
                                 key={n} 
                                 onClick={() => { handleSetAnswer(card.id, n.toString()); setShowNumberPickerFor(null); }} 
                                 className={`w-full aspect-square rounded-lg font-bold text-base transition-colors ${answers[card.id] === n.toString() ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-50 hover:bg-indigo-100 text-slate-700 border border-slate-100 hover:border-indigo-200'}`}
                               >
                                  {n}
                               </button>
                            ))}
                            <button onClick={() => { handleSetAnswer(card.id, ''); setShowNumberPickerFor(null); }} className="col-span-4 py-1.5 mt-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-bold transition-colors">
                              ลบข้อมูล
                            </button>
                         </div>
                       )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 🎯 Modal ขยายเต็มจอสำหรับฝึกเขียน (ปรับ z-[5000]) */}
      {isWritingExpanded && focusedCard && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-slate-700 flex items-center gap-2">
                <Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน (โหมดเต็มจอ)
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
                text={focusedCard.chinese} 
                size={120} showControls={true} showPinyin={true} layout="col-top" flexWrap="flex-wrap"
                userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd}
              />
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Modal แบบฝึกหัดสด (Live Exercise) (ปรับ z-[5000]) */}
      {isLiveExOpen && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            
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

            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 bg-slate-100/50">
              
              {userRole === 'teacher' && (
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-500 pl-2">ครูพิมพ์อักษรจีนที่นี่ (แปลไทย/จับคู่สีคำอัตโนมัติ):</label>
                  <input
                    type="text"
                    value={liveExText}
                    onChange={handleLiveExTextChange}
                    placeholder="เช่น 二十五块八, 谢谢, 你好..."
                    className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none shadow-sm"
                  />
                </div>
              )}

              {liveExText.trim() ? (
                <div className="flex flex-col items-center bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 w-full min-h-[300px] gap-8">
                  
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

                  <div className="flex items-center gap-4 mt-auto">
                    <button onClick={(e) => { e.stopPropagation(); speakChinese(liveExText); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all shadow-sm font-bold text-lg">
                      <Volume2 size={24} /> ฟังเสียง
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (recordingId === 'live_ex') stopListening();
                        else startListening(liveExText, 'live_ex');
                      }}
                      disabled={recordingId !== null && recordingId !== 'live_ex'}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all shadow-sm font-bold text-lg border-2 ${
                        recordingId === 'live_ex' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {recordingId === 'live_ex' ? <Mic size={24} /> : <MicOff size={24} />}
                      {recordingId === 'live_ex' ? 'หยุดพูด' : 'ฝึกพูด'}
                    </button>
                  </div>
                  
                  {speechScores['live_ex'] && (
                      <div className="flex flex-wrap justify-center gap-4 w-full mt-2">
                          {speechScores['live_ex'].teacher && userRole === 'teacher' && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm bg-white ${getScoreColor(speechScores['live_ex'].teacher.score)}`}>
                              👩‍🏫 ครู: {speechScores['live_ex'].teacher.score}%
                            </div>
                          )}
                          {speechScores['live_ex'].student && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm bg-white ${getScoreColor(speechScores['live_ex'].student.score)}`}>
                              🧒 นักเรียน: {speechScores['live_ex'].student.score}%
                            </div>
                          )}
                      </div>
                  )}

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

      {/* === Teacher Control Panel === */}
      {/* 🎯 ใส่เช็ค isSlideVisible และปรับ z-[6000] */}
      {userRole === 'teacher' && roomPin && isSlideVisible && (
        <>
          <div className={`fixed bottom-24 md:bottom-28 left-4 z-[6000] transition-all duration-500 ${isControlPanelOpen ? '-translate-x-32 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <button onClick={() => setIsControlPanelOpen(true)} className="bg-white/95 backdrop-blur-md p-3 md:px-4 md:py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-105">
              <Settings size={20} />
              <span className="text-xs font-bold hidden md:inline-block uppercase tracking-wider">แผงควบคุม</span>
            </button>
          </div>

          <div className={`fixed bottom-24 md:bottom-28 left-0 w-full p-4 flex justify-center pointer-events-none z-[6000] transition-all duration-500 ${isControlPanelOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex flex-col md:flex-row items-center gap-4 relative">
              
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
                
                {/* เปิดโหมดวาดรูป */}
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