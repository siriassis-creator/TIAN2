// src/settings/setting_other_lesson5-20.tsx
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

export default function SettingOtherLesson5_20({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    if (!section.images || section.images.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-20',
        mainTitle: s.mainTitle || '4. 描出每组汉字中相同的部分。',
        subTitle: s.subTitle || 'เขียนส่วนประกอบที่เหมือนกันของตัวอักษรแต่ละคู่',
        images: s.images || [
          { id: 'img_1', imageUrl: 'https://s.imgz.io/2026/09/07/Gemini_Generated_Image_8sccdc8sccdc8sccbb0c38d8b52e70bf.jpeg' }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeImages = safeSection.images || [];

  const handleAddImage = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      images: [...(s.images || []), { id: `img_${Date.now()}`, imageUrl: '' }]
    }));
  };

  const handleDeleteImage = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const newImages = [...(s.images || [])];
      newImages.splice(idx, 1);
      return { ...s, images: newImages };
    });
  };

  const updateImageUrl = (idx: number, url: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const newImages = [...(s.images || [])];
      newImages[idx] = { ...newImages[idx], imageUrl: formatDriveUrl(url) };
      return { ...s, images: newImages };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: โจทย์ข้อความ + รูปภาพประกอบ (Other_lesson5-20)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อหลัก (จีน)</label>
          <input 
            type="text" 
            value={safeSection.mainTitle || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400 font-serif" 
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อย่อย (ไทย)</label>
          <input 
            type="text" 
            value={safeSection.subTitle || ''} 
            onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, subTitle: e.target.value }))} 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-400" 
          />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่ารูปภาพ */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><ImageIcon size={14}/> รูปภาพประกอบด้านล่าง</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeImages.length} รูป</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {safeImages.map((img: any, idx: number) => (
            <div key={img.id} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative items-start md:items-center">
              
              <div className="text-[12px] font-bold text-orange-600 bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                {idx + 1}
              </div>
              
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1 uppercase">
                  URL รูปภาพ
                </label>
                <input 
                  type="text" 
                  value={img.imageUrl || ''} 
                  onChange={(e) => updateImageUrl(idx, e.target.value)} 
                  className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-400" 
                  placeholder="วางลิ้งค์รูปภาพ (Google Drive หรืออื่นๆ)..."
                />
              </div>

              <div className="w-full md:w-32 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 p-1">
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt="preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400">ไม่มีรูป</span>
                )}
              </div>

              <button onClick={() => handleDeleteImage(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-2 shadow-sm shrink-0 self-end md:self-auto transition-colors">
                <Trash2 size={16} />
              </button>

            </div>
          ))}

          <button onClick={handleAddImage} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all mt-2">
            <PlusCircle size={20} /> เพิ่มรูปภาพใหม่
          </button>
        </div>
      </div>

    </div>
  );
}