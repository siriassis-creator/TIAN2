import React from 'react';
import { Trash2, Plus } from 'lucide-react';

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

export default function SettingNote({
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
        <span className="bg-indigo-100 p-1.5 rounded">📝</span> Setting: Grammar
        Note
      </h3>

      {/* --- หัวข้อ --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
          ข้อมูลหัวข้อ
        </label>
        <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
          <input
            type="text"
            placeholder="ข้อ (เช่น 1)"
            value={section.sectionNumber || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, sectionNumber: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold w-full text-center"
          />
          <input
            type="text"
            placeholder="หัวข้อจีน (เช่น 疑问代词...)"
            value={section.titleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
          <input
            type="text"
            placeholder="หัวข้ออังกฤษ (เช่น The Interrogative...)"
            value={section.titleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
        </div>
      </div>

      {/* --- เนื้อหาอธิบาย --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          1 & 2. ข้อความคำอธิบาย
        </label>
        <textarea
          placeholder="ข้อความภาษาจีน..."
          value={section.contentZh || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, contentZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-sm h-24 font-serif"
        />
        <textarea
          placeholder="ข้อความภาษาอังกฤษ..."
          value={section.contentEn || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, contentEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-sm h-24 font-serif"
        />
      </div>

      {/* --- ประโยคตัวอย่าง --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          3. ตัวอย่างประโยค (ไม่ต้องใส่ตัวเลข)
        </label>
        {(section.examples || []).map((example: string, index: number) => (
          <div
            key={index}
            className="flex gap-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100 items-center"
          >
            <span className="text-slate-400 font-bold text-xs shrink-0 w-6 text-center">
              ({index + 1})
            </span>
            <input
              type="text"
              placeholder="พิมพ์ประโยคตัวอย่างที่นี่..."
              value={example || ''}
              onChange={(e) => {
                const newArr = [...(section.examples || [])];
                newArr[index] = e.target.value;
                updateData((s) => ({ ...s, examples: newArr }));
              }}
              className="flex-1 p-2 border border-slate-200 rounded text-sm font-serif"
            />
            <button
              onClick={() => {
                const newArr = section.examples.filter(
                  (_: any, i: number) => i !== index
                );
                updateData((s) => ({ ...s, examples: newArr }));
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              examples: [...(s.examples || []), ''],
            }))
          }
          className="flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> เพิ่มประโยคตัวอย่าง
        </button>
      </div>
    </div>
  );
}
