// src/settings/setting_other_lesson6-14.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2, Plus, Trash2 } from 'lucide-react';

export interface CardItem6_14 { id: string; symbol: string; chineseText: string; }
export interface VocabItem6_14 { id: string; chinese: string; thai: string; }

export interface OtherLesson6_14Data {
  id?: string;
  patternType: 'other_lesson6-14';
  mainTitle: string;
  subTitle: string;
  cards: CardItem6_14[];
  vocabTitle: string;
  vocabs: VocabItem6_14[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_14({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_14Data> = {
    mainTitle: '1. 你知道吗？',
    subTitle: 'รู้หรือไม่',
    cards: [
      { id: 'c1', symbol: '¥', chineseText: '中国的钱叫 “人民币”。' },
      { id: 'c2', symbol: '฿', chineseText: '泰国的钱叫 “泰铢”。' },
      { id: 'c3', symbol: '$', chineseText: '美国的钱叫 “美元”。' },
      { id: 'c4', symbol: '£', chineseText: '英国的钱叫 “英镑”。' },
      { id: 'c5', symbol: '¥', chineseText: '日本的钱叫 “日元”。' }
    ],
    vocabTitle: '你认识这些货币符号吗？ (คุณรู้จักสัญลักษณ์ของสกุลเงินเหล่านี้ไหม)',
    vocabs: [
      { id: 'v1', chinese: '美元', thai: 'เงินดอลลาร์' },
      { id: 'v2', chinese: '英镑', thai: 'เงินปอนด์' },
      { id: 'v3', chinese: '日元', thai: 'เงินเยน' }
    ]
  };

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_14Data = {
    ...section,
    patternType: 'other_lesson6-14',
    mainTitle: section?.mainTitle ?? defaultData.mainTitle,
    subTitle: section?.subTitle ?? defaultData.subTitle,
    cards: Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultData.cards,
    vocabTitle: section?.vocabTitle ?? defaultData.vocabTitle,
    vocabs: Array.isArray(section?.vocabs) ? section.vocabs : defaultData.vocabs
  };

  const handleChange = (field: keyof OtherLesson6_14Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleArrayChange = (arrayName: 'cards' | 'vocabs', index: number, field: string, value: string) => {
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
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่าเนื้อหา 6-14 (รู้หรือไม่)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลตั้งต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Cards List */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-2">รายการการ์ดสกุลเงิน</h3>
        <div className="space-y-3">
          {safeData.cards.map((item, idx) => (
             <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-20 shrink-0 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">สัญลักษณ์</label>
                  <input type="text" value={item.symbol} onChange={(e) => handleArrayChange('cards', idx, 'symbol', e.target.value)} className="w-full px-2 py-1.5 border rounded text-center font-bold text-lg text-yellow-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">ประโยคภาษาจีน (Pinyin จะสร้างให้อัตโนมัติ)</label>
                  <input type="text" value={item.chineseText} onChange={(e) => handleArrayChange('cards', idx, 'chineseText', e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm" />
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-orange-800 border-b border-orange-200 pb-2">คำศัพท์อื่นๆ (กรอบด้านล่าง)</h3>
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-orange-700">หัวข้อกรอบคำศัพท์</label>
           <input type="text" value={safeData.vocabTitle} onChange={(e) => handleChange('vocabTitle', e.target.value)} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white" />
        </div>
        <div className="space-y-2">
          {safeData.vocabs.map((item, idx) => (
             <div key={item.id} className="flex gap-2">
                <input type="text" value={item.chinese} onChange={(e) => handleArrayChange('vocabs', idx, 'chinese', e.target.value)} placeholder="อักษรจีน" className="flex-1 px-3 py-1.5 border border-orange-200 rounded text-sm bg-white" />
                <input type="text" value={item.thai} onChange={(e) => handleArrayChange('vocabs', idx, 'thai', e.target.value)} placeholder="คำแปล" className="flex-1 px-3 py-1.5 border border-orange-200 rounded text-sm bg-white" />
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}