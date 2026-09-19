// src/settings/setting_other_lesson6-10.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, LayoutTemplate, Wand2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface CardChoice6_10 {
  id: string;
  letter: string; // A, B, C, D
  imageUrl: string;
}

export interface Question6_10 {
  id: string;
  number: number;
  chinese: string;
  pinyin: string;
  correctAnswer: string;
}

export interface OtherLesson6_10Data {
  id?: string;
  patternType: 'other_lesson6-10';
  mainTitle: string;
  subTitle: string;
  choices: CardChoice6_10[];
  questions: Question6_10[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_10({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้นตามภาพ
  const defaultData: Partial<OtherLesson6_10Data> = {
    choices: [
      { id: 'c1', letter: 'A', imageUrl: '' },
      { id: 'c2', letter: 'B', imageUrl: '' },
      { id: 'c3', letter: 'C', imageUrl: '' },
      { id: 'c4', letter: 'D', imageUrl: '' }
    ],
    questions: [
      { id: 'q1', number: 1, chinese: '这个笔袋五十九泰铢。', pinyin: 'Zhège bǐdài wǔshíjiǔ Tàizhū.', correctAnswer: 'B' },
      { id: 'q2', number: 2, chinese: '这本笔记本四十泰铢。', pinyin: 'Zhèběn bǐjìběn sìshí Tàizhū.', correctAnswer: 'D' },
      { id: 'q3', number: 3, chinese: '这件上衣三百五十块。', pinyin: 'Zhèjiàn shàngyī sānbǎi wǔshí kuài.', correctAnswer: 'C' },
      { id: 'q4', number: 4, chinese: '这支笔三块五。', pinyin: 'Zhèzhī bǐ sān kuài wǔ.', correctAnswer: 'A' }
    ]
  };

  useEffect(() => {
    if (!section.questions || section.questions.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_10Data = {
    ...section,
    patternType: 'other_lesson6-10',
    mainTitle: section?.mainTitle ?? '2. 读一读，选择正确的图片。',
    subTitle: section?.subTitle ?? 'ฝึกอ่านแล้วเลือกรูปภาพที่ตรงกับความหมายของประโยค',
    choices: Array.isArray(section?.choices) && section.choices.length > 0 ? section.choices : defaultData.choices,
    questions: Array.isArray(section?.questions) && section.questions.length > 0 ? section.questions : defaultData.questions
  };

  const handleChange = (field: keyof OtherLesson6_10Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleChoiceChange = (index: number, field: keyof CardChoice6_10, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newChoices = [...(sec.choices || [])];
      newChoices[index] = { ...newChoices[index], [field]: value };
      return { ...sec, choices: newChoices };
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question6_10, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newQ = [...(sec.questions || [])];
      newQ[index] = { ...newQ[index], [field]: value };
      if (field === 'chinese') newQ[index].pinyin = pinyinConverter(value);
      return { ...sec, questions: newQ };
    });
  };

  const loadDefaultTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeData.questions.length > 0) {
      if (!window.confirm('ต้องการโหลดข้อมูลตั้งต้น ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
    }
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><LayoutTemplate className="text-indigo-500" /> ตั้งค่าส่วนหัว</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Choices Setup */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700">รูปภาพตัวเลือก ({safeData.choices.length} รูป)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm"><Wand2 size={14} className="inline mr-1" /> โหลดข้อมูลเริ่มต้น</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {safeData.choices.map((c, i) => (
            <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded bg-slate-800 text-white font-black flex items-center justify-center">{c.letter}</div>
                 <input type="text" value={c.letter} onChange={(e) => handleChoiceChange(i, 'letter', e.target.value)} className="w-12 px-2 py-1 border rounded text-center font-bold" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><ImageIcon size={12}/> URL รูปภาพ</label>
                 <input type="text" value={c.imageUrl} onChange={(e) => handleChoiceChange(i, 'imageUrl', e.target.value)} placeholder="/images/..." className="w-full px-3 py-1.5 bg-white border rounded text-sm font-mono focus:ring-1 focus:ring-indigo-500" />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Setup */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 border-b pb-3">ประโยคคำถาม (คลิกวงเล็บเพื่อตอบ)</h3>
        <div className="space-y-4">
          {safeData.questions.map((q, i) => (
            <div key={q.id} className="flex gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
               <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center shrink-0">{q.number}</div>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6 space-y-1"><label className="text-[10px] font-bold text-slate-500">ประโยค (จีน)</label><input type="text" value={q.chinese} onChange={(e) => handleQuestionChange(i, 'chinese', e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm" /></div>
                  <div className="md:col-span-4 space-y-1"><label className="text-[10px] font-bold text-slate-500">พินอิน (Auto)</label><input type="text" value={q.pinyin} onChange={(e) => handleQuestionChange(i, 'pinyin', e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm font-mono" /></div>
                  <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-bold text-emerald-600">เฉลยข้อ (A-D)</label><input type="text" value={q.correctAnswer} onChange={(e) => handleQuestionChange(i, 'correctAnswer', e.target.value)} className="w-full px-3 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded text-sm text-center font-bold" /></div>
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}