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

export interface Pattern1Data {
  sectionNumber: string;
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
    type: string;
    meaning: string;
  }[];
}

interface Props {
  data: Pattern1Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function LessonPattern1({ data, onUpdateNote }: Props) {
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
        // เช็คว่าถ้าเล่นจบไปแล้ว (currentTime == duration) ให้เริ่มจาก 0 ใหม่
        if (audioRef.current.currentTime === audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsLoading(true);
      const audio = new Audio(data.audioUrl);

      // บังคับไม่ให้เล่นวนซ้ำ (Loop) เด็ดขาด
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
        // เมื่อเล่นจบ 1 รอบ ให้หยุดการเล่นและรีเซ็ตค่ากลับเป็นเริ่มต้น
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
        } max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 font-sans relative overflow-hidden`}
      >
        <div className="flex items-center justify-between border-b-[3px] border-slate-300 pb-2 mb-6">
          <div className="flex items-center">
            <div className="bg-slate-400 text-white font-bold text-xl px-4 py-1 mr-4 rounded">
              {data.sectionNumber}
            </div>

            <button
              onClick={toggleAudio}
              disabled={isLoading}
              className={`flex items-center transition-colors group ${
                isPlaying || progress > 0
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <div className="relative w-6 h-6 mr-2 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200">
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            <StickyNote size={14} />
            {isNoteOpen ? 'ปิดโน้ต' : 'อาจารย์ Note'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 flex flex-col gap-6 pt-4">
            {data.dialogues.map((dialogue, index) => (
              <div key={index} className="flex items-start group">
                <span className="text-2xl font-serif mr-3 mt-6 text-slate-400">
                  {dialogue.speaker}:
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-indigo-500 font-medium mb-1">
                    {dialogue.pinyin}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-serif tracking-widest text-slate-800 whitespace-nowrap">
                      {dialogue.chinese}
                    </span>
                    <button
                      onClick={() => speakChinese(dialogue.chinese)}
                      className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"
                      title="ฟังเสียงอ่าน"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-5 flex justify-center items-start pt-2">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="Content"
                className="w-full max-w-sm rounded-lg object-cover shadow-md"
              />
            ) : (
              <div className="w-full h-48 bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-lg italic text-sm">
                Waiting for Image
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex flex-col gap-8 border-l border-slate-100 pl-6 md:pl-8">
            <div>
              <h3 className="italic text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                English Version
              </h3>
              <div className="flex flex-col gap-3">
                {data.dialogues.map((dialogue, index) => (
                  <div key={index} className="flex text-sm leading-relaxed">
                    <span className="font-bold mr-2 text-indigo-400">
                      {dialogue.speaker}:
                    </span>
                    <span className="text-slate-600">{dialogue.english}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="italic text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                New Words
              </h3>
              <div className="flex flex-col gap-5">
                {data.newWords.map((word, index) => (
                  <div key={index} className="flex items-start group">
                    <span className="text-slate-300 text-xs font-bold mt-1.5 mr-3 w-4">
                      {word.no || index + 1}.
                    </span>
                    <div className="flex flex-col shrink-0 mr-4">
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
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-indigo-600 font-bold text-sm">
                          {word.pinyin}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 rounded">
                          {word.type}
                        </span>
                      </div>
                      <span className="text-slate-500 text-sm leading-tight">
                        {word.meaning}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
