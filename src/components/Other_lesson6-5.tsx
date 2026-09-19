// src/components/Other_lesson6-5.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PauseCircle, ChevronDown, PlayCircle, Headphones, Volume2, Mic, MicOff, RotateCcw, Settings, X, Pencil, Keyboard, Maximize2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import HanziWriter from 'hanzi-writer';

export interface Card6_5 { id: string; imageUrl: string; noun: string; measureWord: string; priceNumber: string; priceSpoken: string; }
export interface OtherLesson6_5Data { id?: string; patternType: 'other_lesson6-5'; mainTitle: string; subTitle: string; audioTrack: string; audioUrl: string; cards: Card6_5[]; }
interface Props { data: OtherLesson6_5Data; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const LOCAL_DICT: Record<string, string> = { "多少钱": "ราคาเท่าไหร่", "一共": "ทั้งหมด", "多少": "เท่าไหร่", "块": "หยวน", "元": "หยวน", "毛": "เหมา" };

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
const HanziWordWriter = ({ text, align = 'left', size, showControls = false, hideQuiz = false, showPinyin = true, userRole, remoteAnimCmd, onBroadcastAnim, layout = 'col', flexWrap = 'flex-wrap', customStrokeColor, customPinyinColor }: any) => {
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

export default function OtherLesson6_5({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_5Data);
  
  // ✅ 1. เพิ่มข้อมูลสำรอง (Fallback) ให้ Header
  const mainTitle = safeData.mainTitle || '2. 两人一组，看一看，说一说。';
  const subTitle = safeData.subTitle || 'กิจกรรมคู่ ดูภาพแล้วฝึกพูด';
  const audioTrack = safeData.audioTrack || '06-05';
  
  // ✅ 2. เพิ่มข้อมูลสำรอง (Fallback) ให้การ์ด 6 ใบ
  const defaultCards: Card6_5[] = [
    { id: `c_default_1`, imageUrl: '', noun: '书包', measureWord: '个', priceNumber: '120.00', priceSpoken: '一百二十块' },
    { id: `c_default_2`, imageUrl: '', noun: '笔记本', measureWord: '本', priceNumber: '18.50', priceSpoken: '十八块五' },
    { id: `c_default_3`, imageUrl: '', noun: '橡皮', measureWord: '块', priceNumber: '1.50', priceSpoken: '一块五' },
    { id: `c_default_4`, imageUrl: '', noun: '西瓜', measureWord: '个', priceNumber: '25.00', priceSpoken: '二十五块' },
    { id: `c_default_5`, imageUrl: '', noun: '芒果', measureWord: '个', priceNumber: '8.80', priceSpoken: '八块八' },
    { id: `c_default_6`, imageUrl: '', noun: '榴莲', measureWord: '个', priceNumber: '90.99', priceSpoken: '九十块九毛九' }
  ];
  const cards = Array.isArray(safeData.cards) && safeData.cards.length > 0 ? safeData.cards : defaultCards;

  const fbKeyAudio = `other6_5_audio_${safeData.id || 'default'}`; 
  const fbKeySelected = `other6_5_selected_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_5_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_5_live_ex_text_${safeData.id || 'default'}`;
  const fbKeyWriteAnim = `other6_5_write_anim_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_5_write_modal_${safeData.id || 'default'}`; 

  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef(0);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null); 
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true); 
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [writingModalText, setWritingModalText] = useState<string | null>(null); 
  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
        if (d[fbKeySelected] !== undefined) setSelectedCardId(d[fbKeySelected]);
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
  }, [roomPin, fbKeyAudio, fbKeySelected, fbKeyLiveExModal, fbKeyLiveExText, fbKeyWriteAnim, fbKeyWriteModal]);

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } stopListening(); }; }, []);

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

  const handleSelectCard = async (cId: string) => {
    if (userRole !== 'teacher') return;
    setSelectedCardId(cId);
    if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySelected]: cId }); } catch(e){} }
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
    if (window.confirm('ต้องการล้างหน้าจอและรีเซ็ตค่าทั้งหมดใช่หรือไม่?')) {
      setSelectedCardId(null); setLiveExText(''); setWritingModalText(null);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySelected]: null, [fbKeyLiveExModal]: false, [fbKeyLiveExText]: '', [fbKeyWriteModal]: null }); } catch(e){}
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

  // หาประโยคปัจจุบันจากการ์ดที่ถูกเลือก
  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];
  const questionText = activeCard ? `这${activeCard.measureWord}${activeCard.noun}多少钱？` : '这个书包多少钱？';
  const answerText = activeCard ? `${activeCard.priceSpoken}。` : '一百二十块。';

  return (
    <div className="flex w-full items-start my-4 font-sans text-left relative bg-white rounded-2xl border border-slate-200">
      <div className="flex-1 w-full p-4 md:p-6 pb-24">
        
        {/* Header */}
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

        {/* Content Area */}
        <div className="w-full space-y-8">
          
          {/* ==================== 1. MAIN DIALOGUE (DYNAMIC) ==================== */}
          <div className="w-full bg-slate-50/70 p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative">
             
             {/* Left Bubble (Boy - Question) */}
             <div className="flex items-end gap-4 w-full md:w-[50%] relative group cursor-pointer" onClick={() => userRole === 'teacher' ? openWritingModal(questionText) : undefined} title={userRole === 'teacher' ? "คลิกเพื่อขยายกระดานเขียน" : ""}>
                <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-3xl">👦🏻</div>
                <div className="bg-green-100 border-2 border-green-200 p-5 rounded-2xl rounded-bl-none shadow-sm relative flex-1">
                   <div className="absolute w-4 h-4 bg-green-100 border-b-2 border-l-2 border-green-200 -left-2.5 bottom-2 rotate-45"></div>
                   <div className="flex flex-col items-center">
                     <HanziWordWriter text={questionText} size={42} showControls={false} />
                   </div>
                   <div className="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {userRole === 'teacher' && <button className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:scale-110"><Maximize2 size={16}/></button>}
                      <button onClick={(e)=>{e.stopPropagation(); speakChinese(questionText);}} className="p-2 bg-white text-orange-500 rounded-full shadow-md border border-orange-100 hover:scale-110"><Volume2 size={16}/></button>
                      <button onClick={(e)=>{e.stopPropagation(); if(recordingId === 'boy') stopListening(); else startListening(questionText, 'boy');}} className={`p-2 rounded-full shadow-md border hover:scale-110 ${recordingId === 'boy' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-100'}`}>
                         {recordingId === 'boy' ? <Mic size={16}/> : <MicOff size={16}/>}
                      </button>
                   </div>
                </div>
             </div>

             {/* Right Bubble (Girl - Answer) */}
             <div className="flex items-end gap-4 w-full md:w-[45%] justify-end relative group cursor-pointer" onClick={() => userRole === 'teacher' ? openWritingModal(answerText) : undefined} title={userRole === 'teacher' ? "คลิกเพื่อขยายกระดานเขียน" : ""}>
                <div className="bg-orange-100 border-2 border-orange-200 p-5 rounded-2xl rounded-br-none shadow-sm relative flex-1">
                   <div className="absolute w-4 h-4 bg-orange-100 border-t-2 border-r-2 border-orange-200 -right-2.5 bottom-2 rotate-45"></div>
                   <div className="flex flex-col items-center">
                     <HanziWordWriter text={answerText} size={42} showControls={false} />
                   </div>
                   <div className="absolute -top-3 -left-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {userRole === 'teacher' && <button className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:scale-110"><Maximize2 size={16}/></button>}
                      <button onClick={(e)=>{e.stopPropagation(); speakChinese(answerText);}} className="p-2 bg-white text-orange-500 rounded-full shadow-md border border-orange-100 hover:scale-110"><Volume2 size={16}/></button>
                      <button onClick={(e)=>{e.stopPropagation(); if(recordingId === 'girl') stopListening(); else startListening(answerText, 'girl');}} className={`p-2 rounded-full shadow-md border hover:scale-110 ${recordingId === 'girl' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-100'}`}>
                         {recordingId === 'girl' ? <Mic size={16}/> : <MicOff size={16}/>}
                      </button>
                   </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-3xl">👧🏻</div>
             </div>

          </div>

          {/* ==================== 2. CARDS GRID (Layout รูปซ้าย 1:1 ข้อความขวา) ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-fade-in w-full px-2">
            {cards.map((card, idx) => {
              const isSelected = activeCard?.id === card.id;
              
              return (
                <div 
                  key={card.id} 
                  onClick={() => handleSelectCard(card.id)}
                  className={`relative bg-white rounded-3xl border-2 transition-all duration-300 flex flex-row items-stretch overflow-hidden group cursor-pointer
                    ${isSelected ? 'border-orange-400 shadow-lg ring-4 ring-orange-100 scale-[1.02] z-10' : 'border-slate-200 hover:border-orange-300 hover:shadow-md'}
                  `}
                >
                  {/* ซ้าย: รูปภาพ (Aspect Ratio 1:1) */}
                  <div className="w-[40%] aspect-square p-3 flex flex-col items-center justify-center bg-slate-50/80 border-r border-slate-100 shrink-0">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" alt={card.noun} />
                    ) : (
                      <div className="text-slate-300 text-4xl">🛍️</div>
                    )}
                  </div>

                  {/* ขวา: อักษรจีน + Pinyin */}
                  <div className="w-[60%] px-2 py-3 flex flex-col justify-center items-center relative">
                     <div className="flex flex-row flex-wrap items-end justify-center gap-1.5 w-full">
                        {/* โชว์แค่ตัวหนังสือแบบซ่อนปุ่ม */}
                        <HanziWordWriter text={card.noun} size={36} showControls={false} />
                        <HanziWordWriter text={card.measureWord} size={36} showControls={false} />
                     </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* === Modal ฝึกเขียนเต็มจอ (เด้งตอนคลิก Bubble บทสนทนา) === */}
      {writingModalText && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนประโยค</h3>
              <button onClick={() => { if(userRole==='teacher') openWritingModal(null); else setWritingModalText(null); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center bg-slate-100/50">
              <HanziWordWriter text={writingModalText} size={90} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} flexWrap="flex-wrap" />
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
              
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleLiveExerciseModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold shadow-sm"><Keyboard size={14} /> แบบฝึกหัด</button>
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={handleTeacherReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 hover:text-red-500 rounded-xl text-xs font-bold shadow-sm"><RotateCcw size={14} /> ล้างหน้าจอ</button>
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={() => setIsControlPanelOpen(false)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"><ChevronDown size={14} /> เก็บ</button>
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}