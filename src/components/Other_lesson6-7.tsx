// src/components/Other_lesson6-7.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, MicOff, Search, X, Pencil, Maximize2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_7 { id: string; theme: 'pink' | 'green'; phrases: string[]; }
export interface OtherLesson6_7Data { id?: string; patternType: 'other_lesson6-7'; mainTitle: string; subTitle: string; cards: Card6_7[]; }
interface Props { data: OtherLesson6_7Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

// === กระดาน Hanzi ตัวเดียว (ใช้สำหรับ Modal เต็มจอ) ===
const SingleHanziWriter = ({ character, size = 100, pinyin, showControls = false, hideQuiz = false, layout = 'col', userRole, remoteAnimCmd, onBroadcastAnim, customStrokeColor, customPinyinColor }: any) => {
  const containerRef = useRef<HTMLDivElement>(null); const writerRef = useRef<any>(null);
  const [animState, setAnimState] = useState<'idle'|'playing'|'paused'>('idle');
  const lastAnimTs = useRef(0);
  const isStudentSynced = userRole === 'student' && onBroadcastAnim !== undefined;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; 
    writerRef.current = HanziWriter.create(containerRef.current, character, { width: size, height: size, padding: size > 40 ? 4 : 2, showOutline: true, strokeAnimationSpeed: 0.5, delayBetweenStrokes: 300, strokeColor: customStrokeColor || '#334155', radicalColor: customStrokeColor || '#334155', outlineColor: '#e2e8f0', drawingColor: '#f97316' });
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
        <div className="flex flex-col gap-1 w-full px-1 mb-2">
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>▶ ลำดับ</button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-2 ${size <= 40 ? 'text-[11px]' : 'text-xl'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

const HanziWordWriter = ({ text, align = 'center', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split(''); const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  return (
    <div className={`flex ${flexWrap} items-end gap-1 ${justifyClass} relative z-20`}>
      {chars.map((char: string, idx: number) => (
         /[\u4e00-\u9fa5]/.test(char) ? (
           <SingleHanziWriter key={idx + char} character={char} size={size} pinyin={showPinyin ? pinyinConverter(char) : undefined} showControls={showControls} hideQuiz={hideQuiz} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor} />
         ) : (
           <div key={idx} className="flex flex-col items-center shrink-0 mb-1">
             {showControls && layout === 'col-top' && <div className={`w-full ${hideQuiz ? 'h-[28px]' : 'h-[62px]'}`}></div>}
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-4" style={{ fontSize: size * 0.6, width: size/2, height: size }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};

// === ฟังก์ชันหาชุดสี (Theme) แบบขั้นบันได ===
const getStepThemeClasses = (theme: 'pink' | 'green', index: number) => {
  const pinks = ['bg-pink-50', 'bg-pink-100/60', 'bg-pink-100', 'bg-pink-200/60', 'bg-pink-200', 'bg-pink-300'];
  const greens = ['bg-teal-50', 'bg-teal-100/60', 'bg-teal-100', 'bg-teal-200/60', 'bg-teal-200', 'bg-teal-300'];
  const colors = theme === 'pink' ? pinks : greens;
  // เพื่อให้สีเข้มขึ้นเรื่อยๆ ไล่ไปตาม index
  return colors[Math.min(index, colors.length - 1)];
};

export default function OtherLesson6_7({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_7Data);
  
  // ข้อมูลตั้งต้น Fallback
  const defaultCards: Card6_7[] = [
    { id: `c_def_1`, theme: 'pink', phrases: ['钱', '多少钱', '书多少钱', '这本书多少钱'] },
    { id: `c_def_2`, theme: 'pink', phrases: ['钱', '多少钱', 'T恤多少钱', '这件T恤多少钱'] },
    { id: `c_def_3`, theme: 'green', phrases: ['可爱', '真可爱', '橡皮真可爱', '熊猫橡皮真可爱', '这块熊猫橡皮真可爱'] },
    { id: `c_def_4`, theme: 'green', phrases: ['贵', '真贵', '笔袋真贵', '大象笔袋真贵', '这个大象笔袋真贵'] }
  ];
  
  const mainTitle = safeData.mainTitle || '2. 词语阶梯。';
  const subTitle = safeData.subTitle || 'ต่อคำขยายความ';
  const cards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  const fbKeyWriteAnim = `other6_7_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_7_write_modal_${safeData.id || 'default'}`; 

  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyWriteAnim, fbKeyWriteModal]);

  useEffect(() => { return () => stopListening(); }, []);

  const openWritingModal = async (text: string | null) => {
    setWritingModalText(text);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: text }); } catch(e){} }
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

  // --- ไมค์ฝึกพูด ---
  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.abort(); setRecordingId(null); };
  const startListening = (expected: string, id: string) => {
    if (!expected) return; stopListening();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");
    const recognition = new SpeechRecognition(); recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setRecordingId(id);
    recognition.onresult = () => { setRecordingId(null); };
    recognition.onerror = () => setRecordingId(null); recognition.onend = () => setRecordingId(null);
    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-6 pb-24">
        
        {/* Header */}
        <div className="w-full mb-8">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl font-bold text-white tracking-wide">{mainTitle}</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] font-bold text-slate-700 flex-1">{subTitle}</div>
          </div>
        </div>

        {/* Content Area: Grid 2 คอลัมน์สำหรับ 4 บล็อก */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in w-full px-2">
          {cards.map((card, cIdx) => (
            <div key={card.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
               {card.phrases.map((phrase, pIdx) => {
                 const stepBgClass = getStepThemeClasses(card.theme, pIdx);
                 const uniqueId = `${card.id}_${pIdx}`;
                 
                 return (
                   <div key={pIdx} className={`w-full flex items-center justify-between p-4 px-6 transition-all hover:brightness-95 group ${stepBgClass}`}>
                      
                      {/* ข้อความและ Pinyin */}
                      <div className="flex flex-col">
                         <div className="text-2xl md:text-3xl font-serif font-black text-slate-800 tracking-wider">
                           {phrase}
                         </div>
                         <div className="text-sm font-bold text-slate-600 mt-1">
                           {pinyinConverter(phrase)}
                         </div>
                      </div>

                      {/* กลุ่มปุ่ม 3 ปุ่ม: แว่นขยาย, ลำโพง, ไมค์ */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {/* ปุ่มแว่นขยาย (เฉพาะครู ถึงจะกดขยายให้เด็กดูได้) */}
                         {userRole === 'teacher' && (
                           <button 
                             onClick={() => openWritingModal(phrase)} 
                             className="p-2.5 bg-indigo-500 text-white rounded-full shadow-md hover:scale-110 transition-transform"
                             title="ขยายเต็มจอ"
                           >
                             <Search size={16} />
                           </button>
                         )}
                         
                         {/* ปุ่มลำโพง */}
                         <button 
                           onClick={() => speakChinese(phrase)} 
                           className="p-2.5 bg-white text-orange-500 rounded-full shadow-md hover:scale-110 transition-transform"
                         >
                           <Volume2 size={16} />
                         </button>
                         
                         {/* ปุ่มไมค์ */}
                         <button 
                           onClick={() => { if(recordingId === uniqueId) stopListening(); else startListening(phrase, uniqueId); }} 
                           className={`p-2.5 rounded-full shadow-md transition-all hover:scale-110 ${recordingId === uniqueId ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-emerald-600'}`}
                         >
                           {recordingId === uniqueId ? <Mic size={16}/> : <MicOff size={16}/>}
                         </button>
                      </div>

                   </div>
                 );
               })}
            </div>
          ))}
        </div>

      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (กระดานอักษรจีน Hanzi Writer) === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              {/* หน้าต่างขยายเต็มจอ ให้มีทั้งลำดับและเขียน */}
              <HanziWordWriter text={writingModalText} size={90} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}