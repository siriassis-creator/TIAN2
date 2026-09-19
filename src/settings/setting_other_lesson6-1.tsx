// src/settings/setting_other_lesson6-1.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Wand2, Image as ImageIcon } from 'lucide-react';
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
    return newUrl.replace('?dl=0', '?dl=1').replace('&dl=0', '&dl=1');
  }
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return `https://drive.google.com/uc?export=download&id=${matchD[1]}`;
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return `https://drive.google.com/uc?export=download&id=${matchId[1]}`;
  return url;
};

// ข้อมูลตั้งต้นตามรูปภาพต้นฉบับ
const defaultCards = [
  { id: 'c1', chinese: '一百块', pinyin: 'yìbǎi kuài', translation: '100 หยวน', imageUrl: '' },
  { id: 'c2', chinese: '五十块', pinyin: 'wǔshí kuài', translation: '50 หยวน', imageUrl: '' },
  { id: 'c3', chinese: '二十块', pinyin: 'èrshí kuài', translation: '20 หยวน', imageUrl: '' },
  { id: 'c4', chinese: '十块', pinyin: 'shí kuài', translation: '10 หยวน', imageUrl: '' },
  { id: 'c5', chinese: '五块', pinyin: 'wǔ kuài', translation: '5 หยวน', imageUrl: '' },
  { id: 'c6', chinese: '一块', pinyin: 'yí kuài', translation: '1 หยวน', imageUrl: '' },
  { id: 'c7', chinese: '五毛', pinyin: 'wǔ máo', translation: '5 เหมา', imageUrl: '' },
  { id: 'c8', chinese: '一毛', pinyin: 'yì máo', translation: '1 เหมา', imageUrl: '' },
  { id: 'c9', chinese: '人民币', pinyin: 'Rénmínbì', translation: 'เงินหยวน', imageUrl: '' },
  { id: 'c10', chinese: '泰铢', pinyin: 'Tàizhū', translation: 'เงินบาท', imageUrl: '' },
  { id: 'c11', chinese: '钱', pinyin: 'qián', translation: 'เงิน', imageUrl: '' },
];

export default function SettingOtherLesson6_1({ section, cardId, lessonId, updateSectionState }: Props) {
  
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson6-1',
        mainTitle: s.mainTitle || '听一听 มาฝึกฟังกัน',
        subTitle: s.subTitle || '1. 听录音，跟读，熟读下列词语。 ฟังแล้วอ่านตาม จากนั้นเรียนรู้คำศัพท์',
        audioTrack: s.audioTrack || '06-01',
        audioUrl: s.audioUrl || '',
        cards: s.cards || defaultCards
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeCards = safeSection.cards || [];

  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { id: Date.now().toString(), chinese: '', pinyin: '', translation: '', imageUrl: '' }]
    }));
  };

  const handleDeleteCard = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      nc.splice(idx, 1);
      return { ...s, cards: nc };
    });
  };

  const updateCard = (idx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = [...(s.cards || [])];
      if (field === 'imageUrl') {
        nc[idx] = { ...nc[idx], [field]: formatDriveUrl(value) };
      } else if (field === 'chinese') {
        const generatedPinyin = pinyinConverter(value);
        nc[idx] = { ...nc[idx], chinese: value, pinyin: generatedPinyin };
      } else {
        nc[idx] = { ...nc[idx], [field]: value };
      }
      return { ...s, cards: nc };
    });
  };

  const handleAutoPinyinAll = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nc = (s.cards || []).map((card: any) => ({
        ...card,
        pinyin: card.chinese ? pinyinConverter(card.chinese) : card.pinyin
      }));
      return { ...s, cards: nc };
    });
    alert('🪄 แปลงพินอินอัตโนมัติเรียบร้อยแล้วครับ!');
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: บทที่ 6 การ์ดพลิกคำศัพท์เรื่องเงิน (Other_lesson6-1)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก (ป้ายสีส้ม)</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อย่อย</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">เลข Track เสียง</label>
          <input type="text" value={safeSection.audioTrack || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, audioTrack: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-orange-600 mb-1 block uppercase">URL ไฟล์เสียงหลัก</label>
          <input type="text" value={safeSection.audioUrl || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm focus:ring-1 focus:ring-orange-400" placeholder="วางลิ้งค์เสียง (Dropbox/Drive)..." />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าการ์ด */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">ชุดการ์ดคำศัพท์</label>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มีการ์ด {safeCards.length} ใบ</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeCards.map((card: any, idx: number) => (
            <div key={card.id || idx} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative group">
              
              <div className="absolute -top-3 -left-3 text-[12px] font-black text-white bg-orange-400 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10 border-2 border-white">
                {idx + 1}
              </div>
              
              {/* ภาพประกอบ */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase"><ImageIcon size={12}/> URL รูปภาพ (โชว์ด้านหน้า)</label>
                <input type="text" value={card.imageUrl || ''} onChange={(e) => updateCard(idx, 'imageUrl', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-orange-400 text-indigo-600" placeholder="ลิ้งค์รูปธนบัตร/เหรียญ..." />
              </div>

              {/* ข้อความ */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input type="text" value={card.chinese || ''} onChange={(e) => updateCard(idx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-orange-400 font-serif text-slate-800" placeholder="อักษรจีน (โชว์หน้า/หลัง)..." />
                </div>
                <div className="flex-1">
                  <input type="text" value={card.pinyin || ''} onChange={(e) => updateCard(idx, 'pinyin', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-orange-400 text-slate-500 font-sans" placeholder="พินอิน..." />
                </div>
              </div>

              <div>
                <input type="text" value={card.translation || ''} onChange={(e) => updateCard(idx, 'translation', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-orange-400 text-slate-600" placeholder="คำแปลภาษาไทย..." />
              </div>

              <button onClick={() => handleDeleteCard(idx)} className="absolute -top-2 -right-2 text-slate-300 hover:text-white bg-white hover:bg-red-500 border border-slate-200 hover:border-red-500 rounded-full p-1.5 shadow-sm transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full border-t border-slate-100 pt-4">
          <button onClick={handleAddCard} className="flex-1 py-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all">
            <PlusCircle size={18} /> เพิ่มการ์ดใหม่
          </button>
          <button onClick={handleAutoPinyinAll} className="flex-1 py-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all">
            <Wand2 size={18} /> Auto Pinyin ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}