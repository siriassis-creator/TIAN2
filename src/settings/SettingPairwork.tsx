import React from 'react';
import { Trash2, Plus, Wand2 } from 'lucide-react';
import { pinyin } from 'pinyin-pro';

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

export default function SettingPairwork({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  const addDialogue = () =>
    updateData((s) => ({
      ...s,
      dialogues: [
        ...(s.dialogues || []),
        { speaker: 'A:', pinyin: '', chinese: '' },
      ],
    }));

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <span className="bg-indigo-100 p-1.5 rounded">👥</span> Setting: Pair
        Work Dialogue
      </h3>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
          <input
            type="text"
            placeholder="ข้อ"
            value={section.sectionNumber || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, sectionNumber: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs text-center"
          />
          <input
            type="text"
            placeholder="หัวข้อจีน"
            value={section.titleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs"
          />
          <input
            type="text"
            placeholder="หัวข้ออังกฤษ"
            value={section.titleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="คำสั่งจีน"
            value={section.subTitleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, subTitleZh: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-serif"
          />
          <input
            type="text"
            placeholder="คำสั่งอังกฤษ"
            value={section.subTitleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, subTitleEn: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {(section.dialogues || []).map((item: any, idx: number) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group"
          >
            <button
              onClick={() =>
                updateData((s) => ({
                  ...s,
                  dialogues: s.dialogues.filter(
                    (_: any, i: number) => i !== idx
                  ),
                }))
              }
              className="absolute top-2 right-2 text-red-300 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-[60px_1fr] gap-4 items-center">
              <input
                type="text"
                placeholder="Speaker"
                value={item.speaker}
                onChange={(e) => {
                  const newD = [...section.dialogues];
                  newD[idx].speaker = e.target.value;
                  updateData((s) => ({ ...s, dialogues: newD }));
                }}
                className="p-2 border border-slate-200 rounded text-xs font-bold text-center text-indigo-600"
              />
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ภาษาจีน"
                  value={item.chinese}
                  onChange={(e) => {
                    const newD = [...section.dialogues];
                    newD[idx].chinese = e.target.value;
                    updateData((s) => ({ ...s, dialogues: newD }));
                  }}
                  className="w-full p-2 border border-slate-200 rounded text-sm font-serif"
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pinyin (กด Auto พินอินด้านขวา)"
                    value={item.pinyin}
                    onChange={(e) => {
                      const newD = [...section.dialogues];
                      newD[idx].pinyin = e.target.value;
                      updateData((s) => ({ ...s, dialogues: newD }));
                    }}
                    className="w-full p-2 border border-slate-200 rounded text-xs pr-8"
                  />
                  <button
                    onClick={() => {
                      if (!item.chinese)
                        return alert('กรุณาใส่ภาษาจีนก่อนครับ');
                      const py = pinyin(item.chinese);
                      const newD = [...section.dialogues];
                      newD[idx].pinyin = py;
                      updateData((s) => ({ ...s, dialogues: newD }));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
                    title="สร้างพินอินอัตโนมัติ"
                  >
                    <Wand2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addDialogue}
          className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> เพิ่มบทสนทนา
        </button>
      </div>
    </div>
  );
}
