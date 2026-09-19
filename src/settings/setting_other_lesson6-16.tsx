// src/settings/setting_other_lesson6-16.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2 } from 'lucide-react';

export interface Option6_16 { letter: string; text: string; }
export interface Card6_16 { id: string; num: number; imageUrl: string; answer: string; }

export interface OtherLesson6_16Data {
  id?: string;
  patternType: 'other_lesson6-16';
  headerTitle: string;
  headerSub: string;
  mainTitle: string;
  subTitle: string;
  options: Option6_16[];
  cards: Card6_16[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_16({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_16Data> = {
    headerTitle: '测一测',
    headerSub: 'ทดสอบความจำ',
    mainTitle: '1. 看图片，选择正确的答案。',
    subTitle: 'ดูภาพแล้วเลือกคำตอบที่ถูกต้อง',
    options: [
      { letter: 'A', text: '一百块' },
      { letter: 'B', text: '泰铢' },
      { letter: 'C', text: '六十九块' },
      { letter: 'D', text: '十二块九毛九' },
      { letter: 'E', text: '真贵啊' },
      { letter: 'F', text: '五毛五' },
      { letter: 'G', text: '七块五' }
    ],
    cards: [
      { id: 'c1', num: 1, imageUrl: '', answer: 'E' }, // ปากกา 200.00 -> 真贵啊 (แพงจัง)
      { id: 'c2', num: 2, imageUrl: '', answer: 'B' }, // เงินบาท -> 泰铢
      { id: 'c3', num: 3, imageUrl: '', answer: 'C' }, // 69.00 -> 六十九块
      { id: 'c4', num: 4, imageUrl: '', answer: 'F' }, // 0.55 -> 五毛五
      { id: 'c5', num: 5, imageUrl: '', answer: 'D' }, // 12.99 -> 十二块九毛九
      { id: 'c6', num: 6, imageUrl: '', answer: 'A' }, // แบงก์ 100 -> 一百块
      { id: 'c7', num: 7, imageUrl: '', answer: 'G' }  // 7.50 -> 七块五
    ]
  };

  useEffect(() => {
    if (!section.options || section.options.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_16Data = {
    ...section,
    patternType: 'other_lesson6-16',
    headerTitle: section?.headerTitle ?? defaultData.headerTitle,
    headerSub: section?.headerSub ?? defaultData.headerSub,
    mainTitle: section?.mainTitle ?? defaultData.mainTitle,
    subTitle: section?.subTitle ?? defaultData.subTitle,
    options: Array.isArray(section?.options) && section.options.length > 0 ? section.options : defaultData.options,
    cards: Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultData.cards
  };

  const handleChange = (field: keyof OtherLesson6_16Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleArrayChange = (arrayName: 'options' | 'cards', index: number, field: string, value: string | number) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newArray = [...(sec[arrayName] || [])];
      if (newArray[index]) newArray[index] = { ...newArray[index], [field]: value };
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
      
      {/* Headings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่า 6-16 (ทดสอบความจำ)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลตั้งต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">ป้ายหัวข้อ (จีน)</label><input type="text" value={safeData.headerTitle} onChange={(e) => handleChange('headerTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50 text-orange-700 font-bold" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">ป้ายหัวข้อ (ไทย)</label><input type="text" value={safeData.headerSub} onChange={(e) => handleChange('headerSub', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50 text-orange-700 font-bold" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำสั่ง (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำสั่ง (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options */}
        <div className="bg-pink-50 p-5 rounded-xl border border-pink-100 shadow-sm space-y-4">
           <h3 className="text-sm font-bold text-pink-800 border-b border-pink-200 pb-2">ตัวเลือก (A-G)</h3>
           <div className="space-y-2">
             {safeData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                   <div className="w-8 h-8 flex items-center justify-center bg-white border border-pink-200 rounded font-bold text-pink-600">{opt.letter}</div>
                   <input type="text" value={opt.text} onChange={(e) => handleArrayChange('options', idx, 'text', e.target.value)} placeholder="ข้อความภาษาจีน" className="flex-1 px-3 py-1.5 border border-pink-200 rounded text-sm bg-white" />
                </div>
             ))}
           </div>
        </div>

        {/* Cards */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
           <h3 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2">การ์ดรูปภาพและเฉลย</h3>
           <div className="space-y-3">
             {safeData.cards.map((card, idx) => (
                <div key={card.id} className="bg-white p-3 rounded-lg border border-blue-200 space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">ข้อ {card.num}</span>
                     <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">เฉลยตัวอักษร:</label>
                        <input type="text" value={card.answer} onChange={(e) => handleArrayChange('cards', idx, 'answer', e.target.value.toUpperCase())} maxLength={1} className="w-10 px-2 py-1 border-2 border-emerald-400 bg-emerald-50 rounded text-sm font-bold text-emerald-700 text-center" />
                     </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">URL รูปภาพ</label>
                      <input type="text" value={card.imageUrl} onChange={(e) => handleArrayChange('cards', idx, 'imageUrl', e.target.value)} placeholder="/images/..." className="w-full px-2 py-1 border rounded text-xs" />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
}