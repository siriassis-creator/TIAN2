// src/components/Other_lesson6-9.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, ChevronDown, Headphones, PlayCircle, PauseCircle, Settings, X, Pencil, Keyboard, Search } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Vocab6_9 { id: string; chinese: string; pinyin: string; thai: string; }
export interface Question6_9 { id: string; number: number; chinese: string; pinyin: string; }
export interface OtherLesson6_9Data { id?: string; patternType: 'other_lesson6-9'; mainTitle: string; subTitle: string; audioTrack: string; audioUrl: string; articleImageUrl: string; paragraphs: string[]; vocabularies: Vocab6_9[]; questions: Question6_9[]; }
interface Props { data: OtherLesson6_9Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const LOCAL_DICT: Record<string, string> = { "多少钱": "ราคาเท่าไหร่", "一共": "ทั้งหมด", "商店": "ร้านค้า", "东西": "สิ่งของ", "钢笔": "ปากกาหมึกซึม", "什么": "อะไร" };

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

// === กระดาน Hanzi ===
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
      {pinyin && <div className={`font-sans font-bold text-center leading-none whitespace-nowrap mt-1 ${size <= 40 ? 'text-[11px]' : 'text-[14px]'} ${customPinyinColor || 'text-slate-500'}`}>{pinyin}</div>}
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
             <div className="flex items-end justify-center font-serif font-black text-slate-700 pb-2" style={{ fontSize: size * 0.6, width: size/2, height: size }}>{char}</div>
           </div>
         )
      ))}
    </div>
  );
};

