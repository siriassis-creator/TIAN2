import React, { useState } from 'react';
import { StickyNote, X, Volume2 } from 'lucide-react';

export interface MatchImage {
  letter: string; // เช่น A, B, C
  imageUrl: string;
}

export interface MatchWord {
  number: string; // เช่น 1, 2, 3
  pinyin: string;
  chinese: string;
  correctLetter: string; // ตัวอักษรเฉลย เช่น E
}

export interface PatternMatchPictureData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  images?: MatchImage[];
  words?: MatchWord[];
  teacherNote?: string;
}

interface Props {
  data: PatternMatchPictureData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternMatchPicture({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // State สำหรับเก็บว่าข้อไหนถูกเปิดเฉลยแล้วบ้าง { 0: true, 1: false, ... }
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const toggleReveal = (index: number) => {
    setRevealed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const speakWord = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ดึงตัวอักษรที่ถูกกดเปิดเฉลยแล้วทั้งหมดมารวมกัน เพื่อไปทำรูปเป็นสีเทา
  const revealedLetters = (data.words || [])
    .filter((_, idx) => revealed[idx])
    .map((word) => word.correctLetter);

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/90 p-8 md:p-10 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* --- ส่วนหัวข้อ --- */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-slate-700 tracking-wide flex items-center gap-3">
              {data.sectionNumber && (
                <span className="bg-slate-400 text-white px-3 py-1 rounded text-lg">
                  {data.sectionNumber}
                </span>
              )}
              {data.titleZh}
            </h2>
            <p className="text-slate-400 text-lg ml-[3.25rem]">
              {data.titleEn}
            </p>
          </div>
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`p-2 rounded transition-all shrink-0 ${
              isNoteOpen
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-300 hover:text-amber-500 bg-slate-50'
            }`}
          >
            <StickyNote size={24} />
          </button>
        </div>

        {/* --- ส่วนที่ 1: รูปภาพตัวเลือก (A, B, C...) --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {(data.images || []).map((img, idx) => {
            const currentLetter = img.letter || String.fromCharCode(65 + idx);
            // เช็คว่ารูปนี้ถูกเฉลยไปแล้วหรือยัง
            const isRevealed = revealedLetters.includes(currentLetter);

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* ลดขนาดรูปด้วย w-1/2 และเช็ค isRevealed เพื่อทำภาพสีเทา */}
                <div
                  className={`relative w-1/2 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-700 ${
                    isRevealed
                      ? 'border-slate-300 grayscale opacity-40 scale-95 shadow-none'
                      : 'border-slate-200 shadow-sm bg-slate-50 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`absolute top-1.5 left-1.5 z-10 border w-6 h-6 flex items-center justify-center font-bold text-sm rounded transition-colors duration-500 ${
                      isRevealed
                        ? 'bg-slate-200 text-slate-400 border-slate-300 shadow-none'
                        : 'bg-white/90 text-slate-700 border-slate-200 shadow-sm'
                    }`}
                  >
                    {currentLetter}
                  </div>
                  {img.imageUrl ? (
                    <img
                      src={img.imageUrl}
                      alt={`Option ${currentLetter}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- ส่วนที่ 2: คำศัพท์และกล่องเฉลย (1, 2, 3...) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {(data.words || []).map((word, idx) => (
            <div
              key={idx}
              className="flex items-end justify-between group border-b border-dashed border-slate-300 pb-2"
            >
              {/* หมายเลข และ คำศัพท์ */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => speakWord(word.chinese || word.pinyin)}
              >
                <div className="bg-slate-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-1 transition-colors group-hover:bg-indigo-400">
                  {word.number || idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-lg tracking-wider group-hover:text-indigo-500 transition-colors flex items-center gap-2">
                    {word.pinyin}
                    <Volume2
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </span>
                  <span className="text-3xl font-serif text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {word.chinese}
                  </span>
                </div>
              </div>

              {/* กล่อง 3D พลิกเฉลย */}
              <div
                className="w-12 h-12 ml-4 perspective-[1000px] cursor-pointer shrink-0"
                onClick={() => toggleReveal(idx)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                    revealed[idx] ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* กล่องยังไม่เฉลย (ด้านหน้า) */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] border-b-2 border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-300 rounded-sm">
                    <span className="text-xl font-bold opacity-50">?</span>
                  </div>

                  {/* กล่องเฉลยแล้ว (ด้านหลัง) */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] border-2 border-indigo-500 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-sm shadow-inner">
                    <span className="text-3xl font-bold">
                      {word.correctLetter}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Note Sidebar --- */}
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
