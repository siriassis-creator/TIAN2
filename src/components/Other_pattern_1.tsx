// src/components/Other_pattern_1.tsx
import React, { useState } from 'react';
import { StickyNote, X } from 'lucide-react';

export interface OtherPattern1Data {
  id?: string;
  patternType: 'other_pattern_1';
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  content: string; // เนื้อหาทั่วไป
  teacherNote?: string;
}

interface Props {
  data: OtherPattern1Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherPattern1({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/50 p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        
        {/* หัวข้อ */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 text-white font-bold px-3 py-1 rounded text-lg">
              {data.sectionNumber || '01'}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-slate-700 leading-none">
                {data.titleZh || 'หัวข้อภาษาจีน'}
              </h2>
              <p className="text-slate-400 italic text-sm text-left">
                {data.titleEn || 'English Title'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-1.5 rounded transition-all ${
              isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-50'
            }`}
          >
            <StickyNote size={22} />
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
          {data.content || 'เพิ่มเนื้อหาบทเรียนที่นี่...'}
        </div>

      </div>

      {/* Note Sidebar */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 shrink-0 text-left">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Note
          </span>
          <button onClick={() => setIsNoteOpen(false)} className="text-amber-300 hover:text-amber-600">
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