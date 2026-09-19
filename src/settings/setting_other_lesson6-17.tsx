// src/settings/setting_other_lesson6-17.tsx
import React, { useEffect } from 'react';
import { LayoutTemplate, Wand2 } from 'lucide-react';

export interface Card6_17 { 
  id: string; 
  num: number; 
  sentence: string; 
  img1Url: string; 
  img2Url: string; 
  correctAnswer: 1 | 2; 
}

export interface OtherLesson6_17Data {
  id?: string;
  patternType: 'other_lesson6-17';
  mainTitle: string;
  subTitle: string;
  cards: Card6_17[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_17({ section, cardId, lessonId, updateSectionState }: Props) {
  
  const defaultData: Partial<OtherLesson6_17Data> = {
    mainTitle: '2. 读一读，选择正确的图片。',
    subTitle: 'ฝึกอ่านแล้วเลือกรูปภาพที่ตรงกับความหมายของประโยค',
    cards: [
      { 
        id: 'c1', num: 1, sentence: '这个杯子十块钱。', 
        img1Url: '', img2Url: '', correctAnswer: 2 // แก้ว 10 หยวน
      },
      { 
        id: 'c2', num: 2, sentence: '这支笔真贵啊！', 
        img1Url: '', img2Url: '', correctAnswer: 2 // ปากกาแพง 200.00
      },
      { 
        id: 'c3', num: 3, sentence: '那块橡皮多少钱？', 
        img1Url: '', img2Url: '', correctAnswer: 2 // ยางลบ
      },
      { 
        id: 'c4', num: 4, sentence: '一百泰铢是二十二块人民币。', 
        img1Url: '', img2Url: '', correctAnswer: 1 // 100 บาท = 22 หยวน
      }
    ]
  };

  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_17Data = {
    ...section,
    patternType: 'other_lesson6-17',
    mainTitle: section?.mainTitle ?? defaultData.mainTitle,
    subTitle: section?.subTitle ?? defaultData.subTitle,
    cards: Array.isArray(section?.cards) && section.cards.length > 0 ? section.cards : defaultData.cards
  };

  const handleChange = (field: keyof OtherLesson6_17Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleArrayChange = (index: number, field: string, value: string | number) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newArray = [...(sec.cards || [])];
      if (newArray[index]) newArray[index] = { ...newArray[index], [field]: value };
      return { ...sec, cards: newArray };
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
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่า 6-17 (เลือกรูปให้ตรงประโยค)</h3>
          <button type="button" onClick={loadDefaultTemplate} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลตั้งต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำสั่ง (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำสั่ง (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Cards Config */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
         <h3 className="text-sm font-bold text-slate-700 border-b pb-2">จัดการการ์ดแบบฝึกหัด</h3>
         <div className="grid grid-cols-1 gap-6">
            {safeData.cards.map((card, idx) => (
               <div key={card.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-sm shrink-0">{card.num}</span>
                     <input type="text" value={card.sentence} onChange={(e) => handleArrayChange(idx, 'sentence', e.target.value)} placeholder="ประโยคภาษาจีน" className="flex-1 px-3 py-2 border rounded-lg font-bold" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                           <input type="radio" name={`correct-${card.id}`} checked={card.correctAnswer === 1} onChange={() => handleArrayChange(idx, 'correctAnswer', 1)} className="w-4 h-4 accent-emerald-500" />
                           รูปภาพที่ 1 (ตัวเลือกซ้าย) {card.correctAnswer === 1 && <span className="text-emerald-500 font-normal">(คำตอบที่ถูก)</span>}
                        </label>
                        <input type="text" value={card.img1Url} onChange={(e) => handleArrayChange(idx, 'img1Url', e.target.value)} placeholder="URL รูปภาพที่ 1" className="w-full px-3 py-1.5 border rounded text-xs" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                           <input type="radio" name={`correct-${card.id}`} checked={card.correctAnswer === 2} onChange={() => handleArrayChange(idx, 'correctAnswer', 2)} className="w-4 h-4 accent-emerald-500" />
                           รูปภาพที่ 2 (ตัวเลือกขวา) {card.correctAnswer === 2 && <span className="text-emerald-500 font-normal">(คำตอบที่ถูก)</span>}
                        </label>
                        <input type="text" value={card.img2Url} onChange={(e) => handleArrayChange(idx, 'img2Url', e.target.value)} placeholder="URL รูปภาพที่ 2" className="w-full px-3 py-1.5 border rounded text-xs" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}