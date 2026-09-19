// src/settings/setting_other_lesson6-11.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2, BookOpen } from 'lucide-react';

export interface Flashcard6_11 { id: string; character: string; word: string; }
export interface RadicalInfo6_11 { radical: string; nameZh: string; pinyin: string; descZh: string; descTh: string; }

export interface OtherLesson6_11Data {
  id?: string;
  patternType: 'other_lesson6-11';
  mainTitle1: string;
  subTitle1: string;
  part1Cards: Flashcard6_11[];
  mainTitle2: string;
  subTitle2: string;
  radicalInfo: RadicalInfo6_11;
  part2Cards: Flashcard6_11[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_11({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_11Data> = {
    mainTitle1: '1. 读一读，认一认。',
    subTitle1: 'ฝึกอ่านและจำตัวอักษรจีน',
    part1Cards: [
      { id: 'p1_1', character: '钱', word: '多少钱' },
      { id: 'p1_2', character: '贵', word: '真贵' },
      { id: 'p1_3', character: '百', word: '一百块' }
    ],
    mainTitle2: '2. 偏旁学习。',
    subTitle2: 'เรียนรู้หมวดอักษร',
    radicalInfo: {
      radical: '钅',
      nameZh: '金字旁',
      pinyin: 'jīnzìpáng',
      descZh: '含有“钅”的字大多和金属有关。',
      descTh: 'ตัวอักษรที่มีหมวด 钅 ส่วนใหญ่จะเกี่ยวข้องกับโลหะ'
    },
    part2Cards: [
      { id: 'p2_1', character: '钱', word: '多少钱' },
      { id: 'p2_2', character: '镜', word: '眼镜 镜子' },
      { id: 'p2_3', character: '铅', word: '铅笔' }
    ]
  };

  useEffect(() => {
    if (!section.part1Cards || section.part1Cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_11Data = {
    ...section,
    patternType: 'other_lesson6-11',
    mainTitle1: section?.mainTitle1 ?? defaultData.mainTitle1,
    subTitle1: section?.subTitle1 ?? defaultData.subTitle1,
    part1Cards: Array.isArray(section?.part1Cards) && section.part1Cards.length > 0 ? section.part1Cards : defaultData.part1Cards,
    mainTitle2: section?.mainTitle2 ?? defaultData.mainTitle2,
    subTitle2: section?.subTitle2 ?? defaultData.subTitle2,
    radicalInfo: section?.radicalInfo ?? defaultData.radicalInfo,
    part2Cards: Array.isArray(section?.part2Cards) && section.part2Cards.length > 0 ? section.part2Cards : defaultData.part2Cards
  };

  const handleChange = (field: keyof OtherLesson6_11Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (part: 'part1Cards' | 'part2Cards', index: number, field: keyof Flashcard6_11, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec[part] || [])];
      if (newCards[index]) newCards[index] = { ...newCards[index], [field]: value };
      return { ...sec, [part]: newCards };
    });
  };

  const handleRadicalChange = (field: keyof RadicalInfo6_11, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      return { ...sec, radicalInfo: { ...sec.radicalInfo, [field]: value } };
    });
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* Header Part 1 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><LayoutTemplate className="text-indigo-500" /> ส่วนที่ 1: ฝึกอ่านและจำตัวอักษร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle1} onChange={(e) => handleChange('mainTitle1', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle1} onChange={(e) => handleChange('subTitle1', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {safeData.part1Cards.map((card, idx) => (
             <div key={card.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">ตัวอักษรหลัก</label><input type="text" value={card.character} onChange={(e) => handleCardChange('part1Cards', idx, 'character', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center font-serif text-lg" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">คำศัพท์ประกอบ</label><input type="text" value={card.word} onChange={(e) => handleCardChange('part1Cards', idx, 'word', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
             </div>
          ))}
        </div>
      </div>

      {/* Header Part 2 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><BookOpen className="text-emerald-500" /> ส่วนที่ 2: เรียนรู้หมวดอักษร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle2} onChange={(e) => handleChange('mainTitle2', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle2} onChange={(e) => handleChange('subTitle2', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        
        {/* Radical Info */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
           <div className="space-y-1"><label className="text-[10px] font-bold text-emerald-600">หมวดอักษร</label><input type="text" value={safeData.radicalInfo.radical} onChange={(e) => handleRadicalChange('radical', e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 rounded text-center font-serif text-xl bg-white" /></div>
           <div className="space-y-1"><label className="text-[10px] font-bold text-emerald-600">ชื่อหมวด (จีน)</label><input type="text" value={safeData.radicalInfo.nameZh} onChange={(e) => handleRadicalChange('nameZh', e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 rounded text-center bg-white" /></div>
           <div className="space-y-1"><label className="text-[10px] font-bold text-emerald-600">พินอิน</label><input type="text" value={safeData.radicalInfo.pinyin} onChange={(e) => handleRadicalChange('pinyin', e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 rounded text-center font-mono bg-white" /></div>
           <div className="space-y-1 md:col-span-4"><label className="text-[10px] font-bold text-emerald-600">คำอธิบาย (จีน)</label><input type="text" value={safeData.radicalInfo.descZh} onChange={(e) => handleRadicalChange('descZh', e.target.value)} className="w-full px-3 py-1.5 border border-emerald-200 rounded bg-white text-sm" /></div>
           <div className="space-y-1 md:col-span-4"><label className="text-[10px] font-bold text-emerald-600">คำอธิบาย (ไทย)</label><input type="text" value={safeData.radicalInfo.descTh} onChange={(e) => handleRadicalChange('descTh', e.target.value)} className="w-full px-3 py-1.5 border border-emerald-200 rounded bg-white text-sm" /></div>
        </div>

        {/* Part 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {safeData.part2Cards.map((card, idx) => (
             <div key={card.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">ตัวอักษร (คอลัมน์ {idx+2})</label><input type="text" value={card.character} onChange={(e) => handleCardChange('part2Cards', idx, 'character', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center font-serif text-lg" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">คำศัพท์ประกอบ</label><input type="text" value={card.word} onChange={(e) => handleCardChange('part2Cards', idx, 'word', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}