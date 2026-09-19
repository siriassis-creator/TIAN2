import React, { useState } from 'react';
import { StickyNote, X, Save } from 'lucide-react';

export interface SingleCharItem {
  chinese: string;
  english: string;
  imageUrl: string;
}

export interface PatternSinglecharacterData {
  sectionNumber?: string;
  titleZh: string;
  titleEn: string;
  rows: SingleCharItem[];
  teacherNote?: string;
}

interface Props {
  data: PatternSinglecharacterData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternSinglecharacter({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/90 p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 flex-1 relative overflow-hidden z-[1]">
        {/* หัวข้อบทเรียน */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {data.sectionNumber && (
              <div className="bg-slate-400 text-white font-bold px-4 py-1.5 rounded text-xl shadow-sm">
                {data.sectionNumber}
              </div>
            )}
            <div className="flex items-baseline gap-4">
              <h2 className="text-2xl font-bold text-slate-700 leading-none tracking-wide">
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

        {/* รายการคำศัพท์ (3 ส่วน: จีน, อังกฤษ, รูปภาพ) */}
        <div className="flex flex-col gap-10 pl-2">
          {(data.rows || []).map((row, i) => (
            <div key={i} className="flex flex-col gap-3">
              {/* 1. ภาษาจีน */}
              {row.chinese && (
                <p className="text-xl text-slate-800 font-serif leading-relaxed tracking-wide">
                  {row.chinese}
                </p>
              )}

              {/* 2. ภาษาอังกฤษ */}
              {row.english && (
                <p className="text-[16px] text-slate-500 leading-relaxed pl-8">
                  {row.english}
                </p>
              )}

              {/* 3. รูปภาพ URL */}
              {row.imageUrl && (
                <div className="mt-2 pl-8">
                  <img
                    src={row.imageUrl}
                    alt="single-character-stroke"
                    className="max-h-24 w-auto object-contain mix-blend-multiply"
                  />
                </div>
              )}
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
          className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4 shadow-inner"
        />
        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved Note');
          }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-sm"
        >
          SAVE NOTE
        </button>
      </div>
    </div>
  );
}
