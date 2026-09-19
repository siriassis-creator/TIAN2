// src/settings/setting_other_lesson6-6.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, LayoutTemplate, Wand2, Type } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface Card6_6 {
  id: string;
  displayType: 'text' | 'image';
  content: string;     // คำแปลภาษาไทย หรือ URL รูปภาพ
  chinese: string;     // อักษรจีน
  pinyinClue: string;  // พินอินที่มีช่องว่าง เช่น ___shao
  fullPinyin: string;  // พินอินเฉลย เช่น duōshao
}

export interface OtherLesson6_6Data {
  id?: string;
  patternType: 'other_lesson6-6';
  mainTitle: string;
  subTitle: string;
  cards: Card6_6[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_6({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้น 9 ข้อ ตามรูปภาพเป๊ะๆ
  const defaultCards: Card6_6[] = [
    { id: `c_def_1`, displayType: 'text', content: 'เท่าไร', chinese: '多少', pinyinClue: '____shao', fullPinyin: 'duōshao' },
    { id: `c_def_2`, displayType: 'text', content: 'เงิน', chinese: '钱', pinyinClue: '____ián', fullPinyin: 'qián' },
    { id: `c_def_3`, displayType: 'text', content: 'แพง', chinese: '贵', pinyinClue: '____uì', fullPinyin: 'guì' },
    { id: `c_def_4`, displayType: 'text', content: 'จริงๆ', chinese: '真', pinyinClue: 'zh____', fullPinyin: 'zhēn' },
    { id: `c_def_5`, displayType: 'text', content: 'น่ารัก', chinese: '可爱', pinyinClue: 'kě____', fullPinyin: 'kě\'ài' },
    { id: `c_def_6`, displayType: 'image', content: '', chinese: '块', pinyinClue: 'k____', fullPinyin: 'kuài' },
    { id: `c_def_7`, displayType: 'image', content: '', chinese: '百', pinyinClue: 'b____', fullPinyin: 'bǎi' },
    { id: `c_def_8`, displayType: 'image', content: '', chinese: '人民币', pinyinClue: 'Rén____bì', fullPinyin: 'Rénmínbì' },
    { id: `c_def_9`, displayType: 'image', content: '', chinese: '泰铢', pinyinClue: 'Tài____', fullPinyin: 'Tàizhū' },
  ];

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec, cards: defaultCards
      }));
    }
  }, [section.id]);

  const safeCards: Card6_6[] = Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultCards;
  const safeData: OtherLesson6_6Data = {
    ...section,
    patternType: 'other_lesson6-6',
    mainTitle: section?.mainTitle ?? '1. 看词语，补全拼音。',
    subTitle: section?.subTitle ?? 'ดูคำศัพท์แล้วเติมพินอินให้สมบูรณ์',
    cards: safeCards
  };

  const handleChange = (field: keyof OtherLesson6_6Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (index: number, field: keyof Card6_6, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[index]) {
        newCards[index] = { ...newCards[index], [field]: value };
        // Auto-generate full Pinyin if Chinese changes
        if (field === 'chinese') {
           newCards[index].fullPinyin = pinyinConverter(value);
        }
      }
      return { ...sec, cards: newCards };
    });
  };

  const addCard = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.push({ id: `card_${Date.now()}`, displayType: 'text', content: '', chinese: '', pinyinClue: '____', fullPinyin: '' });
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
      if (!window.confirm('ต้องการโหลดข้อมูล 9 ข้อ ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
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
          <h3 className="text-lg font-bold text-slate-700">คำศัพท์ฝึกเติมพินอิน ({safeCards.length})</h3>
          <button type="button" onClick={loadDefaultTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm">
            <Wand2 size={14} /> โหลดข้อมูล 9 ข้อจากแบบเรียน
          </button>
        </div>

        <div className="space-y-4">
          {safeCards.map((card, index) => (
            <div key={card.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 group">
              <div className="cursor-move text-slate-300 mt-2 shrink-0"><GripVertical size={20} /></div>
              <div className="flex-1 space-y-4">
                
                {/* แถวที่ 1: เลือกประเภทการแสดงผลฝั่งซ้าย */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">รูปแบบฝั่งซ้าย</label>
                    <select value={card.displayType} onChange={(e) => handleCardChange(index, 'displayType', e.target.value as any)} className="w-full px-2 py-1.5 border rounded text-sm bg-white">
                      <option value="text">ข้อความ (คำแปล)</option>
                      <option value="image">รูปภาพ (URL)</option>
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-9 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      {card.displayType === 'text' ? <><Type size={12}/> ข้อความคำแปลไทย</> : <><ImageIcon size={12}/> URL รูปภาพ</>}
                    </label>
                    <input type="text" value={card.content} onChange={(e) => handleCardChange(index, 'content', e.target.value)} placeholder={card.displayType === 'text' ? "เช่น เท่าไร" : "/images/..."} className="w-full px-3 py-1.5 bg-white border rounded text-sm focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* แถวที่ 2: ตั้งค่าภาษาจีนและพินอินฝั่งขวา */}
                <div className="grid grid-cols-12 gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">อักษรจีน</label>
                    <input type="text" value={card.chinese} onChange={(e) => handleCardChange(index, 'chinese', e.target.value)} placeholder="เช่น 多少" className="w-full px-2 py-1.5 border rounded text-base text-center" />
                  </div>
                  <div className="col-span-6 md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-orange-500">พินอินที่ให้เด็กเห็น (ปริศนา)</label>
                    <input type="text" value={card.pinyinClue} onChange={(e) => handleCardChange(index, 'pinyinClue', e.target.value)} placeholder="เช่น ____shao" className="w-full px-2 py-1.5 border border-orange-200 bg-orange-50 text-orange-700 rounded text-sm text-center font-mono" />
                  </div>
                  <div className="col-span-6 md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-emerald-600">พินอินเฉลย (เต็ม)</label>
                    <input type="text" value={card.fullPinyin} onChange={(e) => handleCardChange(index, 'fullPinyin', e.target.value)} placeholder="เช่น duōshao" className="w-full px-2 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded text-sm text-center" />
                  </div>
                </div>

              </div>
              <button type="button" onClick={(e) => removeCard(e, index)} className="text-slate-300 hover:text-red-500 p-2 h-fit"><Trash2 size={18}/></button>
            </div>
          ))}
          <button type="button" onClick={addCard} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl hover:bg-indigo-50 font-bold text-sm flex justify-center items-center gap-1">
            <Plus size={18}/> เพิ่มการ์ด
          </button>
        </div>
      </div>

    </div>
  );
}