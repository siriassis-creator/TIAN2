// src/components/Other_lesson5-17.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Edit3, Mic, MicOff } from 'lucide-react';

export interface PhraseItem {
  id: string;
  chinese: string;
  pinyin: string;
}

export interface CharCard {
  id: string;
  mainChar: string;
  mainPinyin: string;
  phrases: PhraseItem[];
}

export interface OtherLesson5_17Data {
  id?: string;
  patternType: 'other_lesson5-17';
  mainTitle: string;
  subTitle: string;
  showPinyin: boolean;
  cards: CharCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_17Data;
  onUpdateNote?: (newNote: string) => void;
}

// Sub-component สำหรับการ์ดพลิก
function FlipCharCard({ card }: { card: CharCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  return (
    <div 
      className="relative w-full aspect-square cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className={`relative w-full h-full duration-500 transition-all shadow-sm rounded-xl border-2 ${isFlipped ? '[transform:rotateY(180deg)] border-orange-200' : 'border-slate-300'}`} 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ด้านหน้า: อักษรจีน */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-xl flex items-center justify-center p-2" 
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-[60px] md:text-[80px] font-serif text-slate-800 leading-none drop-shadow-sm">
            {card.mainChar}
          </span>
        </div>

        {/* ด้านหลัง: พินอิน + ลำโพง */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-50 to-white rounded-xl flex flex-col items-center justify-center p-2 [transform:rotateY(180deg)]" 
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-[20px] md:text-[28px] font-sans font-bold text-orange-600 mb-4 tracking-wide">
            {card.mainPinyin}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              speakChinese(card.mainChar);
            }}
            className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md hover:scale-110 active:scale-95"
            title="ฟังเสียง"
          >
            <Volume2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OtherLesson5_17({ data, onUpdateNote }: Props) {
  const safeData = data || ({} as OtherLesson5_17Data);
  const safeCards = safeData.cards || [];
  const showPinyin = safeData.showPinyin !== false; // Default is true

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  // Speech Assessment State สำหรับวลีด้านล่าง
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => { stopListening(); };
  }, []);

  const speakChinesePhrase = (text: string) => {
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

  const startListening = (expectedChinese: string, phraseId: string) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(phraseId);
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

      setSpeechScores(prev => ({ ...prev, [phraseId]: { score: calculatedScore, transcript } }));
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

        {/* Header */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm">
              <Edit3 size={24} />
            </div>
            <div className="bg-orange-400 text-white px-6 py-1.5 rounded-full shadow-sm">
              <span className="text-xl md:text-2xl font-bold tracking-wide">
                {safeData.mainTitle || '写一写 อักษรจีนแสนสนุก'}
              </span>
            </div>
          </div>
          <div className="pl-[52px] text-[16px] md:text-[18px] font-bold text-slate-700 tracking-wide">
            {safeData.subTitle || '1. 读一读，认一认。 ฝึกอ่านและจำตัวอักษรจีน'}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mt-12 px-2 md:px-6">
          {safeCards.map((card) => (
            <div key={card.id} className="flex flex-col items-center">
              
              {/* Flip Card (อักษรจีนเดี่ยว) */}
              <div className="w-full max-w-[140px]">
                <FlipCharCard card={card} />
              </div>

              {/* วลีประกอบด้านล่าง พร้อมลำโพง/ไมค์ */}
              <div className="mt-6 flex flex-col gap-3 items-center text-center w-full">
                {card.phrases?.map((phrase) => {
                  const isRecording = recordingId === phrase.id;
                  const scoreData = speechScores[phrase.id];

                  return (
                    <div key={phrase.id} className="flex flex-col items-center w-full p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-orange-100 transition-all group">
                      <span className="text-[20px] md:text-[22px] font-serif text-slate-800 leading-tight">
                        {phrase.chinese}
                      </span>
                      {showPinyin && (
                        <span className="text-[12px] md:text-[14px] font-sans text-slate-500 mt-0.5">
                          {phrase.pinyin}
                        </span>
                      )}

                      {/* เครื่องมือ ฟังเสียง และ ฝึกพูด สำหรับวลี */}
                      <div className="flex items-center gap-1.5 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => speakChinesePhrase(phrase.chinese)} 
                          className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors shadow-sm" 
                          title="ฟังเสียงวลีนี้"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button 
                          onClick={() => { if (isRecording) stopListening(); else startListening(phrase.chinese, phrase.id); }} 
                          className={`p-1.5 rounded-full transition-all shadow-sm border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50'}`} 
                          title="ฝึกพูดวลีนี้"
                        >
                          {isRecording ? <Mic size={14} /> : <MicOff size={14} />}
                        </button>
                        {scoreData && !isRecording && (
                          <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold animate-fade-in ${getScoreColor(scoreData.score)}`}>
                            {scoreData.score}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
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