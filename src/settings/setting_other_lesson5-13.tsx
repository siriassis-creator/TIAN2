// src/settings/setting_other_lesson5-13.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

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

export default function SettingOtherLesson5_13({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data จำลองการ์ด 8 ใบ
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '3. 词语速递游戏。 เกมใครไวใครได้',
        cards: [
          { id: 'c1', imageUrl: '' },
          { id: 'c2', imageUrl: '' },
          { id: 'c3', imageUrl: '' },
          { id: 'c4', imageUrl: '' },
          { id: 'c5', imageUrl: '' },
          { id: 'c6', imageUrl: '' },
          { id: 'c7', imageUrl: '' },
          { id: 'c8', imageUrl: '' }
        ]
      }));
    }
  }, []);

  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, section.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: `card-${Date.now()}`, imageUrl: '' }]
    }));
  };

  const handleDeleteCard = (cardIdx: number) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nc = [...s.cards];
      nc.splice(cardIdx, 1);
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-sky-50/50 p-4 rounded-lg border border-sky-100 font-sans mt-4 relative">
      <h4 className="font-bold text-sky-800 mb-4 text-sm uppercase tracking-wide border-b border-sky-200 pb-2 inline-block">
        แบบเรียน: Speed Game (เกมใครไวใครได้ เลือกตอบรูปภาพ)
      </h4>

      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ</label>
        <input 
          type="text" 
          value={section.mainTitle || ''} 
          placeholder="เช่น: 3. 词语速递游戏。 เกมใครไวใครได้" 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-sky-400" 
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">คลังรูปภาพ (เรียงอัตโนมัติบนโต๊ะ)</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {section.cards?.length || 0} รูป</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(section.cards || []).map((card: any, idx: number) => (
            <div key={card.id} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded">ใบที่ {idx + 1}</span>
                <button onClick={() => handleDeleteCard(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1 shadow-sm">
                  <Trash2 size={14} />
                </button>
              </div>
              <input 
                type="text" 
                value={card.imageUrl || ''} 
                placeholder="URL รูปภาพ..." 
                onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                  const nc = [...s.cards]; 
                  nc[idx].imageUrl = formatDriveUrl(e.target.value); 
                  return { ...s, cards: nc }; 
                })} 
                className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-sky-400" 
              />
            </div>
          ))}

          <button 
            onClick={handleAddCard} 
            className="w-full h-full min-h-[80px] py-2 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-sky-200 text-sky-500 rounded-lg text-xs font-bold hover:bg-sky-50 transition-all"
          >
            <PlusCircle size={20} /> เพิ่มรูปภาพ
          </button>
        </div>
      </div>

    </div>
  );
}