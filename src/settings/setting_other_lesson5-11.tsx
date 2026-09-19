// src/settings/setting_other_lesson5-11.tsx
import React, { useEffect } from 'react';

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

export default function SettingOtherLesson5_11({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data เหมือนในหนังสือเป๊ะๆ
  useEffect(() => {
    if (!section.row1Boxes || section.row1Boxes.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '练一练 กิจกรรมหรรษา',
        subTitle: '1. 看词语，补全拼音。 ดูคำศัพท์แล้วเติมพินอินให้สมบูรณ์',
        row1Boxes: [
          { id: 'r1-1', leftType: 'text', leftContent: 'ให้', pinyinStart: '', hiddenPinyin: 'g', pinyinEnd: 'ěi', chinese: '给' },
          { id: 'r1-2', leftType: 'text', leftContent: 'คู่', pinyinStart: '', hiddenPinyin: 'sh', pinyinEnd: 'uāng', chinese: '双' },
          { id: 'r1-3', leftType: 'text', leftContent: 'ชิ้น', pinyinStart: 'k', hiddenPinyin: 'uài', pinyinEnd: '', chinese: '块' }
        ],
        gridBoxes: [
          { id: 'g-1', leftType: 'image', leftContent: '', pinyinStart: 'kuài', hiddenPinyin: 'zi', pinyinEnd: '', chinese: '筷子' },
          { id: 'g-2', leftType: 'image', leftContent: '', pinyinStart: '', hiddenPinyin: 'sháo', pinyinEnd: 'zi', chinese: '勺子' },
          { id: 'g-3', leftType: 'text', leftContent: 'ใบ', pinyinStart: 'b', hiddenPinyin: 'ēi', pinyinEnd: '', chinese: '杯' },
          { id: 'g-4', leftType: 'image', leftContent: '', pinyinStart: '', hiddenPinyin: 'chā', pinyinEnd: 'zi', chinese: '叉子' },
          { id: 'g-5', leftType: 'image', leftContent: '', pinyinStart: '', hiddenPinyin: 'bēi', pinyinEnd: 'zi', chinese: '杯子' },
          { id: 'g-6', leftType: 'image', leftContent: '', pinyinStart: '', hiddenPinyin: 'pán', pinyinEnd: 'zi', chinese: '盘子' }
        ]
      }));
    }
  }, []);

  const renderBoxInputs = (boxList: any[], listKey: 'row1Boxes' | 'gridBoxes') => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxList.map((box: any, idx: number) => (
          <div key={box.id || idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative flex flex-col gap-2 shadow-sm">
            <div className="font-bold text-orange-500 text-xs mb-1">กล่องที่ {idx + 1}</div>

            {/* การตั้งค่าฝั่งซ้าย (เลือกว่าจะเป็นรูปหรือข้อความ) */}
            <div className="flex gap-2 mb-1 bg-white p-1.5 rounded border border-slate-100">
              <select 
                value={box.leftType} 
                onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].leftType = e.target.value; return { ...s, [listKey]: nb }; })}
                className="w-1/3 px-1 py-1 text-[11px] border rounded focus:ring-1 focus:ring-orange-400 bg-slate-50 font-bold"
              >
                <option value="text">ข้อความ</option>
                <option value="image">รูปภาพ</option>
              </select>
              <input 
                type="text" 
                value={box.leftContent || ''} 
                placeholder={box.leftType === 'text' ? 'คำแปลภาษาไทย' : 'URL รูปภาพ'} 
                onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                  const nb = [...s[listKey]]; 
                  nb[idx].leftContent = box.leftType === 'image' ? formatDriveUrl(e.target.value) : e.target.value; 
                  return { ...s, [listKey]: nb }; 
                })} 
                className="w-2/3 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-orange-400" 
              />
            </div>

            {/* พินอินแบบแบ่ง 3 ท่อน */}
            <label className="text-[10px] text-slate-500 font-bold mt-1">แบ่งท่อน Pinyin (ซ้าย - ซ่อน - ขวา)</label>
            <div className="flex gap-1">
              <input type="text" value={box.pinyinStart || ''} placeholder="หน้า" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].pinyinStart = e.target.value; return { ...s, [listKey]: nb }; })} className="w-1/3 px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400 text-center" />
              <input type="text" value={box.hiddenPinyin || ''} placeholder="ส่วนที่ซ่อน" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].hiddenPinyin = e.target.value; return { ...s, [listKey]: nb }; })} className="w-1/3 px-2 py-1.5 text-xs border-2 border-orange-300 rounded focus:ring-1 focus:ring-orange-400 text-center font-bold text-orange-600 bg-orange-50" />
              <input type="text" value={box.pinyinEnd || ''} placeholder="หลัง" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].pinyinEnd = e.target.value; return { ...s, [listKey]: nb }; })} className="w-1/3 px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400 text-center" />
            </div>

            {/* ตัวจีน */}
            <input 
              type="text" 
              value={box.chinese || ''} 
              placeholder="อักษรจีน" 
              onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].chinese = e.target.value; return { ...s, [listKey]: nb }; })} 
              className="w-full mt-1 px-2 py-1.5 text-sm border rounded font-serif focus:ring-1 focus:ring-orange-400 text-center" 
            />

          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 inline-block">
        แบบเรียน: เติมพินอินในช่องว่าง (กิจกรรมหรรษา)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก (ป้ายส้ม)</label>
          <input type="text" value={section.mainTitle || ''} placeholder="เช่น: 练一练 กิจกรรมหรรษา" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อย่อย</label>
          <input type="text" value={section.subTitle || ''} placeholder="เช่น: 1. 看词语..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-orange-400" />
        </div>
      </div>
      
      <div className="space-y-6">
        {/* ROW 1 */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">แถวที่ 1 (เรียง 3 กล่อง)</label>
          {renderBoxInputs(section.row1Boxes || [], 'row1Boxes')}
        </div>

        {/* GRID BOXES */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">แถวที่ 2-4 (เรียงกล่องแบบ Grid 2 คอลัมน์)</label>
          {renderBoxInputs(section.gridBoxes || [], 'gridBoxes')}
        </div>
      </div>

    </div>
  );
}