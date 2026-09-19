import React from 'react';
import { Table, Plus, Trash2, LayoutTemplate, Columns } from 'lucide-react';

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

export default function SettingFlexibleDoubleTable({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  const addRow = () => {
    updateData((s) => ({
      ...s,
      tableRows: [
        ...(s.tableRows || []),
        { col1: '', col2: '', col3: '', col4: '' },
      ],
    }));
  };

  const removeRow = (index: number) => {
    updateData((s) => ({
      ...s,
      tableRows: s.tableRows.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateRowField = (index: number, field: string, value: string) => {
    updateData((s) => {
      const newRows = [...(s.tableRows || [])];
      newRows[index] = { ...newRows[index], [field]: value };
      return { ...s, tableRows: newRows };
    });
  };

  return (
    <div className="space-y-6 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-indigo-50/30">
      <h3 className="font-bold text-indigo-600 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <LayoutTemplate size={14} /> Pattern: Flexible Double Table (2-Tier
        Headers)
      </h3>

      {/* --- Section Info --- */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              เลขข้อ (Section)
            </label>
            <input
              type="text"
              placeholder="เช่น 3"
              value={section.sectionNumber || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, sectionNumber: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                หัวข้อหลัก (Zh)
              </label>
              <input
                type="text"
                placeholder="Title (Chinese)"
                value={section.titleZh || ''}
                onChange={(e) =>
                  updateData((s) => ({ ...s, titleZh: e.target.value }))
                }
                className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                หัวข้อรอง (En)
              </label>
              <input
                type="text"
                placeholder="Title (English)"
                value={section.titleEn || ''}
                onChange={(e) =>
                  updateData((s) => ({ ...s, titleEn: e.target.value }))
                }
                className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            คำอธิบาย (ภาษาจีน)
          </label>
          <textarea
            placeholder="Description in Chinese..."
            value={section.contentZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, contentZh: e.target.value }))
            }
            className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none h-20 resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            คำอธิบาย (ภาษาอังกฤษ)
          </label>
          <textarea
            placeholder="Description in English..."
            value={section.contentEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, contentEn: e.target.value }))
            }
            className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none h-16 resize-none"
          />
        </div>
      </div>

      {/* --- Table Configuration --- */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-4">
        <label className="text-[11px] font-bold text-indigo-500 uppercase flex items-center gap-2 border-b border-indigo-50 pb-2">
          <Columns size={14} /> ตั้งชื่อหัวตารางแบบ 2 ชั้น (Double-Tier Headers)
        </label>

        {/* Headers Configuration */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-4 gap-3 text-center">
          {/* Column 1 */}
          <div className="col-span-1 border-r border-slate-200 pr-3 flex flex-col justify-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              คอลัมน์ 1 (รวบ 2 ชั้น)
            </label>
            <input
              type="text"
              placeholder="Subject"
              value={section.header1 || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header1: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-center"
            />
          </div>

          {/* Column 2 & 3 Group */}
          <div className="col-span-2 border-r border-slate-200 pr-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              กลุ่มคอลัมน์ 2-3 (ชั้นบน)
            </label>
            <input
              type="text"
              placeholder="Verb1"
              value={section.header2_top || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header2_top: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-center mb-2"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="去"
                value={section.header2_sub1 || ''}
                onChange={(e) =>
                  updateData((s) => ({ ...s, header2_sub1: e.target.value }))
                }
                className="w-1/2 p-2 border border-slate-200 rounded text-xs text-center"
              />
              <input
                type="text"
                placeholder="(place)"
                value={section.header2_sub2 || ''}
                onChange={(e) =>
                  updateData((s) => ({ ...s, header2_sub2: e.target.value }))
                }
                className="w-1/2 p-2 border border-slate-200 rounded text-xs text-center"
              />
            </div>
          </div>

          {/* Column 4 Group */}
          <div className="col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              คอลัมน์ 4 (ชั้นบน)
            </label>
            <input
              type="text"
              placeholder="Verb2"
              value={section.header3_top || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header3_top: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-center mb-2"
            />
            <input
              type="text"
              placeholder="to do sth."
              value={section.header3_sub || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header3_sub: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-xs text-center"
            />
          </div>
        </div>

        {/* Rows Configuration */}
        <div className="space-y-2 mt-4">
          {(section.tableRows || []).map((row: any, index: number) => (
            <div key={index} className="flex gap-2 items-center group">
              <div className="bg-slate-100 text-slate-400 font-bold text-[10px] px-2 py-2 rounded shrink-0 w-8 text-center">
                {index + 1}
              </div>
              <input
                type="text"
                placeholder="Col 1 (Subject)"
                value={row.col1 || ''}
                onChange={(e) => updateRowField(index, 'col1', e.target.value)}
                className="w-1/4 p-2 border border-slate-200 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Col 2 (去)"
                value={row.col2 || ''}
                onChange={(e) => updateRowField(index, 'col2', e.target.value)}
                className="w-1/4 p-2 border border-slate-200 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Col 3 (place)"
                value={row.col3 || ''}
                onChange={(e) => updateRowField(index, 'col3', e.target.value)}
                className="w-1/4 p-2 border border-slate-200 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Col 4 (to do sth.)"
                value={row.col4 || ''}
                onChange={(e) => updateRowField(index, 'col4', e.target.value)}
                className="w-1/4 p-2 border border-slate-200 rounded text-sm"
              />
              <button
                onClick={() => removeRow(index)}
                className="text-red-300 hover:text-red-500 p-2 shrink-0 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            className="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
          >
            <Plus size={14} /> เพิ่มแถวข้อมูลตาราง (Add Row)
          </button>
        </div>
      </div>
    </div>
  );
}
