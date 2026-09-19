// src/settings/setting_other_lesson5-23.tsx
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

// Helper: แปลงข้อความธรรมดา ให้กลายเป็น Array ของ Tokens
const generateTokens = (text: string) => {
  const pinyinArr = pinyinConverter(text, { type: 'array' });
  return text.split('').map((char, i) => ({
    id: Math.random().toString(36).substr(2, 9),
    char: char,
    pinyin: pinyinArr[i] || '',
    isBlank: false
  }));
};

export default function SettingOtherLesson5_23({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้นให้ตรงกับรูป
  useEffect(() => {
    if (!section.lines || section.lines.length === 0) {
      
      const createDefaultLine = (text: string, blankWords: string[]) => {
        let tokens = generateTokens(text);
        blankWords.forEach(blankWord => {
          let wordIndex = text.indexOf(blankWord);
          if (wordIndex !== -1) {
            for (let i = wordIndex; i < wordIndex + blankWord.length; i++) {
              tokens[i].isBlank = true;
            }
          }
        });
        return { id: `l_${Math.random().toString(36).substr(2, 9)}`, tokens };
      };

      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-23',
        mainTitle: s.mainTitle || '2. 仿照示例，写一写，说一说。',
        subTitle: s.subTitle || 'ฝึกเขียนและพูดตามตัวอย่าง',
        imageUrl: s.imageUrl || '', 
        lines: s.lines || [
          createDefaultLine('这是我的早饭。我的', []),
          createDefaultLine('早饭有一杯牛奶、一块', ['一杯牛奶', '一块']),
          createDefaultLine('蛋糕和一个鸡蛋。我用', ['蛋糕和一个鸡蛋']),
          createDefaultLine('勺子吃蛋糕，用叉子吃', ['蛋糕', '叉子']),
          createDefaultLine('鸡蛋。', ['鸡蛋'])
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeLines = safeSection.lines || [];

  const handleAddLine = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      lines: [...(s.lines || []), { id: `l_${Date.now()}`, tokens: [] }]
    }));
  };

  const handleDeleteLine = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = [...(s.lines || [])];
      nl.splice(idx, 1);
      return { ...s, lines: nl };
    });
  };

  const handleUpdateSentence = (idx: number, newText: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = [...(s.lines || [])];
      nl[idx] = { ...nl[idx], tokens: generateTokens(newText) };
      return { ...s, lines: nl };
    });
  };

  const toggleTokenBlank = (lineIdx: number, tokenIdx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = [...(s.lines || [])];
      const newTokens = [...nl[lineIdx].tokens];
      newTokens[tokenIdx] = { ...newTokens[tokenIdx], isBlank: !newTokens[tokenIdx].isBlank };
      nl[lineIdx] = { ...nl[lineIdx], tokens: newTokens };
      return { ...s, lines: nl };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: เปรียบเทียบซ้ายขวา และเติมคำ (Other_lesson5-23)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อและรูปภาพ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1 uppercase">
            <ImageIcon size={12}/> URL รูปภาพประกอบ (ตรงกลาง)
          </label>
          <input 
            type="text" 
            value={safeSection.imageUrl || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, imageUrl: formatDriveUrl(e.target.value) }))} 
            className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-400" 
            placeholder="วางลิ้งค์รูปภาพอาหารเช้า..."
          />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าประโยค (ซ้าย-ขวา) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><Sparkles size={14} className="text-orange-500"/> ระบบสร้างช่องว่างอัจฉริยะฝั่งขวา</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeLines.length} บรรทัด</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {safeLines.map((line: any, idx: number) => {
            const rawSentence = line.tokens?.map((t:any) => t.char).join('') || '';

            return (
              <div key={line.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative">
                
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">บรรทัดที่ {idx + 1}</div>
                  <button onClick={() => handleDeleteLine(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">1. พิมพ์ประโยคเต็มที่นี่ (แสดงฝั่งซ้าย)</label>
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
                      2. กดที่คำที่ต้องการให้เป็น "ช่องว่าง" (สำหรับให้นักเรียนเติมในฝั่งขวา)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {line.tokens?.map((t: any, tIdx: number) => (
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
                      {(!line.tokens || line.tokens.length === 0) && <span className="text-xs text-slate-300">กรุณาพิมพ์ประโยคด้านบนก่อนครับ</span>}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}

          <button onClick={handleAddLine} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all mt-2">
            <PlusCircle size={20} /> เพิ่มบรรทัดใหม่
          </button>
        </div>
      </div>

    </div>
  );
}