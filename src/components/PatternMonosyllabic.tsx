import React, { useState, useRef, useEffect } from 'react';
import {
  Disc,
  PlayCircle,
  PauseCircle,
  Loader2,
  StickyNote,
  X,
  Volume2,
} from 'lucide-react';

export interface MonosyllabicWord {
  imageUrl: string;
  pinyin: string;
}

export interface PatternMonosyllabicData {
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  audioTrack: string;
  audioUrl: string;
  words: MonosyllabicWord[];
  teacherNote?: string;
}

interface Props {
  data: PatternMonosyllabicData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternMonosyllabic({ data, onUpdateNote }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // --- State และ Ref สำหรับระบบ Audio ใหม่ ---
  const [progress, setProgress] = useState(0);
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
      <div className="bg-white/50 p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* ส่วนที่ 1: หัวข้อและ URL เสียง (จัดชิดซ้าย) */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 text-white font-bold px-3 py-1 rounded text-lg">
              {data.sectionNumber}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-700 leading-none">
                  {data.titleZh}
                </h2>

                {/* --- อัปเกรดปุ่มไฟล์เสียง --- */}
                <button
                  onClick={toggleAudio}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all group ${
                    isPlaying || progress > 0
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-indigo-600'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <div className="relative w-4 h-4 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 shrink-0">
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

                  <span className="font-bold text-xs ml-1">
                    {data.audioTrack || 'Track'}
                  </span>

                  {/* ไอคอน Play/Pause */}
                  {isPlaying ? (
                    <PauseCircle className="w-4 h-4 ml-0.5 shrink-0" />
                  ) : (
                    <PlayCircle className="w-4 h-4 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </button>
              </div>
              <p className="text-slate-400 italic text-sm text-left">
                {data.titleEn}
              </p>
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

        {/* ส่วนที่ 2: รูปภาพบรรทัดละ 4 รูป (อัปเกรดเป็น 3D Flip Card พลิกได้ พร้อมรูปจางๆ) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.words.map((item, idx) => (
            <div
              key={idx}
              onClick={() => speakWord(item.pinyin)}
              className="flex flex-col items-center group cursor-pointer"
            >
              {/* กล่อง 3D Container สำหรับการพลิก (คงขนาด w-1/2 ของเดิมไว้) */}
              <div className="w-1/2 aspect-square rounded-xl perspective-[1000px] bg-transparent">
                <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm group-hover:shadow-lg rounded-xl">
                  {/* ด้านหน้า (Front): โชว์รูปภาพ */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden border border-slate-200 bg-white">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.pinyin}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* ด้านหลัง (Back): โชว์รูปจางๆ + พินอิน + ลำโพง */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-2 border-indigo-200 bg-white flex flex-col items-center justify-center shadow-inner overflow-hidden">
                    {/* รูปภาพพื้นหลังแบบจางๆ */}
                    {item.imageUrl && (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-full h-full object-cover opacity-15 grayscale-[30%]"
                        />
                      </div>
                    )}

                    {/* ข้อความและไอคอน (อยู่ด้านบน z-10) */}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <span className="text-xl text-indigo-600 tracking-wider font-bold drop-shadow-sm">
                        {item.pinyin}
                      </span>
                      <div className="mt-1 bg-indigo-600/90 text-white p-1.5 rounded-full shadow-md animate-pulse backdrop-blur-sm">
                        <Volume2 size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
