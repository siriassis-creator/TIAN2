import React, { useState } from 'react';
import { StickyNote, X, Save } from 'lucide-react';

export interface PatternSentence3ColsData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  contentZh?: string;
  contentEn?: string;
  // Table Headers
  headerSubject?: string;
  headerPredicate?: string;
  headerVerb?: string;
  headerObject?: string;
  // Table Rows
  tableRows?: {
    col1: string;
    col2: string;
    col3: string;
  }[];
  teacherNote?: string;
}

interface Props {
  data: PatternSentence3ColsData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternSentence3Cols({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // ฟังก์ชันกดอ่านออกเสียงเผื่ออาจารย์อยากให้เด็กฟัง
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
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/90 p-8 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* --- ส่วนหัวข้อ --- */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              {data.sectionNumber && (
                <div className="bg-slate-400 text-white font-bold px-3 py-1 rounded shadow-sm text-lg">
                  {data.sectionNumber}
                </div>
              )}
              {data.titleZh && (
                <h2 className="text-2xl font-bold text-slate-700 tracking-wide">
                  {data.titleZh}
                </h2>
              )}
              {data.titleEn && (
                <p className="text-xl text-slate-400 font-serif ml-2">
                  {data.titleEn}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-2 rounded transition-all shrink-0 ml-4 ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-300 hover:text-amber-500 bg-slate-50'
            }`}
          >
            <StickyNote size={24} />
          </button>
        </div>

        {/* --- ส่วนเนื้อหาคำอธิบาย (จีน และ อังกฤษ) --- */}
        <div className="mb-10 px-4 space-y-6">
          {data.contentZh && (
            <p className="text-[20px] text-slate-700 leading-[2.2] text-left font-serif indent-8">
              {data.contentZh}
            </p>
          )}
          {data.contentEn && (
            <p className="text-[17px] text-slate-500 leading-relaxed text-left indent-8 font-serif">
              {data.contentEn}
            </p>
          )}
        </div>

        {/* --- ส่วนตาราง 3 คอลัมน์ (โครงสร้างตามรูปเป๊ะๆ) --- */}
        <div className="px-4 mt-8">
          <div className="rounded-xl overflow-hidden border-2 border-slate-200 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th
                    rowSpan={2}
                    className="border border-slate-200 p-4 text-[17px] font-normal text-slate-500 text-center align-middle w-1/3"
                  >
                    {data.headerSubject || 'Subject'}
                  </th>
                  <th
                    colSpan={2}
                    className="border border-slate-200 p-2 text-[17px] font-normal text-slate-500 text-center w-2/3"
                  >
                    {data.headerPredicate || 'Predicate'}
                  </th>
                </tr>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-2 text-[16px] font-normal text-slate-500 text-center w-1/3">
                    {data.headerVerb || '(不) 是'}
                  </th>
                  <th className="border border-slate-200 p-2 text-[16px] font-normal text-slate-500 text-center w-1/3">
                    {data.headerObject || 'Noun/Noun Phrase'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data.tableRows || []).map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() =>
                      speakChinese(`${row.col1} ${row.col2} ${row.col3}`)
                    }
                    title="คลิกเพื่อฟังเสียงอ่านทั้งประโยค"
                  >
                    <td className="border border-slate-200 p-4 text-[26px] font-serif text-slate-700 text-center">
                      {row.col1}
                    </td>
                    <td className="border border-slate-200 p-4 text-[26px] font-serif text-slate-700 text-center">
                      {row.col2}
                    </td>
                    <td className="border border-slate-200 p-4 text-[26px] font-serif text-slate-700 text-center">
                      {row.col3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Teacher Note Sidebar --- */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${
          isNoteOpen
            ? 'w-[320px] opacity-100 p-6'
            : 'w-0 opacity-0 p-0 border-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6 shrink-0 text-left">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <StickyNote size={18} />
            <span className="text-[11px] uppercase tracking-widest">
              Teacher's Note
            </span>
          </div>
          <button
            onClick={() => setIsNoteOpen(false)}
            className="text-amber-400 hover:text-amber-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <textarea
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
          placeholder="จดบันทึก..."
          className="flex-1 w-full bg-white/80 rounded-xl p-4 text-sm text-amber-900 focus:outline-none border border-amber-200 resize-none mb-6 shadow-inner"
        />
        <button
          onClick={() => {
            onUpdateNote?.(tempNote);
            alert('Saved');
          }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Save size={16} /> SAVE NOTE
        </button>
      </div>
    </div>
  );
}
