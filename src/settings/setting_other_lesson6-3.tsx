// src/settings/setting_other_lesson6-3.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Volume2, Type, LayoutTemplate, Wand2 } from 'lucide-react';

export interface Card6_3 {
  id: string;
  imageUrl: string;
  chinese: string;
  correctOrder: string;
}

export interface OtherLesson6_3Data {
  id?: string;
  patternType: 'other_lesson6-3';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: Card6_3[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_3({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้น 8 ข้อ ตามรูปภาพหนังสือเป๊ะๆ
  const defaultCards: Card6_3[] = [
    { id: `c_${Date.now()}_1`, imageUrl: '', chinese: '一百零五块', correctOrder: '1' },
    { id: `c_${Date.now()}_2`, imageUrl: '', chinese: '十九块九', correctOrder: '2' },
    { id: `c_${Date.now()}_3`, imageUrl: '', chinese: '二十五块八', correctOrder: '3' },
    { id: `c_${Date.now()}_4`, imageUrl: '', chinese: '二百一十三块', correctOrder: '4' },
    { id: `c_${Date.now()}_5`, imageUrl: '', chinese: '三块五毛八', correctOrder: '5' },
    { id: `c_${Date.now()}_6`, imageUrl: '', chinese: '六块九毛九', correctOrder: '6' },
    { id: `c_${Date.now()}_7`, imageUrl: '', chinese: '十块五毛', correctOrder: '7' },
    { id: `c_${Date.now()}_8`, imageUrl: '', chinese: '三十五块两毛五', correctOrder: '8' }
  ];

  // ✅ พระเอกของเรา: โหลดข้อมูล 8 ข้ออัตโนมัติทันทีที่เปิดหน้านี้ (ถ้ายังไม่มีการ์ด)
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec,
        cards: defaultCards
      }));
    }
  }, [section.id]); // รันแค่ครั้งเดียวตอนโหลด

  const safeCards: Card6_3[] = Array.isArray(section?.cards) ? section.cards : [];
  const safeData: OtherLesson6_3Data = {
    ...section,
    patternType: 'other_lesson6-3',
    mainTitle: section?.mainTitle ?? '3. 听录音，排序。',
    subTitle: section?.subTitle ?? 'ฟังแล้วเขียนตัวเลขตามลำดับ',
    audioTrack: section?.audioTrack ?? '06-03',
    audioUrl: section?.audioUrl ?? '',
    cards: safeCards
  };

  const handleChange = (field: keyof OtherLesson6_3Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (index: number, field: keyof Card6_3, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[index]) {
        newCards[index] = { ...newCards[index], [field]: value };
      }
      return { ...sec, cards: newCards };
    });
  };

  const addCard = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.push({
        id: `card_${Date.now()}`,
        imageUrl: '',
        chinese: '',
        correctOrder: `${newCards.length + 1}`
      });
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

  const forceLoadDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeCards.length > 0) {
      if (!window.confirm('มีข้อมูลอยู่แล้ว ต้องการโหลดข้อมูลเริ่มต้นทับไปเลยหรือไม่?')) return;
    }
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
      ...sec,
      cards: defaultCards
    }));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3">
          <LayoutTemplate className="text-indigo-500" />
          ตั้งค่าส่วนหัว (Header)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">หัวข้อหลัก (จีน)</label>
            <input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">คำอธิบาย (ไทย)</label>
            <input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Volume2 size={14} /> ชื่อแทร็กเสียง</label>
            <input type="text" value={safeData.audioTrack} onChange={(e) => handleChange('audioTrack', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Volume2 size={14} /> URL ไฟล์เสียง</label>
            <input type="text" value={safeData.audioUrl} onChange={(e) => handleChange('audioUrl', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono text-xs" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Type className="text-orange-500" />
              ชุดการ์ด (จัดลำดับ)
            </h3>
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{safeCards.length} ใบ</span>
          </div>
          <button type="button" onClick={forceLoadDefault} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm">
            <Wand2 size={14} /> โหลดข้อมูลเริ่มต้นตามหนังสือ
          </button>
        </div>

        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs border border-blue-100 flex items-start gap-2">
          <span className="font-bold shrink-0">💡 การเฉลยลำดับ:</span>
          <p>กรอกเลข 1, 2, 3... ในช่อง <b>"ลำดับเฉลยที่ถูกต้อง"</b> เพื่อให้ระบบล็อก Focus และปุ่มเฉลยให้ทำงานได้ถูกต้องครับ</p>
        </div>

        <div className="space-y-4">
          {safeCards.map((card, index) => (
            <div key={card.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group hover:border-indigo-300">
              <div className="cursor-move text-slate-300 hover:text-indigo-500 mt-2 shrink-0"><GripVertical size={20} /></div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ImageIcon size={12} /> รูปภาพ (ป้ายราคา) ใบที่ {index + 1}</label>
                  <input type="text" value={card.imageUrl} onChange={(e) => handleCardChange(index, 'imageUrl', e.target.value)} placeholder="URL รูปภาพป้ายราคา" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-12 gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-sm items-end">
                  <div className="col-span-8 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">ประโยคภาษาจีน (Chinese)</label>
                    <input type="text" value={card.chinese} onChange={(e) => handleCardChange(index, 'chinese', e.target.value)} placeholder="เช่น 一百零五块" className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-base font-serif focus:ring-1 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-4 space-y-1 relative">
                    <label className="text-[10px] font-bold text-orange-500">ลำดับเฉลยที่ถูกต้อง</label>
                    <input type="number" value={card.correctOrder} onChange={(e) => handleCardChange(index, 'correctOrder', e.target.value)} placeholder="เช่น 1" className="w-full px-2 py-1.5 bg-orange-50 border border-orange-300 rounded text-base text-center text-orange-700 focus:ring-1 focus:ring-orange-500 outline-none font-bold" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={(e) => removeCard(e, index)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 h-fit" title="ลบการ์ดนี้"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={addCard} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-sm">
            <Plus size={18} className="inline-block mr-1"/> เพิ่มการ์ดใหม่
          </button>
        </div>
      </div>
    </div>
  );
}