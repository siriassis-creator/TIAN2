// src/settings/setting_other_lesson5-18.tsx
import React, { useEffect } from 'react';
import { Edit3, Wand2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (hskId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson5_18({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้นตามในรูปภาพ
  useEffect(() => {
    if (!section.items || section.items.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-18',
        mainTitle: s.mainTitle || '2. 偏旁学习。เรียนรู้หมวดอักษร',
        col1_mainChar: s.col1_mainChar || '木',
        col1_subText1: s.col1_subText1 || '木字旁 mùzìpáng',
        col1_subText2: s.col1_subText2 || '含有“木”的字大多和树木有关。',
        col1_subText3: s.col1_subText3 || 'ตัวอักษรที่มีหมวด 木 ส่วนใหญ่จะเกี่ยวข้องกับต้นไม้',
        items: s.items || [
          { id: 'i1', mainChar: '杯', mainPinyin: 'bēi', words: '杯子 水杯', wordsPinyin: 'bēizi shuǐbēi' },
          { id: 'i2', mainChar: '树', mainPinyin: 'shù', words: '大树', wordsPinyin: 'dàshù' },
          { id: 'i3', mainChar: '棒', mainPinyin: 'bàng', words: '木棒 很棒', wordsPinyin: 'mùbàng hěnbàng' },
          { id: 'i4', mainChar: '柜', mainPinyin: 'guì', words: '柜子', wordsPinyin: 'guìzi' },
          { id: 'i5', mainChar: '椅', mainPinyin: 'yǐ', words: '椅子 桌椅', wordsPinyin: 'yǐzi zhuōyǐ' },
          { id: 'i6', mainChar: '楼', mainPinyin: 'lóu', words: '教学楼', wordsPinyin: 'jiàoxuélóu' },
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeItems = safeSection.items || [];

  const updateCol1 = (field: string, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, [field]: value }));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const newItems = [...(s.items || [])];
      
      // Auto Pinyin เฉพาะช่องที่พิมพ์จีน
      if (field === 'mainChar') {
        newItems[idx] = { ...newItems[idx], mainChar: value, mainPinyin: pinyinConverter(value) };
      } else if (field === 'words') {
        newItems[idx] = { ...newItems[idx], words: value, wordsPinyin: pinyinConverter(value) };
      } else {
        newItems[idx] = { ...newItems[idx], [field]: value };
      }
      
      return { ...s, items: newItems };
    });
  };

  const handleAutoPinyinAll = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const newItems = (s.items || []).map((item: any) => ({
        ...item,
        mainPinyin: item.mainChar ? pinyinConverter(item.mainChar) : item.mainPinyin,
        wordsPinyin: item.words ? pinyinConverter(item.words) : item.wordsPinyin
      }));
      return { ...s, items: newItems };
    });
    alert('🪄 แปลงพินอินอัตโนมัติเรียบร้อยแล้วครับ!');
  };

  return (
    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-sans mt-4 relative">
      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: ตารางเรียนรู้หมวดอักษร (Other_lesson5-18)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อหลัก */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (บนสุด)</label>
        <input 
          type="text" 
          value={safeSection.mainTitle || ''} 
          onChange={(e) => updateCol1('mainTitle', e.target.value)} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 2. ฝั่งซ้าย: Column 1 */}
        <div className="w-full lg:w-1/3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col gap-3">
          <div className="text-xs font-bold text-emerald-700 border-b border-emerald-200 pb-2 mb-2 uppercase">ตั้งค่าฝั่งซ้าย (หมวดอักษร)</div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">อักษรหมวด (ตัวใหญ่)</label>
            <input type="text" value={safeSection.col1_mainChar || ''} onChange={(e) => updateCol1('col1_mainChar', e.target.value)} className="w-full px-3 py-2 text-xl font-serif text-center border rounded focus:ring-1 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">คำอ่าน/พินอิน (บรรทัดแรก)</label>
            <input type="text" value={safeSection.col1_subText1 || ''} onChange={(e) => updateCol1('col1_subText1', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">คำอธิบายจีน (บรรทัดสอง)</label>
            <input type="text" value={safeSection.col1_subText2 || ''} onChange={(e) => updateCol1('col1_subText2', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">คำอธิบายไทย (บรรทัดสาม)</label>
            <input type="text" value={safeSection.col1_subText3 || ''} onChange={(e) => updateCol1('col1_subText3', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400" />
          </div>
        </div>

        {/* 3. ฝั่งขวา: Column 2-4 (ตาราง 6 ช่อง) */}
        <div className="w-full lg:w-2/3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase">ตั้งค่าฝั่งขวา (ตาราง 6 ช่อง พิมพ์จีนแปลพินอินอัตโนมัติ)</span>
            <button onClick={handleAutoPinyinAll} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-all flex items-center gap-1">
              <Wand2 size={12} /> Auto Pinyin
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeItems.map((item: any, idx: number) => (
              <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2 relative">
                <div className="absolute -top-2 -left-2 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {idx + 1}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400">อักษรบน</label>
                    <input type="text" value={item.mainChar || ''} onChange={(e) => updateItem(idx, 'mainChar', e.target.value)} className="w-full px-2 py-1 text-sm font-serif border rounded" placeholder="เช่น 杯" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400">พินอินบน</label>
                    <input type="text" value={item.mainPinyin || ''} onChange={(e) => updateItem(idx, 'mainPinyin', e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded text-slate-500" placeholder="พินอิน..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400">คำศัพท์ล่าง</label>
                    <input type="text" value={item.words || ''} onChange={(e) => updateItem(idx, 'words', e.target.value)} className="w-full px-2 py-1 text-sm font-serif border rounded" placeholder="เช่น 杯子 水杯" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400">พินอินล่าง</label>
                    <input type="text" value={item.wordsPinyin || ''} onChange={(e) => updateItem(idx, 'wordsPinyin', e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded text-slate-500" placeholder="พินอิน..." />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}