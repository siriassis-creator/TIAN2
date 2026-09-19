// src/settings/setting_other_lesson6-8.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, LayoutTemplate, Wand2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface Card6_8 {
  id: string;
  imageUrl: string;
  noun: string;       // คำศัพท์ (ตัวจีน)
  pinyin: string;     // พินอิน
  priceNumber: string;// ราคาตัวเลข
  priceSpoken: string;// คำอ่านราคา (ตัวจีน)
}

export interface OtherLesson6_8Data {
  id?: string;
  patternType: 'other_lesson6-8';
  mainTitle: string;
  subTitle: string;
  cards: Card6_8[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_8({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // อัปเดตข้อมูล 18 คำศัพท์ พร้อมฟิลด์ราคาและพินอิน
  const defaultCards: Card6_8[] = [
    { id: `c_def_1`, imageUrl: '', noun: '面包', pinyin: 'miànbāo', priceNumber: '5.80', priceSpoken: '五块八' },
    { id: `c_def_2`, imageUrl: '', noun: '橡皮', pinyin: 'xiàngpí', priceNumber: '1.80', priceSpoken: '一块八' },
    { id: `c_def_3`, imageUrl: '', noun: '可乐', pinyin: 'kělè', priceNumber: '3.80', priceSpoken: '三块八' },
    { id: `c_def_4`, imageUrl: '', noun: '果汁', pinyin: 'guǒzhī', priceNumber: '5.00', priceSpoken: '五块' },
    { id: `c_def_5`, imageUrl: '', noun: '牛奶', pinyin: 'niúnǎi', priceNumber: '3.50', priceSpoken: '三块五' },
    { id: `c_def_6`, imageUrl: '', noun: '铅笔', pinyin: 'qiānbǐ', priceNumber: '5.00', priceSpoken: '五块' },
    { id: `c_def_7`, imageUrl: '', noun: '山竹', pinyin: 'shānzhú', priceNumber: '6.80', priceSpoken: '六块八' },
    { id: `c_def_8`, imageUrl: '', noun: '香蕉', pinyin: 'xiāngjiāo', priceNumber: '6.80', priceSpoken: '六块八' },
    { id: `c_def_9`, imageUrl: '', noun: '书包', pinyin: 'shūbāo', priceNumber: '399.00', priceSpoken: '三百九十九块' },
    { id: `c_def_10`, imageUrl: '', noun: '课本', pinyin: 'kèběn', priceNumber: '120.00', priceSpoken: '一百二十块' },
    { id: `c_def_11`, imageUrl: '', noun: '书', pinyin: 'shū', priceNumber: '52.00', priceSpoken: '五十二块' },
    { id: `c_def_12`, imageUrl: '', noun: '裙子', pinyin: 'qúnzi', priceNumber: '129.00', priceSpoken: '一百二十九块' },
    { id: `c_def_13`, imageUrl: '', noun: '椅子', pinyin: 'yǐzi', priceNumber: '599.00', priceSpoken: '五百九十九块' },
    { id: `c_def_14`, imageUrl: '', noun: '桌子', pinyin: 'zhuōzi', priceNumber: '799.00', priceSpoken: '七百九十九块' },
    { id: `c_def_15`, imageUrl: '', noun: '菠萝', pinyin: 'bōluó', priceNumber: '10.00', priceSpoken: '十块' },
    { id: `c_def_16`, imageUrl: '', noun: '笔记本', pinyin: 'bǐjìběn', priceNumber: '8.90', priceSpoken: '八块九' },
    { id: `c_def_17`, imageUrl: '', noun: '笔袋', pinyin: 'bǐdài', priceNumber: '19.80', priceSpoken: '十九块八' },
    { id: `c_def_18`, imageUrl: '', noun: '梨', pinyin: 'lí', priceNumber: '6.80', priceSpoken: '六块八' }
  ];

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec, cards: defaultCards
      }));
    }
  }, [section.id]);

  const safeCards: Card6_8[] = Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultCards;
  const safeData: OtherLesson6_8Data = {
    ...section,
    patternType: 'other_lesson6-8',
    mainTitle: section?.mainTitle ?? '3. 扔橡皮游戏。',
    subTitle: section?.subTitle ?? 'เกมโยนยางลบ',
    cards: safeCards
  };

  const handleChange = (field: keyof OtherLesson6_8Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (index: number, field: keyof Card6_8, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[index]) {
        newCards[index] = { ...newCards[index], [field]: value };
        // แปลง Pinyin อัตโนมัติเมื่อพิมพ์ตัวจีน
        if (field === 'noun') {
           newCards[index].pinyin = pinyinConverter(value);
        }
      }
      return { ...sec, cards: newCards };
    });
  };

  const addCard = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.push({ id: `card_${Date.now()}`, imageUrl: '', noun: '', pinyin: '', priceNumber: '', priceSpoken: '' });
      return { ...sec, cards: newCards };
    });
  };

  const removeCard = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.splice(index, 1);
      return { ...sec, cards: newCards };
    });
  };

  const loadDefaultTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeCards.length > 0) {
      if (!window.confirm('ต้องการโหลดข้อมูล 18 คำศัพท์ ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
    }
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
      ...sec, cards: defaultCards
    }));
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

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700">กองการ์ดสินค้า ({safeCards.length} ใบ)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm">
            <Wand2 size={14} /> โหลด 18 การ์ดเริ่มต้น
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {safeCards.map((card, index) => (
            <div key={card.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 group">
              <div className="cursor-move text-slate-300 mt-2 shrink-0"><GripVertical size={20} /></div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><ImageIcon size={12}/> URL รูปภาพ</label>
                  <input type="text" value={card.imageUrl} onChange={(e) => handleCardChange(index, 'imageUrl', e.target.value)} placeholder="/images/..." className="w-full px-3 py-1.5 bg-white border rounded text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">อักษรจีน</label><input type="text" value={card.noun} onChange={(e) => handleCardChange(index, 'noun', e.target.value)} placeholder="面包" className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">พินอิน</label><input type="text" value={card.pinyin || ''} onChange={(e) => handleCardChange(index, 'pinyin', e.target.value)} placeholder="miànbāo" className="w-full px-2 py-1.5 border rounded text-sm text-center font-mono" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-indigo-500">ราคาตัวเลข</label><input type="text" value={card.priceNumber || ''} onChange={(e) => handleCardChange(index, 'priceNumber', e.target.value)} placeholder="5.80" className="w-full px-2 py-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded text-sm text-center font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-emerald-600">คำอ่านราคา</label><input type="text" value={card.priceSpoken} onChange={(e) => handleCardChange(index, 'priceSpoken', e.target.value)} placeholder="五块八" className="w-full px-2 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded text-sm text-center" /></div>
                </div>
              </div>
              <button type="button" onClick={(e) => removeCard(e, index)} className="text-slate-300 hover:text-red-500 p-2 h-fit"><Trash2 size={18}/></button>
            </div>
          ))}
          <button type="button" onClick={addCard} className="w-full h-full min-h-[120px] border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl hover:bg-indigo-50 font-bold text-sm flex justify-center items-center gap-1">
            <Plus size={18}/> เพิ่มการ์ดใหม่
          </button>
        </div>
      </div>

    </div>
  );
}