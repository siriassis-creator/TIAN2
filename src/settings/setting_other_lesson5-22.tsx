// src/settings/setting_other_lesson5-22.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Image as ImageIcon } from 'lucide-react';

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

export default function SettingOtherLesson5_22({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้นตามภาพ
  useEffect(() => {
    if (!section.groups || section.groups.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-22',
        mainTitle: s.mainTitle || '6. 描一描，写一写。',
        subTitle: s.subTitle || 'ฝึกเขียนตามลายเส้น',
        groups: s.groups || [
          { id: 'g1', title: '给（*给*我  *给*妹妹）', text: '给给给给给给给给给给', imageUrl: '' },
          { id: 'g2', title: '双（一*双*筷子）', text: '双双双双双双双双双双', imageUrl: '' },
          { id: 'g3', title: '7. 描句子。 ฝึกเขียนประโยคตามลายเส้น', text: '给我一杯可乐。', imageUrl: 'https://s.imgz.io/2026/09/07/Gemini_Generated_Image_8sccdc8sccdc8sccbb0c38d8b52e70bf.jpeg' }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeGroups = safeSection.groups || [];

  const handleAddGroup = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      groups: [...(s.groups || []), { id: `g_${Date.now()}`, title: '', text: 'อักษรจีน...', imageUrl: '' }]
    }));
  };

  const handleDeleteGroup = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const ng = [...(s.groups || [])];
      ng.splice(idx, 1);
      return { ...s, groups: ng };
    });
  };

  const updateGroup = (idx: number, field: string, value: any) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const ng = [...(s.groups || [])];
      ng[idx] = { ...ng[idx], [field]: value };
      return { ...s, groups: ng };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: สมุดฝึกคัดลายมือ (Other_lesson5-22)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (จีน)</label>
          <input type="text" value={safeSection.mainTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย (ไทย)</label>
          <input type="text" value={safeSection.subTitle || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าแถวการเขียน */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">ชุดข้อความฝึกเขียน (แต่ละอักษรจะกลายเป็นกล่อง 1 ใบ)</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeGroups.length} แถว</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {safeGroups.map((group: any, gIdx: number) => (
            <div key={group.id} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative items-start">
              
              <div className="text-[12px] font-bold text-orange-600 bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                {gIdx + 1}
              </div>
              
              <div className="flex-1 w-full space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
                    หัวข้ออธิบายบนแถว (ใส่ <strong className="text-red-500 text-sm">*</strong> คร่อมตัวอักษรเพื่อทำสีแดง เช่น 给（<strong className="text-red-500">*给*</strong>我）)
                  </label>
                  <input 
                    type="text" 
                    value={group.title || ''} 
                    onChange={(e) => updateGroup(gIdx, 'title', e.target.value)} 
                    className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-orange-400 font-serif" 
                    placeholder="เช่น 给（*给*我  *给*妹妹）" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-orange-500 mb-1 block uppercase">อักษรจีนที่ต้องการให้เขียน (เครื่องหมายวรรคตอนจะแสดงเป็นข้อความปกติ)</label>
                  <input 
                    type="text" 
                    value={group.text || ''} 
                    onChange={(e) => updateGroup(gIdx, 'text', e.target.value)} 
                    className="w-full px-3 py-2 text-sm font-serif border border-orange-200 rounded focus:ring-1 focus:ring-orange-400" 
                    placeholder="เช่น 给给给给给给给给给给 หรือ 给我一杯可乐。" 
                  />
                </div>
              </div>

              {/* รูปภาพประกอบ (อยู่ต่อท้ายแถว) */}
              <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                <label className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase">
                  <ImageIcon size={12}/> รูปภาพประกอบท้ายแถว
                </label>
                <input 
                  type="text" 
                  value={group.imageUrl || ''} 
                  onChange={(e) => updateGroup(gIdx, 'imageUrl', formatDriveUrl(e.target.value))} 
                  className="w-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded text-xs focus:ring-1 focus:ring-indigo-400" 
                  placeholder="URL รูปภาพ..."
                />
                {group.imageUrl && (
                  <div className="h-16 bg-white border border-slate-200 rounded flex items-center justify-center p-1">
                    <img src={group.imageUrl} alt="preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <button onClick={() => handleDeleteGroup(gIdx)} className="absolute -top-2 -right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-1.5 shadow-md border border-slate-100 transition-colors">
                <Trash2 size={14} />
              </button>

            </div>
          ))}

          <button onClick={handleAddGroup} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all mt-2">
            <PlusCircle size={20} /> เพิ่มแถวฝึกเขียนใหม่
          </button>
        </div>
      </div>

    </div>
  );
}