// src/components/Other_lesson6-10.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Search, X, Pencil, PauseCircle, CheckCircle2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface CardChoice6_10 { id: string; letter: string; imageUrl: string; }
export interface Question6_10 { id: string; number: number; chinese: string; pinyin: string; correctAnswer: string; }
export interface OtherLesson6_10Data { id?: string; patternType: 'other_lesson6-10'; mainTitle: string; subTitle: string; choices: CardChoice6_10[]; questions: Question6_10[]; }
interface Props { data: OtherLesson6_10Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

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
          {/* ปุ่ม Pause / Resume / ลำดับ */}
          <button onClick={handleAnimate} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            {animState === 'playing' ? <PauseCircle size={12}/> : '▶'} {animState === 'playing' ? 'พัก' : (animState === 'paused' ? 'ต่อ' : 'ลำดับ')}
          </button>
          {!hideQuiz && <button onClick={handleQuiz} disabled={isStudentSynced} className={`w-full py-1.5 rounded-md text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 border ${isStudentSynced ? 'bg-slate-50 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}><Pencil size={10}/> เขียน</button>}
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${hideBg ? 'bg-transparent' : `bg-white border-2 border-slate-200 rounded-xl shadow-sm ${!hideQuiz ? 'cursor-crosshair hover:border-indigo-400' : ''}`} overflow-hidden transition-colors ${!hideBg && isStudentSynced ? 'border-slate-200 cursor-not-allowed opacity-90' : ''} ${!hideBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjwvc3ZnPg==')]" : ""}`}
        style={{ width: size, height: size }} onClick={isStudentSynced || hideBg || hideQuiz ? undefined : handleQuiz}
      ></div>
      {/* Pinyin ไว้ด้านล่าง */}
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1.5 ${size <= 40 ? 'text-[11px] md:text-[12px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
    </div>
  );
};

// === กลุ่มคำ Hanzi (ดึง Pinyin แยกตัวต่อตัวอัตโนมัติ) ===
const HanziWordWriter = ({ text, align = 'center', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
  const chars = text.split(''); 
  const pinyins = pinyinConverter(text, { type: 'array' }); // ดึง Pinyin ออกมาเป็น Array แยกตัวต่อตัว
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';
  
  return (
    <div className={`flex ${flexWrap} items-start gap-y-4 ${justifyClass} relative z-20`}>
      {chars.map((char: string, idx: number) => {
         const isChinese = /[\u4e00-\u9fa5]/.test(char);
         const isPunc = /[。，？！、.,?!]/.test(char);
         const nextChar = chars[idx + 1];
         const isNextPunc = nextChar && /[。，？！、.,?!]/.test(nextChar);
         
         // ดึงเครื่องหมายวรรคตอนให้ชิดตัวอักษร
         const marginClass = isNextPunc ? 'mr-0' : 'mr-1 md:mr-1.5';

         return isChinese ? (
           <div key={idx} className={marginClass}>
             <SingleHanziWriter 
               character={char} 
               size={size} 
               pinyin={showPinyin ? pinyins[idx] : undefined} 
               showControls={showControls} hideQuiz={hideQuiz} layout={layout} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={onBroadcastAnim} customStrokeColor={customStrokeColor} customPinyinColor={customPinyinColor} 
             />
           </div>
         ) : (
           <div key={idx} className={`flex flex-col items-center shrink-0 ${marginClass}`}>
             {showControls && layout === 'col-top' && <div className={`w-full ${hideQuiz ? 'h-[28px]' : 'h-[62px]'}`}></div>}
             <div className={`flex items-end justify-center font-serif font-black text-slate-700 pb-2 ${isPunc ? '-ml-1 md:-ml-2' : ''}`} style={{ fontSize: size * 0.6, width: isPunc ? size/3 : size/2, height: size }}>{char}</div>
             {/* ช่องว่างดัน Pinyin ให้สมดุลกับตัวอักษรจีน */}
             {showPinyin && <div className="text-[11px] md:text-[12px] opacity-0 mt-1.5 h-3 leading-none"> </div>}
           </div>
         )
      })}
    </div>
  );
};

export default function OtherLesson6_10({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_10Data);
  
  const defaultData: Partial<OtherLesson6_10Data> = {
    choices: [
      { id: 'c1', letter: 'A', imageUrl: '' }, { id: 'c2', letter: 'B', imageUrl: '' }, { id: 'c3', letter: 'C', imageUrl: '' }, { id: 'c4', letter: 'D', imageUrl: '' }
    ],
    questions: [
      { id: 'q1', number: 1, chinese: '这个笔袋五十九泰铢。', pinyin: 'Zhège bǐdài wǔshíjiǔ Tàizhū.', correctAnswer: 'B' },
      { id: 'q2', number: 2, chinese: '这本笔记本四十泰铢。', pinyin: 'Zhèběn bǐjìběn sìshí Tàizhū.', correctAnswer: 'D' },
      { id: 'q3', number: 3, chinese: '这件上衣三百五十块。', pinyin: 'Zhèjiàn shàngyī sānbǎi wǔshí kuài.', correctAnswer: 'C' },
      { id: 'q4', number: 4, chinese: '这支笔三块五。', pinyin: 'Zhèzhī bǐ sān kuài wǔ.', correctAnswer: 'A' }
    ]
  };

  const mainTitle = safeData.mainTitle || '2. 读一读，选择正确的图片。';
  const subTitle = safeData.subTitle || 'ฝึกอ่านแล้วเลือกรูปภาพที่ตรงกับความหมายของประโยค';
  const choices = Array.isArray(safeData.choices) && safeData.choices.length > 0 ? safeData.choices : (defaultData.choices as CardChoice6_10[]);
  const questions = Array.isArray(safeData.questions) && safeData.questions.length > 0 ? safeData.questions : (defaultData.questions as Question6_10[]);

  // Firebase Keys
  const fbKeyAnswers = `other6_10_answers_${safeData.id || 'default'}`; 
  const fbKeyActiveChoice = `other6_10_activeChoice_${safeData.id || 'default'}`; 
  const fbKeyWriteModal = `other6_10_wmodal_${safeData.id || 'default'}`; 
  const fbKeyWriteAnim = `other6_10_wanim_${safeData.id || 'default'}`;
  const fbKeyRevealed = `other6_10_revealed_${safeData.id || 'default'}`;

  // Local States
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: "A" }
  const [activeChoice, setActiveChoice] = useState<string | null>(null); // ตัวอักษรที่กำลังกดเลือกไว้ (เช่น "A")
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);

