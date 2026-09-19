// src/components/SharedHanzi.tsx
import React, { useState, useEffect, useRef } from 'react';
import { PauseCircle, Pencil, Volume2, Mic, MicOff } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import HanziWriter from 'hanzi-writer';

// === กระดาน Hanzi ตัวเดียว ===
export const SingleHanziWriter = ({ 
  character, size = 100, pinyin, showControls = true, layout = 'col',
  onSpeak, onRecord, isRecording = false, userRole = 'student',
  remoteAnimCmd = null, onBroadcastAnim, customStrokeColor, customPinyinColor
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
      width: size, height: size, padding: 8, showOutline: true,
      strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300,  
      strokeColor: customStrokeColor || '#334155', radicalColor: customStrokeColor || '#334155',
      outlineColor: '#e2e8f0', drawingColor: '#f97316', 
    });
    setAnimState('idle');
  }, [character, size, customStrokeColor]);

  useEffect(() => {
    if (remoteAnimCmd && remoteAnimCmd.char === character && remoteAnimCmd.ts !== lastAnimTs.current) {
      lastAnimTs.current = remoteAnimCmd.ts;
      if (!writerRef.current || userRole === 'teacher') return;
      if (remoteAnimCmd.action === 'animate') {
        setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') });
      } else if (remoteAnimCmd.action === 'pause') {
        writerRef.current.pauseAnimation(); setAnimState('paused');
      } else if (remoteAnimCmd.action === 'resume') {
        writerRef.current.resumeAnimation(); setAnimState('playing');
      }
    }
  }, [remoteAnimCmd, character, userRole]);

  const handleAnimate = (e: React.MouseEvent) => {
    e.stopPropagation(); if (!writerRef.current || isStudentSynced) return;
    let nextAction = animState === 'idle' ? 'animate' : (animState === 'playing' ? 'pause' : 'resume');
    if (userRole === 'teacher' && onBroadcastAnim) onBroadcastAnim(character, nextAction);
    if (nextAction === 'animate') { setAnimState('playing'); writerRef.current.animateCharacter({ onComplete: () => setAnimState('idle') }); }
    else if (nextAction === 'pause') { writerRef.current.pauseAnimation(); setAnimState('paused'); }
    else if (nextAction === 'resume') { writerRef.current.resumeAnimation(); setAnimState('playing'); }
  };

  const handleQuiz = (e: React.MouseEvent) => {
    e.stopPropagation(); if (!writerRef.current || isStudentSynced) return;
    setAnimState('idle'); writerRef.current.quiz();
  };

  const canvasBgClass = `bg-white border-2 border-dashed rounded-xl overflow-hidden shadow-sm transition-colors bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')] ${isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : 'border-slate-300 cursor-crosshair hover:border-indigo-400'}`;

  if (layout === 'row') {
    return (
      <div className="flex flex-row items-center justify-start gap-3 w-full z-20 relative mt-2">
        <div className="flex flex-col items-center shrink-0" style={{ width: size }}>
          <div ref={containerRef} className={canvasBgClass} style={{ width: size, height: size }} onClick={isStudentSynced ? undefined : handleQuiz}></div>
          {pinyin && <div className={`text-[13px] font-sans font-bold text-center mt-1 ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
        </div>
        {showControls && (
          <div className="grid grid-cols-2 gap-2 w-full flex-1">
            <button onClick={handleAnimate} disabled={isStudentSynced} className="py-2.5 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm border bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:bg-slate-50 disabled:text-slate-400">
              {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
            </button>
            <button onClick={handleQuiz} disabled={isStudentSynced} className="py-2.5 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm border bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:bg-slate-50 disabled:text-slate-400">
              <Pencil size={12}/> เขียน
            </button>
            {onSpeak && <button onClick={(e) => { e.stopPropagation(); onSpeak(); }} className="py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"><Volume2 size={14}/> ฟัง</button>}
            {onRecord && <button onClick={(e) => { e.stopPropagation(); onRecord(); }} className={`py-2.5 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm border ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>{isRecording ? <Mic size={14}/> : <MicOff size={14}/>} {isRecording ? 'หยุด' : 'พูด'}</button>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center z-20 relative shrink-0" style={{ width: size }}>
      {showControls && layout === 'col-top' && (
        <div className="flex flex-col gap-1 w-full px-1 mb-2">
          <button onClick={handleAnimate} disabled={isStudentSynced} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:bg-slate-50 disabled:text-slate-400">{animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}</button>
          <button onClick={handleQuiz} disabled={isStudentSynced} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:bg-slate-50 disabled:text-slate-400"><Pencil size={12}/> เขียน</button>
        </div>
      )}
      <div ref={containerRef} className={canvasBgClass} style={{ width: size, height: size }} onClick={isStudentSynced ? undefined : handleQuiz}></div>
      {pinyin && <div className={`font-sans font-bold text-center mt-1.5 text-[14px] ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
      {showControls && layout === 'col' && (
        <div className="flex flex-col gap-1 w-full px-1 mt-2">
          <button onClick={handleAnimate} disabled={isStudentSynced} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:bg-slate-50 disabled:text-slate-400">{animState === 'playing' ? <PauseCircle size={12}/> : '▶'} ลำดับ</button>
          <button onClick={handleQuiz} disabled={isStudentSynced} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:bg-slate-50 disabled:text-slate-400"><Pencil size={12}/> เขียน</button>
        </div>
      )}
    </div>
  );
};

// === กระดานเขียนคำ ===
export const HanziWordWriter = ({ text, align = 'center', size, gap = 'gap-3', padding = 'p-4', showControls = true, showPinyin = true, userRole = 'student', remoteAnimCmd = null, onBroadcastAnim, layout = 'col' }: any) => {
  const chars = text.split('');
  const resolvedSize = size ?? (chars.length >= 5 ? 60 : (chars.length >= 3 ? 80 : 100));
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  
  return (
    <div className={`flex flex-wrap items-start ${gap} ${padding} w-full relative z-20 ${justifyClass}`}>
      {chars.map((char: string, idx: number) => (
         /[\u4e00-\u9fa5]/.test(char) ? (
           <SingleHanziWriter key={idx + char} character={char} size={resolvedSize} pinyin={showPinyin ? pinyinConverter(char) : undefined} showControls={showControls} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} />
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0">
             {showControls && layout === 'col-top' && <div className="w-full h-[66px]"></div>}
             <div className="flex items-center justify-center font-serif font-black text-slate-700" style={{ fontSize: resolvedSize * 0.6, width: resolvedSize, height: resolvedSize }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};