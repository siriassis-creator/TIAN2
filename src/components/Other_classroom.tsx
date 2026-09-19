// src/components/Other_classroom.tsx
import React, { useState, useRef } from 'react';
import { StickyNote, X, Volume2, Eye, Mic, MicOff } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface ClassroomSentence {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface OtherClassroomData {
  id?: string;
  patternType: 'other_classroom';
  mainTitleZh: string;
  subTitleZh: string; 
  sentences: ClassroomSentence[];
  teacherNote?: string;
}

interface Props {
  data: OtherClassroomData;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherClassroom({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');
  
  const [revealedItems, setRevealedItems] = useState<Record<number, boolean>>({});

  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, { score: number, transcript: string, transcriptPinyin: string }>>({});
  
  const recognitionRef = useRef<any>(null);

  const toggleReveal = (idx: number) => {
    setRevealedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakEnglish = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort(); 
    }
    setRecordingIdx(null);
  };

  const startListening = (expectedChinese: string, idx: number) => {
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
      setRecordingIdx(idx);
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
        [idx]: { score: calculatedScore, transcript: transcript, transcriptPinyin: transcriptPinyin }
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      if (event.error === 'not-allowed') {
        alert("กรุณาอนุญาตให้เว็บไซต์ใช้งานไมโครโฟนของคุณก่อนครับ");
      }
      setRecordingIdx(null);
    };

    recognition.onend = () => {
      setRecordingIdx(null);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Mic start error:", e);
      setRecordingIdx(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/50 p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        
        <button
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className={`absolute top-6 right-6 p-1.5 rounded transition-all ${
            isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'
          }`}
        >
          <StickyNote size={22} />
        </button>

        {/* +++ ถอด pl-4 md:pl-10 ออก เพื่อให้หัวข้อชิดขอบซ้ายสุด +++ */}
        <div className="text-left mb-10 mt-4 space-y-4">
          {data.mainTitleZh && (
            <h2 className="text-3xl font-serif text-slate-800 tracking-wide">
              {data.mainTitleZh}
            </h2>
          )}
          {data.subTitleZh && (
            <h3 className="text-2xl font-serif text-slate-800 tracking-wide mt-2">
              {data.subTitleZh}
            </h3>
          )}
        </div>
        {/* +++++++++++++++++++++++++++++++++++++++++++++ */}

        {/* +++ เปลี่ยนเป็น w-full และถอดการจัดกึ่งกลาง (mx-auto) ออกทั้งหมดเพื่อให้เนื้อหาชิดซ้ายสุด +++ */}
        <div className="w-full space-y-8">
          {(data.sentences || []).map((item, idx) => {
            const isRevealed = revealedItems[idx];
            const isRecording = recordingIdx === idx;
            const scoreData = speechScores[idx];

            return (
              <div key={idx} className="flex gap-4 items-start group relative">
                {/* ตัวเลขข้อ */}
                <div className="text-2xl font-serif text-slate-800 shrink-0 w-8 text-left pt-0.5">
                  {idx + 1}.
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <div className="text-[28px] font-serif text-slate-800 tracking-wide leading-none flex items-center gap-3">
                    {item.chinese}
                    
                    {!isRevealed && (
                      <Volume2 
                        size={22} 
                        className="text-slate-300 hover:text-indigo-500 cursor-pointer transition-colors"
                        onClick={() => speakChinese(item.chinese)}
                        title="ฟังเสียงภาษาจีน"
                      />
                    )}

                    <button
                      onClick={() => {
                        if (isRecording) {
                          stopListening();
                        } else {
                          startListening(item.chinese, idx);
                        }
                      }}
                      disabled={recordingIdx !== null && !isRecording}
                      className={`ml-2 p-2 rounded-full transition-all border shadow-sm ${
                        isRecording 
                        ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                        : recordingIdx !== null 
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                          : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200 border-slate-200'
                      }`}
                      title={isRecording ? "คลิกเพื่อหยุด" : "คลิกเพื่อฝึกพูด"}
                    >
                      {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                  </div>

                  {scoreData && !isRecording && (
                    <div className={`flex items-center gap-3 w-fit px-4 py-2 rounded-lg border text-sm font-medium animate-fade-in ${getScoreColor(scoreData.score)}`}>
                      <div className="font-bold text-lg">{scoreData.score}%</div>
                      <div className="border-l pl-3 border-current/20 opacity-80 flex flex-col leading-tight">
                        <span>ระบบได้ยิน: "{scoreData.transcript}"</span>
                        <span className="text-[11px] opacity-75 font-sans tracking-wide">({scoreData.transcriptPinyin})</span>
                      </div>
                    </div>
                  )}
                  
                  {!isRevealed ? (
                    <button 
                      onClick={() => toggleReveal(idx)}
                      className="flex items-center gap-2 mt-1 px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg text-sm font-bold w-fit transition-colors shadow-sm"
                    >
                      <Eye size={16} /> แสดง Pinyin และคำแปล
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 animate-fade-in border-l-2 border-indigo-200 pl-4 py-1 mt-1">
                      <div 
                        className="text-xl text-indigo-600 font-sans cursor-pointer flex items-center gap-2 hover:text-indigo-800 transition-colors w-fit group/audioZh"
                        onClick={() => speakChinese(item.chinese || item.pinyin)}
                        title="คลิกเพื่อฟังเสียงภาษาจีน"
                      >
                        {item.pinyin}
                        <Volume2 size={20} className="opacity-50 group-hover/audioZh:opacity-100 transition-opacity text-indigo-500" />
                      </div>
                      
                      <div 
                        className="text-[19px] text-slate-700 font-serif leading-snug cursor-pointer flex items-center gap-2 hover:text-emerald-700 transition-colors w-fit group/audioEn mt-1"
                        onClick={() => speakEnglish(item.english)}
                        title="คลิกเพื่อฟังเสียงภาษาอังกฤษ"
                      >
                        {item.english}
                        <Volume2 size={18} className="opacity-50 group-hover/audioEn:opacity-100 transition-opacity text-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      </div>

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