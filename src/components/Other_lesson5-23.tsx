// src/components/Other_lesson5-23.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, X, Edit3, RotateCcw, CheckCircle2, Eraser, PenTool } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface CompareToken {
  id: string;
  char: string;
  pinyin: string;
  isBlank: boolean;
}

export interface CompareLine {
  id: string;
  tokens: CompareToken[];
}

export interface OtherLesson5_23Data {
  id?: string;
  patternType: 'other_lesson5-23';
  mainTitle: string;
  subTitle: string;
  imageUrl: string;
  lines: CompareLine[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_23Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_23({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_23Data);
  const safeLines = safeData.lines || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#1e293b'); // สีกรมท่าเข้ม
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isComparedGreen, setIsComparedGreen] = useState(false);

  // Helper สำหรับรวมกลุ่ม Token
  const groupTokens = (tokens: CompareToken[]) => {
    const groups: { isBlank: boolean; chars: string[]; pinyins: string[] }[] = [];
    if (!tokens || tokens.length === 0) return groups;

    let currentGroup = { isBlank: tokens[0].isBlank, chars: [] as string[], pinyins: [] as string[] };

    tokens.forEach((t) => {
      if (t.isBlank === currentGroup.isBlank) {
        currentGroup.chars.push(t.char);
        currentGroup.pinyins.push(t.pinyin);
      } else {
        if (currentGroup.chars.length > 0) groups.push(currentGroup);
        currentGroup = { isBlank: t.isBlank, chars: [t.char], pinyins: [t.pinyin] };
      }
    });
    if (currentGroup.chars.length > 0) groups.push(currentGroup);
    return groups;
  };

  // Resize canvas ให้ตรงกับขนาด Container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const tempImg = canvas.toDataURL();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const img = new Image();
      img.src = tempImg;
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      };
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [safeLines]);

  // Firebase Real-time Drawing Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_23_canvas && canvasRef.current) {
          const img = new Image();
          img.src = d.other5_23_canvas;
          img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(img, 0, 0);
            }
          };
        }
        if (d.other5_23_compared !== undefined) {
          setIsComparedGreen(d.other5_23_compared);
        }
      }
    });
    return () => unsub();
  }, [roomPin]);

  const syncCanvasToFirebase = async () => {
    if (!roomPin || !canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      await updateDoc(doc(db, 'live_sessions', roomPin), {
        other5_23_canvas: dataUrl,
      });
    } catch (e) {}
  };

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = isComparedGreen ? '#10b981' : penColor;
      ctx.lineWidth = penWidth;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    syncCanvasToFirebase();
  };

  const handleClearCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (roomPin) {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          other5_23_canvas: '',
        });
      } catch (e) {}
    }
  };

  const handleToggleCompare = async () => {
    const nextVal = !isComparedGreen;
    setIsComparedGreen(nextVal);

    // เปลี่ยนสีหมึกที่มีอยู่ทั้งหมดบน Canvas ให้เป็นสีเขียว
    const canvas = canvasRef.current;
    if (canvas && nextVal) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (roomPin) {
      try {
        const dataUrl = canvas?.toDataURL('image/png') || '';
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          other5_23_compared: nextVal,
          other5_23_canvas: dataUrl,
        });
      } catch (e) {}
    }
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px] flex flex-col">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-4 right-4 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={20} />
        </button>

        {/* 1. Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
            <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
              <Edit3 size={20} />
            </div>
            {safeData.mainTitle || '2. 仿照示例，写一写，说一说。'}
          </div>
          <div className="text-[13px] md:text-[15px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'ฝึกเขียนและพูดตามตัวอย่าง'}
          </div>
        </div>

        {/* 2. รูปภาพประกอบด้านบน */}
        {safeData.imageUrl && (
          <div className="flex justify-center mb-8">
            <img src={safeData.imageUrl} alt="ประกอบบทเรียน" className="max-h-[160px] object-contain drop-shadow-sm" />
          </div>
        )}

        {/* 3. สองคอลัมน์ (ซ้ายต้นฉบับ - ขวากระดานวาดเขียน) */}
        <div className="flex flex-col gap-6 md:gap-8 relative pb-24 max-w-5xl mx-auto w-full">
          
          {/* เส้นประคั่นกลาง */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 w-px border-r-2 border-dashed border-orange-200 -translate-x-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative w-full items-stretch">
            
            {/* ฝั่งซ้าย: ต้นฉบับ */}
            <div className="flex flex-col gap-6 pr-0 md:pr-6 select-none">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-orange-100 pb-1">
                ต้นฉบับสำหรับเปรียบเทียบ
              </div>
              {safeLines.map((line) => {
                const groups = groupTokens(line.tokens);
                return (
                  <div key={line.id} className="flex flex-wrap items-end justify-start md:justify-end gap-[2px]">
                    {groups.map((g, gIdx) => (
                      <div key={gIdx} className="flex gap-[2px]">
                        {g.chars.map((char, cIdx) => (
                          <div key={cIdx} className="inline-flex flex-col items-center align-bottom mx-[2px]">
                            <span className="text-[22px] md:text-[28px] font-serif text-slate-800 leading-tight">
                              {char}
                            </span>
                            <span className="text-[11px] md:text-[13px] text-slate-500 font-sans mt-0.5">
                              {g.pinyins[cIdx]}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* ฝั่งขวา: พื้นที่เขียนด้วยมือ (Drawing Canvas Overlay) */}
            <div className="relative flex flex-col gap-6 pl-0 md:pl-6 border-t-2 md:border-t-0 border-dashed border-orange-100 pt-6 md:pt-0">
              
              {/* แถบเครื่องมือปากกาด้านบนกระดาน */}
              <div className="flex items-center justify-between gap-2 border-b border-orange-100 pb-2 z-20">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEraser(false)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold ${
                      !isEraser ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600'
                    }`}
                  >
                    <PenTool size={14} /> ปากกา
                  </button>
                  <button
                    onClick={() => setIsEraser(true)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold ${
                      isEraser ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600'
                    }`}
                  >
                    <Eraser size={14} /> ยางลบ
                  </button>
                  <button
                    onClick={handleClearCanvas}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs flex items-center gap-1"
                    title="ล้างหมึกทั้งหมด"
                  >
                    <RotateCcw size={14} /> ล้าง
                  </button>
                </div>

                {/* ปุ่มเฉลย/เปรียบเทียบเป็นสีเขียว */}
                <button
                  onClick={handleToggleCompare}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    isComparedGreen
                      ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 size={14} /> {isComparedGreen ? 'ถูกต้อง (สีเขียว)' : 'ตรวจคำตอบ'}
                </button>
              </div>

              {/* ข้อความและเส้นประไกด์ไลน์ (Background Layer) */}
              <div className="relative flex flex-col gap-6 select-none z-0">
                {safeLines.map((line) => {
                  const groups = groupTokens(line.tokens);
                  return (
                    <div key={line.id} className="flex flex-wrap items-end justify-start gap-[2px] min-h-[44px]">
                      {groups.map((g, gIdx) => {
                        if (!g.isBlank) {
                          return (
                            <div key={gIdx} className="flex gap-[2px]">
                              {g.chars.map((char, cIdx) => (
                                <div key={cIdx} className="inline-flex flex-col items-center align-bottom mx-[2px]">
                                  <span className="text-[22px] md:text-[28px] font-serif text-slate-800 leading-tight">
                                    {char}
                                  </span>
                                  <span className="text-[11px] md:text-[13px] text-slate-500 font-sans mt-0.5">
                                    {g.pinyins[cIdx]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          // เส้นขีดด้านล่างสำหรับช่องว่างที่ให้เขียน
                          const lineWidth = `${Math.max(2, g.chars.length) * 2.2}rem`;
                          return (
                            <div key={gIdx} className="inline-flex flex-col items-center justify-end mx-2 align-bottom">
                              <div style={{ width: lineWidth }} className="border-b-2 border-slate-300 h-9" />
                              <div className="h-[18px] md:h-[22px]"></div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  );
                })}

                {/* Drawing Layer (Canvas วาดเขียนวางทับด้านบน) */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
                />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Note Sidebar */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden z-[40] ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
        <div className="flex items-center justify-between mb-4 shrink-0 text-left">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Note</span>
          <button onClick={() => setIsNoteOpen(false)} className="text-amber-300 hover:text-amber-600"><X size={16} /></button>
        </div>
        <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="จดบันทึก..." className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4" />
        <button onClick={() => { onUpdateNote?.(tempNote); alert('Saved'); }} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm">SAVE NOTE</button>
      </div>
    </div>
  );
}