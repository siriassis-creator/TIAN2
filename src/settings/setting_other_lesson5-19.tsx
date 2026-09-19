// src/settings/setting_other_lesson5-19.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Image as ImageIcon } from 'lucide-react';

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (hskId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

const formatDriveUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('dropbox.com')) {
    let newUrl = url.replace(/(www\.)?dropbox\.com/, 'dl.dropboxusercontent.com');
    newUrl = newUrl.replace('?dl=0', '?dl=1').replace('&dl=0', '&dl=1');
    return newUrl;
  }
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return `https://drive.google.com/uc?export=download&id=${matchD[1]}`;
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return `https://drive.google.com/uc?export=download&id=${matchId[1]}`;
  return url;
};

export default function SettingOtherLesson5_19({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้นตามแบบในรูปภาพเป๊ะๆ
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-19',
        mainTitle: s.mainTitle || '3. 圈出正确的汉字，然后读一读。',
        subTitle: s.subTitle || 'วงกลมล้อมรอบตัวอักษรจีนที่ถูกต้อง จากนั้นฝึกอ่าน',
        cards: s.cards || [
          { id: 'c1', sentence: '我给爸爸两___蛋糕。', choices: ['块', '快', '决'], correctIndex: 0, imageUrl: '' },
          { id: 'c2', sentence: '给你一个___子。', choices: ['勺', '的', '匀'], correctIndex: 0, imageUrl: '' },
          { id: 'c3', sentence: '给我一个___子。', choices: ['又', '叉', '双'], correctIndex: 1, imageUrl: '' },
          { id: 'c4', sentence: '妈妈给我一___果汁。', choices: ['坏', '杯', '怀'], correctIndex: 1, imageUrl: '' }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeCards = safeSection.cards || [];

  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: `c_${Date.now()}`, sentence: 'ประโยค___ช่องว่าง', choices: ['A', 'B', 'C'], correctIndex: 0, imageUrl: '' }]
    }));
  };

  const handleDeleteCard = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc.splice(idx, 1);
      return { ...s, cards: nc };
    });
  };

  const updateCard = (cardIdx: number, field: string, value: any) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[cardIdx] = { ...nc[cardIdx], [field]: value };
      return { ...s, cards: nc };
    });
  };

  const updateChoice = (cardIdx: number, choiceIdx: number, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      const newChoices = [...nc[cardIdx].choices];
      newChoices[choiceIdx] = value;
      nc[cardIdx] = { ...nc[cardIdx], choices: newChoices };
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: วงกลมเลือกตัวอักษรจีน (Other_lesson5-19)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (จีน)</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย (ไทย)</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าการ์ด */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">ชุดข้อสอบ Multiple Choice</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeCards.length} การ์ด</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {safeCards.map((card: any, cIdx: number) => (
            <div key={card.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">การ์ดข้อที่ {cIdx + 1}</span>
                <button onClick={() => handleDeleteCard(cIdx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              {/* ประโยค */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">ประโยค (พิมพ์ <strong className="text-orange-500">___</strong> เพื่อเว้นช่องว่าง)</label>
                <input 
                  type="text" 
                  value={card.sentence || ''} 
                  onChange={(e) => updateCard(cIdx, 'sentence', e.target.value)} 
                  className="w-full px-3 py-2 text-sm font-serif border rounded focus:ring-1 focus:ring-orange-400" 
                  placeholder="เช่น 我给爸爸两___蛋糕。" 
                />
              </div>

              {/* 3 ตัวเลือก */}
              <div className="bg-white p-3 rounded-lg border border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 mb-2 block">ตัวเลือก (คลิกที่วงกลมเพื่อตั้งเป็นข้อที่ถูก)</label>
                <div className="flex gap-2">
                  {card.choices?.map((choice: string, chIdx: number) => (
                    <div key={chIdx} className="flex-1 flex flex-col items-center gap-1">
                      <input 
                        type="text" 
                        value={choice} 
                        onChange={(e) => updateChoice(cIdx, chIdx, e.target.value)} 
                        className={`w-full text-center py-1.5 font-serif text-lg border rounded focus:ring-1 focus:ring-orange-400 ${card.correctIndex === chIdx ? 'bg-emerald-50 border-emerald-300' : ''}`}
                      />
                      <input 
                        type="radio" 
                        name={`correct_${card.id}`} 
                        checked={card.correctIndex === chIdx}
                        onChange={() => updateCard(cIdx, 'correctIndex', chIdx)}
                        className="w-4 h-4 mt-1 accent-emerald-500 cursor-pointer"
                        title="ตั้งเป็นคำตอบที่ถูก"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* รูปภาพ */}
              <div>
                <label className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1">
                  <ImageIcon size={12}/> URL รูปภาพประกอบ
                </label>
                <input 
                  type="text" 
                  value={card.imageUrl || ''} 
                  onChange={(e) => updateCard(cIdx, 'imageUrl', formatDriveUrl(e.target.value))} 
                  className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-400" 
                  placeholder="วางลิ้งค์รูปภาพ..."
                />
              </div>

            </div>
          ))}

          <button onClick={handleAddCard} className="w-full min-h-[250px] py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all">
            <PlusCircle size={24} /> เพิ่มการ์ดข้อสอบใหม่
          </button>
        </div>
      </div>

    </div>
  );
}