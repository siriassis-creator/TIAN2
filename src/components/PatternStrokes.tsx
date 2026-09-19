import React, { useState } from 'react';
import { StickyNote, X, Save, Volume2 } from 'lucide-react';

export interface StrokeExample {
  character: string;
  pinyin: string;
  meaning: string;
}

export interface StrokeRow {
  strokeImgUrl: string; // รูปตัวเขียนขนาดเล็ก
  nameZh: string;
  pinyin: string;
  directionName: string; // เช่น horizontal, vertical
  directionImgUrl: string; // รูปทิศทางขนาดใหญ่
  examples: StrokeExample[];
}

export interface PatternStrokesData {
  sectionNumber?: string;
  titleZh: string;
  titleEn: string;
  introTextZh: string;
  introTextEn: string;
  rows: StrokeRow[];
  teacherNote?: string;
}

interface Props {
  data: PatternStrokesData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternStrokes({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // ฟังก์ชันสำหรับอ่านออกเสียง
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
      <div className="bg-white/90 p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 flex-1 relative overflow-hidden z-[1]">
        {/* หัวข้อบทเรียน */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {data.sectionNumber && (
              <div className="bg-slate-400 text-white font-bold px-3 py-1 rounded text-xl">
                {data.sectionNumber}
              </div>
            )}
            <div className="flex flex-col text-left">
              <h2 className="text-2xl font-bold text-slate-700 leading-none mb-1">
                {data.titleZh}
              </h2>
              <p className="text-slate-400 text-lg leading-none">
                {data.titleEn}
              </p>
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

        {/* ข้อความอธิบาย */}
        <div className="mb-8 text-left pl-2 border-l-2 border-slate-100">
          <p className="text-lg text-slate-700 leading-relaxed font-serif mb-1">
            {data.introTextZh}
          </p>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            {data.introTextEn}
          </p>
        </div>

        {/* ตารางแสดงผล 3 คอลัมน์ */}
        <div className="border-[1.5px] border-slate-200 rounded-lg overflow-hidden max-w-5xl mx-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b-[1.5px] border-slate-200 text-center">
                <th className="py-4 px-4 text-slate-500 font-bold border-r border-slate-200 w-1/3">
                  笔画名称 Stroke
                </th>
                <th className="py-4 px-4 text-slate-500 font-bold border-r border-slate-200 w-1/3">
                  运笔方向 Direction
                </th>
                <th className="py-4 px-4 text-slate-500 font-bold w-1/3">
                  例字 Example Characters
                </th>
              </tr>
            </thead>
            <tbody>
              {(data.rows || []).map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {/* คอลัมน์ 1: Stroke Info (จัด 2 บรรทัด) */}
                  <td className="p-4 border-r border-slate-200">
                    <div className="flex items-center gap-4 justify-start h-full">
                      {/* 1. ตัวเขียน URL รูป */}
                      <img
                        src={row.strokeImgUrl}
                        alt="stroke"
                        className="w-12 h-12 object-contain"
                      />
                      <div className="flex flex-col text-left">
                        {/* 2. ตัวจีน และ Pinyin (ใส่ลำโพงและทำให้อ่านออกเสียงได้) */}
                        <div
                          onClick={() => speakWord(row.nameZh)}
                          className="flex items-center gap-1 cursor-pointer group/title"
                        >
                          <span className="text-xl font-bold text-slate-700 font-serif group-hover/title:text-indigo-600 transition-colors">
                            {row.nameZh}
                          </span>
                          <Volume2
                            size={16}
                            className="text-slate-300 opacity-0 group-hover/title:opacity-100 transition-all mr-1"
                          />
                          <span className="text-lg text-slate-500 font-medium">
                            {row.pinyin}
                          </span>
                        </div>
                        {/* 3. Direction (อังกฤษ) */}
                        <span className="text-slate-400 text-[15px]">
                          {row.directionName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* คอลัมน์ 2: Direction Image (รูปขนาดใหญ่) */}
                  <td className="p-2 border-r border-slate-200">
                    <div className="flex justify-center items-center h-full min-h-[80px]">
                      <img
                        src={row.directionImgUrl}
                        alt="direction"
                        className="max-h-16 w-auto object-contain"
                      />
                    </div>
                  </td>

                  {/* คอลัมน์ 3: Examples (ปรับให้อยู่บรรทัดเดียวกันทั้งหมด และมีไอคอนลำโพง) */}
                  <td className="p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {(row.examples || []).map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="flex items-baseline gap-4 text-left border-b border-slate-50 last:border-0 pb-2 group"
                        >
                          {/* ตัวจีน (พร้อมลำโพงซ่อนอยู่) */}
                          <div
                            onClick={() => speakWord(ex.character)}
                            className="flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span className="text-2xl font-serif text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {ex.character}
                            </span>
                            <Volume2
                              size={16}
                              className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                            />
                          </div>
                          {/* Pinyin */}
                          <span className="text-[17px] text-indigo-500 font-medium w-20 shrink-0">
                            {ex.pinyin}
                          </span>
                          {/* คำแปล */}
                          <span className="text-[15px] text-slate-600 leading-tight">
                            {ex.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
