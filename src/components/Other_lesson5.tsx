// src/components/Other_lesson5.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface CellData {
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface CharacterRow {
  imageUrl: string;
  col2: CellData;
  col3: CellData;
  col4: CellData;
  col5: CellData;
}

export interface OtherLesson5Data {
  id?: string;
  patternType: 'other_lesson5';
  mainTitle: string;
  headers: {
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
  };
  characters: CharacterRow[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherLesson5({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // +++ Speech Assessment State (ไมโครโฟนประเมินเสียง) +++
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string, transcriptPinyin: string }>>({});
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // ฟังก์ชันอ่านออกเสียง (อ่านจากตัวอักษรจีนเพื่อให้เสียงวรรณยุกต์ถูกต้องที่สุด)
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
    if (recognitionRef.current) {
      recognitionRef.current.abort(); 
    }
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, cellId: string) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง แนะนำให้ใช้งานผ่าน Google Chrome, Edge หรือ Safari ครับ");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecordingId(cellId);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) {
          matchCount++;
        }
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = 0;
      
      if (maxLength > 0) {
        calculatedScore = Math.round((matchCount / maxLength) * 100);
      }
      
      if (cleanTranscript === cleanExpected) {
        calculatedScore = 100;
      }

      setSpeechScores(prev => ({
        ...prev,
        [cellId]: { score: calculatedScore, transcript: transcript, transcriptPinyin: transcriptPinyin }
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      if (event.error === 'not-allowed') {
        alert("กรุณาอนุญาตให้เว็บไซต์ใช้งานไมโครโฟนของคุณก่อนครับ");
      }
      setRecordingId(null);
    };

    recognition.onend = () => {
      setRecordingId(null);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Mic start error:", e);
      setRecordingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // ชุดสีพื้นหลังสำหรับสลับแถวให้ดูสวยงามเหมือนในหนังสือ
  const rowColors = [
    'bg-[#f4e1f1]/80', // ชมพูอ่อน
    'bg-[#fef3d5]/80', // เหลืองอ่อน
    'bg-[#e2f0e6]/80', // เขียวอ่อน
    'bg-[#e3eff9]/80', // ฟ้าอ่อน
  ];

  const headers = data.headers || {
    col1: '人物 ตัวละคร',
    col2: '姓名 ชื่อสกุล',
    col3: '年龄 อายุ',
    col4: '生日 วันเกิด',
    col5: '出生地 สถานที่เกิด'
  };

  // คอมโพเนนต์สำหรับเรนเดอร์แต่ละเซลล์ พร้อมระบบฝึกพูด
  const RenderCell = ({ cell, cellId }: { cell: CellData, cellId: string }) => {
    const isRecording = recordingId === cellId;
    const scoreData = speechScores[cellId];

    return (
      <div className="flex flex-col items-center justify-start text-center gap-1.5 w-full h-full py-4 px-2">
        
        {/* 1. ภาษาจีน + ปุ่มไมค์ */}
        <div className="flex items-center justify-center gap-2">
          <div className="text-[28px] font-serif text-slate-800 leading-none">
            {cell.chinese}
          </div>
          {cell.chinese && (
            <button
              onClick={() => {
                if (isRecording) {
                  stopListening();
                } else {
                  startListening(cell.chinese, cellId);
                }
              }}
              disabled={recordingId !== null && !isRecording}
              className={`p-1.5 rounded-full transition-all border shadow-sm shrink-0 ${
                isRecording 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : recordingId !== null 
                  ? 'bg-white/50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                  : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200 border-slate-200'
              }`}
              title={isRecording ? "คลิกเพื่อหยุด" : "คลิกเพื่อฝึกพูด"}
            >
              {isRecording ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
          )}
        </div>

        {/* 2. Pinyin + รูปลำโพง (เมื่อกดจะอ่านออกเสียง) */}
        {cell.pinyin && (
          <div 
            className="flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
            onClick={() => speakChinese(cell.chinese || cell.pinyin)}
            title="คลิกเพื่อฟังเสียง"
          >
            <div className="text-[18px] font-sans leading-none tracking-wide mt-0.5">
              {cell.pinyin}
            </div>
            <Volume2 size={16} className="opacity-70 group-hover:opacity-100 shrink-0" />
          </div>
        )}

        {/* 3. คำแปลภาษาไทย */}
        {cell.translation && (
          <div className="text-[18px] font-sans text-slate-800 leading-tight font-medium mt-1">
            {cell.translation}
          </div>
        )}

        {/* 4. แสดงผลคะแนน (ออกแบบแนวตั้งเพื่อให้เข้ากับช่องตารางแคบๆ) */}
        {scoreData && !isRecording && (
          <div className={`mt-2 flex flex-col items-center w-full p-2 rounded-lg border animate-fade-in shadow-sm ${getScoreColor(scoreData.score)}`}>
            <div className="font-bold text-sm">{scoreData.score}%</div>
            <div className="text-[11px] leading-tight opacity-90 mt-1">
              "{scoreData.transcript}"
            </div>
            <div className="text-[10px] leading-tight opacity-70">
              ({scoreData.transcriptPinyin})
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden">
      <div className="bg-white/50 p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        
        {/* Note Button */}
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header (ป้ายหัวข้อหลัก) */}
        <div className="mb-10 pl-4">
          <div className="inline-flex items-center justify-center bg-orange-200/60 rounded-full px-8 py-3 border-2 border-orange-300 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-orange-300/40 rounded-l-full"></div>
            <span className="relative text-3xl font-bold text-orange-800 tracking-wide font-serif">
              {data.mainTitle || '人物介绍 แนะนำตัวละคร'}
            </span>
          </div>
        </div>

        {/* 2. Table Section */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[900px] rounded-2xl overflow-hidden border border-orange-200 shadow-sm bg-white">
            
            {/* Table Header */}
            <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] bg-orange-400 text-white font-bold text-xl items-center divide-x divide-orange-300/50">
              <div className="py-4 px-2 text-center drop-shadow-sm">{headers.col1}</div>
              <div className="py-4 px-2 text-center drop-shadow-sm">{headers.col2}</div>
              <div className="py-4 px-2 text-center drop-shadow-sm">{headers.col3}</div>
              <div className="py-4 px-2 text-center drop-shadow-sm">{headers.col4}</div>
              <div className="py-4 px-2 text-center drop-shadow-sm">{headers.col5}</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {(data.characters || []).map((char, idx) => (
                <div 
                  key={idx} 
                  className={`grid grid-cols-[140px_1fr_1fr_1fr_1fr] border-b border-white last:border-0 divide-x divide-white ${rowColors[idx % rowColors.length]}`}
                >
                  {/* Col 1: รูปภาพวงกลม */}
                  <div className="flex items-center justify-center p-3">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt="character" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">No Image</div>
                      )}
                    </div>
                  </div>

                  {/* Col 2 - 5 ส่ง cellId แบบไม่ซ้ำกันไปให้ระบบให้คะแนน */}
                  <RenderCell cell={char.col2} cellId={`row${idx}-col2`} />
                  <RenderCell cell={char.col3} cellId={`row${idx}-col3`} />
                  <RenderCell cell={char.col4} cellId={`row${idx}-col4`} />
                  <RenderCell cell={char.col5} cellId={`row${idx}-col5`} />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Note Sidebar */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
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