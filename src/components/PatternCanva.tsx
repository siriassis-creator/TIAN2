import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  ChevronDown,
  Pause,
  Play,
  Maximize,
  Minimize,
} from 'lucide-react';

export default function PatternCanva({ data }: { data: any }) {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null); // อ้างอิงพื้นที่ทั้งหมด (ปุ่ม + Canva)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ฟังก์ชันสลับโหมด Full Screen ของแอปเรา
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleAudio = () => {
    const rawUrl = data.audioUrls?.[activeSlide];
    if (!rawUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(
      rawUrl
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('dl=0', 'dl=1')
    );
    audioRef.current = audio;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => console.error(e));
    audio.onended = () => setIsPlaying(false);
  };

  return (
    <div
      ref={containerRef}
      className={`font-sans transition-all ${
        isFullScreen
          ? 'bg-white p-10 h-screen w-screen overflow-auto'
          : 'my-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'
      }`}
    >
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullScreen}
            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-all"
            title="Full Screen ทั้งระบบ"
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
            Interactive Lesson
          </span>
        </div>

        {/* --- Dropdown & Play/Pause (ปุ่มนี้จะยังอยู่แม้ขยายจอ) --- */}
        {data.audioUrls && (
          <div className="flex items-center gap-2">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 py-2 px-4 rounded-xl text-xs font-bold focus:outline-none"
              value={activeSlide}
              onChange={(e) => setActiveSlide(Number(e.target.value))}
            >
              {data.audioUrls.map(
                (url: string, idx: number) =>
                  url && (
                    <option key={idx} value={idx}>
                      Slide {idx + 1} Audio
                    </option>
                  )
              )}
            </select>

            <button
              onClick={toggleAudio}
              className={`${
                isPlaying ? 'bg-rose-500' : 'bg-indigo-600'
              } text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg transition-all`}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
          </div>
        )}
      </div>

      {/* ส่วนแสดง Canva */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200"
        style={{
          height: isFullScreen ? 'calc(100vh - 150px)' : data.height || '550px',
        }}
      >
        <iframe
          loading="lazy"
          src={data.canvaUrl}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay"
        />
      </div>
    </div>
  );
}
