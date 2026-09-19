// src/settings/setting_other_lesson5-6.tsx
import React, { useEffect } from 'react';
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

export default function SettingOtherLesson5_6({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Initialize Default Data if empty
  useEffect(() => {
    if (!section.leftCards || section.leftCards.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '2. 听录音，连一连。 ฝึกฟังแล้วโยงเส้นจับคู่',
        audioTrack: '05-02',
        leftCards: [
          { id: '1', imageUrl: '', chinese: '', pinyin: '' },
          { id: '2', imageUrl: '', chinese: '', pinyin: '' },
          { id: '3', imageUrl: '', chinese: '', pinyin: '' },
          { id: '4', imageUrl: '', chinese: '', pinyin: '' }
        ],
        rightCards: [
          { id: '5', imageUrl: '', chinese: '', pinyin: '' },
          { id: '6', imageUrl: '', chinese: '', pinyin: '' },
          { id: '7', imageUrl: '', chinese: '', pinyin: '' },
          { id: '8', imageUrl: '', chinese: '', pinyin: '' }
        ],
        centerCards: [
          { id: 'A', chinese: '', pinyin: '', matchId: '1' },
          { id: 'B', chinese: '', pinyin: '', matchId: '2' },
          { id: 'C', chinese: '', pinyin: '', matchId: '3' },
          { id: 'D', chinese: '', pinyin: '', matchId: '4' },
          { id: 'E', chinese: '', pinyin: '', matchId: '5' },
          { id: 'F', chinese: '', pinyin: '', matchId: '6' },
          { id: 'G', chinese: '', pinyin: '', matchId: '7' },
          { id: 'H', chinese: '', pinyin: '', matchId: '8' }
        ]
      }));
    }
  }, []);

  return (
    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-sans mt-4 relative">
      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 inline-block">
        แบบเรียน: Match Game (เกมลากเส้นจับคู่)
      </h4>

      {/* 1. Header & Audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ</label>
          <input type="text" value={section.subTitle || section.mainTitle || ''} placeholder="เช่น: 2. 听录音，连一连..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Track No.</label>
          <input type="text" value={section.audioTrack || ''} placeholder="เช่น: 05-02" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioTrack: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Audio Link</label>
          <input type="text" value={section.audioUrl || ''} placeholder="วางลิงก์ไฟล์เสียง..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: LEFT CARDS */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-600 mb-3 uppercase text-center border-b pb-2">คอลัมน์ซ้าย (ID: 1-4)</div>
          <div className="space-y-3">
            {(section.leftCards || []).map((card: any, idx: number) => (
              <div key={card.id} className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5 relative">
                <span className="absolute top-1 right-2 text-[10px] font-bold text-slate-300">ID: {card.id}</span>
                <input type="text" placeholder="Image URL" value={card.imageUrl || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.leftCards]; nc[idx].imageUrl = formatDriveUrl(e.target.value); return { ...s, leftCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-emerald-400" />
                <input type="text" placeholder="จีน (Auto Pinyin)" value={card.chinese || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.leftCards]; nc[idx].chinese = e.target.value; nc[idx].pinyin = pinyinConverter(e.target.value); return { ...s, leftCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded font-serif focus:ring-1 focus:ring-emerald-400" />
                <input type="text" placeholder="Pinyin" value={card.pinyin || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.leftCards]; nc[idx].pinyin = e.target.value; return { ...s, leftCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded text-indigo-600 focus:ring-1 focus:ring-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CENTER CARDS */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-600 mb-3 uppercase text-center border-b pb-2">คอลัมน์กลาง (ID: A-H)</div>
          <div className="space-y-2">
            {(section.centerCards || []).map((card: any, idx: number) => (
              <div key={card.id} className="bg-emerald-50/30 p-2 rounded border border-emerald-100 flex flex-col gap-1.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600">ID: {card.id}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    เฉลยคู่กับ: 
                    <select value={card.matchId || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.centerCards]; nc[idx].matchId = e.target.value; return { ...s, centerCards: nc }; })} className="border rounded px-1 py-0.5 bg-white text-emerald-700 font-bold font-sans">
                      <option value="1">ซ้าย 1</option><option value="2">ซ้าย 2</option><option value="3">ซ้าย 3</option><option value="4">ซ้าย 4</option>
                      <option value="5">ขวา 5</option><option value="6">ขวา 6</option><option value="7">ขวา 7</option><option value="8">ขวา 8</option>
                    </select>
                  </div>
                </div>
                <input type="text" placeholder="จีน (Auto Pinyin)" value={card.chinese || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.centerCards]; nc[idx].chinese = e.target.value; nc[idx].pinyin = pinyinConverter(e.target.value); return { ...s, centerCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded font-serif focus:ring-1 focus:ring-emerald-400" />
                <input type="text" placeholder="Pinyin" value={card.pinyin || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.centerCards]; nc[idx].pinyin = e.target.value; return { ...s, centerCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded text-indigo-600 focus:ring-1 focus:ring-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: RIGHT CARDS */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-600 mb-3 uppercase text-center border-b pb-2">คอลัมน์ขวา (ID: 5-8)</div>
          <div className="space-y-3">
            {(section.rightCards || []).map((card: any, idx: number) => (
              <div key={card.id} className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5 relative">
                <span className="absolute top-1 right-2 text-[10px] font-bold text-slate-300">ID: {card.id}</span>
                <input type="text" placeholder="Image URL" value={card.imageUrl || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.rightCards]; nc[idx].imageUrl = formatDriveUrl(e.target.value); return { ...s, rightCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-emerald-400" />
                <input type="text" placeholder="จีน (Auto Pinyin)" value={card.chinese || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.rightCards]; nc[idx].chinese = e.target.value; nc[idx].pinyin = pinyinConverter(e.target.value); return { ...s, rightCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded font-serif focus:ring-1 focus:ring-emerald-400" />
                <input type="text" placeholder="Pinyin" value={card.pinyin || ''} onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nc = [...s.rightCards]; nc[idx].pinyin = e.target.value; return { ...s, rightCards: nc }; })} className="w-full px-2 py-1 text-xs border rounded text-indigo-600 focus:ring-1 focus:ring-emerald-400" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}