  // Sync Firebase
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyAnswers]) setAnswers(d[fbKeyAnswers]);
        if (d[fbKeyActiveChoice] !== undefined) setActiveChoice(d[fbKeyActiveChoice]);
        if (d[fbKeyRevealed] !== undefined) setIsRevealed(d[fbKeyRevealed]);
        if (d[fbKeyWriteModal] !== undefined) setWritingModalText(d[fbKeyWriteModal]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAnswers, fbKeyActiveChoice, fbKeyRevealed, fbKeyWriteModal, fbKeyWriteAnim]);

  // Actions
  const handleSelectChoice = async (letter: string) => {
    if (userRole !== 'teacher') return;
    const newActive = activeChoice === letter ? null : letter; // กดย้ำเพื่อยกเลิกได้
    setActiveChoice(newActive);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyActiveChoice]: newActive }); } catch(e){} }
  };

  const handleFillAnswer = async (qId: string) => {
    if (userRole !== 'teacher') return;
    
    const newAnswers = { ...answers };
    
    // ถ้ามีคำตอบอยู่แล้ว แต่ไม่ได้เลือกไพ่ ให้ถือเป็นการลบคำตอบทิ้ง
    if (!activeChoice && newAnswers[qId]) {
      delete newAnswers[qId];
    } else if (activeChoice) {
      // ถ้าเลือกไพ่อยู่ ให้นำตัวอักษรนั้นไปใส่ในวงเล็บ
      newAnswers[qId] = activeChoice;
    }

    setAnswers(newAnswers);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAnswers]: newAnswers }); } catch(e){} }
  };

  const toggleRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const newState = !isRevealed;
    setIsRevealed(newState);
    
    // ถ้าครูกดเฉลย ให้เติมคำตอบที่ถูกต้องทุกข้อ
    if (newState) {
      const correctAns: Record<string, string> = {};
      questions.forEach(q => correctAns[q.id] = q.correctAnswer);
      setAnswers(correctAns);
      if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: true, [fbKeyAnswers]: correctAns }); } catch(e){} }
    } else {
      setAnswers({});
      if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyRevealed]: false, [fbKeyAnswers]: {} }); } catch(e){} }
    }
  };

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

  if (!safeData.patternType) return <div className="p-10 text-center text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-8">
        
        {/* Header */}
        <div className="w-full mb-8">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl font-bold text-white tracking-wide">{mainTitle}</span>
          </div>
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] font-bold text-slate-700 flex-1">{subTitle}</div>
            
            {/* ปุ่มเฉลยและล้างข้อมูล (เฉพาะครู) */}
            {userRole === 'teacher' && (
              <button 
                onClick={toggleRevealAll} 
                className={`ml-4 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ${isRevealed ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                <CheckCircle2 size={16} /> {isRevealed ? 'ซ่อนเฉลย & ล้างกระดาน' : 'เฉลยทั้งหมด'}
              </button>
            )}
          </div>
        </div>

        {/* แบ่งเลย์เอาต์ ซ้าย (การ์ด) และ ขวา (คำถาม) */}
        <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full mb-8">

          {/* ==================== 1. โซนตัวเลือกภาพ (Choices) ฝั่งซ้าย ==================== */}
          <div className="w-full lg:w-[40%] grid grid-cols-2 gap-4">
            {choices.map((choice) => {
              const isSelected = activeChoice === choice.letter;
              return (
                <div 
                  key={choice.id} 
                  onClick={() => handleSelectChoice(choice.letter)}
                  className={`relative w-full h-full min-h-[140px] rounded-3xl bg-white border-4 shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                    ${isSelected ? 'border-orange-500 shadow-xl -translate-y-2 ring-4 ring-orange-100 scale-[1.02]' : 'border-slate-100 hover:border-orange-200 hover:-translate-y-1'}
                  `}
                >
                  {/* ตัวอักษร A B C D */}
                  <div className={`absolute top-3 left-4 text-2xl font-black transition-colors ${isSelected ? 'text-orange-500' : 'text-slate-600'}`}>
                    {choice.letter}
                  </div>
                  
                  {/* รูปภาพ */}
                  <div className="w-[60%] h-[60%] flex items-center justify-center mt-6">
                    {choice.imageUrl ? (
                      <img src={choice.imageUrl} alt={choice.letter} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="text-slate-200 text-5xl font-black">{choice.letter}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================== 2. โซนคำถาม (Questions) ฝั่งขวา ==================== */}
          <div className="w-full lg:w-[60%] flex flex-col gap-4">
            {questions.map((q) => {
              const currentAnswer = answers[q.id]; // ตัวอักษรที่ตอบไปแล้วในข้อนี้
              const isCorrect = isRevealed && currentAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} className="flex-1 flex flex-col xl:flex-row items-center xl:items-stretch gap-4 bg-slate-50/80 p-4 md:p-5 rounded-3xl border border-slate-100 hover:border-orange-200 transition-colors group">
                  
                  {/* ตัวเลขข้อ */}
                  <div className="w-10 h-10 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center text-lg shrink-0 xl:mt-2">
                    {q.number}
                  </div>

                  {/* ประโยค (เขียน Hanzi) และ Pinyin (ตรงตัวกันเป๊ะ) */}
                  <div className="flex-1 flex flex-col justify-center items-start w-full">
                    <div className="flex items-center gap-3 w-full">
                      {/* ปุ่มฟังเสียง */}
                      <button onClick={() => speakChinese(q.chinese)} className="p-2 bg-white text-orange-500 rounded-full shadow-sm hover:scale-110 transition-transform shrink-0"><Volume2 size={16}/></button>
                      {/* ปุ่มขยายเต็มจอเพื่อเขียน */}
                      {userRole === 'teacher' && (
                        <button onClick={() => openWritingModal(q.chinese)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors shrink-0"><Search size={16}/></button>
                      )}
                      
                      {/* Hanzi Writer ที่ผูก Pinyin เข้าไปตัวต่อตัวเลย */}
                      <div className="ml-1 overflow-x-auto w-full pb-1 pt-1">
                         <HanziWordWriter text={q.chinese} align="left" size={34} showControls={false} showPinyin={true} />
                      </div>
                    </div>
                  </div>

                  {/* วงเล็บสำหรับใส่คำตอบ (Interactive) */}
                  <div 
                    onClick={() => handleFillAnswer(q.id)}
                    className={`relative flex items-center justify-center px-4 min-w-[100px] cursor-pointer shrink-0 transition-transform duration-300 xl:ml-auto
                      ${activeChoice ? 'hover:scale-110' : ''}
                    `}
                    title={userRole === 'teacher' ? (currentAnswer ? 'คลิกเพื่อลบคำตอบ' : 'คลิกเพื่อนำตัวอักษรที่เลือกมาใส่') : ''}
                  >
                    <span className="text-4xl font-serif text-slate-400 font-light">(</span>
                    
                    <div className="w-10 flex justify-center items-center">
                       {currentAnswer ? (
                         <span className={`text-3xl md:text-4xl font-black transition-all animate-fade-in ${isRevealed ? (isCorrect ? 'text-emerald-500' : 'text-red-500') : 'text-orange-600'}`}>
                           {currentAnswer}
                         </span>
                       ) : (
                         // ถ้ายังไม่ตอบ และกำลังเล็ง (Hover) อยู่ให้โชว์ลางๆ (เฉพาะครู)
                         <span className={`text-3xl md:text-4xl font-black text-slate-300 opacity-0 transition-opacity ${userRole === 'teacher' && activeChoice ? 'group-hover:opacity-50' : ''}`}>
                           {activeChoice}
                         </span>
                       )}
                    </div>
                    
                    <span className="text-4xl font-serif text-slate-400 font-light">)</span>
                    
                    {/* ไอคอนตรวจคำตอบเมื่อกดเฉลย */}
                    {isRevealed && currentAnswer && (
                      <div className={`absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm p-0.5 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isCorrect ? <CheckCircle2 size={20} className="fill-emerald-100" /> : <X size={20} className="fill-red-100" />}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (มีลำโพง พัก เล่นต่อ และเขียนครบชุด) === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน</h3>
              <div className="flex gap-2">
                <button onClick={() => speakChinese(writingModalText)} className="px-4 py-2 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full font-bold flex items-center gap-2 transition-colors"><Volume2 size={18}/> ฟังเสียง</button>
                <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              <HanziWordWriter text={writingModalText} size={90} showControls={true} hideQuiz={false} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}