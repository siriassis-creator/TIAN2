// src/components/Other_lesson1-1.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones, Volume2, Mic, MicOff } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface WordRow {
  no: string;
  chinese: string;
  pinyin: string;
  type: string;
  english: string;
}

export interface OtherLesson1_1Data {
  id?: string;
  patternType: 'other_lesson1-1';
  titleZh: string;
  audioTrack: string;
  audioUrl: string;
  words: WordRow[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson1_1Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherLesson1_1({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');
  
  // Audio Player State (สำหรับ Track หลัก)
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // +++ Speech Assessment State (สำหรับไมโครโฟนฝึกพูด) +++
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, { score: number, transcript: string, transcriptPinyin: string }>>({});
  const recognitionRef = useRef<any>(null);
  // +++++++++++++++++++++++++++++++++++++++++++

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []);

  const toggleAudio = () => {
    if (!data.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.currentTime === audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(data.audioUrl);
      audio.loop = false;
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        audio.currentTime = 0;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        alert('ไม่สามารถโหลดไฟล์เสียงได้ กรุณาตรวจสอบ URL');
      };
      audio.load();
    }
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

  // +++ ฟังก์ชันระบบฟังเสียงและให้คะแนน +++
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
  // +++++++++++++++++++++++++++++++++++++++

  // ระบบแยกข้อความหัวข้ออัตโนมัติ
  const titleText = data.titleZh || '二 生词 Shēngcí New Words';
  const spaceIdx = titleText.indexOf(' ');
  const sectionNum = spaceIdx > -1 ? titleText.substring(0, spaceIdx) : '';
  const mainTitle = spaceIdx > -1 ? titleText.substring(spaceIdx + 1) : titleText;

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left">
      <div className="bg-white/50 p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        
        {/* Note Button */}
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header Section */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pl-4">
          <div className="inline-flex items-center bg-slate-200/80 rounded-full pr-1.5 shadow-sm overflow-hidden border border-slate-300">
            {sectionNum && (
              <span className="px-5 font-serif text-[22px] font-bold text-slate-800">
                {sectionNum}
              </span>
            )}
            <div className="bg-slate-400 text-white rounded-full px-5 py-2 flex items-center gap-3 shadow-inner">
              <span className="text-[22px] font-serif leading-none tracking-wide">{mainTitle}</span>
            </div>
          </div>
          
          {/* Audio controls */}
          <button onClick={toggleAudio} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isPlaying || progress > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-slate-300'}`}>
            <div className="relative w-5 h-5 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 shrink-0">
              <div className="absolute inset-0 transition-all duration-75" style={{ background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}%)` }} />
              <div className={`relative w-2 h-2 bg-white rounded-full shadow-sm ${isPlaying ? 'animate-pulse' : ''}`}></div>
            </div>
            {isPlaying ? <PauseCircle size={18} className="shrink-0" /> : <PlayCircle size={18} className="shrink-0" />}
            <span className="font-bold text-xs ml-1 tracking-wide">{data.audioTrack || '01'}</span>
          </button>

          <div className="bg-amber-400 text-white p-2 rounded-full shadow-sm shrink-0">
            <Headphones size={22} />
          </div>
        </div>

        {/* 2. Content Section (4-Column Grid) */}
        <div className="w-full space-y-4 pl-4 md:pl-10">
          {(data.words || []).map((word, idx) => {
            const isRecording = recordingIdx === idx;
            const scoreData = speechScores[idx];

            return (
              <div key={idx} className="flex flex-col gap-2 border-b border-slate-100/50 pb-3 last:border-0">
                {/* แถวข้อมูลคำศัพท์ (ปรับความกว้างคอลัมน์จีนนิดหน่อยเพื่อให้ใส่ปุ่มไมค์ได้พอดี) */}
                <div className="grid grid-cols-[30px_160px_140px_80px_1fr] md:grid-cols-[40px_180px_160px_100px_1fr] gap-2 items-start group">
                  
                  {/* ลำดับข้อ */}
                  <div className="text-right font-serif text-[22px] text-slate-800 pt-1">
                    {word.no}
                  </div>
                  
                  {/* ภาษาจีน + ปุ่มฝึกพูด */}
                  <div className="flex items-center gap-3">
                    <div className="text-[30px] font-serif text-slate-800 leading-none">
                      {word.chinese}
                    </div>
                    {/* +++ ปุ่มไมโครโฟน +++ */}
                    <button
                      onClick={() => {
                        if (isRecording) {
                          stopListening();
                        } else {
                          startListening(word.chinese, idx);
                        }
                      }}
                      disabled={recordingIdx !== null && !isRecording}
                      className={`p-1.5 rounded-full transition-all border shadow-sm ${
                        isRecording 
                        ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                        : recordingIdx !== null 
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                          : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200 border-slate-200'
                      }`}
                      title={isRecording ? "คลิกเพื่อหยุด" : "คลิกเพื่อฝึกพูด"}
                    >
                      {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  </div>
                  
                  {/* Pinyin + รูปลำโพง */}
                  <div 
                    className="text-[22px] font-sans text-indigo-600 pt-1 tracking-wide flex items-center gap-2 cursor-pointer hover:text-indigo-800 transition-colors w-fit group/audio"
                    onClick={() => speakChinese(word.chinese || word.pinyin)}
                    title="คลิกเพื่อฟังเสียง"
                  >
                    {word.pinyin}
                    {word.pinyin && (
                      <Volume2 
                        size={20} 
                        className="opacity-40 group-hover/audio:opacity-100 transition-opacity text-indigo-500 shrink-0" 
                      />
                    )}
                  </div>
                  
                  {/* ประเภทคำ (ในวงเล็บ) */}
                  <div className="text-[20px] font-serif text-slate-500 pt-1.5 text-center">
                    {word.type ? `（${word.type}）` : ''}
                  </div>
                  
                  {/* คำแปลภาษาอังกฤษ */}
                  <div className="text-[22px] font-serif text-slate-700 pt-1.5 pl-2 leading-snug">
                    {word.english}
                  </div>
                </div>

                {/* +++ แถบแสดงผลคะแนนจากการพูด (จะแสดงอยู่ใต้คำนั้นๆ) +++ */}
                {scoreData && !isRecording && (
                  <div className="ml-[40px] md:ml-[230px] mt-1">
                    <div className={`flex items-center gap-3 w-fit px-3 py-1.5 rounded-lg border text-sm font-medium animate-fade-in ${getScoreColor(scoreData.score)}`}>
                      <div className="font-bold text-lg">{scoreData.score}%</div>
                      <div className="border-l pl-3 border-current/20 opacity-80 flex flex-col leading-tight">
                        <span>ระบบได้ยิน: "{scoreData.transcript}"</span>
                        <span className="text-[11px] opacity-75 font-sans tracking-wide">({scoreData.transcriptPinyin})</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* +++++++++++++++++++++++++++++++++++++++++++++++++ */}
              </div>
            );
          })}
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