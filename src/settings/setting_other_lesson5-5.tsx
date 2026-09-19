// src/settings/setting_other_lesson5-5.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Headphones } from 'lucide-react';

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

export default function SettingOtherLesson5_5({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // กำหนดค่าตั้งต้นให้ชัวร์เสมอ
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-5',
        mainTitle: s.mainTitle || '听一听 มาฝึกฟังกัน',
        subTitle: s.subTitle || '1. 听录音，跟读，熟读下列词语。 ฟังแล้วอ่านตาม จากนั้นเรียนรู้คำศัพท์',
        audioTrack: s.audioTrack || '05-01',
        audioUrl: s.audioUrl || '',
        cards: s.cards || [
          { imageUrl: '', chinese: '你好', pinyin: 'nǐ hǎo', translation: 'สวัสดี' },
          { imageUrl: '', chinese: '谢谢', pinyin: 'xiè xie', translation: 'ขอบคุณ' }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeCards = safeSection.cards || [];

  const handleAddCard = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      cards: [...(s.cards || []), { imageUrl: '', chinese: '', pinyin: '', translation: '' }]
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
      nc[idx] = { ...nc[idx], [field]: value };
      return { ...s, cards: nc };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 inline-block flex items-center gap-2">
        <Headphones size={18} /> แบบเรียน: Flashcard ฟังเสียงพร้อมให้คะแนน (Other_lesson5-5)
      </h4>

      {/* ส่วนตั้งค่าหัวข้อหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (ป้ายส้ม)</label>
          <input 
            type="text" 
            value={safeSection.mainTitle || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย</label>
          <input 
            type="text" 
            value={safeSection.subTitle || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} 
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">เลข Track เสียง (เช่น 05-01)</label>
          <input 
            type="text" 
            value={safeSection.audioTrack || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, audioTrack: e.target.value }))} 
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase text-orange-600">URL ไฟล์เสียง (Google Drive หรือเว็บอื่นๆ)</label>
          <input 
            type="text" 
            value={safeSection.audioUrl || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} 
            className="w-full px-3 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm focus:ring-1 focus:ring-orange-400" 
            placeholder="วางลิ้งค์ไฟล์เสียง MP3 / M4A ที่นี่..."
          />
        </div>
      </div>

      {/* ส่วนตั้งค่าการ์ดคำศัพท์ */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">ชุดคำศัพท์ Flashcard</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeCards.length} คำ</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {safeCards.map((card: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">การ์ดใบที่ {idx + 1}</span>
                <button onClick={() => handleDeleteCard(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">อักษรจีน</label>
                  <input type="text" value={card.chinese || ''} onChange={(e) => updateCard(idx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400" placeholder="เช่น 你好" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">พินอิน</label>
                  <input type="text" value={card.pinyin || ''} onChange={(e) => updateCard(idx, 'pinyin', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400" placeholder="เช่น nǐ hǎo" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">คำแปล</label>
                  <input type="text" value={card.translation || ''} onChange={(e) => updateCard(idx, 'translation', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400" placeholder="เช่น สวัสดี" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">URL รูปภาพ</label>
                  <input type="text" value={card.imageUrl || ''} onChange={(e) => updateCard(idx, 'imageUrl', formatDriveUrl(e.target.value))} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400" placeholder="ลิ้งค์รูป (ถ้ามี)" />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddCard} 
            className="w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-lg text-sm font-bold hover:bg-orange-50 transition-all"
          >
            <PlusCircle size={24} /> เพิ่มการ์ดคำศัพท์
          </button>
        </div>
      </div>

    </div>
  );
}