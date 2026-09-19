import React, { useState } from 'react';
import { StickyNote, X, Save, Volume2 } from 'lucide-react';

export interface DespictureItem {
  imageUrl: string;
  imageAlign: 'left' | 'right';
  pinyin: string;
  chinese: string;
}

export interface PatternDespictureData {
  sectionNumber?: string;
  titleZh?: string;
  titleEn?: string;
  items?: DespictureItem[];
  teacherNote?: string;
}

interface Props {
  data: PatternDespictureData;
  onUpdateNote?: (newNote: string) => void;
}

export default function PatternDespicture({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');

  // เก็บ State ว่าช่องว่างไหนถูกเปิดแล้วบ้าง: Format "itemIndex-blankIndex"
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleBlank = (blankId: string) => {
    setRevealed((prev) => ({ ...prev, [blankId]: !prev[blankId] }));
  };

  // ฟังก์ชันอ่านออกเสียง (เช็คช่องว่าง + กรองเฉพาะภาษาจีน)
  const speakChinese = (text: string, itemIdx: number) => {
    if (!text) return;

    // 1. จำแนกข้อความปกติ กับ ช่องว่าง
    const parts = text.split(/\[(.*?)\]/g);
    let textToSpeak = '';

    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        textToSpeak += part; // ข้อความปกติ
      } else {
        // คำที่อยู่ในวงเล็บ [ ] (ช่องว่าง)
        const blankIndex = Math.floor(i / 2);
        const blankId = `${itemIdx}-${blankIndex}`;

        if (revealed[blankId]) {
          textToSpeak += part; // ถ้ากดเฉลยแล้ว ให้อ่านคำนั้น
        } else {
          textToSpeak += ' ... '; // ถ้ายังไม่เฉลย ให้หยุดพัก (ไม่อ่านสปอยล์)
        }
      }
    });

    // 2. ลบวงเล็บที่อาจตกค้าง และกรองเอาเฉพาะตัวอักษรจีน (ตัด Pinyin/English ทิ้ง)
    let cleanText = textToSpeak.replace(/\[|\]/g, '');
    cleanText = cleanText.replace(/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, '');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText.trim());
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ฟังก์ชันแปลง Text ให้กลายเป็นช่องว่างแบบกดได้
  const renderTextWithBlanks = (
    text: string,
    itemIdx: number,
    isPinyin: boolean
  ) => {
    if (!text) return null;

    const parts = text.split(/\[(.*?)\]/g);

    return parts.map((part, i) => {
      if (i % 2 === 0) {
        return <span key={i}>{part}</span>;
      }

      const blankIndex = Math.floor(i / 2);
      const blankId = `${itemIdx}-${blankIndex}`;
      const isRevealed = revealed[blankId];

      return (
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation(); // กันไม่ให้ไปทริกเกอร์การอ่านทั้งประโยค
            toggleBlank(blankId);
          }}
          className={`inline-block mx-1.5 px-3 border-b-2 cursor-pointer transition-all duration-300 ${
            isRevealed
              ? 'border-red-400 text-red-600 font-bold' // เปลี่ยนเป็นสีแดงตามคำขอ
              : 'border-slate-400 text-transparent bg-slate-100 hover:bg-slate-200 rounded-t-sm min-w-[3rem]'
          }`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans">
      <div className="bg-white/90 p-8 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        {/* --- ส่วนหัวข้อ --- */}
        <div className="flex items-start justify-between mb-10">
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
            </div>
            {data.titleEn && (
              <p className="text-xl text-slate-400 font-serif ml-[3.25rem]">
                {data.titleEn}
              </p>
            )}
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

        {/* --- ส่วนเนื้อหา (รูปภาพ + ประโยคเติมคำ) --- */}
        <div className="flex flex-col gap-10">
          {(data.items || []).map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                item.imageAlign === 'right' ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* คอลัมน์ 1: รูปภาพ (ลดขนาดลง 50% เป็น w-1/6) */}
              <div className="w-1/2 md:w-1/6 shrink-0">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`Pic ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* คอลัมน์ 2: ข้อความ Pinyin + Chinese */}
              <div
                className="w-full md:w-5/6 flex flex-col justify-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => speakChinese(item.chinese, idx)}
                title="คลิกพื้นที่ว่างเพื่อฟังเสียงอ่าน"
              >
                {/* บรรทัดแรก: Pinyin */}
                <div className="text-[20px] text-slate-500 font-medium tracking-wide leading-loose">
                  {renderTextWithBlanks(item.pinyin, idx, true)}
                </div>

                {/* บรรทัดสอง: ภาษาจีน */}
                <div className="flex items-end gap-4">
                  <div className="text-[32px] font-serif text-slate-800 leading-loose">
                    {renderTextWithBlanks(item.chinese, idx, false)}
                  </div>
                  <Volume2
                    size={24}
                    className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-2"
                  />
                </div>
              </div>
            </div>
          ))}
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
