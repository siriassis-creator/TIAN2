import React, { useState, useRef, useEffect } from 'react';
import {
  PlayCircle,
  PauseCircle,
  Loader2,
  Volume2,
  StickyNote,
  X,
  Save,
} from 'lucide-react';

export interface PatternDialog2Data {
  sectionNumber: string;
  titleZh?: string;
  titleEn?: string;
  audioTrack: string;
  audioUrl: string;
  imageUrl: string;
  teacherNote?: string;
  dialogues: {
    speaker: string;
    pinyin: string;
    chinese: string;
    english: string;
  }[];
  newWords: {
    no: number;
    character: string;
    pinyin: string;
    type?: string;
    meaning: string;
  }[];
  properNouns?: {
    no: number;
    character: string;
    pinyin: string;
    meaning: string;
  }[];
}

interface Props {
  data: PatternDialog2Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternDialog2({ data, onUpdateNote }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

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

  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบอ่านออกเสียง');
    }
  };

  const toggleAudio = () => {
    if (!data.audioUrl) {
      alert('กรุณาระบุ URL ไฟล์เสียงในหน้าตั้งค่า');
      return;
    }

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

      // --- ส่วนที่เพิ่มเข้ามา: ฟังก์ชันแปลงลิงก์ Dropbox ให้เล่นเสียงได้ทันที ---
      const formatAudioUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('dropbox.com')) {
          return url
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace('dl=0', 'dl=1');
        }
        return url;
      };

      const directUrl = formatAudioUrl(data.audioUrl);
      const audio = new Audio(directUrl);
      // --------------------------------------------------------

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

  return (
    <div className="relative flex w-full gap-4 my-6 group">
      <div
        className={`transition-all duration-500 ease-in-out ${
          isNoteOpen ? 'w-[70%]' : 'w-full'
        } max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 font-sans relative overflow-hidden`}
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-8">
          <div className="flex items-center flex-wrap gap-y-2">
            <div className="bg-slate-400 text-white font-bold text-xl px-4 py-1 mr-4 rounded shadow-sm">
              {data.sectionNumber}
            </div>

            {data.titleZh && (
              <h2 className="text-xl font-bold text-slate-600 tracking-wide mr-3">
                {data.titleZh}
              </h2>
            )}
            {data.titleEn && (
              <h2 className="text-xl font-bold text-slate-300 italic mr-6">
                {data.titleEn}
              </h2>
            )}

            <button
              onClick={toggleAudio}
              disabled={isLoading}
              className={`flex items-center transition-colors group ${
                isPlaying || progress > 0
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <div className="relative w-6 h-6 mr-2 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 bg-slate-50">
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
              <span className="italic text-lg tracking-wider font-medium">
                {data.audioTrack || 'Track'}
              </span>
              {isPlaying ? (
                <PauseCircle className="w-5 h-5 ml-2" />
              ) : (
                <PlayCircle className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shrink-0 ml-4 ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            <StickyNote size={14} />
            {isNoteOpen ? 'ปิดโน้ต' : 'อาจารย์ Note'}
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* --- TOP SECTION: Dialogues (Left) & Image (Right) --- */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Dialogues */}
            <div className="flex-1 flex flex-col gap-6 pt-2">
              {data.dialogues.map((dialogue, index) => (
                <div key={index} className="flex items-start group">
                  <span className="text-2xl font-serif mr-4 mt-6 text-slate-400 shrink-0">
                    {dialogue.speaker}:
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[15px] text-indigo-500 font-medium mb-1 tracking-wide">
                      {dialogue.pinyin}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[32px] font-serif tracking-widest text-slate-800 leading-tight">
                        {dialogue.chinese}
                      </span>
                      <button
                        onClick={() => speakChinese(dialogue.chinese)}
                        className="p-1 text-slate-300 hover:text-indigo-500 transition-colors shrink-0"
                        title="ฟังเสียงอ่าน"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            <div className="w-full md:w-2/5 shrink-0 flex justify-end">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt="Content"
                  className="w-full h-auto max-w-[320px] rounded-lg object-cover shadow-sm border border-slate-100"
                />
              ) : (
                <div className="w-full h-48 max-w-[320px] bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-lg italic text-sm">
                  Waiting for Image
                </div>
              )}
            </div>
          </div>

          {/* --- DIVIDER --- */}
          <hr className="border-t-2 border-dashed border-slate-200 my-2" />

          {/* --- BOTTOM SECTION: English (Left) & Vocab (Right) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* English Version */}
            <div>
              <h3 className="italic text-slate-400 font-bold text-sm mb-5">
                English Version
              </h3>
              <div className="flex flex-col gap-3">
                {data.dialogues.map((dialogue, index) => (
                  <div key={index} className="flex text-[15px] leading-relaxed">
                    <span className="font-bold mr-2 text-slate-400 shrink-0">
                      {dialogue.speaker}:
                    </span>
                    <span className="text-slate-600">{dialogue.english}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabularies */}
            <div className="flex flex-col gap-8">
              {/* New Words */}
              <div>
                <h3 className="italic text-slate-400 font-bold text-sm mb-5">
                  New Word
                </h3>
                <div className="flex flex-col gap-5">
                  {data.newWords.map((word, index) => (
                    <div key={index} className="flex items-start group">
                      <span className="text-slate-300 text-sm font-bold mt-1.5 mr-3 w-4 shrink-0 text-right">
                        {word.no || index + 1}.
                      </span>
                      <div className="flex flex-col shrink-0 mr-5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-serif text-slate-800 whitespace-nowrap leading-none">
                            {word.character}
                          </span>
                          <button
                            onClick={() => speakChinese(word.character)}
                            className="text-slate-300 hover:text-indigo-500 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <span className="text-indigo-600 font-bold text-[15px]">
                            {word.pinyin}
                          </span>
                          {word.type && (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                              {word.type}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[15px] leading-tight">
                          {word.meaning}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proper Nouns */}
              {data.properNouns && data.properNouns.length > 0 && (
                <div>
                  <h3 className="italic text-slate-400 font-bold text-sm mb-5">
                    Proper Nouns
                  </h3>
                  <div className="flex flex-col gap-5">
                    {data.properNouns.map((word, index) => (
                      <div key={index} className="flex items-start group">
                        <span className="text-slate-300 text-sm font-bold mt-1.5 mr-3 w-4 shrink-0 text-right">
                          {word.no || index + 1}.
                        </span>
                        <div className="flex flex-col shrink-0 mr-5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-serif text-slate-800 whitespace-nowrap leading-none">
                              {word.character}
                            </span>
                            <button
                              onClick={() => speakChinese(word.character)}
                              className="text-slate-300 hover:text-indigo-500 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                            <span className="text-indigo-600 font-bold text-[15px]">
                              {word.pinyin}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[15px] leading-tight">
                            {word.meaning}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Teacher Note Sidebar --- */}
      <div
        className={`fixed top-0 right-0 h-screen bg-amber-50/95 backdrop-blur-md shadow-2xl border-l-4 border-amber-400 transition-all duration-500 ease-in-out z-[1000] p-6 flex flex-col ${
          isNoteOpen
            ? 'translate-x-0 w-[350px]'
            : 'translate-x-full w-0 invisible'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <StickyNote size={20} />
            <span className="text-lg uppercase">Teacher's Note</span>
          </div>
          <button
            onClick={() => setIsNoteOpen(false)}
            className="text-amber-400 hover:text-amber-700 p-1 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <textarea
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
          placeholder="จดบันทึกเทคนิคการสอน หรือโน้ตส่วนตัวที่นี่..."
          className="flex-1 w-full bg-white border-2 border-amber-200 rounded-xl p-4 text-amber-900 focus:outline-none focus:border-amber-400 transition-colors resize-none shadow-inner"
        />
        <button
          onClick={() => {
            if (onUpdateNote) onUpdateNote(tempNote);
            alert(
              'อัปเดตโน้ตแล้ว (อย่าลืมกด Save Cloud ที่หน้าหลักเพื่อบันทึกถาวร)'
            );
          }}
          className="mt-6 w-full bg-amber-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-95"
        >
          <Save size={18} /> บันทึกโน้ตหัวข้อนี้
        </button>
      </div>
    </div>
  );
}
