// src/settings/setting_other_lesson5.tsx
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

export default function SettingOtherLesson5({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Set default values if empty
  useEffect(() => {
    if (!section.mainTitle && !section.headers) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '人物介绍 แนะนำตัวละคร',
        headers: {
          col1: '人物 ตัวละคร',
          col2: '姓名 ชื่อสกุล',
          col3: '年龄 อายุ',
          col4: '生日 วันเกิด',
          col5: '出生地 สถานที่เกิด'
        },
        characters: s.characters || []
      }));
    }
  }, []);

  const headers = section.headers || {};

  const handleHeaderChange = (colKey: string, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (s) => ({
      ...s,
      headers: { ...(s.headers || {}), [colKey]: value }
    }));
  };

  const handleCellChange = (charIdx: number, colKey: string, field: string, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const newChars = [...(s.characters || [])];
      const targetCell = { ...newChars[charIdx][colKey] };
      
      targetCell[field] = value;
      
      // Auto Pinyin when Chinese changes
      if (field === 'chinese') {
        targetCell.pinyin = pinyinConverter(value);
      }

      newChars[charIdx] = { ...newChars[charIdx], [colKey]: targetCell };
      return { ...s, characters: newChars };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 inline-block">
        แบบเรียน: Character Intro (แนะนำตัวละคร 5 คอลัมน์)
      </h4>

      {/* 1. ข้อมูลหัวข้อหลัก */}
      <div className="mb-4 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก (Title)</label>
        <input 
          type="text" 
          value={section.mainTitle || ''} 
          placeholder="เช่น: 人物介绍 แนะนำตัวละคร" 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-orange-400" 
        />
      </div>

      {/* 2. ตั้งค่า Header 5 คอลัมน์ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="md:col-span-5 mb-1">
          <label className="text-xs font-bold text-slate-600 block uppercase">ตั้งค่าชื่อคอลัมน์ (Table Headers)</label>
        </div>
        <input type="text" value={headers.col1 || ''} placeholder="Col 1" onChange={(e) => handleHeaderChange('col1', e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-orange-400 text-center font-bold" />
        <input type="text" value={headers.col2 || ''} placeholder="Col 2" onChange={(e) => handleHeaderChange('col2', e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-orange-400 text-center font-bold" />
        <input type="text" value={headers.col3 || ''} placeholder="Col 3" onChange={(e) => handleHeaderChange('col3', e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-orange-400 text-center font-bold" />
        <input type="text" value={headers.col4 || ''} placeholder="Col 4" onChange={(e) => handleHeaderChange('col4', e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-orange-400 text-center font-bold" />
        <input type="text" value={headers.col5 || ''} placeholder="Col 5" onChange={(e) => handleHeaderChange('col5', e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-orange-400 text-center font-bold" />
      </div>
      
      {/* 3. จัดการข้อมูลตัวละครแต่ละแถว */}
      <div className="space-y-4">
        {(section.characters || []).map((char: any, idx: number) => (
          <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 relative">
            
            <button onClick={() => { const newChars = section.characters.filter((_: any, i: number) => i !== idx); updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, characters: newChars })); }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1 transition-colors bg-white rounded-full"><Trash2 size={18} /></button>

            <h5 className="font-bold text-orange-600 mb-3 text-sm border-b pb-2">ตัวละครที่ {idx + 1}</h5>
            
            {/* Col 1: รูปภาพ */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Col 1: รูปภาพตัวละคร (Image URL)</label>
              <input type="text" value={char.imageUrl || ''} placeholder="วางลิงก์รูปภาพ..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const newChars = [...(s.characters || [])]; newChars[idx] = { ...newChars[idx], imageUrl: formatDriveUrl(e.target.value) }; return { ...s, characters: newChars }; })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
            </div>

            {/* Col 2 - 5: ข้อมูล 3 บรรทัด */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Col 2 Input Block */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-center text-slate-500 uppercase">{headers.col2 || 'Col 2'}</div>
                <input type="text" placeholder="ภาษาจีน" value={char.col2?.chinese || ''} onChange={(e) => handleCellChange(idx, 'col2', 'chinese', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center font-serif focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="Pinyin" value={char.col2?.pinyin || ''} onChange={(e) => handleCellChange(idx, 'col2', 'pinyin', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center text-indigo-600 focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="แปลไทย" value={char.col2?.translation || ''} onChange={(e) => handleCellChange(idx, 'col2', 'translation', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center focus:ring-1 focus:ring-orange-400" />
              </div>

              {/* Col 3 Input Block */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-center text-slate-500 uppercase">{headers.col3 || 'Col 3'}</div>
                <input type="text" placeholder="ภาษาจีน" value={char.col3?.chinese || ''} onChange={(e) => handleCellChange(idx, 'col3', 'chinese', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center font-serif focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="Pinyin" value={char.col3?.pinyin || ''} onChange={(e) => handleCellChange(idx, 'col3', 'pinyin', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center text-indigo-600 focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="แปลไทย" value={char.col3?.translation || ''} onChange={(e) => handleCellChange(idx, 'col3', 'translation', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center focus:ring-1 focus:ring-orange-400" />
              </div>

              {/* Col 4 Input Block */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-center text-slate-500 uppercase">{headers.col4 || 'Col 4'}</div>
                <input type="text" placeholder="ภาษาจีน" value={char.col4?.chinese || ''} onChange={(e) => handleCellChange(idx, 'col4', 'chinese', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center font-serif focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="Pinyin" value={char.col4?.pinyin || ''} onChange={(e) => handleCellChange(idx, 'col4', 'pinyin', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center text-indigo-600 focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="แปลไทย" value={char.col4?.translation || ''} onChange={(e) => handleCellChange(idx, 'col4', 'translation', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center focus:ring-1 focus:ring-orange-400" />
              </div>

              {/* Col 5 Input Block */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-center text-slate-500 uppercase">{headers.col5 || 'Col 5'}</div>
                <input type="text" placeholder="ภาษาจีน" value={char.col5?.chinese || ''} onChange={(e) => handleCellChange(idx, 'col5', 'chinese', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center font-serif focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="Pinyin" value={char.col5?.pinyin || ''} onChange={(e) => handleCellChange(idx, 'col5', 'pinyin', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center text-indigo-600 focus:ring-1 focus:ring-orange-400" />
                <input type="text" placeholder="แปลไทย" value={char.col5?.translation || ''} onChange={(e) => handleCellChange(idx, 'col5', 'translation', e.target.value)} className="w-full px-2 py-1 text-sm border rounded text-center focus:ring-1 focus:ring-orange-400" />
              </div>

            </div>
          </div>
        ))}
        
        <button 
          onClick={() => updateSectionState(cardId, lessonId, section.id, (s) => ({
            ...s, 
            characters: [...(s.characters || []), { 
              imageUrl: '', 
              col2: { chinese: '', pinyin: '', translation: '' },
              col3: { chinese: '', pinyin: '', translation: '' },
              col4: { chinese: '', pinyin: '', translation: '' },
              col5: { chinese: '', pinyin: '', translation: '' }
            }] 
          }))} 
          className="w-full py-3 border-2 border-dashed border-orange-200 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-50 transition-all text-center px-2"
        >
          + เพิ่มข้อมูลตัวละคร
        </button>
      </div>
    </div>
  );
}