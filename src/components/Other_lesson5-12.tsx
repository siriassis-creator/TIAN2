// src/components/Other_lesson5-12.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, RotateCcw } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText';

export interface LadderRow {
  id: string;
  chinese: string;
  pinyin: string;
}

export interface LadderBlock {
  id: string;
  theme: 'pink' | 'yellow' | 'blue' | 'green';
  rows: LadderRow[];
}

export interface OtherLesson5_12Data {
  id?: string;
  patternType: 'other_lesson5-12';
  mainTitle: string;
  ladders: LadderBlock[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_12Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

const getThemeClass = (theme: string, idx: number) => {
  const i = Math.min(idx, 4); // สูงสุด 5 ระดับ
  if (theme === 'pink') return ['bg-rose-50/70', 'bg-rose-100', 'bg-rose-200', 'bg-rose-300', 'bg-rose-400'][i];
  if (theme === 'yellow') return ['bg-amber-50/70', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400'][i];
  if (theme === 'blue') return ['bg-sky-50/70', 'bg-sky-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400'][i];
  if (theme === 'green') return ['bg-emerald-50/70', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400'][i];
  return 'bg-slate-50';
};

export default function OtherLesson5_12({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_12Data);
  const fbKeySpeech = `other5_12_speech_${safeData.id || 'default'}`;

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Speech Assessment State
  const [recordingId, setRecordingId] = useState<string | null>(null);
  
  // โครงสร้างการเก็บคะแนน: { rowId: { teacher: scoreData, student: scoreData } }
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
        if (d[fbKeySpeech] !== undefined) setSpeechScores(d[fbKeySpeech]);
      }
    });
    return () => unsub();
  }, [roomPin, fbKeySpeech]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

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

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, rowId: string) => {
    if (!expectedChinese) return;
    stopListening();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง"); return; }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => setRecordingId(rowId);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();
      
      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) { if (cleanExpected.includes(cleanTranscript[i])) matchCount++; }
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;
      
      const newScoreData = { score: calculatedScore, transcript };
      const currentRowScores = speechScoresRef.current[rowId] || {};
      
      const newScores = { 
        ...speechScoresRef.current, 
        [rowId]: { ...currentRowScores, [userRole]: newScoreData }
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

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างคะแนนทั้งหมดใช่หรือไม่?')) {
      setSpeechScores({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { [fbKeySpeech]: {} }); } catch (e) {}
      }
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden">
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1]">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] pointer-events-auto ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* Header */}
        {safeData.mainTitle && (
          <div className="mb-10 pl-4 flex items-center gap-4 relative z-[30]">
            <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
              {safeData.mainTitle}
            </div>
          </div>
        )}

        {/* Word Ladders Area */}
        <div className="w-full max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-12">
          {(safeData.ladders || []).map((ladder) => (
            <div key={ladder.id} className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 bg-white">
              {ladder.rows.map((row, idx) => {
                const isRecording = recordingId === row.id;
                const scoreData = speechScores[row.id] || {};
                const rowBgClass = getThemeClass(ladder.theme, idx);

                return (
                  <div 
                    key={row.id} 
                    className={`w-full px-6 md:px-8 py-4 flex items-center justify-between transition-colors ${rowBgClass} border-b border-white/20 last:border-0 hover:brightness-95 relative group`}
                  >
                    
                    {/* ส่วนแสดงคะแนนแบบย่อ (โชว์มุมซ้ายบน) */}
                    <div className="absolute top-1 left-2 flex gap-1 z-10 pointer-events-none">
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

                    {/* ข้อมูลคำศัพท์ */}
                    <div className="flex flex-col gap-0.5 max-w-[65%] mt-3">
                      <span className="text-[22px] md:text-[26px] font-serif text-slate-800 leading-tight">{row.chinese}</span>
                      <span className="text-[14px] md:text-[16px] font-sans text-slate-600 tracking-wide opacity-80">{row.pinyin}</span>
                    </div>

                    {/* ปุ่มฟัง/พูด */}
                    <div className="flex flex-col items-end gap-2 shrink-0 mt-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => speakChinese(row.chinese)}
                          className="p-2 rounded-full bg-white/60 hover:bg-white text-slate-600 transition-all shadow-sm"
                          title="ฟังเสียง"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button 
                          onClick={() => { if (isRecording) stopListening(); else startListening(row.chinese, row.id); }}
                          disabled={recordingId !== null && !isRecording}
                          className={`p-2 rounded-full transition-all shadow-sm ${
                            isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : recordingId !== null 
                              ? 'bg-white/30 text-slate-400 cursor-not-allowed'
                              : 'bg-white/60 hover:bg-white text-slate-600'
                          }`}
                          title="ฝึกพูด"
                        >
                          {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>
      
      {/* กระดานคำศัพท์เสริม (สำหรับแสดงบนหน้าจอเด็ก) */}
      {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

      {/* Teacher Control Panel */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-8 md:bottom-12 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">ระบบติดตามการพูด</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            
            {/* กระดานศัพท์สำหรับครู */}
            <FloatingLiveText roomPin={roomPin} userRole={userRole} />
            
            <button 
              onClick={handleTeacherReset} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
            >
              <RotateCcw size={14} /> ล้างคะแนนทั้งหมด
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