// src/settings/setting_other_lesson5-9.tsx
import React, { useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

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

export default function SettingOtherLesson5_9({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data 
  useEffect(() => {
    if (!section.topItems || section.topItems.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '4. 连一连。 โยงเส้นจับคู่',
        sideImageUrl: '', // +++ เพิ่มรูปภาพฝั่งซ้าย +++
        topItems: [
          { id: '1', imageUrl: '', chinese: '' },
          { id: '2', imageUrl: '', chinese: '' },
          { id: '3', imageUrl: '', chinese: '' },
          { id: '4', imageUrl: '', chinese: '' }
        ],
        bottomItems: [
          { id: '1', imageUrl: '', matchId: '1', chinese: '' },
          { id: '2', imageUrl: '', matchId: '2', chinese: '' },
          { id: '3', imageUrl: '', matchId: '3', chinese: '' },
          { id: '4', imageUrl: '', matchId: '4', chinese: '' }
        ]
      }));
    }
  }, []);

  return (
    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-sans mt-4 relative">
      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 inline-block">
        แบบเรียน: โยงเส้นจับคู่รูปภาพ (ลากเส้นบน-ล่าง)
      </h4>

      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ (เว้นว่างได้)</label>
        <input 
          type="text" 
          value={section.mainTitle || ''} 
          placeholder="เช่น: โยงเส้นจับคู่ให้ถูกต้อง..." 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" 
        />
      </div>

      {/* +++ เพิ่มส่วนตั้งค่ารูปภาพประกอบซ้ายมือ +++ */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2 flex items-center gap-2">
            <ImageIcon size={14} className="text-emerald-600" /> รูปภาพประกอบฝั่งซ้ายมือ
        </label>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <input 
                    type="text" 
                    value={section.sideImageUrl || ''} 
                    placeholder="วางลิงก์รูปภาพ..." 
                    onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sideImageUrl: formatDriveUrl(e.target.value) }))} 
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-400 bg-slate-50" 
                />
            </div>
            {section.sideImageUrl && (
                <div className="w-[100px] h-[100px] rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img src={section.sideImageUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TOP ROW IMAGES */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">
            แถวบน (คำถาม) 4 รูป
          </label>
          <div className="space-y-3">
            {(section.topItems || []).map((item: any, idx: number) => (
              <div key={item.id} className="flex items-start gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded flex items-center justify-center shrink-0 mt-1">
                  {item.id}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <input 
                    type="text" 
                    value={item.imageUrl || ''} 
                    placeholder={`Image URL แถวบนที่ ${idx + 1}`} 
                    onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                      const ni = [...s.topItems]; ni[idx].imageUrl = formatDriveUrl(e.target.value); return { ...s, topItems: ni }; 
                    })} 
                    className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400" 
                  />
                  <input 
                    type="text" 
                    value={item.chinese || ''} 
                    placeholder={`คำศัพท์ภาษาจีน (แสดงตอนพลิกรูป)`} 
                    onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                      const ni = [...s.topItems]; ni[idx].chinese = e.target.value; return { ...s, topItems: ni }; 
                    })} 
                    className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400 font-serif" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW IMAGES */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">
            แถวล่าง (คำตอบ) 4 รูป
          </label>
          <div className="space-y-3">
            {(section.bottomItems || []).map((item: any, idx: number) => (
              <div key={item.id} className="flex flex-col gap-2 bg-emerald-50/30 p-2 rounded border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600">รูปแถวล่างที่ {idx + 1}</span>
                  <div className="flex items-center gap-2 text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    <span className="font-bold text-slate-500">เฉลยโยงคู่กับ:</span>
                    <select 
                      value={item.matchId || ''} 
                      onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                        const ni = [...s.bottomItems]; ni[idx].matchId = e.target.value; return { ...s, bottomItems: ni }; 
                      })}
                      className="border-none bg-transparent font-bold text-emerald-700 outline-none p-0 cursor-pointer"
                    >
                      <option value="1">รูปบน 1</option>
                      <option value="2">รูปบน 2</option>
                      <option value="3">รูปบน 3</option>
                      <option value="4">รูปบน 4</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      value={item.imageUrl || ''} 
                      placeholder={`Image URL แถวล่างที่ ${idx + 1}`} 
                      onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                        const ni = [...s.bottomItems]; ni[idx].imageUrl = formatDriveUrl(e.target.value); return { ...s, bottomItems: ni }; 
                      })} 
                      className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400 bg-white" 
                    />
                    <input 
                      type="text" 
                      value={item.chinese || ''} 
                      placeholder={`คำศัพท์ภาษาจีน (แสดงตอนพลิกรูป)`} 
                      onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { 
                        const ni = [...s.bottomItems]; ni[idx].chinese = e.target.value; return { ...s, bottomItems: ni }; 
                      })} 
                      className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-emerald-400 font-serif bg-white" 
                    />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}