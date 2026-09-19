// src/components/Other_lesson5-18.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, BookOpen } from 'lucide-react';

export interface RadicalTableItem {
  id: string;
  mainChar: string;
  mainPinyin: string;
  words: string;
  wordsPinyin: string;
}

export interface OtherLesson5_18Data {
  id?: string;
  patternType: 'other_lesson5-18';
  mainTitle: string;
  col1_mainChar: string;
  col1_subText1: string;
  col1_subText2: string;
  col1_subText3: string;
  items: RadicalTableItem[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_18Data;
  onUpdateNote?: (newNote: string) => void;
}

// Sub-component สำหรับแต่ละช่องตารางที่ Flip ได้
function FlipTableCell({ item }: { item: RadicalTableItem }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScore, setSpeechScore] = useState<{ score: number, transcript: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => { stopListening(); };
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

  const startListening = (expectedChinese: string) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(item.id);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      setSpeechScore({ score: calculatedScore, transcript });
    };
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);

    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const isRecording = recordingId === item.id;

  return (
    <div 
      className="relative w-full h-full min-h-[140px] cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className={`relative w-full h-full duration-500 transition-all ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ด้านหน้า: ตัวอักษรจีน (ไม่มีกรอบ เพื่อให้เนียนไปกับตาราง) */}
        <div 
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-2 bg-transparent" 
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-[32px] md:text-[40px] font-serif text-slate-800 leading-none mb-2">
            {item.mainChar}
          </div>
          <div className="text-[16px] md:text-[18px] font-serif text-slate-600">
            {item.words}
          </div>
        </div>

        {/* ด้านหลัง: พินอิน + ลำโพง/ไมค์ */}
        <div 
          className="absolute inset-0 w-full h-full bg-emerald-50/90 flex flex-col items-center justify-center p-2 shadow-inner [transform:rotateY(180deg)]" 
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-[16px] md:text-[20px] font-sans font-bold text-emerald-700 leading-none mb-1">
            {item.mainPinyin}
          </div>
          <div className="text-[12px] md:text-[14px] font-sans text-emerald-600/80 mb-3">
            {item.wordsPinyin}
          </div>
          
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => { e.stopPropagation(); speakChinese(item.words || item.mainChar); }}
              className="p-2 rounded-full bg-white text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm"
              title="ฟังเสียง"
            >
              <Volume2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if (isRecording) stopListening(); else startListening(item.words || item.mainChar); }}
              className={`p-2 rounded-full transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-orange-500 hover:bg-orange-50'}`}
              title="ฝึกพูด"
            >
              {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            {speechScore && !isRecording && (
              <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold animate-fade-in ${getScoreColor(speechScore.score)}`}>
                {speechScore.score}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtherLesson5_18({ data, onUpdateNote }: Props) {
  const safeData = data || ({} as OtherLesson5_18Data);
  const safeItems = safeData.items || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px]">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header */}
        <div className="mb-8 flex items-center gap-3 pl-2">
          <div className="text-[18px] md:text-[22px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
            {safeData.mainTitle || '2. 偏旁学习。เรียนรู้หมวดอักษร'}
          </div>
        </div>

        {/* 2. Main Table Layout (กรอบตารางหลัก) */}
        <div className="w-full max-w-5xl mx-auto bg-white border-2 border-emerald-100 rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden">
          
          {/* Column 1: อธิบายหมวดอักษร (ฝั่งซ้าย) */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-emerald-50/40 border-b md:border-b-0 md:border-r-2 border-emerald-100 p-6 md:p-8 flex flex-col justify-center">
            
            {/* อักษรตัวใหญ่ตรงกลาง */}
            <div className="flex justify-center mb-6">
              <span className="text-[80px] md:text-[100px] font-serif text-emerald-600 leading-none drop-shadow-sm">
                {safeData.col1_mainChar || '木'}
              </span>
            </div>
            
            {/* คำอธิบาย */}
            <div className="space-y-3">
              <div>
                <div className="text-[16px] md:text-[18px] font-bold text-emerald-600 font-serif leading-tight">
                  {safeData.col1_subText1?.split(' ')[0] || '木字旁'}
                </div>
                <div className="text-[12px] md:text-[14px] text-slate-500 font-sans">
                  {safeData.col1_subText1?.split(' ').slice(1).join(' ') || 'mùzìpáng'}
                </div>
              </div>
              <div className="text-[14px] md:text-[15px] font-serif text-slate-600 leading-relaxed">
                {safeData.col1_subText2 || '含有“木”的字大多和树木有关。'}
              </div>
              <div className="text-[13px] md:text-[14px] font-sans text-slate-500 leading-relaxed">
                {safeData.col1_subText3 || 'ตัวอักษรที่มีหมวด 木 ส่วนใหญ่จะเกี่ยวข้องกับต้นไม้'}
              </div>
            </div>
          </div>

          {/* Columns 2-4: ตาราง Flip Card (ฝั่งขวา) */}
          <div className="w-full md:w-2/3 lg:w-3/4 grid grid-cols-2 md:grid-cols-3">
            {safeItems.map((item, idx) => {
              // จัดการเส้นขอบตารางให้เป็นเส้นประ ยกเว้นขอบล่างของแถวสุดท้าย และขอบขวาของคอลัมน์สุดท้าย
              const isLastRow = idx >= safeItems.length - (safeItems.length % 3 === 0 ? 3 : safeItems.length % 3);
              const isLastCol = (idx + 1) % 3 === 0;
              
              return (
                <div 
                  key={item.id} 
                  className={`
                    border-emerald-200/60 border-dashed
                    ${!isLastRow ? 'border-b-2' : ''}
                    ${!isLastCol ? 'border-r-2' : ''}
                  `}
                >
                  <FlipTableCell item={item} />
                </div>
              );
            })}
          </div>

        </div>

      </div>

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