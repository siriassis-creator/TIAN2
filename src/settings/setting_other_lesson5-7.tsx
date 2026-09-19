// src/settings/setting_other_lesson5-7.tsx
import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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

export default function SettingOtherLesson5_7({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data matching the image exactly
  useEffect(() => {
    if (!section.cards || section.cards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '3. 听录音，排序。 ฟังแล้วเขียนตัวเลขตามลำดับ',
        audioTrack: '05-03',
        cards: [
          { id: '1', imageUrl: '', chinese: '一双筷子', pinyin: 'yì shuāng kuàizi', correctNumber: '1' },
          { id: '2', imageUrl: '', chinese: '一个勺子', pinyin: 'yí gè sháozi', correctNumber: '2' },
          { id: '3', imageUrl: '', chinese: '一个叉子', pinyin: 'yí gè chāzi', correctNumber: '3' },
          { id: '4', imageUrl: '', chinese: '一块蛋糕', pinyin: 'yí kuài dàngāo', correctNumber: '4' },
          { id: '5', imageUrl: '', chinese: '一个盘子', pinyin: 'yí gè pánzi', correctNumber: '5' },
          { id: '6', imageUrl: '', chinese: '一个杯子', pinyin: 'yí gè bēizi', correctNumber: '6' },
          { id: '7', imageUrl: '', chinese: '一杯果汁', pinyin: 'yì bēi guǒzhī', correctNumber: '7' }
        ]
      }));
    }
  }, []);

  return (
    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 font-sans mt-4 relative">
      <h4 className="font-bold text-amber-800 mb-4 text-sm uppercase tracking-wide border-b border-amber-200 pb-2 inline-block">
        แบบเรียน: Listen & Sequence (ฟังเสียงแล้วเรียงลำดับ)
      </h4>

      {/* 1. Header & Audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ</label>
          <input type="text" value={section.mainTitle || ''} placeholder="เช่น: 3. 听录音，排序..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-amber-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Track No.</label>
          <input type="text" value={section.audioTrack || ''} placeholder="เช่น: 05-03" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioTrack: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-amber-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Audio Link</label>
          <input type="text" value={section.audioUrl || ''} placeholder="วางลิงก์ไฟล์เสียง..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-amber-400" />
        </div>
      </div>
      
      {/* 3. Cards List */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block uppercase flex items-center justify-between">
          <span>รายการการ์ดเรียงลำดับ</span>
          <span className="text-[10px] font-normal text-slate-400">ทั้งหมด {(section.cards || []).length} ใบ</span>
        </label>
        
        <div className="space-y-3">
          {(section.cards || []).map((card: any, idx: number) => (
            <div key={card.id || idx} className="flex flex-col md:flex-row gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 relative">
              
              <button 
                onClick={() => { const newCards = section.cards.filter((_: any, i: number) => i !== idx); updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, cards: newCards })); }} 
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>

              <div className="w-full md:w-1/3 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">Image URL</label>
                <input type="text" value={card.imageUrl || ''} placeholder="ลิงก์รูป" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.cards]; nc[idx].imageUrl = formatDriveUrl(e.target.value); return { ...s, cards: nc }; })} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-amber-400" />
              </div>
              
              <div className="w-full md:w-1/3 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">จีน & Pinyin</label>
                <input type="text" value={card.chinese || ''} placeholder="จีน (Pinyin ออโต้)" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.cards]; nc[idx].chinese = e.target.value; nc[idx].pinyin = pinyinConverter(e.target.value); return { ...s, cards: nc }; })} className="w-full px-2 py-1 text-xs border rounded font-serif mb-1 focus:ring-1 focus:ring-amber-400" />
                <input type="text" value={card.pinyin || ''} placeholder="Pinyin" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.cards]; nc[idx].pinyin = e.target.value; return { ...s, cards: nc }; })} className="w-full px-2 py-1 text-xs border rounded text-indigo-600 focus:ring-1 focus:ring-amber-400" />
              </div>

              <div className="w-full md:w-1/4 flex flex-col gap-1 items-start md:items-center">
                <label className="text-[10px] font-bold text-emerald-600">เลขเฉลย (คำตอบ)</label>
                <input type="text" value={card.correctNumber || ''} placeholder="เช่น 1" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.cards]; nc[idx].correctNumber = e.target.value; return { ...s, cards: nc }; })} className="w-16 px-2 py-2 text-center font-bold text-lg border-2 border-emerald-200 rounded-lg text-emerald-700 focus:ring-2 focus:ring-emerald-400 bg-emerald-50" />
              </div>

            </div>
          ))}
        </div>
        
        <button 
          onClick={() => updateSectionState(cardId, lessonId, section.id, (s) => ({ 
            ...s, 
            cards: [...(s.cards || []), { id: Date.now().toString(), imageUrl: '', chinese: '', pinyin: '', correctNumber: '' }] 
          }))} 
          className="w-full mt-4 py-3 border-2 border-dashed border-amber-200 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-50 transition-all text-center px-2"
        >
          + เพิ่มการ์ด
        </button>
      </div>
    </div>
  );
}