// src/settings/setting_other1.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import type { OtherPattern1Data } from '../components/Other_pattern_1';

interface Props {
  section: OtherPattern1Data;
  onChange: (updatedSection: OtherPattern1Data) => void;
  onRemove: () => void;
}

export default function SettingOther1({ section, onChange, onRemove }: Props) {
  return (
    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl relative">
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white p-1.5 rounded-md shadow-sm"
        title="ลบ Section"
      >
        <Trash2 size={16} />
      </button>

      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 inline-block">
        แบบเรียนทั่วไป (Pattern 1)
      </h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">หมายเลขหัวข้อ</label>
          <input
            type="text"
            value={section.sectionNumber || ''}
            onChange={(e) => onChange({ ...section, sectionNumber: e.target.value })}
            className="w-full p-2 text-sm border rounded bg-white"
            placeholder="เช่น 01"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">หัวข้อ (ภาษาจีน/หลัก)</label>
          <input
            type="text"
            value={section.titleZh || ''}
            onChange={(e) => onChange({ ...section, titleZh: e.target.value })}
            className="w-full p-2 text-sm border rounded bg-white"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-slate-500 mb-1">หัวข้อย่อย (ภาษาอังกฤษ/แปล)</label>
        <input
          type="text"
          value={section.titleEn || ''}
          onChange={(e) => onChange({ ...section, titleEn: e.target.value })}
          className="w-full p-2 text-sm border rounded bg-white"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">เนื้อหาบทเรียน</label>
        <textarea
          value={section.content || ''}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          className="w-full p-2 text-sm border rounded bg-white h-24 resize-y"
          placeholder="พิมพ์เนื้อหาที่นี่..."
        />
      </div>
    </div>
  );
}