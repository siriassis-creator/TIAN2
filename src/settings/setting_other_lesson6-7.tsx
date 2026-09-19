// src/settings/setting_other_lesson6-7.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, GripVertical, LayoutTemplate, Palette, Type, Wand2, X } from 'lucide-react';

export interface Card6_7 {
  id: string;
  theme: 'pink' | 'green';
  phrases: string[];
}

export interface OtherLesson6_7Data {
  id?: string;
  patternType: 'other_lesson6-7';
  mainTitle: string;
  subTitle: string;
  cards: Card6_7[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_7({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้น 4 บล็อก ตามรูปภาพ 6-7
  const defaultCards: Card6_7[] = [
    {
      id: `c_def_1`, theme: 'pink',
      phrases: ['钱', '多少钱', '书多少钱', '这本书多少钱']
    },
    {
      id: `c_def_2`, theme: 'pink',
      phrases: ['钱', '多少钱', 'T恤多少钱', '这件T恤多少钱']
    },
    {
      id: `c_def_3`, theme: 'green',
      phrases: ['可爱', '真可爱', '橡皮真可爱', '熊猫橡皮真可爱', '这块熊猫橡皮真可爱']
    },
    {
      id: `c_def_4`, theme: 'green',
      phrases: ['贵', '真贵', '笔袋真贵', '大象笔袋真贵', '这个大象笔袋真贵']
    }
  ];

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec, cards: defaultCards
      }));
    }
  }, [section.id]);

  const safeCards: Card6_7[] = Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultCards;
  const safeData: OtherLesson6_7Data = {
    ...section,
    patternType: 'other_lesson6-7',
    mainTitle: section?.mainTitle ?? '2. 词语阶梯。',
    subTitle: section?.subTitle ?? 'ต่อคำขยายความ',
    cards: safeCards
  };

  const handleChange = (field: keyof OtherLesson6_7Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (cIndex: number, field: keyof Card6_7, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[cIndex]) newCards[cIndex] = { ...newCards[cIndex], [field]: value };
      return { ...sec, cards: newCards };
    });
  };

  const handlePhraseChange = (cIndex: number, pIndex: number, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[cIndex] && newCards[cIndex].phrases) {
        const newPhrases = [...newCards[cIndex].phrases];
        newPhrases[pIndex] = value;
        newCards[cIndex].phrases = newPhrases;
      }
      return { ...sec, cards: newCards };
    });
  };

  const addPhrase = (e: React.MouseEvent, cIndex: number) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[cIndex]) newCards[cIndex].phrases.push('');
      return { ...sec, cards: newCards };
    });
  };

  const removePhrase = (e: React.MouseEvent, cIndex: number, pIndex: number) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      if (newCards[cIndex]) newCards[cIndex].phrases.splice(pIndex, 1);
      return { ...sec, cards: newCards };
    });
  };

  const addCard = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newCards = [...(sec.cards || [])];
      newCards.push({ id: `card_${Date.now()}`, theme: 'pink', phrases: [''] });
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
      if (!window.confirm('ต้องการโหลดข้อมูล 4 บล็อก ทับข้อมูลเดิมไปเลยหรือไม่?')) return;
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
          <h3 className="text-lg font-bold text-slate-700">บล็อกคำขยายความ ({safeCards.length})</h3>
          <button type="button" onClick={loadDefaultTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm">
            <Wand2 size={14} /> โหลดข้อมูลเริ่มต้นตามแบบเรียน
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safeCards.map((card, cIdx) => (
            <div key={card.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                 <div className="flex items-center gap-2">
                    <Palette size={16} className="text-slate-400" />
                    <select value={card.theme} onChange={(e) => handleCardChange(cIdx, 'theme', e.target.value)} className="px-2 py-1 text-xs border rounded bg-white font-bold outline-none">
                      <option value="pink">โทนสีชมพู (Pink)</option>
                      <option value="green">โทนสีเขียว (Green)</option>
                    </select>
                 </div>
                 <button type="button" onClick={(e) => removeCard(e, cIdx)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Type size={12}/> ลำดับขั้นคำศัพท์ (บนลงล่าง)</label>
                {card.phrases.map((phrase, pIdx) => (
                   <div key={pIdx} className="flex gap-2 items-center bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                      <div className="w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">{pIdx + 1}</div>
                      <input type="text" value={phrase} onChange={(e) => handlePhraseChange(cIdx, pIdx, e.target.value)} className="w-full px-2 py-1 border-none focus:ring-0 text-sm outline-none" placeholder="พิมพ์คำศัพท์..." />
                      <button type="button" onClick={(e) => removePhrase(e, cIdx, pIdx)} className="text-slate-300 hover:text-red-500 pr-1"><X size={14}/></button>
                   </div>
                ))}
                <button type="button" onClick={(e) => addPhrase(e, cIdx)} className="w-full py-2 bg-white border border-dashed border-indigo-200 text-indigo-500 rounded-lg hover:bg-indigo-50 text-xs font-bold flex justify-center items-center gap-1 mt-2">
                  <Plus size={14}/> เพิ่มขั้นบันได
                </button>
              </div>
            </div>
          ))}
          
          <button type="button" onClick={addCard} className="h-full min-h-[150px] border-2 border-dashed border-slate-300 text-slate-400 rounded-xl hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 font-bold text-sm flex flex-col justify-center items-center gap-2">
            <Plus size={24}/> เพิ่มบล็อกใหม่
          </button>
        </div>
      </div>

    </div>
  );
}