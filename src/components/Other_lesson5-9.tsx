// src/components/Other_lesson5-9.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, CheckCircle2, XCircle, Eye, RotateCcw, Volume2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface ImageMatchItem {
  id: string;
  imageUrl: string;
  matchId?: string; 
  chinese?: string; 
}

export interface OtherLesson5_9Data {
  id?: string;
  patternType: 'other_lesson5-9';
  mainTitle?: string;
  sideImageUrl?: string; 
  topItems: ImageMatchItem[];
  bottomItems: ImageMatchItem[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_9Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_9({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_9Data);
  const fbKeyLines = `other5_9_lines_${safeData.id || 'default'}`;
  const fbKeyReveals = `other5_9_reveals_${safeData.id || 'default'}`;

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  // --- Drawing Lines State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ topId: string; bottomId: string; isCorrect: boolean }[]>([]);
  const [activeLine, setActiveLine] = useState<{ startId: string; x: number; y: number } | null>(null);
  const [updateTick, setUpdateTick] = useState(0);
  
  const [revealedItems, setRevealedItems] = useState<string[]>([]); 

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyLines] !== undefined) setLines(d[fbKeyLines]);
        if (d[fbKeyReveals] !== undefined) setRevealedItems(d[fbKeyReveals]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyLines, fbKeyReveals, safeData.id]);

  useEffect(() => {
    const handleResize = () => setUpdateTick(t => t + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setUpdateTick(t => t + 1), 500);
    return () => clearTimeout(timer);
  }, [safeData]);

  const getDotPos = (dotId: string) => {
    const el = document.getElementById(dotId);
    const cont = containerRef.current;
    if (!el || !cont) return null;
    const rect = el.getBoundingClientRect();
    const contRect = cont.getBoundingClientRect();
    return { 
      x: rect.left - contRect.left + rect.width / 2, 
      y: rect.top - contRect.top + rect.height / 2 
    };
  };

  // --- Drag Events ---
  const handlePointerDown = (e: React.PointerEvent, dotId: string) => {
    e.stopPropagation();
    
    const isBottomDot = dotId.startsWith('b-');
    const checkId = isBottomDot ? dotId.replace('b-', '') : null;
    if (revealedItems.includes('ALL') || (checkId && revealedItems.includes(checkId))) return;

    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch(err) {}

    const cont = containerRef.current;
    if (!cont) return;
    const contRect = cont.getBoundingClientRect();
    setActiveLine({ startId: dotId, x: e.clientX - contRect.left, y: e.clientY - contRect.top });
    
    const newLines = lines.filter(l => l.topId !== dotId && l.bottomId !== dotId);
    setLines(newLines);
    if (roomPin) {
      updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: newLines }).catch(()=>{});
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeLine) return;
    e.preventDefault(); 
    const cont = containerRef.current;
    if (!cont) return;
    const contRect = cont.getBoundingClientRect();
    setActiveLine({ ...activeLine, x: e.clientX - contRect.left, y: e.clientY - contRect.top });
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!activeLine) return;
    
    const target = e.target as HTMLElement;
    try { target.releasePointerCapture(e.pointerId); } catch(err) {}

    const originalPointerEvents = target.style.pointerEvents;
    target.style.pointerEvents = 'none';

    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = targetElement?.closest('[data-drop-id]');
    
    target.style.pointerEvents = originalPointerEvents;

    if (dropZone) {
      const targetId = dropZone.getAttribute('data-drop-id');
      if (targetId && targetId !== activeLine.startId) {
        
        const isTopStart = activeLine.startId.startsWith('t-');
        const isTargetTop = targetId.startsWith('t-');

        if (isTopStart !== isTargetTop) {
          const topId = isTopStart ? activeLine.startId : targetId;
          const bottomId = !isTopStart ? activeLine.startId : targetId;
          
          const baseBottomId = bottomId.replace('b-', '');
          const bottomItem = safeData.bottomItems?.find(item => item.id === baseBottomId);
          const isCorrect = bottomItem?.matchId === topId.replace('t-', '');

          const filtered = lines.filter(l => l.topId !== topId && l.bottomId !== bottomId);
          const newLines = [...filtered, { topId, bottomId, isCorrect }];
          
          setLines(newLines);
          if (roomPin) {
            try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: newLines }); } catch(err){}
          }
        }
      }
    }
    setActiveLine(null);
  };

  // --- Teacher Controls ---
  const handleTeacherReveal = async (bottomId: string) => {
    if (userRole !== 'teacher') return;
    const newReveals = [...revealedItems, bottomId];
    setRevealedItems(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyReveals]: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    setRevealedItems(['ALL']);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyReveals]: ['ALL'] }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างเส้นและการเฉลยทั้งหมดใช่หรือไม่?')) {
      setLines([]);
      setRevealedItems([]);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLines]: [], [fbKeyReveals]: [] }); } catch (e) {}
      }
    }
  };

  // +++ ฟังก์ชันสำหรับอ่านออกเสียงภาษาจีน +++
  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header */}
        <div className="mb-8 pl-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-[30] pointer-events-auto">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.mainTitle || '4. 连一连。 โยงเส้นจับคู่'}
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 w-full max-w-[1200px] mx-auto items-stretch">
          
          {/* +++ ฝั่งซ้าย: รูปภาพประกอบ +++ */}
          {safeData.sideImageUrl && (
            <div className="w-full lg:w-[450px] xl:w-[550px] shrink-0 flex flex-col bg-white rounded-[24px] border-[3px] border-[#8dae92] p-4 shadow-sm h-full max-h-[600px] items-center justify-center">
              <div className="w-full h-full relative overflow-hidden rounded-xl flex items-center justify-center">
                 <img src={safeData.sideImageUrl} alt="Illustration" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* --- ฝั่งขวา: Game Board (โยงเส้น) --- */}
          <div 
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="flex-1 relative bg-[#f8f9fa] border-[3px] border-[#8dae92] rounded-[24px] p-8 md:p-16 min-h-[400px] overflow-hidden flex flex-col justify-between touch-none select-none"
          >
            {/* SVG Overlay สำหรับวาดเส้น */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[10] overflow-visible">
              {lines.map((line, i) => {
                const startPos = getDotPos(`dot-${line.topId}`);
                const endPos = getDotPos(`dot-${line.bottomId}`);
                if (!startPos || !endPos) return null;
                
                const baseBottomId = line.bottomId.replace('b-', '');
                const isRevealed = revealedItems.includes('ALL') || revealedItems.includes(baseBottomId);
                
                const midX = (startPos.x + endPos.x) / 2;
                const midY = (startPos.y + endPos.y) / 2;

                return (
                  <g key={i}>
                    <line 
                      x1={startPos.x} y1={startPos.y} 
                      x2={endPos.x} y2={endPos.y} 
                      stroke={isRevealed ? (line.isCorrect ? '#10b981' : '#ef4444') : '#cbd5e1'} 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      className="transition-colors duration-300"
                    />
                    {isRevealed && (
                      <foreignObject x={midX - 16} y={midY - 16} width="32" height="32" className="overflow-visible">
                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm animate-fade-in border border-slate-100">
                          {line.isCorrect 
                            ? <CheckCircle2 size={24} className="text-emerald-500" fill="#ecfdf5" /> 
                            : <XCircle size={24} className="text-red-500" fill="#fef2f2" />
                          }
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
              
              {activeLine && (() => {
                const startPos = getDotPos(`dot-${activeLine.startId}`);
                if (!startPos) return null;
                return (
                  <line 
                    x1={startPos.x} y1={startPos.y} 
                    x2={activeLine.x} y2={activeLine.y} 
                    stroke="#94a3b8" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeDasharray="8 8"
                  />
                );
              })()}
            </svg>

            {/* แถวบน (Top Items) */}
            <div className="grid grid-cols-4 gap-4 w-full relative z-[20]">
              {(safeData.topItems || []).map((item) => (
                <div key={item.id} className="flex flex-col items-center justify-end gap-6 h-[120px] md:h-[140px]">
                  
                  {/* +++ Flip Card Logic +++ */}
                  <div className="group/card [perspective:1000px] w-[80px] md:w-[100px] h-[80px] md:h-[100px] z-20 pointer-events-auto cursor-pointer">
                    <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                      {/* Front (Image) */}
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-xl shadow-sm border-2 border-emerald-200 flex items-center justify-center p-2 hover:bg-emerald-50 transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="Top Item" className="max-w-full max-h-full object-contain mix-blend-multiply select-none pointer-events-none" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300"></div>
                        )}
                      </div>
                      {/* Back (Chinese + Pinyin + Audio) */}
                      <div 
                        className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-xl shadow-md border-2 border-emerald-200 flex flex-col items-center justify-center p-2 hover:bg-emerald-50 transition-colors"
                        onClick={(e) => { e.stopPropagation(); speakChinese(item.chinese || ''); }}
                        title="ฟังเสียง"
                      >
                        <div className="text-[16px] md:text-[20px] font-serif text-slate-800 leading-tight mb-0.5 text-center px-1 break-words">{item.chinese || '?'}</div>
                        <div className="text-[10px] md:text-[11px] text-indigo-600 font-sans tracking-wide leading-tight text-center px-1 break-words">{item.chinese ? pinyinConverter(item.chinese) : ''}</div>
                        <Volume2 size={16} className="text-slate-400 mt-2 opacity-50 shrink-0" />
                      </div>
                    </div>
                  </div>
                  {/* +++ End Flip Card +++ */}

                  <div 
                    data-drop-id={`t-${item.id}`}
                    onPointerDown={(e) => handlePointerDown(e, `t-${item.id}`)}
                    className="p-3 cursor-crosshair group flex items-center justify-center -mb-3"
                  >
                    <div 
                      id={`dot-t-${item.id}`} 
                      className="w-3.5 h-3.5 bg-[#64748b] rounded-full group-hover:scale-150 transition-transform pointer-events-none"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[80px] md:h-[100px]"></div>

            {/* แถวล่าง (Bottom Items) */}
            <div className="grid grid-cols-4 gap-4 w-full relative z-[20]">
              {(safeData.bottomItems || []).map((item) => {
                const isRevealed = revealedItems.includes('ALL') || revealedItems.includes(item.id);
                
                return (
                  <div key={item.id} className="flex flex-col items-center justify-start gap-6 h-[120px] md:h-[140px] relative group">
                    
                    {/* ปุ่มเฉลยรายข้อ สำหรับครู */}
                    {userRole === 'teacher' && !isRevealed && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTeacherReveal(item.id); }}
                        className="absolute top-2 -right-2 md:-right-4 bg-white border border-indigo-200 text-indigo-600 rounded-full p-1 shadow-sm hover:bg-indigo-50 z-30 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
                        title="เฉลยข้อนี้"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    <div 
                      data-drop-id={`b-${item.id}`}
                      onPointerDown={(e) => handlePointerDown(e, `b-${item.id}`)}
                      className="p-3 cursor-crosshair flex items-center justify-center -mt-3"
                    >
                      <div 
                        id={`dot-b-${item.id}`} 
                        className="w-3.5 h-3.5 bg-[#64748b] rounded-full hover:scale-150 transition-transform pointer-events-none"
                      ></div>
                    </div>
                    
                    {/* +++ Flip Card Logic +++ */}
                    <div className="group/card [perspective:1000px] w-[80px] md:w-[100px] h-[80px] md:h-[100px] z-20 pointer-events-auto cursor-pointer">
                      <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                        {/* Front (Image) */}
                        <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-xl shadow-sm border-2 border-emerald-200 flex items-center justify-center p-2 hover:bg-emerald-50 transition-colors">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="Bottom Item" className="max-w-full max-h-full object-contain mix-blend-multiply select-none pointer-events-none" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300"></div>
                          )}
                        </div>
                        {/* Back (Chinese + Pinyin + Audio) */}
                        <div 
                          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-xl shadow-md border-2 border-emerald-200 flex flex-col items-center justify-center p-2 hover:bg-emerald-50 transition-colors"
                          onClick={(e) => { e.stopPropagation(); speakChinese(item.chinese || ''); }}
                          title="ฟังเสียง"
                        >
                          <div className="text-[16px] md:text-[20px] font-serif text-slate-800 leading-tight mb-0.5 text-center px-1 break-words">{item.chinese || '?'}</div>
                          <div className="text-[10px] md:text-[11px] text-indigo-600 font-sans tracking-wide leading-tight text-center px-1 break-words">{item.chinese ? pinyinConverter(item.chinese) : ''}</div>
                          <Volume2 size={16} className="text-slate-400 mt-2 opacity-50 shrink-0" />
                        </div>
                      </div>
                    </div>
                    {/* +++ End Flip Card +++ */}
                    
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Teacher Control Panel */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-24 md:bottom-28 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">ระบบโยงเส้นจับคู่</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            
            <button 
              onClick={handleTeacherRevealAll} 
              disabled={revealedItems.includes('ALL')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedItems.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
            >
              <Eye size={14} /> เฉลยทั้งหมด
            </button>
            
            <button 
              onClick={handleTeacherReset} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
            >
              <RotateCcw size={14} /> ล้างกระดาน
            </button>
          </div>
        </div>
      )}

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