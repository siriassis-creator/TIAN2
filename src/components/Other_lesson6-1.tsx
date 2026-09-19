// src/components/Other_lesson6-1.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PauseCircle, PlayCircle, Headphones, Volume2, Mic, MicOff, Hand, X, Search, ArrowLeft, Pencil, Maximize2, Keyboard } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

// 🎯 Import ส่วนกลางที่สร้างไว้
import { SingleHanziWriter, HanziWordWriter } from './SharedHanzi';
import { SharedTeacherPanel } from './SharedTeacherPanel';

export interface FlipCard6_1 { id: string; imageUrl: string; chinese: string; pinyin: string; translation: string; }
export interface OtherLesson6_1Data { id?: string; patternType: 'other_lesson6-1'; mainTitle: string; subTitle: string; audioTrack: string; audioUrl: string; cards: FlipCard6_1[]; teacherNote?: string; }
interface Props { data: OtherLesson6_1Data; onUpdateNote?: (newNote: string) => void; userRole?: 'teacher' | 'student'; roomPin?: string | null; }

const getMoneyDetails = (text: string) => {
  let unitW = ''; let unitS = ''; let textW = text; let textS = text; let isMoney = false;
  if (text.includes('块') || text.includes('元')) { unitW = '元'; unitS = '块'; textW = text.replace(/块/g, '元'); textS = text.replace(/元/g, '块'); isMoney = true; } 
  else if (text.includes('毛') || text.includes('角')) { unitW = '角'; unitS = '毛'; textW = text.replace(/毛/g, '角'); textS = text.replace(/角/g, '毛'); isMoney = true; } 
  else if (text.includes('分')) { unitW = '分'; unitS = '分'; isMoney = true; }
  return { unitW, unitS, textW, textS, isMoney };
};

const LOCAL_DICT: Record<string, string> = { "多少钱": "ราคาเท่าไหร่", "一共": "ทั้งหมด", "谢谢": "ขอบคุณ", "你好": "สวัสดี", "老师": "คุณครู" }; // ย่อให้เพื่อความกะทัดรัด (สามารถนำ Dict เต็มๆ มาวางได้ครับ)

const tokenizeLiveText = (text: string) => {
  let result = [], i = 0, colorIndex = 0;
  const colors = [{ tw: 'text-blue-600' }, { tw: 'text-green-600' }, { tw: 'text-pink-600' }, { tw: 'text-orange-600' }];
  while (i < text.length) {
    let matched = false;
    for (let len = 4; len > 0; len--) {
      if (i + len <= text.length) {
        const word = text.substring(i, i + len);
        if (LOCAL_DICT[word]) {
          const isComp = len >= 2; const c = isComp ? colors[colorIndex % colors.length] : { tw: 'text-slate-600' };
          if (isComp) colorIndex++; result.push({ word, trans: LOCAL_DICT[word], ...c }); i += len; matched = true; break;
        }
      }
    }
    if (!matched) { result.push({ word: text[i], trans: '', tw: 'text-slate-600' }); i++; }
  }
  return result;
};

