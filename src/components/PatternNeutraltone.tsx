import React, { useState, useRef, useEffect } from 'react';
import {
  Disc,
  Loader2,
  StickyNote,
  X,
  Volume2,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';

export interface ImageWord {
  imageUrl: string;
  pinyin: string;
  chinese: string;
}

export interface PatternNeutraltoneData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  introTextZh?: string;
  introTextEn?: string;
  imageWords?: ImageWord[];
  footerTextZh?: string;
  footerTextEn?: string;
  audioTrack?: string;
  audioUrl?: string;
  practiceWords?: string[];
  teacherNote?: string;
}

interface Props {
  data: PatternNeutraltoneData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternNeutraltone({ data, onUpdateNote }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // --- ระบบ Audio แบบวงแหวน Progress ---
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
      <div className="bg-white/90 p-8 md:p-10 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* --- หัวข้อหลัก --- */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-baseline gap-4">
            {data.sectionNumber && (
              <div className="bg-slate-400 text-white font-bold px-3 py-1 rounded text-lg">
                {data.sectionNumber}
              </div>
            )}
            {data.titleZh && (
              <h2 className="text-2xl font-bold text-slate-600 tracking-wide">
                {data.titleZh}
              </h2>
            )}
            {data.titleEn && (
              <p className="text-slate-400 text-lg">{data.titleEn}</p>
            )}
          </div>
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-1.5 rounded transition-all shrink-0 ml-4 ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-300 hover:text-amber-50'
            }`}
          >
            <StickyNote size={22} />
          </button>
        </div>

        {/* --- ส่วนที่ 1 & 2: คำอธิบายภาษาจีนและอังกฤษ --- */}
        <div className="mb-10 px-2 space-y-4">
          {data.introTextZh && (
            <p className="text-lg text-slate-700 leading-relaxed text-left font-serif indent-8">
              {data.introTextZh}
            </p>
          )}
          {data.introTextEn && (
            <p className="text-[15px] text-slate-500 leading-relaxed text-left indent-8">
              {data.introTextEn}
            </p>
          )}
        </div>

        {/* --- ส่วนที่ 3: รูปภาพ 4 คอลัมน์ (Flip Card ซ่อนข้อความด้านหลังพร้อมรูปจางๆ) --- */}
        {data.imageWords && data.imageWords.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {data.imageWords.map((item, idx) => (
              <div
                key={idx}
                onClick={() => speakWord(item.chinese || item.pinyin)}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* กล่อง 3D Container สำหรับการพลิก (เปลี่ยนจาก w-full เป็น w-1/2 เพื่อลดขนาด 50%) */}
                <div className="w-1/2 aspect-[4/3] rounded-xl perspective-[1000px] bg-transparent">
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

                    {/* ด้านหลัง (Back): โชว์รูปจางๆ + พินอิน + อักษรจีน + ลำโพง */}
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
                        <span className="text-2xl text-indigo-600 tracking-wider font-bold drop-shadow-sm">
                          {item.pinyin}
                        </span>
                        <span className="text-4xl font-serif text-slate-800 drop-shadow-sm mt-1">
                          {item.chinese}
                        </span>
                        <div className="mt-2 bg-indigo-600/90 text-white p-2 rounded-full shadow-md animate-pulse backdrop-blur-sm">
                          <Volume2 size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- ส่วนที่ 4, 5, 6: แบบฝึกหัด ข้อความจีน/อังกฤษ พร้อมปุ่มเสียง --- */}
        <div className="border-t-[3px] border-slate-100 pt-8 px-2">
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center flex-wrap gap-x-4 gap-y-3">
              {data.footerTextZh && (
                <h3 className="text-xl text-slate-700 font-medium">
                  {data.footerTextZh}
                </h3>
              )}

              {/* ปุ่มไฟล์เสียง */}
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

            {data.footerTextEn && (
              <p className="text-[15px] text-slate-500 text-left">
                {data.footerTextEn}
              </p>
            )}
          </div>

          {/* --- ส่วนที่ 7: ตารางคำศัพท์แถวละ 4 คำ --- */}
          {data.practiceWords && data.practiceWords.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4">
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
          )}
        </div>
      </div>

      {/* --- Note Sidebar --- */}
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
