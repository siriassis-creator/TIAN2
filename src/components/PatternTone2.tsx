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

export interface Tone2Data {
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  introTextZh: string;
  introTextEn: string;
  audioTrack: string;
  audioUrl: string;
  teacherNote?: string;
  examples: { pinyin: string; chinese: string; translation: string }[];
  syllables: string[][];
}

interface Props {
  data: Tone2Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternTone2({ data, onUpdateNote }: Props) {
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

  const speakPinyin = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.6;
      window.speechSynthesis.speak(utterance);
    }
  };

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

  const ToneGraph = ({ tone }: { tone: number }) => {
    const lines = [5, 4, 3, 2, 1];
    return (
      <div className="relative w-24 h-20 bg-slate-50 rounded border border-slate-100 mb-4 p-1">
        <div className="absolute inset-0 flex flex-col justify-between py-1 px-2">
          {lines.map((l) => (
            <div
              key={l}
              className="w-full border-t border-slate-200 flex justify-between items-center h-0"
            >
              <span className="text-[8px] text-slate-400">{l}</span>
            </div>
          ))}
        </div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
          {tone === 1 && (
            <path
              d="M 20 20 L 80 20"
              stroke="#6366f1"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {tone === 2 && (
            <path
              d="M 20 50 L 80 20"
              stroke="#6366f1"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {tone === 3 && (
            <path
              d="M 20 35 L 50 65 L 80 25"
              stroke="#6366f1"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {tone === 4 && (
            <path
              d="M 20 20 L 80 65"
              stroke="#6366f1"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {tone === 1 && <circle cx="80" cy="20" r="2" fill="#6366f1" />}
          {tone === 2 && <circle cx="80" cy="20" r="2" fill="#6366f1" />}
          {tone === 3 && <circle cx="80" cy="25" r="2" fill="#6366f1" />}
          {tone === 4 && <circle cx="80" cy="65" r="2" fill="#6366f1" />}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/50 p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 text-white font-bold px-3 py-1 rounded text-lg">
              {data.sectionNumber}
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-slate-700 leading-tight">
                {data.titleZh}
              </h2>
              <p className="text-slate-400 italic text-xs">{data.titleEn}</p>
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

        {/* ส่วนที่ 1: เนื้อหา Text ปกติ */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <p className="text-lg text-slate-700 mb-2 leading-relaxed">
            {data.introTextZh}
          </p>
          <p className="text-sm text-slate-500 italic leading-relaxed">
            {data.introTextEn}
          </p>
        </div>

        {/* ส่วนที่ 2: ตัวอย่างการอ่าน */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {data.examples.map((ex, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group"
            >
              <ToneGraph tone={i + 1} />
              <span className="text-indigo-600 font-bold text-lg mb-1">
                {ex.pinyin}
              </span>
              <span className="text-3xl font-serif text-slate-800 mb-2">
                {ex.chinese}
              </span>
              <span className="text-xs text-slate-400 italic">
                {ex.translation}
              </span>
              <button
                onClick={() => speakPinyin(ex.pinyin)}
                className="mt-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-500 transition-all"
              >
                <Volume2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* ส่วนที่ 3: Read the syllables (ย้ายปุ่มเสียงมาชิดซ้าย) */}
        <div className="bg-slate-50/40 rounded-2xl p-6 md:p-8 border border-slate-100">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800 leading-none">
                朗读下列音节，注意声调的不同
              </h3>

              {/* --- อัปเกรดปุ่มเล่นเสียง ตรงนี้เลยครับ --- */}
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
            </div>

            <p className="text-sm text-slate-500 italic">
              Read the syllables aloud and pay attention to the tones.
            </p>
          </div>

          <div className="grid gap-y-4 max-w-md mx-auto">
            {data.syllables.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-4 gap-4">
                {row.map((item, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => speakPinyin(item)}
                    className="py-2 text-2xl font-medium text-slate-700 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
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
        <div className="flex items-center justify-between mb-4 shrink-0">
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
            if (onUpdateNote) onUpdateNote(tempNote);
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
