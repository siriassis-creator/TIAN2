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

export default function SettingMatchPicture({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) => {
    updateSectionState(cardId, lessonId, section.id, updater);
  };

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <span className="bg-indigo-100 p-1.5 rounded">🧩</span> Setting: Match
        Pictures
      </h3>

      {/* --- หัวข้อ --- */}
      <div className="grid grid-cols-[80px_1fr_1fr] gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
            ข้อ
          </label>
          <input
            type="text"
            value={section.sectionNumber || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, sectionNumber: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-center"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
            หัวข้อ (จีน)
          </label>
          <input
            type="text"
            value={section.titleZh || ''}
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
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm"
          />
        </div>
      </div>

      {/* --- ส่วนรูปภาพตัวเลือก --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          1. รูปภาพตัวเลือก (ด้านบน)
        </label>
        {(section.images || []).map((img: any, idx: number) => (
          <div
            key={idx}
            className="flex gap-2 mb-2 items-center bg-slate-50 p-2 border border-slate-100 rounded"
          >
            <input
              type="text"
              placeholder="A, B, C..."
              value={img.letter || ''}
              onChange={(e) => {
                const newArr = [...(section.images || [])];
                newArr[idx] = { ...newArr[idx], letter: e.target.value };
                updateData((s) => ({ ...s, images: newArr }));
              }}
              className="w-12 p-1.5 border border-slate-200 rounded text-center font-bold text-[10px]"
            />
            <input
              type="text"
              placeholder="URL รูปภาพ (รองรับ Drive/Dropbox)"
              value={img.imageUrl || ''}
              onChange={(e) => {
                let val = e.target.value;
                if (val.includes('drive.google.com/file/d/')) {
                  const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                  if (match && match[1])
                    val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                } else if (val.includes('dropbox.com')) {
                  val = val
                    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                    .replace('?dl=0', '');
                }
                const newArr = [...(section.images || [])];
                newArr[idx] = { ...newArr[idx], imageUrl: val };
                updateData((s) => ({ ...s, images: newArr }));
              }}
              className="flex-1 p-1.5 border border-slate-200 rounded text-[10px]"
            />
            <button
              onClick={() => {
                const newArr = section.images.filter(
                  (_: any, i: number) => i !== idx
                );
                updateData((s) => ({ ...s, images: newArr }));
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
              images: [
                ...(s.images || []),
                {
                  letter: String.fromCharCode(65 + (s.images?.length || 0)),
                  imageUrl: '',
                },
              ],
            }))
          }
          className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline"
        >
          + เพิ่มรูปภาพตัวเลือก
        </button>
      </div>

      {/* --- ส่วนคำศัพท์และเฉลย --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          2. คำศัพท์ และ เฉลย (ด้านล่าง)
        </label>
        {(section.words || []).map((word: any, idx: number) => (
          <div
            key={idx}
            className="flex gap-2 mb-2 items-center bg-slate-50 p-2 border border-slate-100 rounded"
          >
            <input
              type="text"
              placeholder="ข้อ"
              value={word.number || ''}
              onChange={(e) => {
                const newArr = [...(section.words || [])];
                newArr[idx] = { ...newArr[idx], number: e.target.value };
                updateData((s) => ({ ...s, words: newArr }));
              }}
              className="w-10 p-1.5 border border-slate-200 rounded text-center text-[10px] bg-slate-200"
            />
            <input
              type="text"
              placeholder="Pinyin"
              value={word.pinyin || ''}
              onChange={(e) => {
                const newArr = [...(section.words || [])];
                newArr[idx] = { ...newArr[idx], pinyin: e.target.value };
                updateData((s) => ({ ...s, words: newArr }));
              }}
              className="flex-1 p-1.5 border border-slate-200 rounded text-[10px]"
            />
            <input
              type="text"
              placeholder="ภาษาจีน"
              value={word.chinese || ''}
              onChange={(e) => {
                const newArr = [...(section.words || [])];
                newArr[idx] = { ...newArr[idx], chinese: e.target.value };
                updateData((s) => ({ ...s, words: newArr }));
              }}
              className="flex-1 p-1.5 border border-slate-200 rounded text-[10px]"
            />
            <input
              type="text"
              placeholder="ตัวอักษรเฉลย (เช่น A)"
              value={word.correctLetter || ''}
              onChange={(e) => {
                const newArr = [...(section.words || [])];
                newArr[idx] = {
                  ...newArr[idx],
                  correctLetter: e.target.value.toUpperCase(),
                };
                updateData((s) => ({ ...s, words: newArr }));
              }}
              className="w-32 p-1.5 border-2 border-indigo-200 rounded text-center text-[10px] font-bold text-indigo-600 focus:border-indigo-400"
            />
            <button
              onClick={() => {
                const newArr = section.words.filter(
                  (_: any, i: number) => i !== idx
                );
                updateData((s) => ({ ...s, words: newArr }));
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
              words: [
                ...(s.words || []),
                {
                  number: String((s.words?.length || 0) + 1),
                  pinyin: '',
                  chinese: '',
                  correctLetter: '',
                },
              ],
            }))
          }
          className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline"
        >
          + เพิ่มคำศัพท์
        </button>
      </div>
    </div>
  );
}
