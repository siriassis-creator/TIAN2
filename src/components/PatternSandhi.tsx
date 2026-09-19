import React, { useState, useRef, useEffect } from 'react';
import {
  Disc,
  Loader2,
  StickyNote,
  X,
  Save,
  Volume2,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';

export interface SandhiRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

export interface PatternSandhiData {
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  introTextZh: string;
  introTextEn: string;
  footerTextZh: string;
  footerTextEn: string;
  audioTrack: string;
  audioUrl: string;
  rows: SandhiRow[];
  practiceWords?: string[]; // เพิ่มฟิลด์สำหรับคำศัพท์ 4 คอลัมน์ด้านล่าง
  teacherNote?: string;
}

interface Props {
  data: PatternSandhiData;
  onUpdateNote?: (newNote: string) => void;
}

// วาดรูปสัญลักษณ์วรรณยุกต์ (เสียง 3 และ เสียง 2)
const Tone3Icon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-slate-400"
  >
    <path d="M4 6 L12 18 L20 6" />
  </svg>
);

const Tone2Icon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-slate-400"
  >
    <path d="M4 18 L20 6" />
  </svg>
);

export default function PatternSandhi({ data, onUpdateNote }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // --- State และ Ref สำหรับระบบ Audio ใหม่ ---
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [data.audioUrl]);

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
      setIsLoading(true);
      const audio = new Audio(data.audioUrl);
      audio.loop = false;
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsLoading(false);
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
        setIsLoading(false);
        setIsPlaying(false);
        audioRef.current = null;
        alert('ไม่สามารถโหลดไฟล์เสียงได้ กรุณาตรวจสอบ URL');
      };

      audio.load();
    }
  };

  const speakWord = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/90 p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* ================= ส่วนที่ 1: หัวข้อหลัก ================= */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-400 text-white font-bold px-4 py-1.5 rounded text-xl">
              {data.sectionNumber}
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-2xl font-bold text-slate-600 leading-none tracking-wide">
                {data.titleZh}
              </h2>
              <p className="text-slate-400 text-lg">{data.titleEn}</p>
            </div>
          </div>
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-1.5 rounded transition-all ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-300 hover:text-amber-50'
            }`}
          >
            <StickyNote size={22} />
          </button>
        </div>

        {/* ================= ส่วนที่ 2: คำอธิบาย (Intro) ================= */}
        <div className="mb-8 px-2">
          <p className="text-lg text-slate-700 mb-4 leading-relaxed text-left font-serif indent-8">
            {data.introTextZh}
          </p>
          <p className="text-[15px] text-slate-500 leading-relaxed text-left indent-8">
            {data.introTextEn}
          </p>
        </div>

        {/* ================= ส่วนที่ 3: ตารางกฎการเปลี่ยนเสียง (ตารางบน) ================= */}
        <div className="border-[1.5px] border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden mb-16 max-w-4xl mx-auto">
          {/* Header Row (สัญลักษณ์) */}
          <div className="flex items-center border-b-[1.5px] border-slate-100 py-6 bg-slate-50/50 relative">
            <div className="flex-1 flex justify-center items-center gap-8 border-r-[1.5px] border-slate-100">
              <Tone3Icon />
              <span className="text-slate-300 font-bold text-2xl">+</span>
              <Tone3Icon />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50/50 px-3 text-slate-400 text-xl font-bold">
              ➔
            </div>
            <div className="flex-1 flex justify-center items-center gap-8">
              <Tone2Icon />
              <span className="text-slate-300 font-bold text-2xl">+</span>
              <Tone3Icon />
            </div>
          </div>

          {/* Data Rows (คำศัพท์) */}
          <div className="flex flex-col">
            {(data.rows || []).map((row, i) => (
              <div
                key={i}
                className="flex items-center border-b border-slate-50 last:border-b-0 py-5 hover:bg-slate-50/50 transition-colors"
              >
                {/* ฝั่งซ้าย (ก่อนเปลี่ยน) */}
                <div className="flex-1 flex justify-center items-center border-r-[1.5px] border-slate-100">
                  <div
                    className="w-1/2 text-center font-serif text-[22px] text-slate-600 cursor-pointer hover:text-indigo-500"
                    onClick={() => speakWord(row.col1)}
                  >
                    {row.col1}
                  </div>
                  <div
                    className="w-1/2 text-center font-serif text-[22px] text-slate-600 cursor-pointer hover:text-indigo-500"
                    onClick={() => speakWord(row.col2)}
                  >
                    {row.col2}
                  </div>
                </div>
                {/* ฝั่งขวา (หลังเปลี่ยน) */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-1/2 text-center font-sans text-xl text-indigo-400 font-medium tracking-wide">
                    {row.col3}
                  </div>
                  <div className="w-1/2 text-center font-sans text-xl text-slate-500 tracking-wide">
                    {row.col4}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ส่วนที่ 4: แบบฝึกหัดศัพท์ (ตารางล่าง) ================= */}
        <div className="border-t-[3px] border-slate-100 pt-10 px-2 mt-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center flex-wrap gap-x-4 gap-y-3">
              <h3 className="text-xl font-bold text-slate-700 leading-none">
                {data.footerTextZh}
              </h3>

              {/* --- ปุ่มไฟล์เสียง --- */}
              <button
                onClick={toggleAudio}
                disabled={isLoading}
                className={`flex items-center px-4 py-1.5 rounded-full border transition-all group ${
                  isPlaying || progress > 0
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-indigo-600'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <div className="relative w-4 h-4 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 mr-2 shrink-0">
                    <div
                      className="absolute inset-0 transition-all duration-75"
                      style={{
                        background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}%)`,
                      }}
                    />
                    <div
                      className={`relative w-1.5 h-1.5 bg-white rounded-full shadow-sm ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                    ></div>
                  </div>
                )}
                <span className="font-bold text-xs tracking-wide mr-1">
                  {data.audioTrack || 'Track'}
                </span>
                {isPlaying ? (
                  <PauseCircle className="w-4 h-4 ml-1 shrink-0" />
                ) : (
                  <PlayCircle className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </button>
            </div>
            <p className="text-[15px] text-slate-500 text-left mb-6">
              {data.footerTextEn}
            </p>
          </div>

          {/* Grid คำศัพท์ 4 คอลัมน์ */}
          {data.practiceWords && data.practiceWords.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
              {data.practiceWords.map((word, i) => (
                <div
                  key={i}
                  onClick={() => speakWord(word)}
                  className="flex items-center gap-2 text-xl text-slate-600 hover:text-indigo-500 cursor-pointer group transition-colors px-2"
                >
                  <span className="tracking-wide">{word}</span>
                  {word && (
                    <Volume2
                      size={14}
                      className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-300 italic text-center py-4">
              (กำลังรอเพิ่มคำศัพท์แบบฝึกหัด)
            </div>
          )}
        </div>
      </div>

      {/* Note Sidebar */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen
            ? 'w-[280px] opacity-100 px-4 py-6'
            : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 shrink-0 text-left">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Note
          </span>
          <button
            onClick={() => setIsNoteOpen(false)}
            className="text-amber-300 hover:text-amber-600"
          >
            <X size={16} />
          </button>
        </div>
        <textarea
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
          placeholder="จดบันทึก..."
          className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4"
        />
        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved');
          }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm"
        >
          SAVE NOTE
        </button>
      </div>
    </div>
  );
}
