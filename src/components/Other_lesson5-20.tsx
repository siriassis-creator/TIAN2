// src/components/Other_lesson5-20.tsx
import React, { useState } from 'react';
import { StickyNote, X, Edit3, Image as ImageIcon } from 'lucide-react';

export interface ImageItem {
  id: string;
  imageUrl: string;
}

export interface OtherLesson5_20Data {
  id?: string;
  patternType: 'other_lesson5-20';
  mainTitle: string;
  subTitle: string;
  images: ImageItem[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_20Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherLesson5_20({ data, onUpdateNote }: Props) {
  const safeData = data || ({} as OtherLesson5_20Data);
  const safeImages = safeData.images || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-6 md:p-10 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px] flex flex-col">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header (โจทย์) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[18px] md:text-[20px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
             <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={24} />
             </div>
             {safeData.mainTitle || '4. 描出每组汉字中相同的部分。'}
          </div>
          <div className="text-[15px] md:text-[17px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'เขียนส่วนประกอบที่เหมือนกันของตัวอักษรแต่ละคู่'}
          </div>
        </div>

        {/* 2. Image List (แสดงรูปภาพเรียงกันลงมา) */}
        <div className="flex flex-col items-center gap-6 w-full pb-10">
          {safeImages.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <ImageIcon size={48} className="text-slate-300 mb-2" />
              <span className="text-slate-400 font-bold">ยังไม่มีรูปภาพประกอบ</span>
            </div>
          ) : (
            safeImages.map((img, idx) => (
              <div key={img.id} className="w-full flex justify-center">
                {img.imageUrl ? (
                  <img 
                    src={img.imageUrl} 
                    alt={`ประกอบข้อที่ ${idx + 1}`} 
                    className="max-w-full rounded-2xl shadow-sm border border-slate-100 object-contain"
                    style={{ maxHeight: '600px' }}
                  />
                ) : (
                  <div className="w-full max-w-2xl aspect-[21/9] bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                    รูปภาพที่ {idx + 1} (ยังไม่ได้ใส่ URL)
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      {/* Note Sidebar */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden z-[40] ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
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