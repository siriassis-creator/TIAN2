// src/settings/setting_other_lesson5-24.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Image as ImageIcon } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

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

export default function SettingOtherLesson5_24({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้นตามภาพเป๊ะๆ
  useEffect(() => {
    if (!section.choices || section.choices.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-24',
        mainTitle: s.mainTitle || '1. 看图片，选择正确的答案。',
        subTitle: s.subTitle || 'ดูภาพแล้วเลือกคำศัพท์ที่ถูกต้อง',
        choices: s.choices || [
          { chinese: '筷子', pinyin: 'kuàizi' },
          { chinese: '杯子', pinyin: 'bēizi' },
          { chinese: '盘子', pinyin: 'pánzi' },
          { chinese: '勺子', pinyin: 'sháozi' },
          { chinese: '叉子', pinyin: 'chāzi' },
          { chinese: '面包', pinyin: 'miànbāo' },
          { chinese: '可乐', pinyin: 'kělè' },
          { chinese: '果汁', pinyin: 'guǒzhī' }
        ],
        cards: s.cards || [
          { id: 'c1', imageUrl: '', correctChoiceIdx: 1 }, // แก้ว = 杯子 (B)
          { id: 'c2', imageUrl: '', correctChoiceIdx: 0 }, // ตะเกียบ = 筷子 (A)
          { id: 'c3', imageUrl: '', correctChoiceIdx: 6 }, // โคล่า = 可乐 (G)
          { id: 'c4', imageUrl: '', correctChoiceIdx: 7 }, // น้ำผลไม้ = 果汁 (H)
          { id: 'c5', imageUrl: '', correctChoiceIdx: 3 }, // ช้อน = 勺子 (D)
          { id: 'c6', imageUrl: '', correctChoiceIdx: 4 }, // ส้อม = 叉子 (E)
          { id: 'c7', imageUrl: '', correctChoiceIdx: 2 }, // จาน = 盘子 (C)
          { id: 'c8', imageUrl: '', correctChoiceIdx: 5 }, // ขนมปัง = 面包 (F)
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeChoices = safeSection.choices || [];
  const safeCards = safeSection.cards || [];

  // --- Functions for Choices ---
  const handleAddChoice = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      choices: [...(s.choices || []), { chinese: '', pinyin: '' }]
    }));
  };

  const handleDeleteChoice = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.choices || [])];
      nc.splice(idx, 1);
      return { ...s, choices: nc };
    });
  };

  const updateChoice = (idx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.choices || [])];
      if (field === 'chinese') {
        nc[idx] = { ...nc[idx], chinese: value, pinyin: pinyinConverter(value) };
      } else {
        nc[idx] = { ...nc[idx], [field]: value };
      }
      return { ...s, choices: nc };
    });
  };

  // --- Functions for Cards ---
  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: `card_${Date.now()}`, imageUrl: '', correctChoiceIdx: 0 }]
    }));
  };

  const handleDeleteCard = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc.splice(idx, 1);
      return { ...s, cards: nc };
    });
  };

  const updateCard = (idx: number, field: string, value: any) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[idx] = { ...nc[idx], [field]: value };
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-sans mt-4 relative">
      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: เติมตัวอักษรลงในวงกลมรูปภาพ (Other_lesson5-24)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (จีน)</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย (ไทย)</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* 2. ส่วนตั้งค่าตัวเลือก (Choices) */}
        <div className="w-full xl:w-1/3 bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <label className="text-xs font-bold text-slate-600 uppercase">1. ชุดตัวเลือก (A, B, C...)</label>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{safeChoices.length} ตัวเลือก</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {safeChoices.map((choice: any, cIdx: number) => {
              const letter = String.fromCharCode(65 + cIdx); // 0=A, 1=B
              return (
                <div key={cIdx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <div className="w-6 h-6 shrink-0 bg-emerald-200 text-emerald-800 font-bold rounded flex items-center justify-center text-xs mt-1">
                    {letter}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <input type="text" value={choice.chinese} onChange={(e) => updateChoice(cIdx, 'chinese', e.target.value)} className="w-full px-2 py-1 text-sm font-serif border rounded focus:ring-1 focus:ring-emerald-400" placeholder="อักษรจีน..." />
                    <input type="text" value={choice.pinyin} onChange={(e) => updateChoice(cIdx, 'pinyin', e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded text-slate-500" placeholder="พินอิน (Auto)..." />
                  </div>
                  <button onClick={() => handleDeleteChoice(cIdx)} className="text-slate-300 hover:text-red-500 p-1 mt-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            <button onClick={handleAddChoice} className="w-full py-2 border border-dashed border-emerald-300 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-1">
              <PlusCircle size={14} /> เพิ่มตัวเลือก
            </button>
          </div>
        </div>

        {/* 3. ส่วนตั้งค่ารูปภาพคำถาม (Cards) */}
        <div className="w-full xl:w-2/3 bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <label className="text-xs font-bold text-slate-600 uppercase">2. ชุดรูปภาพคำถาม</label>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{safeCards.length} ข้อ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeCards.map((card: any, idx: number) => (
              <div key={card.id} className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm relative">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">รูปที่ {idx + 1}</span>
                  <button onClick={() => handleDeleteCard(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* รูปภาพ */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-indigo-600 mb-1 flex items-center gap-1 uppercase">
                      <ImageIcon size={10}/> URL รูปภาพ
                    </label>
                    <input 
                      type="text" 
                      value={card.imageUrl || ''} 
                      onChange={(e) => updateCard(idx, 'imageUrl', formatDriveUrl(e.target.value))} 
                      className="w-full px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded text-xs focus:ring-1 focus:ring-indigo-400" 
                      placeholder="วางลิ้งค์รูปภาพ..."
                    />
                  </div>
                  <div className="w-12 h-12 shrink-0 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
                    {card.imageUrl ? <img src={card.imageUrl} alt="preview" className="max-w-full max-h-full object-contain"/> : <span className="text-[8px] text-slate-300">ไม่มีรูป</span>}
                  </div>
                </div>

                {/* เฉลย */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 mb-1 block uppercase">เฉลย (อักษรที่ถูกต้อง)</label>
                  <select 
                    value={card.correctChoiceIdx} 
                    onChange={(e) => updateCard(idx, 'correctChoiceIdx', Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm border border-emerald-200 rounded focus:ring-1 focus:ring-emerald-400 bg-emerald-50 outline-none"
                  >
                    {safeChoices.map((choice: any, cIdx: number) => {
                      const letter = String.fromCharCode(65 + cIdx);
                      return (
                        <option key={cIdx} value={cIdx}>
                          {letter}: {choice.chinese} ({choice.pinyin})
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>
            ))}

            <button onClick={handleAddCard} className="w-full min-h-[120px] py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
              <PlusCircle size={24} /> เพิ่มรูปภาพคำถาม
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}