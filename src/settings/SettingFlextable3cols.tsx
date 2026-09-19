import React from 'react';
import { Trash2, Plus, LayoutGrid } from 'lucide-react';

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

export default function SettingFlextable3cols({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <LayoutGrid size={14} /> Pattern: Flexible 3-Column Table
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
          className="p-2 border border-slate-200 rounded text-xs"
        />
      </div>

      {/* Content */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          Description
        </label>
        <textarea
          placeholder="คำอธิบายภาษาจีน"
          value={section.contentZh || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, contentZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-serif h-16"
        />
        <textarea
          placeholder="คำอธิบายภาษาอังกฤษ"
          value={section.contentEn || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, contentEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-serif h-16"
        />
      </div>

      {/* Table Header Setup */}
      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
        <label className="text-[10px] font-bold text-indigo-400 mb-2 block uppercase">
          Edit Table Headers
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Header 1"
            value={section.header1 || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, header1: e.target.value }))
            }
            className="p-2 border border-indigo-200 rounded text-[11px] text-center"
          />
          <input
            type="text"
            placeholder="Header 2"
            value={section.header2 || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, header2: e.target.value }))
            }
            className="p-2 border border-indigo-200 rounded text-[11px] text-center"
          />
          <input
            type="text"
            placeholder="Header 3"
            value={section.header3 || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, header3: e.target.value }))
            }
            className="p-2 border border-indigo-200 rounded text-[11px] text-center"
          />
        </div>
      </div>

      {/* Table Rows */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
          Table Rows
        </label>
        <div className="space-y-2">
          {(section.tableRows || []).map((row: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Col 1"
                value={row.col1}
                onChange={(e) => {
                  const nr = [...section.tableRows];
                  nr[idx].col1 = e.target.value;
                  updateData((s) => ({ ...s, tableRows: nr }));
                }}
                className="flex-1 p-2 border border-slate-200 rounded text-xs font-serif text-center"
              />
              <input
                type="text"
                placeholder="Col 2"
                value={row.col2}
                onChange={(e) => {
                  const nr = [...section.tableRows];
                  nr[idx].col2 = e.target.value;
                  updateData((s) => ({ ...s, tableRows: nr }));
                }}
                className="flex-1 p-2 border border-slate-200 rounded text-xs font-serif text-center"
              />
              <input
                type="text"
                placeholder="Col 3"
                value={row.col3}
                onChange={(e) => {
                  const nr = [...section.tableRows];
                  nr[idx].col3 = e.target.value;
                  updateData((s) => ({ ...s, tableRows: nr }));
                }}
                className="flex-1 p-2 border border-slate-200 rounded text-xs font-serif text-center"
              />
              <button
                onClick={() =>
                  updateData((s) => ({
                    ...s,
                    tableRows: s.tableRows.filter(
                      (_: any, i: number) => i !== idx
                    ),
                  }))
                }
                className="text-red-300 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              tableRows: [
                ...(s.tableRows || []),
                { col1: '', col2: '', col3: '' },
              ],
            }))
          }
          className="w-full mt-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Row
        </button>
      </div>
    </div>
  );
}
