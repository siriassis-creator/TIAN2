// src/components/Other_lesson1-3.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones } from 'lucide-react';

export interface PhoneticSection {
  no: string;
  titleZh: string;
  titleEn: string;
  imageUrl: string;
}

export interface OtherLesson1_3Data {
  id?: string;
  patternType: 'other_lesson1-3';
  titleZh: string;
  audioTrack: string;
  audioUrl: string;
  phonetics: PhoneticSection[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson1_3Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherLesson1_3({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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

  // ระบบแยกข้อความหัวข้ออัตโนมัติ
  const titleText = data.titleZh || '三 语音 Yǔyīn Phonetics';
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
        <div className="flex flex-wrap items-center gap-4 mb-12 pl-4">
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
            <span className="font-bold text-xs ml-1 tracking-wide">{data.audioTrack || '01-3'}</span>
          </button>

          <div className="bg-amber-400 text-white p-2 rounded-full shadow-sm shrink-0">
            <Headphones size={22} />
          </div>
        </div>

        {/* 2. Content Section (Phonetics Topics + Images) */}
        <div className="w-full space-y-12 pl-4 md:pl-10">
          {(data.phonetics || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-5">
              
              {/* หัวข้อย่อย + ตัวเลขวงกลม */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-600 font-bold font-serif text-xl shadow-inner pb-0.5 shrink-0">
                  {item.no}
                </div>
                <div className="text-[26px] font-serif text-slate-800 tracking-wide">
                  {item.titleZh}
                </div>
                <div className="text-[22px] font-sans text-slate-500 tracking-wide mt-1">
                  {item.titleEn}
                </div>
              </div>
              
              {/* รูปภาพตารางสัทอักษร */}
              {item.imageUrl && (
                <div className="pl-[48px]">
                  {/* +++ เปลี่ยนเป็น max-w-full w-auto ไม่บังคับขยายให้เต็ม เพื่อให้ภาพชัดเจนตามต้นฉบับ +++ */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.titleZh} 
                    className="max-w-full w-auto max-h-[500px] object-contain rounded-md" 
                  />
                  {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                </div>
              )}
            </div>
          ))}
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