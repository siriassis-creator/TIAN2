// src/settings/setting_other_lesson6-15.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2 } from 'lucide-react';

export interface ExercisePart6_15 {
  id: string;
  prefix: string; // ข้อความก่อนช่องว่าง
  answer: string; // คำตอบในช่องว่าง
  suffix: string; // ข้อความหลังช่องว่าง
}

export interface OtherLesson6_15Data {
  id?: string;
  patternType: 'other_lesson6-15';
  mainTitle: string;
  subTitle: string;
  leftParagraphs: string[];
  rightExercises: ExercisePart6_15[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_15({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_15Data> = {
    mainTitle: '2. 仿照示例，写一写，说一说。',
    subTitle: 'ฝึกเขียนและพูดตามตัวอย่าง',
    leftParagraphs: [
      '中国的钱叫人民币。',
      '人民币有1块、5块、10块、20块、50块和100块。',
      '100块人民币是450泰铢。'
    ],
    rightExercises: [
      { id: 'ex1', prefix: '泰国的钱叫', answer: '泰铢', suffix: '。' },
      { id: 'ex2', prefix: '有', answer: '1铢、2铢、5铢、10铢、20铢、50铢', suffix: '' },
      { id: 'ex3', prefix: '和', answer: '100铢、500铢、1000铢', suffix: '。' },
      { id: 'ex4', prefix: '100泰铢是', answer: '22', suffix: '块人民币。' } // เรทสมมติ 100 บาท = ~22 หยวน
    ]
  };

  useEffect(() => {
    if (!section.leftParagraphs || section.leftParagraphs.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_15Data = {
    ...section,
    patternType: 'other_lesson6-15',
    mainTitle: section?.mainTitle ?? defaultData.mainTitle,
    subTitle: section?.subTitle ?? defaultData.subTitle,
    leftParagraphs: Array.isArray(section?.leftParagraphs) ? section.leftParagraphs : defaultData.leftParagraphs,
    rightExercises: Array.isArray(section?.rightExercises) ? section.rightExercises : defaultData.rightExercises
  };

  const handleChange = (field: keyof OtherLesson6_15Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleArrayChange = (arrayName: 'leftParagraphs' | 'rightExercises', index: number, field: string | null, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newArray = [...(sec[arrayName] || [])];
      if (field) {
        newArray[index] = { ...newArray[index], [field]: value };
      } else {
        newArray[index] = value;
      }
      return { ...sec, [arrayName]: newArray };
    });
  };

  const loadDefaultTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('ต้องการโหลดข้อมูลตั้งต้น ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่า 6-15 (เปรียบเทียบสกุลเงิน)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลตั้งต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side Settings */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
           <h3 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2">ฝั่งซ้าย (ประโยคตัวอย่าง)</h3>
           <div className="space-y-3">
             {safeData.leftParagraphs.map((text, idx) => (
                <div key={idx} className="space-y-1">
                   <label className="text-[10px] font-bold text-blue-600">ประโยคที่ {idx + 1}</label>
                   <textarea value={text} onChange={(e) => handleArrayChange('leftParagraphs', idx, null, e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded text-sm bg-white" rows={2} />
                </div>
             ))}
           </div>
        </div>

        {/* Right Side Settings */}
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm space-y-4">
           <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-200 pb-2">ฝั่งขวา (แบบฝึกหัดเติมคำ)</h3>
           <div className="space-y-4">
             {safeData.rightExercises.map((item, idx) => (
                <div key={item.id} className="bg-white p-3 rounded border border-emerald-200 space-y-2">
                   <div className="text-[10px] font-bold text-emerald-600">บรรทัดที่ {idx + 1}</div>
                   <div className="flex gap-2">
                      <input type="text" value={item.prefix} onChange={(e) => handleArrayChange('rightExercises', idx, 'prefix', e.target.value)} placeholder="ข้อความด้านหน้า" className="flex-1 px-2 py-1 border rounded text-xs" />
                      <input type="text" value={item.answer} onChange={(e) => handleArrayChange('rightExercises', idx, 'answer', e.target.value)} placeholder="[เฉลยในช่องว่าง]" className="flex-[1.5] px-2 py-1 border-2 border-emerald-400 bg-emerald-50 rounded text-xs font-bold text-emerald-700" />
                      <input type="text" value={item.suffix} onChange={(e) => handleArrayChange('rightExercises', idx, 'suffix', e.target.value)} placeholder="ข้อความด้านหลัง" className="flex-1 px-2 py-1 border rounded text-xs" />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
}