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

export default function SettingPreceding({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  const addRow = () =>
    updateData((s) => ({
      ...s,
      rows: [
        ...(s.rows || []),
        {
          ruleZh: '',
          ruleEn: '',
          exampleItems: [
            { char: '', pinyin: '', meaning: '', strokeOrder: '' },
          ],
        },
      ],
    }));

  const addExampleItem = (rIdx: number) => {
    const newRows = [...(section.rows || [])];
    newRows[rIdx].exampleItems.push({
      char: '',
      pinyin: '',
      meaning: '',
      strokeOrder: '',
    });
    updateData((s) => ({ ...s, rows: newRows }));
  };

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <span className="bg-indigo-100 p-1.5 rounded">✍️</span> Setting: Stroke
        Order Rules (Full Table)
      </h3>

      {/* Header Info */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm grid grid-cols-[80px_1fr_1fr] gap-3">
        <input
          type="text"
          placeholder="ข้อ"
          value={section.sectionNumber || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, sectionNumber: e.target.value }))
          }
          className="p-2 border border-slate-200 rounded text-xs text-center font-bold"
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
          className="p-2 border border-slate-200 rounded text-xs font-bold"
        />
      </div>

      {/* Rows */}
      {(section.rows || []).map((row: any, rIdx: number) => (
        <div
          key={rIdx}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative space-y-4"
        >
          <button
            onClick={() =>
              updateData((s) => ({
                ...s,
                rows: s.rows.filter((_: any, i: number) => i !== rIdx),
              }))
            }
            className="absolute top-2 right-2 text-red-300 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>

          {/* Column 1 Setup */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded">
            <input
              type="text"
              placeholder="Rule จีน (บรรทัด 1)"
              value={row.ruleZh}
              onChange={(e) => {
                const nr = [...section.rows];
                nr[rIdx].ruleZh = e.target.value;
                updateData((s) => ({ ...s, rows: nr }));
              }}
              className="p-2 border border-slate-200 rounded text-xs font-serif"
            />
            <input
              type="text"
              placeholder="Rule อังกฤษ (บรรทัด 2)"
              value={row.ruleEn}
              onChange={(e) => {
                const nr = [...section.rows];
                nr[rIdx].ruleEn = e.target.value;
                updateData((s) => ({ ...s, rows: nr }));
              }}
              className="p-2 border border-slate-200 rounded text-xs font-bold"
            />
          </div>

          {/* Column 2 & 3 Setup */}
          <div className="space-y-3 pl-2 border-l-2 border-indigo-100">
            {row.exampleItems.map((item: any, iIdx: number) => (
              <div
                key={iIdx}
                className="bg-slate-50/50 p-2 rounded border border-slate-100 relative"
              >
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ตัวจีน"
                    value={item.char}
                    onChange={(e) => {
                      const nr = [...section.rows];
                      nr[rIdx].exampleItems[iIdx].char = e.target.value;
                      updateData((s) => ({ ...s, rows: nr }));
                    }}
                    className="p-1 border border-slate-200 rounded text-xs font-serif text-center"
                  />
                  <input
                    type="text"
                    placeholder="Pinyin"
                    value={item.pinyin}
                    onChange={(e) => {
                      const nr = [...section.rows];
                      nr[rIdx].exampleItems[iIdx].pinyin = e.target.value;
                      updateData((s) => ({ ...s, rows: nr }));
                    }}
                    className="p-1 border border-slate-200 rounded text-xs text-center"
                  />
                  <input
                    type="text"
                    placeholder="คำแปล"
                    value={item.meaning}
                    onChange={(e) => {
                      const nr = [...section.rows];
                      nr[rIdx].exampleItems[iIdx].meaning = e.target.value;
                      updateData((s) => ({ ...s, rows: nr }));
                    }}
                    className="p-1 border border-slate-200 rounded text-xs text-center"
                  />
                  <button
                    onClick={() => {
                      const nr = [...section.rows];
                      nr[rIdx].exampleItems = nr[rIdx].exampleItems.filter(
                        (_: any, i: number) => i !== iIdx
                      );
                      updateData((s) => ({ ...s, rows: nr }));
                    }}
                    className="text-red-300 hover:text-red-500 ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="书写顺序 Stroke Order (ขีด)"
                  value={item.strokeOrder}
                  onChange={(e) => {
                    const nr = [...section.rows];
                    nr[rIdx].exampleItems[iIdx].strokeOrder = e.target.value;
                    updateData((s) => ({ ...s, rows: nr }));
                  }}
                  className="w-full p-1 border border-slate-200 rounded text-xs font-serif italic"
                />
              </div>
            ))}
            <button
              onClick={() => addExampleItem(rIdx)}
              className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={12} /> เพิ่มรายการ (例字 + Stroke Order)
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addRow}
        className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 flex items-center justify-center gap-2"
      >
        <Plus size={16} /> เพิ่มกฎใหม่ (แถวใหญ่)
      </button>
    </div>
  );
}
