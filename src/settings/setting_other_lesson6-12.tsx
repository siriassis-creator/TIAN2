// src/settings/setting_other_lesson6-12.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2, Puzzle } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface Question6_12 { id: string; number: number; sentenceTemplate: string; choices: string[]; correctAnswer: string; imageUrl: string; }
export interface Part2Item6_12 { id: string; fullChar: string; missingPart: string; }

export interface OtherLesson6_12Data {
  id?: string;
  patternType: 'other_lesson6-12';
  mainTitle1: string;
  subTitle1: string;
  questions: Question6_12[];
  mainTitle2: string;
  subTitle2: string;
  part2Items: Part2Item6_12[];
  part2ChoicesBank: string[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_12({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_12Data> = {
    mainTitle1: '3. 圈出正确的汉字，然后读一读。',
    subTitle1: 'วงกลมล้อมรอบตัวอักษรจีนที่ถูกต้อง จากนั้นฝึกอ่าน',
    questions: [
      { id: 'q1', number: 1, sentenceTemplate: '这个多少_？', choices: ['钱', '浅', '铅'], correctAnswer: '钱', imageUrl: '' },
      { id: 'q2', number: 2, sentenceTemplate: '这支笔五_五。', choices: ['快', '块', '筷'], correctAnswer: '块', imageUrl: '' },
      { id: 'q3', number: 3, sentenceTemplate: '这个一_块。', choices: ['白', '自', '百'], correctAnswer: '百', imageUrl: '' },
      { id: 'q4', number: 4, sentenceTemplate: '这本书真_。', choices: ['贯', '贵', '贸'], correctAnswer: '贵', imageUrl: '' }
    ],
    mainTitle2: '4. 写出缺失的部分。',
    subTitle2: 'เขียนส่วนประกอบที่หายไป',
    part2Items: [
      { id: 'p2_1', fullChar: '块', missingPart: '夬' },
      { id: 'p2_2', fullChar: '贵', missingPart: '贝' },
      { id: 'p2_3', fullChar: '钱', missingPart: '戋' },
      { id: 'p2_4', fullChar: '百', missingPart: '白' }
    ],
    part2ChoicesBank: ['白', '戋', '贝', '夬']
  };

  useEffect(() => {
    if (!section.questions || section.questions.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_12Data = {
    ...section,
    patternType: 'other_lesson6-12',
    mainTitle1: section?.mainTitle1 ?? defaultData.mainTitle1,
    subTitle1: section?.subTitle1 ?? defaultData.subTitle1,
    questions: Array.isArray(section?.questions) && section.questions.length > 0 ? section.questions : defaultData.questions,
    mainTitle2: section?.mainTitle2 ?? defaultData.mainTitle2,
    subTitle2: section?.subTitle2 ?? defaultData.subTitle2,
    part2Items: Array.isArray(section?.part2Items) && section.part2Items.length > 0 ? section.part2Items : defaultData.part2Items,
    part2ChoicesBank: Array.isArray(section?.part2ChoicesBank) && section.part2ChoicesBank.length > 0 ? section.part2ChoicesBank : defaultData.part2ChoicesBank
  };

  const handleChange = (field: keyof OtherLesson6_12Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleQuestionChange = (index: number, field: keyof Question6_12, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newQ = [...(sec.questions || [])];
      newQ[index] = { ...newQ[index], [field]: value };
      return { ...sec, questions: newQ };
    });
  };

  const handleChoiceChange = (qIndex: number, choiceIndex: number, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newQ = [...(sec.questions || [])];
      const newChoices = [...newQ[qIndex].choices];
      newChoices[choiceIndex] = value;
      newQ[qIndex] = { ...newQ[qIndex], choices: newChoices };
      return { ...sec, questions: newQ };
    });
  };

  const handlePart2ItemChange = (index: number, field: keyof Part2Item6_12, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newItems = [...(sec.part2Items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...sec, part2Items: newItems };
    });
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* Header Part 1 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
           <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ส่วนที่ 1: เติมคำในช่องว่าง</h3>
           <button onClick={() => updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }))} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดค่าเริ่มต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle1} onChange={(e) => handleChange('mainTitle1', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle1} onChange={(e) => handleChange('subTitle1', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Part 1 Questions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-2">คำถาม 4 ข้อ (ใช้ _ เพื่อเว้นช่องว่าง)</h3>
        {safeData.questions.map((q, qIdx) => (
          <div key={q.id} className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center shrink-0">{q.number}</div>
               <div className="flex-1 space-y-1"><label className="text-[10px] font-bold text-orange-600">ประโยค (มี _ ตรงช่องว่าง)</label><input type="text" value={q.sentenceTemplate} onChange={(e) => handleQuestionChange(qIdx, 'sentenceTemplate', e.target.value)} className="w-full px-2 py-1.5 border border-orange-200 rounded text-sm" /></div>
               <div className="w-[120px] space-y-1"><label className="text-[10px] font-bold text-emerald-600">เฉลย</label><input type="text" value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded text-sm text-center font-bold" /></div>
             </div>
             <div className="flex gap-2 pl-11">
               {q.choices.map((choice, cIdx) => (
                 <div key={cIdx} className="flex-1 space-y-1"><label className="text-[10px] font-bold text-slate-500">ตัวเลือก {cIdx+1}</label><input type="text" value={choice} onChange={(e) => handleChoiceChange(qIdx, cIdx, e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
               ))}
               <div className="flex-1 space-y-1"><label className="text-[10px] font-bold text-slate-500">URL รูปภาพ</label><input type="text" value={q.imageUrl} onChange={(e) => handleQuestionChange(qIdx, 'imageUrl', e.target.value)} placeholder="/images/..." className="w-full px-2 py-1.5 border rounded text-sm font-mono" /></div>
             </div>
          </div>
        ))}
      </div>

      {/* Header Part 2 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><Puzzle className="text-emerald-500" /> ส่วนที่ 2: ประกอบอักษรจีน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle2} onChange={(e) => handleChange('mainTitle2', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle2} onChange={(e) => handleChange('subTitle2', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-emerald-600">ตัวเลือกชิ้นส่วน (คั่นด้วยลูกน้ำ)</label>
          <input type="text" value={safeData.part2ChoicesBank.join(',')} onChange={(e) => handleChange('part2ChoicesBank', e.target.value.split(','))} className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm font-serif text-lg tracking-widest bg-emerald-50" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {safeData.part2Items.map((item, idx) => (
             <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">อักษรเป้าหมาย</label><input type="text" value={item.fullChar} onChange={(e) => handlePart2ItemChange(idx, 'fullChar', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center font-serif text-lg bg-slate-200" disabled /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-emerald-600">ชิ้นส่วนที่ถูกต้อง</label><input type="text" value={item.missingPart} onChange={(e) => handlePart2ItemChange(idx, 'missingPart', e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 rounded text-sm text-center font-serif text-lg" /></div>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}