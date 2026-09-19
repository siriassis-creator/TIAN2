// src/settings/setting_other_lesson1-1.tsx
import React from 'react';
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

export default function SettingOtherLesson1_1({ section, cardId, lessonId, updateSectionState }: Props) {
  return (
    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 font-sans mt-4 relative">
      <h4 className="font-bold text-indigo-800 mb-4 text-sm uppercase tracking-wide border-b border-indigo-200 pb-2 inline-block">
        แบบเรียน: New Words (คำศัพท์ใหม่ 4 คอลัมน์)
      </h4>

      {/* 1. ข้อมูลหัวข้อ */}
      <div className="mb-4 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อ (พิมพ์เว้นวรรค ระบบจะจัด Layout ให้อัตโนมัติ)</label>
        <input 
          type="text" 
          value={section.titleZh || ''} 
          placeholder="เช่น: 二 生词 Shēngcí New Words" 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, titleZh: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-indigo-400" 
        />
      </div>

      {/* 2. ไฟล์เสียง (ไม่มีรูปภาพ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Track No.</label>
          <input type="text" value={section.audioTrack || ''} placeholder="เช่น: 01-2" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioTrack: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-400" />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Audio Link (Dropbox/Drive)</label>
          <input type="text" value={section.audioUrl || ''} placeholder="วางลิงก์ไฟล์เสียง..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-400" />
        </div>
      </div>
      
      {/* 3. รายการคำศัพท์ */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block uppercase flex items-center justify-between">
          <span>รายการคำศัพท์ (Words List)</span>
          <span className="text-[10px] font-normal text-slate-400">ทั้งหมด {(section.words || []).length} คำ</span>
        </label>
        
        {(section.words || []).map((item: any, idx: number) => (
          <div key={idx} className="flex gap-2 mb-3 pb-3 border-b border-slate-100 relative items-start">
            <input 
              type="text" 
              // +++ ใส่เลขลำดับข้ออัตโนมัติหากไม่มีข้อมูล +++
              value={item.no || `${idx + 1}.`} 
              placeholder="ข้อ" 
              onChange={(e) => { 
                const newRows = [...(section.words || [])]; 
                newRows[idx] = { ...newRows[idx], no: e.target.value }; 
                updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
              }} 
              className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-center focus:ring-1 focus:ring-indigo-400" 
            />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input 
                type="text" 
                value={item.chinese || ''} 
                placeholder="ภาษาจีน (Pinyin จะขึ้นอัตโนมัติ)" 
                onChange={(e) => { 
                  const val = e.target.value;
                  const newRows = [...(section.words || [])]; 
                  const autoPinyin = pinyinConverter(val);
                  newRows[idx] = { ...newRows[idx], chinese: val, pinyin: autoPinyin }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-indigo-400" 
              />
              <input 
                type="text" 
                value={item.pinyin || ''} 
                placeholder="Pinyin" 
                onChange={(e) => { 
                  const newRows = [...(section.words || [])]; 
                  newRows[idx] = { ...newRows[idx], pinyin: e.target.value }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-indigo-600 focus:ring-1 focus:ring-indigo-400" 
              />
              <input 
                type="text" 
                value={item.type || ''} 
                placeholder="ประเภท (เช่น 代)" 
                onChange={(e) => { 
                  const newRows = [...(section.words || [])]; 
                  newRows[idx] = { ...newRows[idx], type: e.target.value }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-indigo-400" 
              />
              <input 
                type="text" 
                value={item.english || ''} 
                placeholder="คำแปล (ENG)" 
                onChange={(e) => { 
                  const newRows = [...(section.words || [])]; 
                  newRows[idx] = { ...newRows[idx], english: e.target.value }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-indigo-400" 
              />
            </div>
            <button 
              onClick={() => { 
                // +++ เรียงลำดับข้อใหม่ทั้งหมดเวลาลบ +++
                const newRows = section.words
                  .filter((_: any, i: number) => i !== idx)
                  .map((w: any, i: number) => ({ ...w, no: `${i + 1}.` })); // รีเซ็ตเลขข้อใหม่
                updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, words: newRows })); 
              }} 
              className="text-slate-300 hover:text-red-500 p-2 shrink-0 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        <button 
          onClick={() => updateSectionState(cardId, lessonId, section.id, (s) => {
            // +++ คำนวณเลขลำดับข้อถัดไปอัตโนมัติ +++
            const nextIdx = (s.words || []).length + 1;
            return { 
              ...s, 
              words: [...(s.words || []), { no: `${nextIdx}.`, chinese: '', pinyin: '', type: '', english: '' }] 
            };
          })} 
          className="w-full mt-2 py-2 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all text-left px-2"
        >
          + เพิ่มคำศัพท์ใหม่
        </button>
      </div>
    </div>
  );
}