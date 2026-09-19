// src/components/Other_lesson6-4.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PauseCircle, ChevronDown, PlayCircle, Headphones, Volume2, Mic, MicOff, RotateCcw, Settings, X, Search, ArrowLeft, Pencil, Keyboard, Maximize2, Edit3, Eraser, Trash2, Brush, PenTool, ChevronUp, GripVertical } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Dialogue { id: string; chinese: string; thai: string; }
export interface Scenario { id: string; imageUrl: string; dialogues: Dialogue[]; question: string; }
export interface OtherLesson6_4Data {
  id?: string; patternType: 'other_lesson6-4'; mainTitle: string; subTitle: string;
  audioTrack: string; audioUrl: string; scenarios: Scenario[];
}

interface Props { data: OtherLesson6_4Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const LOCAL_DICT: Record<string, string> = {
  "多少钱": "ราคาเท่าไหร่", "一共": "ทั้งหมด", "多少": "เท่าไหร่", "谢谢": "ขอบคุณ", "你好": "สวัสดี", 
  "块": "หยวน", "元": "หยวน", "毛": "เหมา", "角": "เจี่ยว", "分": "เฟิน", "买": "ซื้อ", "卖": "ขาย", "贵": "แพง", "便宜": "ถูก"
};

const tokenizeLiveText = (text: string) => {
  let result = [], i = 0, colorIndex = 0;
  const colors = [
    { hex: '#2563eb', tw: 'text-blue-600' }, { hex: '#16a34a', tw: 'text-green-600' },
    { hex: '#db2777', tw: 'text-pink-600' }, { hex: '#ea580c', tw: 'text-orange-600' },
  ];
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
            {/* 🎯 ขยายขนาดตัวอักษรจีนเป็น text-2xl ถึง text-3xl เพื่อความสวยงามใน Grid Mode */}
            <span className={`text-2xl md:text-3xl font-serif font-black ${isChinese ? colorClass : 'text-slate-400'}`}>{char}</span>
          </div>
        );
      })}
    </div>
  );
};


