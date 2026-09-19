// src/settings/setting_other_lesson5-17.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Settings2, X } from 'lucide-react'; // +++ เพิ่ม X ตรงนี้ครับ +++
import { pinyin as pinyinConverter } from 'pinyin-pro';

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (hskId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson5_17({ section, cardId, lessonId, updateSectionState }: Props) {
  
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-17',
        mainTitle: s.mainTitle || '写一写 อักษรจีนแสนสนุก',
        subTitle: s.subTitle || '1. 读一读，认一认。 ฝึกอ่านและจำตัวอักษรจีน',
        showPinyin: s.showPinyin !== false, // ค่าเริ่มต้นเป็น true
        cards: s.cards || [
          {
            id: 'c1', mainChar: '双', mainPinyin: 'shuāng',
            phrases: [{ id: 'p1_1', chinese: '一双筷子', pinyin: 'yì shuāng kuàizi' }, { id: 'p1_2', chinese: '一双鞋', pinyin: 'yì shuāng xié' }]
          },
          {
            id: 'c2', mainChar: '杯', mainPinyin: 'bēi',
            phrases: [{ id: 'p2_1', chinese: '一个杯子', pinyin: 'yí gè bēizi' }, { id: 'p2_2', chinese: '一杯果汁', pinyin: 'yì bēi guǒzhī' }]
          },
          {
            id: 'c3', mainChar: '叉', mainPinyin: 'chā',
            phrases: [{ id: 'p3_1', chinese: '一个叉子', pinyin: 'yí gè chāzi' }]
          },
          {
            id: 'c4', mainChar: '勺', mainPinyin: 'sháo',
            phrases: [{ id: 'p4_1', chinese: '一个勺子', pinyin: 'yí gè sháozi' }]
          },
          {
            id: 'c5', mainChar: '块', mainPinyin: 'kuài',
            phrases: [{ id: 'p5_1', chinese: '一块面包', pinyin: 'yí kuài miànbāo' }]
          },
          {
            id: 'c6', mainChar: '盘', mainPinyin: 'pán',
            phrases: [{ id: 'p6_1', chinese: '一个盘子', pinyin: 'yí gè pánzi' }]
          }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeCards = safeSection.cards || [];

  // เพิ่ม Card อักษรจีนใหม่
  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: `c_${Date.now()}`, mainChar: '', mainPinyin: '', phrases: [] }]
    }));
  };

  const handleDeleteCard = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc.splice(idx, 1);
      return { ...s, cards: nc };
    });
  };

  const updateMainChar = (cardIdx: number, value: string) => {
    const pinyin = pinyinConverter(value);
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[cardIdx] = { ...nc[cardIdx], mainChar: value, mainPinyin: pinyin };
      return { ...s, cards: nc };
    });
  };

  const updateMainPinyin = (cardIdx: number, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[cardIdx] = { ...nc[cardIdx], mainPinyin: value };
      return { ...s, cards: nc };
    });
  };

  // จัดการวลีประกอบ (Phrases)
  const handleAddPhrase = (cardIdx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[cardIdx].phrases.push({ id: `p_${Date.now()}`, chinese: '', pinyin: '' });
      return { ...s, cards: nc };
    });
  };

  const handleDeletePhrase = (cardIdx: number, phraseIdx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[cardIdx].phrases.splice(phraseIdx, 1);
      return { ...s, cards: nc };
    });
  };

  const updatePhrase = (cardIdx: number, phraseIdx: number, field: 'chinese' | 'pinyin', value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      if (field === 'chinese') {
        const py = pinyinConverter(value);
        nc[cardIdx].phrases[phraseIdx] = { ...nc[cardIdx].phrases[phraseIdx], chinese: value, pinyin: py };
      } else {
        nc[cardIdx].phrases[phraseIdx] = { ...nc[cardIdx].phrases[phraseIdx], [field]: value };
      }
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: ฝึกอ่านและจำตัวอักษรจีน (Other_lesson5-17)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-orange-100/50 p-3 rounded-lg border border-orange-200">
          <label className="text-[12px] font-bold text-orange-800 flex items-center gap-2 cursor-pointer">
            <Settings2 size={16} /> ตัวเลือกการแสดงผล (Display Options)
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-md shadow-sm border border-slate-200">
            <input 
              type="checkbox" 
              checked={safeSection.showPinyin !== false} 
              onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, showPinyin: e.target.checked }))} 
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-xs font-bold text-slate-600">แสดงพินอินใต้วลีประกอบ</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (ป้ายส้ม)</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าการ์ดและวลี */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">ชุดอักษรจีนและวลีประกอบ</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeCards.length} การ์ด</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeCards.map((card: any, cIdx: number) => (
            <div key={card.id} className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm relative">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">การ์ดที่ {cIdx + 1}</span>
                <button onClick={() => handleDeleteCard(cIdx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              {/* อักษรจีนหลัก */}
              <div className="flex gap-2">
                <div className="w-16 shrink-0">
                  <label className="text-[9px] font-bold text-slate-400 mb-0.5 block">อักษรเดี่ยว</label>
                  <input type="text" value={card.mainChar || ''} onChange={(e) => updateMainChar(cIdx, e.target.value)} className="w-full px-2 py-1.5 text-center text-lg font-serif border rounded focus:ring-1 focus:ring-orange-400" placeholder="เช่น 双" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-slate-400 mb-0.5 block">พินอิน (แก้ไขได้)</label>
                  <input type="text" value={card.mainPinyin || ''} onChange={(e) => updateMainPinyin(cIdx, e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400 text-slate-500 mt-1" placeholder="เช่น shuāng" />
                </div>
              </div>

              {/* วลีประกอบ */}
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <label className="text-[9px] font-bold text-slate-400 mb-1 block">วลีประกอบด้านล่าง</label>
                <div className="flex flex-col gap-2">
                  {card.phrases?.map((phrase: any, pIdx: number) => (
                    <div key={phrase.id} className="flex items-center gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <input type="text" value={phrase.chinese || ''} onChange={(e) => updatePhrase(cIdx, pIdx, 'chinese', e.target.value)} className="w-full px-2 py-1 text-xs border rounded font-serif" placeholder="อักษรจีน..." />
                        <input type="text" value={phrase.pinyin || ''} onChange={(e) => updatePhrase(cIdx, pIdx, 'pinyin', e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded text-slate-500" placeholder="พินอิน..." />
                      </div>
                      <button onClick={() => handleDeletePhrase(cIdx, pIdx)} className="text-slate-300 hover:text-red-500 p-1 shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => handleAddPhrase(cIdx)} className="w-full py-1 mt-1 border border-dashed border-orange-200 text-orange-500 rounded text-[10px] font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1">
                    <PlusCircle size={12} /> เพิ่มวลี
                  </button>
                </div>
              </div>

            </div>
          ))}

          <button onClick={handleAddCard} className="w-full min-h-[150px] py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all">
            <PlusCircle size={24} /> เพิ่มการ์ดใหม่
          </button>
        </div>
      </div>

    </div>
  );
}