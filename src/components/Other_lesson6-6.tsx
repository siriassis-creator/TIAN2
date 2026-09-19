// src/components/Other_lesson6-6.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PauseCircle, ChevronDown, PlayCircle, Headphones, Volume2, Mic, MicOff, RotateCcw, Settings, X, Pencil, Keyboard, CheckCircle2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_6 { id: string; displayType: 'text' | 'image'; content: string; chinese: string; pinyinClue: string; fullPinyin: string; }
export interface OtherLesson6_6Data { id?: string; patternType: 'other_lesson6-6'; mainTitle: string; subTitle: string; cards: Card6_6[]; }
interface Props { data: OtherLesson6_6Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const LOCAL_DICT: Record<string, string> = { "多少": "เท่าไหร่", "钱": "เงิน", "贵": "แพง", "真": "จริงๆ", "可爱": "น่ารัก", "块": "หยวน", "百": "ร้อย", "人民币": "เงินหยวน", "泰铢": "เงินบาท" };

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

// === กระดาน Hanzi ตัวเดียว ===
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
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>{animState === 'playing' ? <PauseCircle size={10}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}</button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1 ${size <= 40 ? 'text-[11px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

// === กลุ่มคำ Hanzi ===
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
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-2" style={{ fontSize: size * 0.6, width: size/2, height: size }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};

// === ✨ คอมโพเนนต์อัจฉริยะสำหรับ "เติมเฉพาะส่วนที่ขาด" ===
const RenderRevealedPinyin = ({ clue, full }: { clue: string, full: string }) => {
  if (!clue || !full) return <span className="text-emerald-600 font-bold">{full}</span>;
  if (!clue.includes('_')) return <span className="text-emerald-600 font-bold">{full}</span>;
  
  const parts = clue.split(/_+/);
  const escapedParts = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  try {
    const regexStr = '^' + escapedParts.join('(.*)') + '$';
    const regex = new RegExp(regexStr, 'i');
    const match = full.match(regex);
    
    if (match) {
      return (
        <span className="inline-flex items-baseline justify-center">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="text-slate-500 font-bold">{part}</span>
              {i < parts.length - 1 && (
                <span className="text-emerald-500 font-bold border-b-2 border-emerald-400 px-0.5 mx-[1px] relative top-[2px]">
                  {match[i + 1]}
                </span>
              )}
            </React.Fragment>
          ))}
        </span>
      );
    }
  } catch (e) {}

  return <span className="text-emerald-600 font-bold">{full}</span>;
};

