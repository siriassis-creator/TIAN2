import React, { useState, useRef, useEffect } from 'react';
import {
  Disc,
  Volume2,
  StickyNote,
  X,
  Save,
  PlayCircle,
  PauseCircle,
  Loader2,
} from 'lucide-react';

export interface TonesData {
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  audioTrack: string;
  audioUrl: string;
  teacherNote?: string;
  initials: string[];
  finals: string[];
}

interface Props {
  data: TonesData;
  onUpdateNote?: (newNote: string) => void;
}

export default function LessonTones({ data, onUpdateNote }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // State สำหรับเก็บเปอร์เซ็นต์ความคืบหน้าของเสียง
  const [progress, setProgress] = useState(0);

  // ใช้ useRef เก็บ object ของไฟล์เสียง
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // เคลียร์ไฟล์เสียงเมื่อปิดหน้านี้ หรือเปลี่ยน URL
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

  const speakPinyin = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let voiceText = text.toLowerCase();
      const pinyinMap: { [key: string]: string } = {
        b: 'bo',
        p: 'po',
        m: 'mo',
        f: 'fo',
        d: 'de',
        t: 'te',
        n: 'ne',
        l: 'le',
        g: 'ge',
        k: 'ke',
        h: 'he',
        j: 'ji',
        q: 'qi',
        x: 'xi',
      };
      const utterance = new SpeechSynthesisUtterance(
        pinyinMap[voiceText] || voiceText
      );
      utterance.lang = 'zh-CN';
      utterance.rate = 0.65;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAudio = () => {
    if (!data.audioUrl) {
      alert('กรุณาระบุ URL ไฟล์เสียง');
      return;
    }

    if (audioRef.current) {
      // ถ้ามีไฟล์เสียงโหลดไว้อยู่แล้ว
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // เช็คว่าถ้าเล่นจบไปแล้วให้เริ่มใหม่
        if (audioRef.current.currentTime === audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // ถ้ายังไม่เคยโหลดไฟล์
      setIsLoading(true);
      const audio = new Audio(data.audioUrl);

      // บังคับไม่ให้เล่นวนซ้ำ
      audio.loop = false;
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsLoading(false);
        audio.play();
        setIsPlaying(true);
      };

      // อัปเดต Progress Bar
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      // เมื่อเล่นจบ 1 รอบ
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

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      {/* ส่วนเนื้อหาหลัก */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden">
        {/* Header แบบเรียบง่าย */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 text-white font-bold px-2 py-0.5 rounded text-sm">
              {data.sectionNumber}
            </div>
            <h2 className="text-lg font-bold text-slate-700">{data.titleZh}</h2>
            <span className="text-slate-400 italic text-xs hidden sm:block">
              {data.titleEn}
            </span>

            {/* ปุ่ม Play/Pause แบบใหม่ พร้อม Progress Bar วงกลม (ขนาดย่อส่วนให้เข้ากับ Tones) */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all group ${
                isPlaying || progress > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-indigo-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <div className="relative w-3.5 h-3.5 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200">
                  <div
                    className="absolute inset-0 transition-all duration-75"
                    style={{
                      background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}%)`,
                    }}
                  />
                  {/* รูกลางแผ่นดิสก์จำลอง */}
                  <div
                    className={`relative w-1.5 h-1.5 bg-white rounded-full shadow-sm ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                  ></div>
                </div>
              )}

              <span className="font-bold">{data.audioTrack || 'Track'}</span>

              {/* --- ไอคอน Play และ Pause --- */}
              {isPlaying ? (
                <PauseCircle className="w-4 h-4 ml-1" />
              ) : (
                <PlayCircle className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-1.5 rounded transition-all ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-300 hover:text-amber-500'
            }`}
          >
            <StickyNote size={20} />
          </button>
        </div>

        {/* ตารางแบบไม่มีเส้น (No Borders) และช่องว่างแคบ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* Initials */}
          <div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 pl-4">
              Initials (1)
            </div>
            <div className="grid grid-cols-4 gap-y-1">
              {data.initials.map((char, i) => (
                <div
                  key={i}
                  onClick={() => speakPinyin(char)}
                  className="flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-slate-50 rounded-md group"
                >
                  <span className="text-2xl font-serif text-slate-700 leading-none">
                    {char}
                  </span>
                  <Volume2 className="w-2.5 h-2.5 text-slate-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Finals */}
          <div className="border-l border-slate-50 md:pl-8">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 pl-4 mt-6 md:mt-0">
              Finals (1)
            </div>
            <div className="grid grid-cols-4 gap-y-1">
              {data.finals.map((char, i) => (
                <div
                  key={i}
                  onClick={() => speakPinyin(char)}
                  className="flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-slate-50 rounded-md group"
                >
                  <span className="text-2xl font-serif text-slate-700 leading-none">
                    {char}
                  </span>
                  <Volume2 className="w-2.5 h-2.5 text-slate-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* แถบจดโน้ต (Compact Sidebar) */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50/50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen
            ? 'w-[260px] opacity-100 px-3 py-4'
            : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
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
          placeholder="จด..."
          className="flex-1 w-full bg-white/80 rounded-lg p-2 text-xs text-amber-900 focus:outline-none border border-amber-50 resize-none mb-3"
        />

        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved');
          }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all"
        >
          SAVE NOTE
        </button>
      </div>
    </div>
  );
}
