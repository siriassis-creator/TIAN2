import React, { useState } from 'react';
import { StickyNote, X, Save, Volume2, Users, Eye, EyeOff } from 'lucide-react';

export interface DialogueItem {
  speaker: string;
  pinyin: string;
  chinese: string;
}

export interface PatternPairworkData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  subTitleZh?: string;
  subTitleEn?: string;
  dialogues?: DialogueItem[];
  teacherNote?: string;
}

interface Props {
  data: PatternPairworkData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternPairwork({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // สร้าง State เก็บว่าประโยคไหนเปิดพินอินแล้วบ้าง
  const [showPinyin, setShowPinyin] = useState<Record<number, boolean>>({});

  const togglePinyin = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation(); // กันไม่ให้อ่านเสียงตอนกดเปิดพินอิน
    setShowPinyin((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const speakChinese = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
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
              <h2 className="text-2xl font-bold text-slate-400 font-serif">
                {data.titleZh}
              </h2>
            )}
            {data.titleEn && (
              <span className="text-xl text-slate-400 font-serif ml-2">
                {data.titleEn}
              </span>
            )}
          </div>

          <div className="ml-11 space-y-1">
            {data.subTitleZh && (
              <p className="text-xl text-slate-700 font-serif">
                {data.subTitleZh}
              </p>
            )}
            {data.subTitleEn && (
              <p className="text-lg text-slate-400 italic">{data.subTitleEn}</p>
            )}
          </div>
        </div>

        {/* Dialogue Section */}
        <div className="space-y-12 pl-11">
          {(data.dialogues || []).map((item, idx) => (
            <div
              key={idx}
              className="group cursor-pointer flex gap-6 items-start"
              onClick={() => speakChinese(item.chinese)}
            >
              {/* Speaker Name */}
              <div className="text-xl font-bold text-indigo-600 min-w-[50px] pt-10">
                {item.speaker}
              </div>

              {/* Content Area */}
              <div className="flex-1">
                {/* Pinyin Line (ซ่อน/แสดง) */}
                <div className="h-8 flex items-center">
                  <div
                    className={`transition-all duration-300 ${
                      showPinyin[idx] ? 'opacity-100' : 'opacity-0 select-none'
                    }`}
                  >
                    <span className="text-[20px] text-indigo-500 font-medium tracking-wide">
                      {item.pinyin}
                    </span>
                  </div>

                  {/* ปุ่ม Toggle Pinyin */}
                  <button
                    onClick={(e) => togglePinyin(idx, e)}
                    className="ml-4 p-1 rounded bg-slate-50 text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {showPinyin[idx] ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPinyin[idx] ? 'HIDE PY' : 'SHOW PY'}
                  </button>
                </div>

                {/* Chinese Line */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-[34px] font-serif text-slate-800 leading-tight">
                    {item.chinese}
                  </div>
                  <Volume2
                    size={24}
                    className="text-slate-200 group-hover:text-indigo-300 transition-colors shrink-0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note Toggle */}
        <button
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className="absolute top-8 right-8 p-2 text-slate-200 hover:text-amber-500 transition-colors"
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
        <div className="flex items-center justify-between mb-4 text-amber-700 font-bold">
          <span className="text-[10px] uppercase tracking-widest">
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
          className="w-full bg-amber-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
        >
          <Save size={16} /> SAVE NOTE
        </button>
      </div>
    </div>
  );
}