// === ฟังก์ชันแยกคำและสร้าง Pinyin ให้อัตโนมัติ (ชิดกันและเครื่องหมายวรรคตอนแนบติด) ===
const RubyText = ({ text }: { text: string }) => {
  const chars = text.split('');
  const pinyins = pinyinConverter(text, { type: 'array' });
  return (
    // ปรับ gap-y ให้แคบลงเพื่อให้บรรทัดชิดกัน ลบ gap-x ออกเพื่อควบคุมระยะห่างเอง
    <span className="inline-flex flex-wrap items-start gap-y-2 md:gap-y-3">
      {chars.map((char, i) => {
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunc = /[。，？！、.,?!]/.test(char);
        const nextChar = chars[i + 1];
        const isNextPunc = nextChar && /[。，？！、.,?!]/.test(nextChar);

        // ✅ ถ้าตัวถัดไปเป็นเครื่องหมายวรรคตอน ให้ดึงขวาให้ชิด (mr-0) ไม่งั้นให้เว้นตามปกติ (mr-1.5)
        const marginClass = isNextPunc ? 'mr-0' : 'mr-1.5 md:mr-2';

        return (
          <span key={i} className={`inline-flex flex-col items-center justify-start px-[1px] ${marginClass} ${isPunc ? '' : 'min-w-[1.2rem] md:min-w-[1.5rem]'}`}>
            {isChinese ? (
              <>
                <span className="text-[20px] md:text-[24px] font-serif font-medium text-slate-800 leading-none">{char}</span>
                <span className="text-[9px] md:text-[10px] text-slate-500 font-sans tracking-wide mt-1 leading-none">{pinyins[i]}</span>
              </>
            ) : (
              // ✅ ถ้าเป็นเครื่องหมายวรรคตอน ให้ดึงซ้ายเข้ามานิดนึง (-ml-1) ให้แนบตัวอักษร
              <span className={`text-[20px] md:text-[24px] font-serif text-slate-800 leading-none ${isPunc ? '-ml-1 md:-ml-1.5' : ''}`}>{char}</span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default function OtherLesson6_9({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_9Data);
  
  const defaultData = {
    paragraphs: [
      "今年四月，我和爸爸妈妈去了北京。我们去了一个熊猫商店，商店里有趣的东西很多，有熊猫橡皮，有熊猫钢笔，也有熊猫笔袋和熊猫书包。",
      "我喜欢熊猫橡皮和熊猫钢笔。橡皮两块五，我买了两块。熊猫钢笔两百五十块，太贵了，我没买。"
    ],
    vocabularies: [
      { id: 'v1', chinese: '东西', pinyin: 'dōngxi', thai: 'สิ่งของ' },
      { id: 'v2', chinese: '钢笔', pinyin: 'gāngbǐ', thai: 'ปากกาหมึกซึม' }
    ],
    questions: [
      { id: 'q1', number: 1, chinese: '熊猫商店有什么？', pinyin: 'Xióngmāo shāngdiàn yǒu shénme?' },
      { id: 'q2', number: 2, chinese: '熊猫橡皮多少钱？', pinyin: 'Xióngmāo xiàngpí duōshao qián?' },
      { id: 'q3', number: 3, chinese: '熊猫钢笔贵吗？', pinyin: 'Xióngmāo gāngbǐ guì ma?' },
      { id: 'q4', number: 4, chinese: '泰坤买了什么？', pinyin: 'Tàikūn mǎile shénme?' }
    ]
  };

  const mainTitle = safeData.mainTitle || '1. 读一读，然后回答问题。';
  const subTitle = safeData.subTitle || 'ฝึกอ่านแล้วตอบคำถาม';
  const audioTrack = safeData.audioTrack || '06-05';
  const paragraphs = Array.isArray(safeData.paragraphs) && safeData.paragraphs.length > 0 ? safeData.paragraphs : defaultData.paragraphs;
  const vocabularies = Array.isArray(safeData.vocabularies) && safeData.vocabularies.length > 0 ? safeData.vocabularies : defaultData.vocabularies;
  const questions = Array.isArray(safeData.questions) && safeData.questions.length > 0 ? safeData.questions : defaultData.questions;

  // Firebase Keys
  const fbKeyAudio = `other6_9_audio_${safeData.id || 'default'}`; 
  const fbKeyLiveExModal = `other6_9_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_9_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_9_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_9_write_modal_${safeData.id || 'default'}`; 

  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef(0);

  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 

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
  }, [roomPin, fbKeyAudio, fbKeyLiveExModal, fbKeyLiveExText, fbKeyWriteAnim, fbKeyWriteModal]);

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

  const openWritingModal = async (text: string | null) => {
    setWritingModalText(text);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: text }); } catch(e){} }
  };

  const toggleLiveExerciseModal = async (isOpen: boolean) => {
    setIsLiveExOpen(isOpen);
    if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} }
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

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-6 pb-24">
        
        {/* Header & Audio */}
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
                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} disabled={playbackState === 'broadcast_playing'} className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500`} />
              </div>
            )}
          </div>
        </div>

        {/* Content Area: แบ่งซ้าย 60% ขวา 40% ใช้ items-stretch เพื่อให้สูงเท่ากัน */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full">
          
          {/* ==================== 1. ด้านซ้าย (Article & Vocab) ==================== */}
          <div className="w-full lg:w-[60%] flex flex-col gap-4">
             
             {/* กรอบบทความ (ยืด h-full อัตโนมัติด้วย flex-1) */}
             <div className="flex-1 bg-[#faf9f5] border-2 border-slate-200 shadow-sm p-5 md:p-8 rounded-[2rem] relative">
                <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-slate-200 to-transparent opacity-50 rounded-l-[2rem]"></div>
                
                {/* เนื้อหาบทความ Pinyin ด้านล่าง (ชิดกันขึ้น) */}
                <div className="relative z-10 pl-2 space-y-2 md:space-y-3">
                   {paragraphs.map((para, i) => (
                     <div key={i} className="indent-8">
                       <RubyText text={para} />
                     </div>
                   ))}
                </div>
             </div>

             {/* กล่องคำศัพท์ (แยกออกมาด้านนอกกรอบบทความ) */}
             <div className="shrink-0 bg-[#f2e6d5] border-2 border-[#e3d1bb] p-3 md:p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-center gap-6 md:gap-10">
                 {vocabularies.map((v) => (
                   <div key={v.id} className="flex items-center gap-2 md:gap-3 bg-white/50 px-3 py-1.5 rounded-lg border border-[#e3d1bb]/50">
                      <span className="font-serif font-black text-slate-800 text-lg md:text-xl">{v.chinese}</span>
                      <span className="font-mono text-slate-600 font-bold text-xs md:text-sm">{v.pinyin}</span>
                      <span className="text-slate-600 text-xs md:text-sm">{v.thai}</span>
                   </div>
                 ))}
             </div>

          </div>

          {/* ==================== 2. ด้านขวา คำถาม (Questions) ==================== */}
          <div className="w-full lg:w-[40%] flex flex-col gap-4">
             {questions.map((q) => (
               <div key={q.id} className="flex-1 flex flex-row items-center gap-3 bg-orange-50/60 border border-orange-100 p-4 rounded-2xl shadow-sm group hover:border-orange-300 transition-colors">
                  
                  {/* หมายเลขข้อ */}
                  <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center text-base shrink-0">
                    {q.number}
                  </div>

                  {/* กระดานคำถาม (ซ่อนปุ่มเขียน) คลิกเพื่อขยาย */}
                  <div 
                    onClick={() => openWritingModal(q.chinese)}
                    className="flex-1 flex flex-col items-start cursor-pointer transition-transform group-hover:scale-[1.02]"
                    title="คลิกเพื่อฝึกเขียน"
                  >
                     <HanziWordWriter text={q.chinese} size={30} showControls={false} showPinyin={false} />
                     <div className="font-mono font-bold text-slate-500 mt-1 text-xs tracking-wide">
                        {q.pinyin}
                     </div>
                  </div>

                  {/* ปุ่มขยายและลำโพง */}
                  <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openWritingModal(q.chinese)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors"><Search size={16}/></button>
                     <button onClick={(e) => { e.stopPropagation(); speakChinese(q.chinese); }} className="p-2 bg-white text-orange-500 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition-transform"><Volume2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>

        </div>
      </div>

      {/* === Modal ฝึกเขียนเต็มจอ === */}
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
                  <input type="text" value={liveExText} onChange={handleLiveExTextChange} placeholder="เช่น 熊猫" className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 outline-none shadow-sm" />
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

      {/* === Control Panel === */}
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

              {/* คุมเสียง */}
              <div className="flex flex-col gap-1 w-full md:w-[260px]">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border shadow-inner">
                    <button onClick={toggleLocalAudio} className={`flex items-center justify-center gap-1 px-3 py-1 flex-1 rounded-full transition-all ${playbackState === 'local_playing' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>
                      {playbackState === 'local_playing' ? <PauseCircle size={14}/> : <Headphones size={14}/>}
                      <span className="text-[10px] font-bold">ฟังเอง</span>
                    </button>
                    <button onClick={toggleBroadcastAudio} className={`flex items-center justify-center gap-1 px-3 py-1 flex-1 rounded-full transition-all ${playbackState === 'broadcast_playing' ? 'bg-orange-500 text-white font-bold shadow-md' : 'text-orange-600 hover:bg-orange-100 font-bold'}`}>
                      {playbackState === 'broadcast_playing' ? <Volume2 size={14} className="animate-pulse"/> : <PlayCircle size={14}/>}
                      <span className="text-[10px]">กระจายเสียง</span>
                    </button>
                </div>
                <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              
              {/* เมนูอื่น */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-xs font-bold shadow-sm transition-colors"><Keyboard size={14} /> แบบฝึกหัด</button>
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