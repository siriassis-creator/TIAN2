// src/settings/setting_other_lesson5-25.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Image as ImageIcon, Sparkles } from 'lucide-react';
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

const generateTokens = (text: string) => {
  const pinyinArr = pinyinConverter(text, { type: 'array' });
  return text.split('').map((char, i) => ({
    id: Math.random().toString(36).substr(2, 9),
    char: char,
    pinyin: pinyinArr[i] || '',
    isBlank: false
  }));
};

export default function SettingOtherLesson5_25({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      const createDefaultCard = (text: string, blankWord: string, imgUrl: string) => {
        let tokens = generateTokens(text);
        let wordIndex = text.indexOf(blankWord);
        if (wordIndex !== -1) {
          for (let i = wordIndex; i < wordIndex + blankWord.length; i++) {
            tokens[i].isBlank = true;
          }
        }
        return { id: Math.random().toString(36).substr(2, 9), tokens, imageUrl: imgUrl };
      };

      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-25',
        mainTitle: s.mainTitle || '2. 看图片，选择正确的词语，完成句子。',
        subTitle: s.subTitle || 'ดูภาพแล้วเลือกคำศัพท์ไปเติมลงในช่องว่างให้ถูกต้อง',
        cards: s.cards || [
          createDefaultCard('给我一双筷子，谢谢！', '双', ''),
          createDefaultCard('给我一杯冰水，谢谢！', '杯', ''),
          createDefaultCard('给我一个勺子，谢谢！', '个', ''),
          createDefaultCard('给我一块面包，谢谢！', '块', '')
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeCards = safeSection.cards || [];

  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: Math.random().toString(36).substr(2, 9), tokens: [], imageUrl: '' }]
    }));
  };

  const handleDeleteCard = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc.splice(idx, 1);
      return { ...s, cards: nc };
    });
  };

  const handleUpdateSentence = (idx: number, newText: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[idx] = { ...nc[idx], tokens: generateTokens(newText) };
      return { ...s, cards: nc };
    });
  };

  const toggleTokenBlank = (cardIdx: number, tokenIdx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      const newTokens = [...nc[cardIdx].tokens];
      newTokens[tokenIdx] = { ...newTokens[tokenIdx], isBlank: !newTokens[tokenIdx].isBlank };
      nc[cardIdx] = { ...nc[cardIdx], tokens: newTokens };
      return { ...s, cards: nc };
    });
  };

  const updateImageUrl = (idx: number, url: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc[idx] = { ...nc[idx], imageUrl: formatDriveUrl(url) };
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: เติมคำศัพท์ (สลับรูปซ้ายขวา) (Other_lesson5-25)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าการ์ดคำถาม */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><Sparkles size={14} className="text-orange-500"/> ระบบสร้างช่องว่างอัจฉริยะ</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeCards.length} ข้อ</span>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {safeCards.map((card: any, idx: number) => {
            const rawSentence = card.tokens?.map((t:any) => t.char).join('') || '';

            return (
              <div key={card.id} className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative">
                
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">ข้อที่ {idx + 1} (แสดงผล {idx % 2 === 0 ? 'รูปซ้าย' : 'รูปขวา'})</div>
                  <button onClick={() => handleDeleteCard(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Smart Sentence Builder */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">1. พิมพ์ประโยคเต็มที่นี่</label>
                      <input 
                        type="text" 
                        value={rawSentence} 
                        onChange={(e) => handleUpdateSentence(idx, e.target.value)} 
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 font-serif" 
                        placeholder="พิมพ์อักษรจีน..." 
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <label className="text-[10px] font-bold text-orange-500 mb-2 block uppercase animate-pulse">
                        2. กดที่คำที่ต้องการให้เป็น "ช่องว่าง" (คำนั้นจะถูกดึงไปเป็นตัวเลือก A, B, C อัตโนมัติ)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {card.tokens?.map((t: any, tIdx: number) => (
                          <div 
                            key={t.id} 
                            onClick={() => toggleTokenBlank(idx, tIdx)}
                            className={`cursor-pointer px-2 py-1 rounded-lg text-center border-2 select-none transition-all hover:scale-105 active:scale-95
                              ${t.isBlank ? 'bg-orange-500 text-white border-orange-600 shadow-md' : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'}
                            `}
                          >
                            <div className="text-lg font-serif leading-none mb-1">{t.char}</div>
                            <div className={`text-[9px] ${t.isBlank ? 'text-orange-100' : 'text-slate-400'}`}>{t.pinyin}</div>
                          </div>
                        ))}
                        {(!card.tokens || card.tokens.length === 0) && <span className="text-xs text-slate-300">กรุณาพิมพ์ประโยคด้านบนก่อนครับ</span>}
                      </div>
                    </div>
                  </div>

                  {/* Image Setup */}
                  <div className="w-full md:w-64 shrink-0">
                    <label className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1 uppercase">
                      <ImageIcon size={12}/> URL รูปภาพประกอบข้อนี้
                    </label>
                    <input 
                      type="text" 
                      value={card.imageUrl || ''} 
                      onChange={(e) => updateImageUrl(idx, e.target.value)} 
                      className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-400 mb-2" 
                      placeholder="วางลิ้งค์รูปภาพ..."
                    />
                    {card.imageUrl && (
                      <div className="w-full h-24 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center">
                        <img src={card.imageUrl} className="max-h-full max-w-full object-contain" alt="preview" />
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}

          <button onClick={handleAddCard} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all">
            <PlusCircle size={20} /> เพิ่มข้อคำถาม
          </button>
        </div>
      </div>

    </div>
  );
}