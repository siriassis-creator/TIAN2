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

export interface Table3ColRow {
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface Pattern3ColTableData {
  sectionNumber?: string;
  audioTrack: string;
  audioUrl: string;
  rows: Table3ColRow[];
  teacherNote?: string;
}

interface Props {
  data: Pattern3ColTableData;
  onUpdateNote?: (newNote: string) => void;
}

export default function Pattern3ColTable({ data, onUpdateNote }: Props) {
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
      <div className="bg-white/90 p-6 md:p-8 rounded-r-2xl rounded-l-md shadow-sm border border-slate-100 border-l-[12px] border-l-slate-400 flex-1 relative overflow-hidden z-[1]">
        <div className="flex items-center justify-between mb-6">
          {/* --- จัด Layout ปุ่มไฟล์เสียงใหม่ --- */}
          <button
            onClick={toggleAudio}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 rounded-full border transition-all group ${
              isPlaying || progress > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-indigo-600'
            }`}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <div className="relative w-5 h-5 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 mr-2 shrink-0">
                <div
                  className="absolute inset-0 transition-all duration-75"
                  style={{
                    background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}%)`,
                  }}
                />
                <div
                  className={`relative w-2 h-2 bg-white rounded-full shadow-sm ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                ></div>
              </div>
            )}

            <span className="font-bold text-sm tracking-wide mr-1">
              {data.audioTrack || 'Track'}
            </span>

            {/* ไอคอน Play/Pause */}
            {isPlaying ? (
              <PauseCircle className="w-4 h-4 ml-1 shrink-0" />
            ) : (
              <PlayCircle className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
          </button>
          {/* ---------------------------------- */}

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

        <div className="w-full max-w-4xl mx-auto px-4 md:px-12 mt-4 pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 px-2 text-slate-400 font-bold tracking-wide uppercase text-sm w-1/3">
                  คำจีน
                </th>
                <th className="py-3 px-2 text-slate-400 font-bold tracking-wide uppercase text-sm w-1/3">
                  Pinyin
                </th>
                <th className="py-3 px-2 text-slate-400 font-bold tracking-wide uppercase text-sm w-1/3">
                  คำแปล
                </th>
              </tr>
            </thead>
            <tbody>
              {(data.rows || []).map((row: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-2">
                    <div
                      onClick={() => speakWord(row.chinese)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-3xl font-serif text-slate-700">
                        {row.chinese}
                      </span>
                      <Volume2
                        size={16}
                        className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-indigo-500 transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-2 text-[22px] text-slate-500 tracking-wide">
                    {row.pinyin}
                  </td>
                  <td className="py-4 px-2 text-xl text-slate-600 font-serif">
                    {row.translation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
