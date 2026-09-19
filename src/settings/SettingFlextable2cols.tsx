import React from 'react';
import { Table, Plus, Trash2, LayoutTemplate } from 'lucide-react';

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

export default function SettingFlextable2cols({
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
      tableRows: [...(s.tableRows || []), { col1: '', col2: '' }],
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
        <LayoutTemplate size={14} /> Pattern: Flexible Table (2 Columns)
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
              placeholder="เช่น 1, 2.1"
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
            คำอธิบายเพิ่มเติม (ภาษาจีน)
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
            คำอธิบายเพิ่มเติม (ภาษาอังกฤษ)
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
          <Table size={14} /> ตั้งค่าตาราง (Table Content)
        </label>

        {/* Headers */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              ชื่อคอลัมน์ 1
            </label>
            <input
              type="text"
              placeholder="เช่น 汉字"
              value={section.header1 || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header1: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-center"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              ชื่อคอลัมน์ 2
            </label>
            <input
              type="text"
              placeholder="เช่น 拼音"
              value={section.header2 || ''}
              onChange={(e) =>
                updateData((s) => ({ ...s, header2: e.target.value }))
              }
              className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-center"
            />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {(section.tableRows || []).map((row: any, index: number) => (
            <div key={index} className="flex gap-2 items-center group">
              <div className="bg-slate-100 text-slate-400 font-bold text-[10px] px-2 py-2 rounded shrink-0 w-8 text-center">
                {index + 1}
              </div>
              <input
                type="text"
                placeholder="ข้อมูลคอลัมน์ 1"
                value={row.col1 || ''}
                onChange={(e) => updateRowField(index, 'col1', e.target.value)}
                className="w-1/2 p-2 border border-slate-200 rounded text-sm"
              />
              <input
                type="text"
                placeholder="ข้อมูลคอลัมน์ 2"
                value={row.col2 || ''}
                onChange={(e) => updateRowField(index, 'col2', e.target.value)}
                className="w-1/2 p-2 border border-slate-200 rounded text-sm"
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