export default function OtherLesson6_6({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_6Data);
  
  const defaultCards: Card6_6[] = [
    { id: `c_def_1`, displayType: 'text', content: 'เท่าไร', chinese: '多少', pinyinClue: '____shao', fullPinyin: 'duōshao' },
    { id: `c_def_2`, displayType: 'text', content: 'เงิน', chinese: '钱', pinyinClue: '____ián', fullPinyin: 'qián' },
    { id: `c_def_3`, displayType: 'text', content: 'แพง', chinese: '贵', pinyinClue: '____uì', fullPinyin: 'guì' },
    { id: `c_def_4`, displayType: 'text', content: 'จริงๆ', chinese: '真', pinyinClue: 'zh____', fullPinyin: 'zhēn' },
    { id: `c_def_5`, displayType: 'text', content: 'น่ารัก', chinese: '可爱', pinyinClue: 'kě____', fullPinyin: 'kě\'ài' },
    { id: `c_def_6`, displayType: 'image', content: '', chinese: '块', pinyinClue: 'k____', fullPinyin: 'kuài' },
    { id: `c_def_7`, displayType: 'image', content: '', chinese: '百', pinyinClue: 'b____', fullPinyin: 'bǎi' },
    { id: `c_def_8`, displayType: 'image', content: '', chinese: '人民币', pinyinClue: 'Rén____bì', fullPinyin: 'Rénmínbì' },
    { id: `c_def_9`, displayType: 'image', content: '', chinese: '泰铢', pinyinClue: 'Tài____', fullPinyin: 'Tàizhū' },
  ];
  
  const mainTitle = safeData.mainTitle || '1. 看词语，补全拼音。';
  const subTitle = safeData.subTitle || 'ดูคำศัพท์แล้วเติมพินอินให้สมบูรณ์';
  const cards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  const fbKeyRevealed = `other6_6_revealed_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_6_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_6_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_6_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_6_write_modal_${safeData.id || 'default'}`; 

  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({}); 
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyRevealed] !== undefined) setRevealedCards(d[fbKeyRevealed]);
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyRevealed, fbKeyLiveExModal, fbKeyLiveExText, fbKeyWriteAnim, fbKeyWriteModal]);

  useEffect(() => { return () => stopListening(); }, []);

  const handleRevealCard = async (cId: string) => {
    if (userRole !== 'teacher') return;
    const newRevealed = { ...revealedCards, [cId]: !revealedCards[cId] };
    setRevealedCards(newRevealed);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: newRevealed }); } catch(e){} }
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
    if (window.confirm('ต้องการซ่อนเฉลยทั้งหมดและล้างหน้าจอใช่หรือไม่?')) {
      setRevealedCards({}); setLiveExText(''); setWritingModalText(null);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: {}, [fbKeyLiveExModal]: false, [fbKeyLiveExText]: '', [fbKeyWriteModal]: null }); } catch(e){}
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

        {/* Content Area: Grid 3 คอลัมน์ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in w-full px-2">
          {cards.map((card, idx) => {
            const isRevealed = !!revealedCards[card.id];
            
            return (
              <div 
                key={card.id} 
                onClick={() => handleRevealCard(card.id)}
                className={`relative bg-white rounded-3xl border-2 transition-all duration-300 flex flex-row items-stretch overflow-hidden group min-h-[140px]
                  ${isRevealed ? 'border-emerald-400 shadow-md ring-2 ring-emerald-50' : 'border-slate-200 hover:border-indigo-300 cursor-pointer hover:shadow-sm'}
                `}
              >
                {/* ปุ่มเฉลย (เฉพาะครู) */}
                {userRole === 'teacher' && !isRevealed && (
                   <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="flex items-center gap-1 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-sm"><CheckCircle2 size={12}/> เฉลย</button>
                   </div>
                )}

                {/* ฝั่งซ้าย: รูปภาพ หรือ คำแปล (สัดส่วนประมาณ 1/3) */}
                <div className={`w-[35%] p-4 flex flex-col items-center justify-center border-r shrink-0 transition-colors ${isRevealed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/80 border-slate-100'}`}>
                  {card.displayType === 'text' ? (
                     <span className="text-xl font-bold text-orange-600 text-center">{card.content}</span>
                  ) : (
                     card.content ? <img src={card.content} className="max-h-[80px] object-contain mix-blend-multiply" alt="clue" /> : <div className="text-slate-300 text-3xl">🖼️</div>
                  )}
                </div>

                {/* ฝั่งขวา: พินอิน และ อักษรจีน */}
                <div className="w-[65%] px-4 py-5 flex flex-col justify-center items-center relative">
                   
                   {/* ส่วนพินอิน: เรียกใช้งานคอมโพเนนต์ RenderRevealedPinyin ตรงนี้ครับ */}
                   <div className={`text-xl font-mono tracking-wider mb-4 transition-all duration-300 ${isRevealed ? 'scale-110' : 'text-slate-500 font-bold'}`}>
                      {isRevealed ? <RenderRevealedPinyin clue={card.pinyinClue} full={card.fullPinyin} /> : card.pinyinClue}
                   </div>

                   {/* ส่วนอักษรจีน (ซ่อนปุ่ม ตอนกดให้เด้ง Modal) */}
                   <div 
                     onClick={(e) => { 
                       if (isRevealed) { e.stopPropagation(); openWritingModal(card.chinese); } 
                     }}
                     className={`transition-transform duration-300 ${isRevealed ? 'cursor-pointer hover:scale-105' : 'opacity-70 grayscale'}`}
                     title={isRevealed && userRole === 'teacher' ? "คลิกเพื่อขยายกระดานเขียน" : ""}
                   >
                     <HanziWordWriter text={card.chinese} size={42} showControls={false} showPinyin={false} />
                   </div>

                   {/* ปุ่มลำโพงและไมค์ (โชว์เมื่อเฉลยแล้ว ย้ายลงมุมขวาล่าง) */}
                   {isRevealed && (
                     <div className="absolute bottom-3 right-3 flex gap-1.5 animate-fade-in z-30">
                        <button onClick={(e)=>{e.stopPropagation(); speakChinese(card.chinese);}} className="p-2 bg-slate-50 text-orange-500 rounded-full shadow-sm hover:bg-orange-100 transition-colors"><Volume2 size={16}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); if(recordingId === card.id) stopListening(); else startListening(card.chinese, card.id);}} className={`p-2 rounded-full shadow-sm transition-colors ${recordingId === card.id ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-emerald-600 hover:bg-emerald-100'}`}>
                           {recordingId === card.id ? <Mic size={16}/> : <MicOff size={16}/>}
                        </button>
                     </div>
                   )}

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (เด้งตอนคลิกอักษรจีนหลังเฉลย) === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              {/* หน้าต่างขยายเต็มจอ ให้มีทั้งลำดับและเขียน */}
              <HanziWordWriter text={writingModalText} size={120} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>
          </div>
        </div>
      )}

      {/* === Modal Live Exercise === */}
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
                  <input type="text" value={liveExText} onChange={handleLiveExTextChange} placeholder="เช่น 多少钱" className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 outline-none shadow-sm" />
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

      {/* === Control Panel (ย่อได้) === */}
      {userRole === 'teacher' && roomPin && (
        <>
          <div className={`fixed bottom-24 md:bottom-28 left-4 z-[3000] transition-all duration-500 ${isControlPanelOpen ? '-translate-x-32 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <button onClick={() => setIsControlPanelOpen(true)} className="bg-white/95 backdrop-blur-md p-3 md:px-4 md:py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 flex items-center gap-2 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-105">
              <Settings size={20} />
              <span className="text-xs font-bold hidden md:inline-block uppercase tracking-wider">แผงควบคุม</span>
            </button>
          </div>

          <div className={`fixed bottom-24 md:bottom-28 left-0 w-full p-4 flex justify-center pointer-events-none z-[3000] transition-all duration-500 ${isControlPanelOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex flex-col md:flex-row items-center gap-4 relative">
              
              <div className="flex flex-col shrink-0 text-center md:text-left"><span className="text-[9px] font-bold text-slate-500 uppercase">แผงควบคุมครู</span><span className="text-xs font-bold text-slate-800">จัดการหน้าจอ</span></div>
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-xs font-bold shadow-sm transition-colors"><Keyboard size={14} /> แบบฝึกหัด</button>
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={handleTeacherReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold shadow-sm transition-colors"><RotateCcw size={14} /> ซ่อนเฉลยทั้งหมด</button>
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={() => setIsControlPanelOpen(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105"><ChevronDown size={14} /> เก็บ</button>
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}