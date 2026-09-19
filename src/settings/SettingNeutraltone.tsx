import React from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (
    cardId: string,
    lessonId: string,
    sectionId: string,
    updater: (s: any) => any
  ) => void;
}

export default function SettingNeutraltone({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  // ฟังก์ชันช่วยย่อโค้ดให้อ่านง่าย
  const updateData = (updater: (s: any) => any) => {
    updateSectionState(cardId, lessonId, section.id, updater);
  };

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <span className="bg-indigo-100 p-1.5 rounded">📦</span> Setting: The
        Neutral Tone
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
            หัวข้อ (จีน)
          </label>
          <input
            type="text"
            value={section.titleZh || ''}
            placeholder="เช่น: 汉语的轻声"
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
            หัวข้อ (ENG)
          </label>
          <input
            type="text"
            value={section.titleEn || ''}
            placeholder="เช่น: The Neutral Tone"
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm"
          />
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          1 & 2. คำอธิบายหลัก
        </label>
        <textarea
          value={section.introTextZh || ''}
          placeholder="คำอธิบาย (จีน) เช่น: 汉语中除了四声以外..."
          onChange={(e) =>
            updateData((s) => ({ ...s, introTextZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans h-16"
        />
        <textarea
          value={section.introTextEn || ''}
          placeholder="คำอธิบาย (ENG) เช่น: Apart from the four tones..."
          onChange={(e) =>
            updateData((s) => ({ ...s, introTextEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans h-16"
        />
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          3. รูปภาพพร้อมคำศัพท์ (เรียงแถวละ 4 รูป)
        </label>
        {(section.imageWords || []).map((imgWord: any, idx: number) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100 items-center"
          >
            <input
              type="text"
              placeholder="URL รูปภาพ (Direct Link)"
              value={imgWord.imageUrl || ''}
              onChange={(e) => {
                const newArr = [...(section.imageWords || [])];
                newArr[idx] = { ...newArr[idx], imageUrl: e.target.value };
                updateData((s) => ({ ...s, imageWords: newArr }));
              }}
              className="p-1.5 border border-slate-200 rounded text-[10px] w-full"
            />
            <input
              type="text"
              placeholder="Pinyin (เช่น māma)"
              value={imgWord.pinyin || ''}
              onChange={(e) => {
                const newArr = [...(section.imageWords || [])];
                newArr[idx] = { ...newArr[idx], pinyin: e.target.value };
                updateData((s) => ({ ...s, imageWords: newArr }));
              }}
              className="p-1.5 border border-slate-200 rounded text-[10px] w-full"
            />
            <input
              type="text"
              placeholder="ภาษาจีน (เช่น 妈妈)"
              value={imgWord.chinese || ''}
              onChange={(e) => {
                const newArr = [...(section.imageWords || [])];
                newArr[idx] = { ...newArr[idx], chinese: e.target.value };
                updateData((s) => ({ ...s, imageWords: newArr }));
              }}
              className="p-1.5 border border-slate-200 rounded text-[10px] w-full"
            />
            <button
              onClick={() => {
                const newArr = section.imageWords.filter(
                  (_: any, i: number) => i !== idx
                );
                updateData((s) => ({ ...s, imageWords: newArr }));
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              imageWords: [
                ...(s.imageWords || []),
                { imageUrl: '', pinyin: '', chinese: '' },
              ],
            }))
          }
          className="text-[10px] text-indigo-600 font-bold mt-2 hover:underline"
        >
          + เพิ่มรูปภาพคำศัพท์
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          4, 5, 6. ข้อความส่วนล่างและไฟล์เสียง
        </label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <input
            type="text"
            placeholder="Track (เช่น 02-7)"
            value={section.audioTrack || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, audioTrack: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold text-indigo-600 w-full"
          />
          {/* ---> อัปเดตส่วนของการรับ URL ไฟล์เสียงตรงนี้ครับ <--- */}
          <input
            type="text"
            placeholder="URL ไฟล์เสียง (รองรับ Google Drive / Dropbox)"
            value={section.audioUrl || ''}
            onChange={(e) => {
              let val = e.target.value;

              // 1. ตรวจจับและแปลงลิงก์ Google Drive
              if (val.includes('drive.google.com/file/d/')) {
                const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                  val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                }
              }
              // 2. ตรวจจับและแปลงลิงก์ Dropbox
              else if (val.includes('dropbox.com')) {
                val = val
                  .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                  .replace('?dl=0', '');
              }

              updateData((s) => ({ ...s, audioUrl: val }));
            }}
            className="p-2 border border-slate-200 rounded text-xs w-full focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <textarea
          value={section.footerTextZh || ''}
          placeholder="ข้อความ (จีน) เช่น: 朗读下列音节..."
          onChange={(e) =>
            updateData((s) => ({ ...s, footerTextZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans h-10"
        />
        <textarea
          value={section.footerTextEn || ''}
          placeholder="ข้อความ (ENG) เช่น: Read the syllables aloud..."
          onChange={(e) =>
            updateData((s) => ({ ...s, footerTextEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans h-10"
        />
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
          7. ตารางคำศัพท์แบบฝึกหัด (แถวละ 4 คำ)
        </label>
        <textarea
          value={(section.practiceWords || []).join(', ')}
          onChange={(e) => {
            const wordsArray = e.target.value
              .split(',')
              .map((w) => w.trim())
              .filter((w) => w !== '');
            updateData((s) => ({ ...s, practiceWords: wordsArray }));
          }}
          placeholder="พิมพ์คำศัพท์คั่นด้วยลูกน้ำ เช่น: zhuōzi, fángzi, yǐzi, guìzi"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 resize-none h-24"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          ใช้ลูกน้ำ (,) เพื่อแบ่งคำ ระบบจะจัดเป็น 4 คอลัมน์ให้อัตโนมัติ
        </p>
      </div>
    </div>
  );
}