export default function OtherLesson6_1({ data, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson6_1Data);
  const safeCards = safeData.cards || [];

  // 🎯 1. เซ็นเซอร์ตรวจจับการมองเห็น
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { setIsSlideVisible(entries[0].isIntersecting); }, { threshold: 0.1 });
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const fbKeyAudio = `other6_1_audio_${safeData.id || 'default'}`; 
  const fbKeySpeech = `other6_1_speech_${safeData.id || 'default'}`;
  const fbKeyHighlight = `other6_1_highlight_${safeData.id || 'default'}`; 
  const fbKeyFocus = `other6_1_focus_${safeData.id || 'default'}`;
  const fbKeyWriteModal = `other6_1_write_modal_${safeData.id || 'default'}`; 
  const fbKeyWriteAnim = `other6_1_write_anim_${safeData.id || 'default'}`;
  const fbKeyLiveExModal = `other6_1_live_ex_modal_${safeData.id || 'default'}`;
  const fbKeyLiveExText = `other6_1_live_ex_text_${safeData.id || 'default'}`;

  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, any>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null); 
  const [isWritingExpanded, setIsWritingExpanded] = useState(false);
  const [remoteAnimCmd, setRemoteAnimCmd] = useState<any>(null);
  const [isLiveExOpen, setIsLiveExOpen] = useState(false);
  const [liveExText, setLiveExText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const speechScoresRef = useRef(speechScores);
  useEffect(() => { speechScoresRef.current = speechScores; }, [speechScores]);

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
        if (d[fbKeyHighlight] !== undefined) setActiveCardId(d[fbKeyHighlight]);
        if (d[fbKeyFocus] !== undefined) setFocusedCardId(d[fbKeyFocus]);
        if (d[fbKeyWriteModal] !== undefined) setIsWritingExpanded(d[fbKeyWriteModal]);
        if (d[fbKeyWriteAnim] !== undefined) setRemoteAnimCmd(d[fbKeyWriteAnim]);
        if (d[fbKeyLiveExModal] !== undefined) setIsLiveExOpen(d[fbKeyLiveExModal]);
        if (d[fbKeyLiveExText] !== undefined) setLiveExText(d[fbKeyLiveExText]);

        const audioCmd = d[fbKeyAudio];
        if (audioCmd && audioCmd.ts !== lastSignalTs.current) {
          lastSignalTs.current = audioCmd.ts;
          const audio = initAudio();
          if (audio) {
            if (audioCmd.action === 'PLAY') {
              if (Math.abs(audio.currentTime - (audioCmd.currentTime || 0)) > 1) audio.currentTime = audioCmd.currentTime || 0;
              if (audio.currentTime === audio.duration) audio.currentTime = 0;
              audio.play().then(() => setPlaybackState('broadcast_playing')).catch(()=>{}); 
            } else if (audioCmd.action === 'PAUSE') {
              audio.pause();
              if (audioCmd.currentTime !== undefined) { audio.currentTime = audioCmd.currentTime; if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); }
              setPlaybackState('idle');
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAudio, fbKeySpeech, fbKeyHighlight, fbKeyFocus, fbKeyWriteModal, fbKeyWriteAnim, fbKeyLiveExModal, fbKeyLiveExText, userRole, safeData.audioUrl]);

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } stopListening(); }; }, []);

  const initAudio = () => {
    if (!audioRef.current && safeData.audioUrl) {
      const audio = new Audio(safeData.audioUrl); audio.loop = false;
      audio.onended = () => { setPlaybackState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
      audio.onerror = () => { setPlaybackState('idle'); audioRef.current = null; };
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value); setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration; audioRef.current.currentTime = newTime;
      if (playbackState === 'broadcast_playing' && userRole === 'teacher' && roomPin) updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyAudio]: { action: 'PLAY', ts: Date.now(), currentTime: newTime } }).catch(()=>{});
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

  const handleHighlightCard = async (cardId: string) => { if (userRole !== 'teacher') return; const newHighlight = activeCardId === cardId ? null : cardId; setActiveCardId(newHighlight); if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyHighlight]: newHighlight }); } catch(e){} } };
  const handleFocusCard = async (cardId: string | null) => { if (userRole !== 'teacher') return; setFocusedCardId(cardId); if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyFocus]: cardId }); } catch(e){} } };
  const toggleWritingModal = async (isOpen: boolean) => { setIsWritingExpanded(isOpen); if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteModal]: isOpen }); } catch(e){} } };
  const toggleLiveExerciseModal = async (isOpen: boolean) => { setIsLiveExOpen(isOpen); if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExModal]: isOpen }); } catch(e){} } };
  const handleLiveExTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => { const newText = e.target.value; setLiveExText(newText); if (userRole === 'teacher' && roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyLiveExText]: newText }); } catch(e){} } };
  const broadcastAnimCmd = async (char: string, action: string) => { if (userRole !== 'teacher' || !roomPin) return; try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyWriteAnim]: { char, action, ts: Date.now() } }); } catch(e){} };

  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.abort(); setRecordingId(null); };

  const startListening = (expectedChinese: string, cardId: string) => {
    if (!expectedChinese) return;
    stopListening();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setRecordingId(cardId);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) { if (cleanExpected.includes(cleanTranscript[i])) matchCount++; }
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      const newScoreData = { score: calculatedScore, transcript, transcriptPinyin };
      const currentCardScores = speechScoresRef.current[cardId] || {};
      const newScores = { ...speechScoresRef.current, [cardId]: { ...currentCardScores, [userRole]: newScoreData } };

      setSpeechScores(newScores);
      if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch (e) {} }
    };
    recognition.onerror = () => setRecordingId(null); recognition.onend = () => setRecordingId(null);
    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างไฮไลต์และคะแนนทั้งหมดใช่หรือไม่?')) {
      setSpeechScores({}); setActiveCardId(null); setFocusedCardId(null); setLiveExText('');
      if (roomPin) { try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: {}, [fbKeyHighlight]: null, [fbKeyFocus]: null, [fbKeyWriteModal]: false, [fbKeyLiveExModal]: false, [fbKeyLiveExText]: '' }); } catch (e) {} }
    }
  };

  if (!safeData.patternType) return <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl"><span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลการ์ด...</span></div>;

  const focusedCard = focusedCardId ? safeCards.find(c => c.id === focusedCardId) : null;
  const moneyDetails = focusedCard ? getMoneyDetails(focusedCard.chinese) : null;
  const focusedScoreData = focusedCard ? (speechScores[focusedCard.id] || {}) : {};
  const isFocusedRecording = focusedCard ? (recordingId === focusedCard.id) : false;

  // 🎯 สร้างชุดเครื่องมือเสียงแบบ Custom เพื่อส่งให้ SharedTeacherPanel
  const customAudioTools = (
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
  );

  return (
    <div ref={mainContainerRef} className="flex w-full transition-all duration-500 items-start my-4 font-sans text-left relative bg-slate-50 rounded-2xl border border-slate-200">
      
      {/* 🎯 เรียกใช้ SharedTeacherPanel */}
      <SharedTeacherPanel 
        userRole={userRole} 
        roomPin={roomPin} 
        isSlideVisible={isSlideVisible} 
        onOpenLiveEx={() => toggleLiveExerciseModal(true)} 
        onReset={handleTeacherReset}
        customTools={customAudioTools}
      />

      <div className="flex-1 w-full p-4 md:p-6 relative z-[1] pb-24">
        
        {/* 1. Header & Subtitle */}
        <div className="w-full mb-4">
          <div className="inline-flex items-center justify-center bg-orange-400/90 rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-md">
              {safeData.mainTitle || '听一听 มาฝึกฟังกัน'}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-[18px] md:text-[20px] font-bold text-slate-700 leading-tight flex-1">
              {safeData.subTitle || '1. 听录音，跟读，熟读下列词语。 ฟังแล้วอ่านตาม จากนั้นเรียนรู้คำศัพท์'}
            </div>
            
            {userRole !== 'teacher' && (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-orange-600 transition-all w-fit">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs">{playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || 'Track 01'))}</span>
                </button>
                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} disabled={playbackState === 'broadcast_playing'} className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ${playbackState === 'broadcast_playing' ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            )}
          </div>
        </div>

        {/* 2. Content Area */}
        <div className="w-full transition-all duration-500">
          
          {focusedCard && moneyDetails ? (
            <div className="w-full animate-fade-in mb-6">
              {userRole === 'teacher' && (
                <button onClick={() => { handleFocusCard(null); toggleWritingModal(false); }} className="mb-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-2xl transition-colors w-fit shadow-sm border border-indigo-200">
                  <ArrowLeft size={18} /> ย้อนกลับ (ปิดโหมดขยาย)
                </button>
              )}

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch justify-center bg-white p-4 md:p-6 rounded-3xl shadow-md border border-slate-100 relative w-full">
                
                <div className="w-full lg:w-[280px] xl:w-[340px] shrink-0 flex flex-col bg-white rounded-3xl shadow-sm border-4 border-indigo-100 overflow-hidden relative min-h-[400px]">
                  
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-30 pointer-events-none">
                    {focusedScoreData.teacher && userRole === 'teacher' && <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold shadow-sm bg-white/90 ${getScoreColor(focusedScoreData.teacher.score)}`}>👩‍🏫 {focusedScoreData.teacher.score}%</div>}
                    {focusedScoreData.student && <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold shadow-sm bg-white/90 ${getScoreColor(focusedScoreData.student.score)}`}>🧒 {focusedScoreData.student.score}%</div>}
                  </div>

                  <div className="w-full flex-1 relative group [perspective:1000px] cursor-pointer min-h-[250px] border-b-2 border-dashed border-slate-200">
                    <div className={`absolute inset-0 transition-all duration-700 [transform-style:preserve-3d] ${isFocusedRecording ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
                      
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-slate-50/50 p-4 flex flex-col items-center justify-center z-10">
                        <div className="w-full h-full flex items-center justify-center pb-6">
                          {focusedCard.imageUrl ? <img src={focusedCard.imageUrl} alt={focusedCard.chinese} className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <span className="text-slate-300">ไม่มีรูปภาพ</span>}
                        </div>
                      </div>

                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4 gap-3 z-0">
                        <div className="text-[32px] md:text-[40px] font-serif text-slate-800 leading-none text-center mt-auto">{focusedCard.chinese}</div>
                        <button onClick={(e) => { e.stopPropagation(); speakChinese(focusedCard.chinese); }} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full hover:scale-105 transition-all">
                          <Volume2 size={18} /> <span className="text-lg font-sans">{focusedCard.pinyin}</span>
                        </button>
                        <div className="text-sm md:text-base text-slate-600 text-center">{focusedCard.translation}</div>
                        
                        <div className="mt-auto w-full flex justify-center pb-2 z-20 relative">
                          <button onClick={(e) => { e.stopPropagation(); if (isFocusedRecording) stopListening(); else startListening(focusedCard.chinese, focusedCard.id); }} disabled={recordingId !== null && !isFocusedRecording} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border shadow-sm ${isFocusedRecording ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' : recordingId !== null ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' : 'bg-white text-emerald-500 hover:bg-emerald-50 border-emerald-200 hover:scale-105'}`}>
                            {isFocusedRecording ? <Mic size={20} /> : <MicOff size={20} />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center justify-center bg-white relative pt-4 pb-6 group">
                    {userRole === 'teacher' && (
                      <button onClick={() => toggleWritingModal(true)} className="absolute top-2 right-2 p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-slate-200 hover:border-indigo-200 z-30 opacity-0 group-hover:opacity-100">
                        <Maximize2 size={16} />
                      </button>
                    )}
                    <HanziWordWriter text={focusedCard.chinese} showControls={true} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 w-full justify-center">
                  {moneyDetails.isMoney ? (
                    <>
                      <div className="shrink-0 flex flex-col bg-slate-50 p-3 md:p-4 rounded-3xl border border-slate-200 shadow-sm relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800 rounded-l-3xl"></div>
                        <div className="flex items-center justify-start mb-2 shrink-0 relative z-10 border-b border-slate-200/50 pb-2 ml-1">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 m-0"><span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-sm">หน่วยเงิน</span></h4>
                        </div>

                        <div className="w-full relative z-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide w-full text-left">ภาษาเขียน (Written)</div>
                                {speechScores['unitW']?.teacher && userRole === 'teacher' && <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(speechScores['unitW'].teacher.score)}`}>👩‍🏫 {speechScores['unitW'].teacher.score}%</div>}
                                {speechScores['unitW']?.student && <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(speechScores['unitW'].student.score)}`}>🧒 {speechScores['unitW'].student.score}%</div>}
                                <SingleHanziWriter character={moneyDetails.unitW} size={60} pinyin={pinyinConverter(moneyDetails.unitW)} layout="row" showControls={true} onSpeak={() => speakChinese(moneyDetails.unitW)} onRecord={() => { if (recordingId === 'unitW') stopListening(); else startListening(moneyDetails.unitW, 'unitW'); }} isRecording={recordingId === 'unitW'} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                              </div>
                              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide w-full text-left">ภาษาพูด (Spoken)</div>
                                {speechScores['unitS']?.teacher && userRole === 'teacher' && <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(speechScores['unitS'].teacher.score)}`}>👩‍🏫 {speechScores['unitS'].teacher.score}%</div>}
                                {speechScores['unitS']?.student && <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(speechScores['unitS'].student.score)}`}>🧒 {speechScores['unitS'].student.score}%</div>}
                                <SingleHanziWriter character={moneyDetails.unitS} size={60} pinyin={pinyinConverter(moneyDetails.unitS)} layout="row" showControls={true} onSpeak={() => speakChinese(moneyDetails.unitS)} onRecord={() => { if (recordingId === 'unitS') stopListening(); else startListening(moneyDetails.unitS, 'unitS'); }} isRecording={recordingId === 'unitS'} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                              </div>
                            </div>
                        </div>
                      </div>

                      <div className="w-full flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800 rounded-l-2xl"></div>
                        <div className="flex items-center justify-start mb-2 shrink-0 relative z-10 border-b border-slate-200/50 pb-2 ml-1">
                          <h4 className="text-sm font-bold text-slate-700 m-0 flex items-center gap-2"><span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-sm">คำอ่านเต็ม</span></h4>
                        </div>
                        <div className="flex flex-col gap-2 w-full relative z-0">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 w-full text-left">
                              <div className="text-[10px] font-bold text-slate-400 mb-1 text-left">อ่านแบบภาษาเขียน</div>
                              <HanziWordWriter text={moneyDetails.textW} align="left" size={44} gap="gap-1.5" padding="p-0" showControls={false} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                            </div>
                            <button onClick={() => speakChinese(moneyDetails.textW)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 rounded-full transition-all shrink-0"><Volume2 size={20} /></button>
                          </div>
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 w-full text-left">
                              <div className="text-[10px] font-bold text-slate-400 mb-1 text-left">อ่านแบบภาษาพูด</div>
                              <HanziWordWriter text={moneyDetails.textS} align="left" size={44} gap="gap-1.5" padding="p-0" showControls={false} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                            </div>
                            <button onClick={() => speakChinese(moneyDetails.textS)} className="p-2.5 bg-orange-50 text-orange-500 hover:bg-orange-100 hover:scale-105 rounded-full transition-all shrink-0"><Volume2 size={20} /></button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-10 rounded-3xl border border-slate-200 shadow-sm text-center">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">คำศัพท์ทั่วไป</div>
                      <div className="text-5xl md:text-6xl font-serif text-slate-800 mb-4">{focusedCard.chinese}</div>
                      <div className="text-2xl text-indigo-600 font-sans mb-2">{focusedCard.pinyin}</div>
                      <div className="text-xl text-slate-600 mb-6">{focusedCard.translation}</div>
                      <div className="w-full mb-6 flex justify-center"><HanziWordWriter text={focusedCard.chinese} showControls={false} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} /></div>
                      <button onClick={() => speakChinese(focusedCard.chinese)} className="mt-4 flex items-center gap-2 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full hover:bg-indigo-200 transition-colors font-bold"><Volume2 size={20} /> ฟังเสียงอ่าน</button>
                    </div>
                  )}
                </div>

              </div>

              {isWritingExpanded && (
                <div className="fixed inset-0 z-[4000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-700 flex items-center gap-2"><Pencil className="text-orange-500" /> ฝึกเขียนอักษรจีน (โหมดเต็มจอ)</h3>
                      <button onClick={() => { if (userRole === 'teacher') toggleWritingModal(false); else setIsWritingExpanded(false); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center bg-slate-100/50">
                      <HanziWordWriter text={focusedCard.chinese} size={150} showControls={true} showPinyin={true} userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fade-in w-full">
              {safeCards.map((card, idx) => {
                const isRecording = recordingId === card.id;
                const scoreData = speechScores[card.id] || {};
                const isHighlighted = activeCardId === card.id;

                return (
                  <div key={card.id} className={`group [perspective:1000px] aspect-[4/3] min-h-[200px] w-full relative ${userRole === 'teacher' ? 'hover:scale-[1.02]' : ''} transition-transform`}>
                    {userRole === 'teacher' && (
                      <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleHighlightCard(card.id); }} className={`p-2 rounded-full shadow-md transition-all hover:scale-110 ${isHighlighted ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 hover:text-orange-500'}`} title="ไฮไลต์การ์ดนี้"><Hand size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleFocusCard(card.id); }} className="p-2 rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-all hover:scale-110" title="ขยายดูละเอียด (Focus Mode)"><Search size={16} /></button>
                      </div>
                    )}
                    {isHighlighted && <div className="absolute -inset-2 bg-orange-400/20 rounded-3xl animate-pulse blur-sm z-0 pointer-events-none"></div>}

                    <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] shadow-sm hover:shadow-xl rounded-2xl z-10 ${isRecording ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
                      <div className={`absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl border-2 flex flex-col items-center justify-center p-2 overflow-hidden ${isHighlighted ? 'border-orange-400 ring-2 ring-orange-200' : 'border-slate-100'}`}>
                        {userRole === 'teacher' && <div className="absolute top-2 left-2 text-[10px] text-slate-300 font-bold z-10">{idx + 1}</div>}
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10 pointer-events-none">
                          {scoreData.teacher && userRole === 'teacher' && <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(scoreData.teacher.score)}`}>👩‍🏫 {scoreData.teacher.score}%</div>}
                          {scoreData.student && <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shadow-sm bg-white/90 ${getScoreColor(scoreData.student.score)}`}>🧒 {scoreData.student.score}%</div>}
                        </div>
                        <div className="w-full h-full flex items-center justify-center rounded-xl bg-slate-50/50 p-2">
                          {card.imageUrl ? <img src={card.imageUrl} alt={card.chinese} className="max-h-[90%] max-w-[90%] object-contain mix-blend-multiply" /> : <span className="text-slate-300 text-sm">ไม่มีรูปภาพ</span>}
                        </div>
                      </div>
                      <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-orange-50 to-white rounded-2xl border-2 flex flex-col items-center justify-center p-3 gap-2 ${isHighlighted ? 'border-orange-400 ring-2 ring-orange-200' : 'border-orange-200'}`}>
                        <div className="text-[26px] md:text-[30px] font-serif text-slate-800 leading-none text-center mt-2">{card.chinese}</div>
                        <button onClick={(e) => { e.stopPropagation(); speakChinese(card.chinese); }} className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 px-3 py-1.5 rounded-full transition-all hover:scale-105" title="ฟังเสียง"><Volume2 size={16} /> <span className="text-[14px] md:text-[16px] font-sans tracking-wide leading-none">{card.pinyin}</span></button>
                        <div className="text-[12px] md:text-[14px] font-sans text-slate-600 font-medium text-center leading-tight">{card.translation}</div>
                        <div className="mt-auto w-full flex justify-center pb-1 z-20 relative">
                          <button onClick={(e) => { e.stopPropagation(); if (isRecording) stopListening(); else startListening(card.chinese, card.id); }} disabled={recordingId !== null && !isRecording} className={`flex items-center justify-center w-9 h-9 rounded-full transition-all border shadow-sm ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' : recordingId !== null ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' : 'bg-white text-emerald-500 hover:bg-emerald-50 border-emerald-200 hover:scale-105'}`}>
                            {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {isLiveExOpen && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-slate-700 flex items-center gap-2"><Keyboard className="text-indigo-500" /> แบบฝึกหัดสด (Live Exercise)</h3>
              <button onClick={() => { if (userRole === 'teacher') toggleLiveExerciseModal(false); else setIsLiveExOpen(false); }} className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 bg-slate-100/50">
              {userRole === 'teacher' && (
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-500 pl-2">ครูพิมพ์อักษรจีนที่นี่ (แปลไทย/จับคู่สีคำอัตโนมัติ):</label>
                  <input type="text" value={liveExText} onChange={handleLiveExTextChange} placeholder="เช่น 多少钱, 谢谢, 你好..." className="w-full px-6 py-4 text-2xl font-serif rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none shadow-sm" />
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
                                <SingleHanziWriter key={cIdx} character={char} size={80} pinyin={pinyinConverter(char)} showControls={true} layout="col-top" userRole={userRole} remoteAnimCmd={remoteAnimCmd} onBroadcastAnim={broadcastAnimCmd} customStrokeColor={token.hex} customPinyinColor={token.tw} />
                              ) : (
                                <div key={cIdx} className="flex flex-col items-center shrink-0">
                                  <div className="w-full h-[66px]"></div>
                                  <div className="flex items-center justify-center font-serif font-black text-slate-700" style={{ fontSize: 80 * 0.6, width: 80, height: 80 }}>{char}</div>
                                </div>
                              )
                            ))}
                          </div>
                          {token.translation && <div className={`text-[13px] md:text-sm font-bold mt-0.5 ${token.tw} w-full text-center px-2 py-0.5 bg-slate-50/50 rounded-md`}>{token.translation}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <button onClick={(e) => { e.stopPropagation(); speakChinese(liveExText); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all shadow-sm font-bold text-lg"><Volume2 size={24} /> ฟังเสียง</button>
                    <button onClick={(e) => { e.stopPropagation(); if (recordingId === 'live_ex') stopListening(); else startListening(liveExText, 'live_ex'); }} disabled={recordingId !== null && recordingId !== 'live_ex'} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all shadow-sm font-bold text-lg border-2 ${recordingId === 'live_ex' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                      {recordingId === 'live_ex' ? <Mic size={24} /> : <MicOff size={24} />} {recordingId === 'live_ex' ? 'หยุดพูด' : 'ฝึกพูด'}
                    </button>
                  </div>
                  {speechScores['live_ex'] && (
                      <div className="flex flex-wrap justify-center gap-4 w-full mt-2">
                          {speechScores['live_ex'].teacher && userRole === 'teacher' && <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm bg-white ${getScoreColor(speechScores['live_ex'].teacher.score)}`}>👩‍🏫 ครู: {speechScores['live_ex'].teacher.score}%</div>}
                          {speechScores['live_ex'].student && <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm bg-white ${getScoreColor(speechScores['live_ex'].student.score)}`}>🧒 นักเรียน: {speechScores['live_ex'].student.score}%</div>}
                      </div>
                  )}
                </div>
              ) : (
                userRole === 'student' && <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[300px]"><div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div><span className="font-bold text-xl animate-pulse">รอคุณครูพิมพ์แบบฝึกหัด...</span></div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}