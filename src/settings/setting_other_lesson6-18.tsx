// src/settings/setting_other_lesson6-18.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2 } from 'lucide-react';

export interface Line6_18 { id: string; chineseText: string; displayMode: 'pinyin' | 'chinese'; }
export interface Card6_18 { id: string; num: number; fullWidth: boolean; lines: Line6_18[]; }

export interface OtherLesson6_18Data {
  id?: string;
  patternType: 'other_lesson6-18';
  mainTitle: string;
  subTitle: string;
  cardHeaderTitle: string;
  cardHeaderSub: string;
  cards: Card6_18[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_18({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_18Data> = {
    mainTitle: '1. 问题闯关。',
    subTitle: 'วัดสมองประลองความรู้',
    cardHeaderTitle: '怎么读？',
    cardHeaderSub: 'อ่านว่าอะไร',
    cards: [
      {
        id: 'c1', num: 1, fullWidth: false,
        lines: [
          { id: 'l1-1', chineseText: '一支笔 一本笔记本', displayMode: 'pinyin' },
          { id: 'l1-2', chineseText: '一本漫画书 一件上衣', displayMode: 'pinyin' },
          { id: 'l1-3', chineseText: '一条裙子 一只熊猫', displayMode: 'pinyin' },
          { id: 'l1-4', chineseText: '一个书包 一条鱼', displayMode: 'pinyin' }
        ]
      },
      {
        id: 'c2', num: 2, fullWidth: false,
        lines: [
          { id: 'l2-1', chineseText: '一双筷子 一个勺子', displayMode: 'pinyin' },
          { id: 'l2-2', chineseText: '一块蛋糕 一杯果汁', displayMode: 'pinyin' },
          { id: 'l2-3', chineseText: '一个叉子 一个杯子', displayMode: 'pinyin' },
          { id: 'l2-4', chineseText: '一个盘子 一块面包', displayMode: 'pinyin' }
        ]
      },
      {
        id: 'c3', num: 3, fullWidth: true,
        lines: [
          { id: 'l3-1', chineseText: '一百块 五十块 二十块 十块 五块 一块', displayMode: 'pinyin' },
          { id: 'l3-2', chineseText: '五毛 一毛 人民币 泰铢 钱', displayMode: 'pinyin' }
        ]
      },
      {
        id: 'c4', num: 4, fullWidth: true,
        lines: [
          { id: 'l4-1', chineseText: '有 裙子 本 笔记本 漫画书 条 支 只 件', displayMode: 'chinese' }
        ]
      },
      {
        id: 'c5', num: 5, fullWidth: true,
        lines: [
          { id: 'l5-1', chineseText: '给 双 块 筷子 勺子 杯 叉子 杯子 盘子', displayMode: 'chinese' }
        ]
      }
    ]
  };

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_18Data = {
    ...section,
    patternType: 'other_lesson6-18',
    mainTitle: section?.mainTitle ?? defaultData.mainTitle,
    subTitle: section?.subTitle ?? defaultData.subTitle,
    cardHeaderTitle: section?.cardHeaderTitle ?? defaultData.cardHeaderTitle,
    cardHeaderSub: section?.cardHeaderSub ?? defaultData.cardHeaderSub,
    cards: Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultData.cards
  };

  const handleChange = (field: keyof OtherLesson6_18Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (cIdx: number, field: string, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards[cIdx] = { ...newCards[cIdx], [field]: value };
      return { ...sec, cards: newCards };
    });
  };

  const handleLineChange = (cIdx: number, lIdx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      const newLines = [...newCards[cIdx].lines];
      newLines[lIdx] = { ...newLines[lIdx], [field]: value };
      newCards[cIdx].lines = newLines;
      return { ...sec, cards: newCards };
    });
  };

  const loadDefaultTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('ต้องการโหลดข้อมูลตั้งต้น ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่า 6-18 (วัดสมองประลองความรู้)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลตั้งต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำแปลหัวข้อหลัก</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-orange-500">หัวข้อในการ์ด (จีน)</label><input type="text" value={safeData.cardHeaderTitle} onChange={(e) => handleChange('cardHeaderTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-orange-500">หัวข้อในการ์ด (ไทย)</label><input type="text" value={safeData.cardHeaderSub} onChange={(e) => handleChange('cardHeaderSub', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50" /></div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {safeData.cards.map((card, cIdx) => (
          <div key={card.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-sm">การ์ดที่ {card.num}</span>
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg cursor-pointer">
                <input type="checkbox" checked={card.fullWidth} onChange={(e) => handleCardChange(cIdx, 'fullWidth', e.target.checked)} className="w-4 h-4 accent-indigo-500" />
                แสดงกว้างเต็มหน้าจอ (Full Width)
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-2 pb-1">
                 <div className="col-span-3 text-[10px] font-bold text-slate-400">รูปแบบที่โชว์ในการ์ด</div>
                 <div className="col-span-9 text-[10px] font-bold text-slate-400">ประโยคภาษาจีน (ป้อนจีนเสมอ ระบบจะแยก Pinyin ให้เอง)</div>
              </div>
              {card.lines.map((line, lIdx) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="col-span-3">
                     <select value={line.displayMode} onChange={(e) => handleLineChange(cIdx, lIdx, 'displayMode', e.target.value)} className="w-full p-2 border rounded-md text-xs font-bold text-slate-600 focus:ring-1 outline-none">
                       <option value="pinyin">แสดง Pinyin</option>
                       <option value="chinese">แสดง อักษรจีน</option>
                     </select>
                  </div>
                  <div className="col-span-9">
                     <input type="text" value={line.chineseText} onChange={(e) => handleLineChange(cIdx, lIdx, 'chineseText', e.target.value)} className="w-full p-2 border rounded-md text-sm" placeholder="พิมพ์อักษรจีน (เช่น 一支笔 一本笔记本)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}