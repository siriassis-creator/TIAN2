// src/settings/setting_other_lesson6-5.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Volume2, LayoutTemplate, MessageCircle, Wand2 } from 'lucide-react';

export interface Card6_5 {
  id: string;
  imageUrl: string;
  noun: string;       
  measureWord: string; 
  priceNumber: string; 
  priceSpoken: string; 
}

export interface OtherLesson6_5Data {
  id?: string;
  patternType: 'other_lesson6-5';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: Card6_5[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_5({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้น 12 ข้อ (รวมของใหม่)
  const defaultCards: Card6_5[] = [
    { id: `c_default_1`, imageUrl: '', noun: '书包', measureWord: '个', priceNumber: '120.00', priceSpoken: '一百二十块' },
    { id: `c_default_2`, imageUrl: '', noun: '笔记本', measureWord: '本', priceNumber: '18.50', priceSpoken: '十八块五' },
    { id: `c_default_3`, imageUrl: '', noun: '橡皮', measureWord: '块', priceNumber: '1.50', priceSpoken: '一块五' },
    { id: `c_default_4`, imageUrl: '', noun: '西瓜', measureWord: '个', priceNumber: '25.00', priceSpoken: '二十五块' },
    { id: `c_default_5`, imageUrl: '', noun: '芒果', measureWord: '个', priceNumber: '8.80', priceSpoken: '八块八' },
    { id: `c_default_6`, imageUrl: '', noun: '榴莲', measureWord: '个', priceNumber: '90.99', priceSpoken: '九十块九毛九' },
    // ข้อมูลชุดใหม่
    { id: `c_default_7`, imageUrl: '', noun: '上衣', measureWord: '件', priceNumber: '402.00', priceSpoken: '四百零二块' },
    { id: `c_default_8`, imageUrl: '', noun: '裤子', measureWord: '条', priceNumber: '199.00', priceSpoken: '一百九十九块' },
    { id: `c_default_9`, imageUrl: '', noun: '鞋', measureWord: '双', priceNumber: '299.00', priceSpoken: '两百九十九块' },
    { id: `c_default_10`, imageUrl: '', noun: '可乐', measureWord: '杯', priceNumber: '3.05', priceSpoken: '三块零五分' },
    { id: `c_default_11`, imageUrl: '', noun: '牛奶', measureWord: '盒', priceNumber: '3.80', priceSpoken: '三块八' },
    { id: `c_default_12`, imageUrl: '', noun: '包子', measureWord: '个', priceNumber: '2.00', priceSpoken: '两块' }
  ];

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec, cards: defaultCards
      }));
    }
  }, [section.id]);

  const safeCards: Card6_5[] = Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultCards;
  const safeData: OtherLesson6_5Data = {
    ...section,
    patternType: 'other_lesson6-5',
    mainTitle: section?.mainTitle ?? '2. 两人一组，看一看，说一说。',
    subTitle: section?.subTitle ?? 'กิจกรรมคู่ ดูภาพแล้วฝึกพูด',
    audioTrack: section?.audioTrack ?? '06-05',
    audioUrl: section?.audioUrl ?? '',
    cards: safeCards
  };

  const handleChange = (field: keyof OtherLesson6_5Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (index: number, field: keyof Card6_5, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[index]) newCards[index] = { ...newCards[index], [field]: value };
      return { ...sec, cards: newCards };
    });
  };

  const addCard = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.push({ id: `card_${Date.now()}`, imageUrl: '', noun: '', measureWord: '', priceNumber: '', priceSpoken: '' });
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
      if (!window.confirm('มีข้อมูลอยู่แล้ว ต้องการโหลดข้อมูล 12 ข้อ ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
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
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">ชื่อแทร็กเสียง</label><input type="text" value={safeData.audioTrack} onChange={(e) => handleChange('audioTrack', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">URL ไฟล์เสียง</label><input type="text" value={safeData.audioUrl} onChange={(e) => handleChange('audioUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-orange-500" /> <h3 className="text-lg font-bold text-slate-700">คำศัพท์สินค้า ({safeCards.length})</h3>
          </div>
          <button type="button" onClick={loadDefaultTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm">
            <Wand2 size={14} /> โหลดข้อมูล 12 ข้ออัตโนมัติ
          </button>
        </div>

        <div className="space-y-4">
          {safeCards.map((card, index) => (
            <div key={card.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 group">
              <div className="cursor-move text-slate-300 mt-2 shrink-0"><GripVertical size={20} /></div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><ImageIcon size={12}/> URL รูปภาพ</label>
                  <input type="text" value={card.imageUrl} onChange={(e) => handleCardChange(index, 'imageUrl', e.target.value)} className="w-full px-3 py-1.5 bg-white border rounded text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 space-y-1"><label className="text-[10px] font-bold text-slate-500">คำศัพท์ (Noun)</label><input type="text" value={card.noun} onChange={(e) => handleCardChange(index, 'noun', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
                  <div className="col-span-4 space-y-1"><label className="text-[10px] font-bold text-slate-500">ลักษณนาม (Measure)</label><input type="text" value={card.measureWord} onChange={(e) => handleCardChange(index, 'measureWord', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
                  <div className="col-span-4 space-y-1"><label className="text-[10px] font-bold text-orange-500">ป้ายราคา (120.00)</label><input type="text" value={card.priceNumber} onChange={(e) => handleCardChange(index, 'priceNumber', e.target.value)} className="w-full px-2 py-1.5 border border-orange-200 bg-orange-50 text-orange-700 font-bold rounded text-sm text-center" /></div>
                  <div className="col-span-12 space-y-1 mt-1"><label className="text-[10px] font-bold text-indigo-500">คำอ่านราคา (ร้อยยี่สิบหยวน)</label><input type="text" value={card.priceSpoken} onChange={(e) => handleCardChange(index, 'priceSpoken', e.target.value)} className="w-full px-2 py-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold rounded text-sm text-center" /></div>
                </div>
              </div>
              <button type="button" onClick={(e) => removeCard(e, index)} className="text-slate-300 hover:text-red-500 p-2 h-fit"><Trash2 size={18}/></button>
            </div>
          ))}
          <button type="button" onClick={addCard} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl hover:bg-indigo-50 font-bold text-sm flex justify-center items-center gap-1">
            <Plus size={18}/> เพิ่มสินค้า
          </button>
        </div>
      </div>

    </div>
  );
}