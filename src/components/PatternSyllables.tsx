import React, { useState } from 'react';
import { StickyNote, X, Save, Volume2 } from 'lucide-react';

export interface SyllableRow {
  syllable: string;
  initial: string;
  final: string;
  tone: string;
}

export interface PatternSyllablesData {
  sectionNumber: string;
  titleZh: string;
  titleEn: string;
  introTextZh: string;
  introTextEn: string;
  footerTextZh?: string;
  footerTextEn?: string;
  rows: SyllableRow[];
  teacherNote?: string;
}

interface Props {
  data: PatternSyllablesData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternSyllables({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  const speakPinyin = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.6;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      {/* ส่วนเนื้อหาหลัก - พื้นหลังโปร่งใสเพื่อให้ปากกาเขียนทับได้ */}
      <div className="bg-white/50 p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 text-white font-bold px-3 py-1 rounded text-lg">
              {data.sectionNumber}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700 leading-none">
                {data.titleZh}
              </h2>
              <p className="text-slate-400 italic text-sm mt-1">
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

        {/* ส่วนที่ 1: คำอธิบาย (Text Content) */}
        <div className="mb-8 px-4 md:px-10">
          <p className="text-lg text-slate-700 mb-2 leading-relaxed text-right md:text-center font-serif">
            {data.introTextZh}
          </p>
          <p className="text-sm text-slate-500 italic leading-relaxed text-right md:text-center">
            {data.introTextEn}
          </p>
        </div>

        {/* ส่วนที่ 2: ตารางวิเคราะห์พินอิน 4 ช่อง */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse rounded-lg overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="border border-slate-200 py-3 px-4 font-bold">
                  汉语的音节 Syllable
                </th>
                <th className="border border-slate-200 py-3 px-4 font-bold">
                  声母 Initial
                </th>
                <th className="border border-slate-200 py-3 px-4 font-bold">
                  韵母 Final
                </th>
                <th className="border border-slate-200 py-3 px-4 font-bold">
                  声调 Tone
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <tr
                  key={index}
                  className="text-center hover:bg-white/80 transition-colors group"
                >
                  <td
                    className="border border-slate-200 py-4 px-4 text-xl font-serif text-slate-700 cursor-pointer"
                    onClick={() =>
                      speakPinyin(row.syllable.split('(')[0].trim())
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      {row.syllable}
                      <Volume2
                        size={14}
                        className="text-slate-300 opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </td>
                  <td className="border border-slate-200 py-4 px-4 text-xl font-serif text-slate-600">
                    {row.initial}
                  </td>
                  <td className="border border-slate-200 py-4 px-4 text-xl font-serif text-slate-600">
                    {row.final}
                  </td>
                  <td className="border border-slate-200 py-4 px-4 text-xl font-serif text-slate-600 font-bold">
                    {row.tone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ส่วนท้าย (Notes/Footer) */}
        {(data.footerTextZh || data.footerTextEn) && (
          <div className="mt-8 px-4 py-4 bg-slate-50/40 rounded-lg border border-slate-100 italic">
            <p className="text-sm text-slate-600 mb-1">{data.footerTextZh}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {data.footerTextEn}
            </p>
          </div>
        )}
      </div>

      {/* Teacher's Note Sidebar */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen
            ? 'w-[280px] opacity-100 px-4 py-6'
            : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Teacher Note
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
          placeholder="จดบันทึกเทคนิคการจำ..."
          className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4"
        />
        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved Note');
          }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm"
        >
          SAVE NOTE
        </button>
      </div>
    </div>
  );
}