// === กระดาน Hanzi ตัวเดียว ===
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
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            {animState === 'playing' ? <PauseCircle size={10}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && (
            <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
              <Pencil size={10}/> เขียน
            </button>
          )}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }}
        onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1 ${size <= 40 ? 'text-[11px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

// === กลุ่มคำ Hanzi ===
const HanziWordWriter = ({ text, align = 'left', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split('');
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
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

export default function OtherLesson6_4({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_4Data);

  // 🎯 เซ็นเซอร์สำหรับเช็คว่าหน้าสไลด์มองเห็นหรือไม่ ป้องกันแผงควบคุมทับกัน
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { setIsSlideVisible(entries[0].isIntersecting); }, { threshold: 0.1 });
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);
  
  // ข้อมูลตั้งต้น 2 เหตุการณ์ (Fallback หากยังไม่มีการบันทึก)
  const defaultScenarios: Scenario[] = [
    {
      id: 'scenario_1', imageUrl: '', question: '熊猫橡皮多少钱？',
      dialogues: [
        { id: 'd1_1', chinese: '熊猫橡皮，真可爱！', thai: 'ยางลบหมีแพนด้า น่ารักจัง' },
        { id: 'd1_2', chinese: '请问，一块橡皮多少钱？', thai: 'ไม่ทราบว่ายางลบก้อนนี้ราคาเท่าไรครับ' },
        { id: 'd1_3', chinese: '两块五。', thai: '2.5 หยวน' }
      ]
    },
    {
      id: 'scenario_2', imageUrl: '', question: '笔多少钱？',
      dialogues: [
        { id: 'd2_1', chinese: '这支笔多少钱？', thai: 'ปากกาด้ามนี้ราคาเท่าไรครับ' },
        { id: 'd2_2', chinese: '两百五十块。', thai: '250 หยวน' },
        { id: 'd2_3', chinese: '真贵啊！', thai: 'แพงจังเลย' }
      ]
    }
  ];

  // ✅ เพิ่มระบบ Fallback ให้ Header และ Scenarios
  const mainTitle = safeData.mainTitle || '1. 听录音，说一说，然后回答问题。';
  const subTitle = safeData.subTitle || 'ฟังแล้วฝึกพูด จากนั้นตอบคำถาม';
  const audioTrack = safeData.audioTrack || '06-04';
  const scenarios = Array.isArray(safeData.scenarios) && safeData.scenarios.length > 0 ? safeData.scenarios : defaultScenarios;

  const fbKeyAudio = `other6_4_audio_${safeData.id || 'default'}`; 
  const fbKeyFocus = `other6_4_focus_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_4_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_4_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_4_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_4_write_modal_${safeData.id || 'default'}`; 

  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef(0);

  const [focusedScenarioId, setFocusedScenarioId] = useState<string | null>(null); 
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 

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

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyFocus] !== undefined) setFocusedScenarioId(d[fbKeyFocus]);
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);

        const audioCmd = d[fbKeyAudio];
        if (audioCmd && audioCmd.ts !== lastSignalTs.current) {
          lastSignalTs.current = audioCmd.ts;
          const audio = initAudio();
          if (audio) {
            if (audioCmd.action === 'PLAY') {
              if (Math.abs(audio.currentTime - (audioCmd.currentTime || 0)) > 1) audio.currentTime = audioCmd.currentTime || 0;
              audio.play().then(() => setPlaybackState('broadcast_playing')).catch(()=>{}); 
            } else if (audioCmd.action === 'PAUSE') {
              audio.pause();
              if (audioCmd.currentTime !== undefined) { audio.currentTime = audioCmd.currentTime; setProgress((audio.currentTime / audio.duration) * 100); }
              setPlaybackState('idle');
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAudio, fbKeyFocus, fbKeyLiveExModal, fbKeyLiveExText, fbKeyWriteAnim, fbKeyWriteModal]);

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }; }, []);

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
    const audio = initAudio(); if (!audio) return alert('ไม่มีไฟล์เสียง');
    if (playbackState === 'local_playing') { audio.pause(); setPlaybackState('idle'); } 
    else { audio.play().then(() => setPlaybackState('local_playing')); }
  };

  const toggleBroadcastAudio = async () => {
    if (userRole !== 'teacher' || !roomPin) return;
    const newAction = playbackState === 'broadcast_playing' ? 'PAUSE' : 'PLAY';
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0; 
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAudio]: { action: newAction, ts: Date.now(), currentTime } }); } catch(e) {}
  };

  const handleFocusScenario = async (sId: string | null) => {
    if (userRole !== 'teacher') return;
    setFocusedScenarioId(sId);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFocus]: sId }); } catch(e){} }
  };

  const openWritingModal = async (text: string | null) => {
    setWritingModalText(text);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: text }); } catch(e){} }
  };

  const toggleLiveExerciseModal = async (isOpen: boolean) => {
    setIsLiveExOpen(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างหน้าจอและคำตอบทั้งหมดใช่หรือไม่?')) {
      setFocusedScenarioId(null); setLiveExText(''); setWritingModalText(null);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFocus]: null, [fbKeyLiveExModal]: false, [fbKeyLiveExText]: '', [fbKeyWriteModal]: null }); } catch(e){}
      }
    }
  };

  const handleLiveExTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value; setLiveExText(newText);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExText]: newText }); } catch(e){} }
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

  const focusedScenario = focusedScenarioId ? scenarios.find(s => s.id === focusedScenarioId) : null;

  return (
    <div ref={mainContainerRef} className={`flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200 ${drawMode ? 'select-none' : ''}`}>
      
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
      
      <div className="flex-1 w-full p-4 md:p-6 pb-24 relative z-[1]">
        
        {/* Header (ดึงค่า Fallback ถ้ายังไม่ได้ตั้งค่า) */}
        <div className="w-full mb-6">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl font-bold text-white tracking-wide">{mainTitle}</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] font-bold text-slate-700 flex-1">{subTitle}</div>
            {userRole !== 'teacher' && (
              <div className="flex gap-2 min-w-[200px] flex-col">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border shadow-sm text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs">{playbackState === 'broadcast_playing' ? '📢 เสียงจากครู' : audioTrack}</span>
                </button>
                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} disabled={playbackState === 'broadcast_playing'} className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ${playbackState === 'broadcast_playing' ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          {focusedScenario ? (
            // ==================== SLIDE MODE (Focus) ====================
            <div className="w-full animate-fade-in flex flex-col items-center">
              {userRole === 'teacher' && (
                <button onClick={() => handleFocusScenario(null)} className="mb-4 flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-6 py-2.5 rounded-full shadow-sm border border-indigo-200 self-start hover:bg-indigo-100 transition-colors">
                  <ArrowLeft size={18} /> กลับไปหน้าหลัก
                </button>
              )}

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 w-full max-w-5xl shadow-sm flex flex-col gap-6">
                <div className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2 px-4 text-center md:text-left">
                  เหตุการณ์ที่ {focusedScenario.id === 'scenario_1' ? '1' : '2'}
                </div>
                
                {/* แบ่ง 2 ฝั่ง ซ้ายรูปภาพ - ขวาข้อความ */}
                <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                  
                  {/* ซ้าย: รูปภาพ */}
                  <div className="w-full md:w-[40%] flex justify-center bg-slate-50/50 rounded-2xl p-4 min-h-[200px] border border-slate-100">
                    {focusedScenario.imageUrl ? <img src={focusedScenario.imageUrl} className="max-h-[300px] object-contain mix-blend-multiply" alt="Scenario" /> : <div className="text-slate-300">ไม่มีรูปภาพ</div>}
                  </div>

                  {/* ขวา: ข้อความพร้อมกระดานเขียน */}
                  <div className="w-full md:w-[60%] space-y-6">
                    {focusedScenario.dialogues.map((dlg, idx) => (
                      <div key={dlg.id} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors group relative" title={userRole === 'teacher' ? "คลิกไอคอนขยายเพื่อฝึกเขียนเต็มจอ" : ""}>
                         <div className="mt-2 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                         
                         <div className="flex-1 flex flex-col justify-center min-h-[80px]">
                            {/* Slide Mode: เปิดโชว์ปุ่ม ลำดับ/เขียน (showControls=true) */}
                            <HanziWordWriter text={dlg.chinese} size={48} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} align="left" />
                            <div className="mt-4 text-indigo-600 font-bold text-lg text-center">{dlg.thai}</div>
                         </div>
                         
                         <div className="flex flex-col gap-2 shrink-0">
                           {userRole === 'teacher' && (
                             <button onClick={(e) => { e.stopPropagation(); openWritingModal(dlg.chinese); }} className="p-3 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl shadow-sm transition-transform hover:scale-110 opacity-0 group-hover:opacity-100">
                               <Maximize2 size={20} />
                             </button>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); speakChinese(dlg.chinese); }} className="p-3 bg-white rounded-full text-slate-400 hover:text-orange-500 shadow-sm transition-transform hover:scale-110">
                              <Volume2 size={24} />
                           </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ==================== NORMAL MODE (หน้าคู่ เปลี่ยนบทสนทนาเป็นแบบพิมพ์) ====================
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {scenarios.map((scene, sIdx) => (
                  <div key={scene.id} className="bg-white rounded-[2rem] border-2 border-slate-200 flex flex-col md:flex-row overflow-hidden relative group">
                    
                    {userRole === 'teacher' && (
                      <div className="absolute top-4 right-4 z-30">
                        <button onClick={() => handleFocusScenario(scene.id)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-all hover:scale-105 font-bold text-sm">
                          <Search size={16} /> ขยาย (Slide)
                        </button>
                      </div>
                    )}

                    {/* ซ้าย: รูปภาพ */}
                    <div className="w-full md:w-2/5 min-h-[200px] p-4 flex items-center justify-center bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100">
                      {scene.imageUrl ? <img src={scene.imageUrl} className="max-h-[250px] object-contain mix-blend-multiply" alt="Scenario" /> : <div className="text-slate-300">ไม่มีรูปภาพ</div>}
                    </div>

                    {/* ขวา: ข้อความ (Normal Mode ใช้ NormalPinyinText) */}
                    <div className="p-4 md:p-6 space-y-5 flex-1 flex flex-col justify-center relative overflow-x-auto no-scrollbar">
                      {scene.dialogues.map((dlg, dIdx) => (
                        <div key={dlg.id} className="flex items-start gap-3 w-full">
                           <div className="mt-1 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">{dIdx + 1}</div>
                           <div className="flex-1 w-full overflow-hidden">
                              {/* 🎯 เปลี่ยนจาก HanziWordWriter เป็น NormalPinyinText */}
                              <NormalPinyinText text={dlg.chinese} />
                              <div className="mt-1 text-slate-500 text-sm whitespace-normal">{dlg.thai}</div>
                           </div>
                           <button onClick={() => speakChinese(dlg.chinese)} className="p-2 text-slate-300 hover:text-orange-500 transition-colors shrink-0"><Volume2 size={20} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== QUESTIONS BANNER (แสดงด้านล่างเสมอ ใช้ HanziWriter เหมือนเดิม) ==================== */}
          <div className="w-full bg-orange-50/80 p-6 rounded-[2rem] border border-orange-100 flex flex-col xl:flex-row gap-6 justify-around items-center mt-8 shadow-sm">
             {scenarios.map((s, i) => (
               <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-orange-200 w-full xl:w-auto relative group transition-all hover:border-orange-400">
                 
                 {/* ปุ่มขยายหน้าเขียนเต็มจอ (เฉพาะครู) */}
                 {userRole === 'teacher' && (
                    <button 
                      onClick={() => openWritingModal(s.question)} 
                      className="absolute top-3 right-3 p-2 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 z-30 shadow-sm" 
                      title="ขยายเต็มจอเพื่อฝึกเขียน"
                    >
                      <Maximize2 size={18} />
                    </button>
                 )}

                 <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shrink-0">{i+1}</div>
                 
                 {/* ใช้กระดาน Hanzi Writer ที่โชว์แค่ปุ่ม ลำดับ (hideQuiz=true) */}
                 <div className="flex-1 flex justify-center w-full min-h-[100px] px-4">
                    <HanziWordWriter text={s.question} size={52} showControls={true} hideQuiz={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                 </div>
                 
                 <button onClick={() => speakChinese(s.question)} className="p-3 text-slate-300 hover:text-orange-500 transition-transform hover:scale-110 shrink-0">
                    <Volume2 size={28} />
                 </button>
                 
               </div>
             ))}
          </div>

        </div>
      </div>

      {/* 🎯 Modal ฝึกเขียนเต็มจอ (ปรับ z-[5000]) */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              {/* หน้าต่างขยายเต็มจอ ให้มีทั้งลำดับและเขียน (hideQuiz=false) */}
              <HanziWordWriter text={writingModalText} size={90} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Modal Live Exercise (ปรับ z-[5000]) */}
      {isLiveExOpen && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Keyboard className="text-indigo-500" /> แบบฝึกหัดสด (Live Exercise)</h3>
              <button onClick={() => { if(userRole==='teacher') toggleLiveExerciseModal(false); else setIsLiveExOpen(false); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 bg-slate-100/50">
              {userRole === 'teacher' && (
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-500 pl-2">ครูพิมพ์อักษรจีนที่นี่:</label>
                  <input type="text" value={liveExText} onChange={handleLiveExTextChange} placeholder="เช่น 橡皮多少钱" className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 outline-none shadow-sm" />
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

      {/* 🎯 แผงควบคุมครู (ลากได้ + โหมดวาดเขียน) ปรับ z-[6000] และเช็ค isSlideVisible */}
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
                    <button onClick={handleTeacherReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm" title="ล้างหน้าจอ">
                      <RotateCcw size={14} /> ล้างหน้าจอ
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