// src/components/Other_lesson5-11.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Mic, MicOff, Eye, RotateCcw, Puzzle } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText'; // +++ ดึงกระดานลอยมาใช้ +++

export interface BoxData {
  id: string;
  leftType: 'text' | 'image';
  leftContent: string;
  pinyinStart: string;
  hiddenPinyin: string;
  pinyinEnd: string;
  chinese: string;
}

export interface OtherLesson5_11Data {
  id?: string;
  patternType: 'other_lesson5-11';
  mainTitle: string;
  subTitle: string;
  row1Boxes: BoxData[];
  gridBoxes: BoxData[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_11Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_11({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_11Data);
  const fbKeyReveals = `other5_11_reveals_${safeData.id || 'default'}`;
  const fbKeySpeech = `other5_11_speech_${safeData.id || 'default'}`;

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // State 
  const [revealedItems, setRevealedItems] = useState<string[]>([]);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  
  // โครงสร้างการเก็บคะแนน: { boxId: { teacher: scoreData, student: scoreData } }
  const [speechScores, setSpeechScores] = useState<Record<string, any>>({});
  const recognitionRef = useRef<any>(null);
  const speechScoresRef = useRef(speechScores);

  useEffect(() => {
    speechScoresRef.current = speechScores;
  }, [speechScores]);

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d[fbKeyReveals] !== undefined) setRevealedItems(d[fbKeyReveals]);
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyReveals, fbKeySpeech]);

  useEffect(() => {
    return () => stopListening();
  }, []);

  // --- Speech Assessment (Mic) ---
  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, boxId: string) => {
    if (!expectedChinese) return;
    stopListening();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง"); return; }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => setRecordingId(boxId);
    
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
      const currentBoxScores = speechScoresRef.current[boxId] || {};
      
      const newScores = { 
        ...speechScoresRef.current, 
        [boxId]: { ...currentBoxScores, [userRole]: newScoreData }
      };
      
      setSpeechScores(newScores);
      
      if (roomPin) {
         try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: newScores }); } catch(e) {}
      }
    };
    
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);
    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // --- Teacher Controls ---
  const handleTeacherReveal = async (boxId: string) => {
    if (userRole !== 'teacher') return;
    const newReveals = [...revealedItems, boxId];
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
    if (window.confirm('ต้องการล้างการเฉลยและคะแนนทั้งหมดใช่หรือไม่?')) {
      setRevealedItems([]);
      setSpeechScores({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeyReveals]: [], [fbKeySpeech]: {} }); } catch (e) {}
      }
    }
  };

  // Render Box Component
  const renderBox = (box: BoxData) => {
    const isRevealed = revealedItems.includes('ALL') || revealedItems.includes(box.id);
    const isRecording = recordingId === box.id;
    const scoreData = speechScores[box.id] || {};

    return (
      <div key={box.id} className="relative flex items-center bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all p-3 h-[110px] w-full max-w-[340px] group">
        
        {/* ส่วนแสดงคะแนนแบบย่อ (โชว์ที่มุมขวาบนของการ์ด) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10 pointer-events-none">
            {scoreData.teacher && userRole === 'teacher' && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold shadow-sm bg-white/90 backdrop-blur-sm ${getScoreColor(scoreData.teacher.score)}`}>
                  👩‍🏫 {scoreData.teacher.score}%
                </div>
            )}
            {scoreData.student && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold shadow-sm bg-white/90 backdrop-blur-sm ${getScoreColor(scoreData.student.score)}`}>
                  🧒 {scoreData.student.score}%
                </div>
            )}
        </div>

        {/* ปุ่มเฉลยรายข้อ สำหรับครู */}
        {userRole === 'teacher' && !isRevealed && (
          <button 
            onClick={() => handleTeacherReveal(box.id)}
            className="absolute -top-3 -left-3 bg-white border border-orange-200 text-orange-500 rounded-full p-1.5 shadow-sm hover:bg-orange-50 z-30 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
            title="เฉลยข้อนี้"
          >
            <Eye size={16} />
          </button>
        )}

        {/* ฝั่งซ้าย (รูป หรือ คำแปล) */}
        <div className="w-[80px] h-[80px] shrink-0 flex items-center justify-center bg-slate-50/50 rounded-xl mr-4 overflow-hidden border border-slate-100">
          {box.leftType === 'image' && box.leftContent ? (
            <img src={box.leftContent} alt="vocab" className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply" />
          ) : (
            <span className="text-[14px] text-slate-500 font-medium text-center px-1 leading-tight">{box.leftContent || '...'}</span>
          )}
        </div>

        {/* ฝั่งขวา (Pinyin + จีน + ไมค์) */}
        <div className="flex-1 flex flex-col justify-center gap-1 pr-6 relative">
          
          {/* พินอิน (ส่วนเติมคำ) */}
          <div className="flex items-end justify-start gap-0.5 font-sans tracking-wide text-indigo-600 text-[18px]">
            <span>{box.pinyinStart}</span>
            <div className={`relative px-1 border-b-2 text-center min-w-[30px] font-bold transition-colors ${isRevealed ? 'border-emerald-300 text-emerald-600' : 'border-slate-300 text-transparent'}`}>
              <span className="relative z-10">{box.hiddenPinyin}</span>
              {!isRevealed && <span className="absolute inset-0 flex items-center justify-center text-slate-300 text-[12px] -mt-1 font-normal opacity-50">?</span>}
            </div>
            <span>{box.pinyinEnd}</span>
          </div>

          {/* อักษรจีน + ปุ่มไมค์ */}
          <div className="flex items-center justify-start gap-3 w-full">
            <span className="text-[26px] font-serif text-slate-800 leading-none">{box.chinese}</span>
            
            <button
              onClick={() => {
                if (isRecording) stopListening();
                else startListening(box.chinese, box.id);
              }}
              disabled={recordingId !== null && !isRecording}
              className={`p-1.5 rounded-full transition-all border shadow-sm shrink-0 ${
                isRecording 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : recordingId !== null 
                  ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                  : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200'
              }`}
              title={isRecording ? "คลิกเพื่อหยุด" : "คลิกเพื่อฝึกพูด"}
            >
              {isRecording ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header 1 (ป้ายส้ม) */}
        <div className="mb-6 pl-4 flex items-center gap-4 relative z-[30]">
          <div className="bg-white p-2 rounded-full shadow-sm text-orange-400 border-2 border-orange-100">
            <Puzzle size={36} strokeWidth={2} />
          </div>
          <div className="inline-flex items-center justify-center bg-orange-300/80 rounded-full px-8 py-2.5 shadow-sm relative overflow-hidden">
            <span className="relative text-2xl font-bold text-white tracking-wide font-sans drop-shadow-md">
              {safeData.mainTitle || '练一练 กิจกรรมหรรษา'}
            </span>
          </div>
        </div>

        {/* 2. Subtitle */}
        <div className="mb-10 pl-4 relative z-[30]">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || '1. 看词语，补全拼音。 ดูคำศัพท์แล้วเติมพินอินให้สมบูรณ์'}
          </div>
        </div>

        {/* 3. ROW 1 (3 กล่องแนวนอน) */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 px-4 mb-10">
          {(safeData.row1Boxes || []).map(box => renderBox(box))}
        </div>

        {/* 4. GRID BOXES (กล่องด้านล่าง เรียง 2 คอลัมน์) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 px-4 max-w-4xl mx-auto place-items-center">
          {(safeData.gridBoxes || []).map(box => renderBox(box))}
        </div>

      </div>

      {/* +++ ฝั่งเด็กโชว์กระดานลอย (ถ้าครูเปิดไว้) +++ */}
      {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

      {/* Teacher Control Panel */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-8 md:bottom-12 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">เฉลยเติมคำ & คะแนนพูด</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            
            {/* +++ ปุ่มกระดานศัพท์สำหรับครู +++ */}
            <FloatingLiveText roomPin={roomPin} userRole={userRole} />
            
            <button 
              onClick={handleTeacherRevealAll} 
              disabled={revealedItems.includes('ALL')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedItems.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-orange-500 hover:bg-orange-600 text-white hover:-translate-y-0.5'}`}
            >
              <Eye size={14} /> เฉลยทั้งหมด
            </button>
            
            <button 
              onClick={handleTeacherReset} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
            >
              <RotateCcw size={14} /> ล้างข้อมูล
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