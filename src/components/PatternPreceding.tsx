import React, { useState } from 'react';
import { StickyNote, X, Save, Volume2 } from 'lucide-react';

export interface PrecedingRow {
  ruleZh: string;
  ruleEn: string;
  exampleItems: {
    char: string;
    pinyin: string;
    meaning: string;
    strokeOrder: string;
  }[];
}

export interface PatternPrecedingData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  rows?: PrecedingRow[];
  teacherNote?: string;
}

interface Props {
  data: PatternPrecedingData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternPreceding({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // ฟังก์ชันอ่านออกเสียงภาษาจีน
  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex w-full gap-2 items-start my-6 font-sans text-left">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1]">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            {data.sectionNumber && (
              <div className="bg-slate-600 text-white font-bold px-2 py-0.5 rounded text-lg">
                {data.sectionNumber}
              </div>
            )}
            {data.titleZh && (
              <h2 className="text-2xl font-bold text-slate-800">
                {data.titleZh}
              </h2>
            )}
          </div>
          {data.titleEn && (
            <p className="text-lg font-bold text-slate-800 ml-11 leading-snug">
              {data.titleEn}
            </p>
          )}
        </div>

        {/* Table Structure */}
        <div className="w-full border-t border-slate-200">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-slate-200 py-4 text-[18px] font-medium text-slate-700">
            <div className="pl-4">笔顺 Rule</div>
            <div className="pl-4">例字 Example Characters</div>
            <div className="pl-4">书写顺序 Stroke Order</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {(data.rows || []).map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 items-stretch py-8 group"
              >
                {/* Column 1: Rule */}
                <div className="flex flex-col gap-2 pl-4 pr-6 justify-center">
                  <span className="text-[24px] font-serif text-slate-900 leading-tight">
                    {row.ruleZh}
                  </span>
                  <span className="text-[17px] font-bold text-slate-800 leading-snug">
                    {row.ruleEn}
                  </span>
                </div>

                {/* Column 2: Example Characters (คลิกเพื่อฟังเสียง) */}
                <div className="pl-4 pr-4 border-l border-slate-50 flex flex-col justify-center gap-6">
                  {row.exampleItems.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="grid grid-cols-[40px_1fr_1fr] gap-4 items-baseline cursor-pointer group/item hover:text-indigo-600 transition-colors"
                      onClick={() => speakChinese(item.char)}
                      title="คลิกเพื่อฟังเสียงอ่าน"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[26px] font-serif text-slate-900 group-hover/item:text-indigo-600">
                          {item.char}
                        </span>
                      </div>
                      <span className="text-[18px] text-slate-500 font-medium">
                        {item.pinyin}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-[18px] text-slate-400 italic">
                          {item.meaning}
                        </span>
                        <Volume2
                          size={16}
                          className="text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3: Stroke Order */}
                <div className="pl-8 border-l border-slate-50 flex flex-col justify-center gap-6">
                  {row.exampleItems.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="text-[26px] font-serif text-slate-600 tracking-[0.5em]"
                    >
                      {item.strokeOrder}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note Toggle */}
        <button
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className="absolute top-8 right-8 p-2 text-slate-300 hover:text-amber-500 transition-colors"
        >
          <StickyNote size={24} />
        </button>
      </div>

      {/* Note Sidebar */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen
            ? 'w-[300px] opacity-100 p-6'
            : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Teacher's Note
          </span>
          <button
            onClick={() => setIsNoteOpen(false)}
            className="text-amber-300 hover:text-amber-600"
          >
            <X size={20} />
          </button>
        </div>
        <textarea
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
          className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm border-0 resize-none mb-4 shadow-inner"
        />
        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved');
          }}
          className="w-full bg-amber-500 text-white py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2"
        >
          <Save size={16} /> SAVE NOTE
        </button>
      </div>
    </div>
  );
}
