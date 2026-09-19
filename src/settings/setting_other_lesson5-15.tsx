// src/settings/setting_other_lesson5-15.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, Edit3, Wand2 } from 'lucide-react';
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

export default function SettingOtherLesson5_15({ section, cardId, lessonId, updateSectionState }: Props) {
  
  useEffect(() => {
    if (!section.lines || section.lines.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        patternType: 'other_lesson5-15',
        mainTitle: s.mainTitle || '读一读，判断对错',
        subTitle: s.subTitle || 'ฝึกอ่านแล้วพิจารณาว่าถูกหรือผิด',
        audioTrack: s.audioTrack || '05-05',
        audioUrl: s.audioUrl || '',
        imageUrl: s.imageUrl || '', // +++ เพิ่มช่องรูปภาพเริ่มต้น +++
        lines: s.lines || [
          { chinese: '娜林的妹妹读一年级。', pinyin: 'Nàlín de mèimei dú yī niánjí.', correctAnswer: 'true' },
          { chinese: '妹妹的生日是八月十五日。', pinyin: 'Mèimei de shēngrì shì Bāyuè shíwǔ rì.', correctAnswer: 'false' },
          { chinese: '爸爸给妹妹一件T恤。', pinyin: 'Bàba gěi mèimei yí jiàn T xù.', correctAnswer: 'true' },
          { chinese: '妈妈给妹妹一双鞋。', pinyin: 'Māma gěi mèimei yì shuāng xié.', correctAnswer: 'false' },
          { chinese: '娜林给妹妹一支笔和一本书。', pinyin: 'Nàlín gěi mèimei yì zhī bǐ hé yì běn shū.', correctAnswer: 'true' }
        ]
      }));
    }
  }, []);

  const safeSection = section || {};
  const safeLines = safeSection.lines || [];

  const handleAddLine = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => ({
      ...s,
      lines: [...(s.lines || []), { chinese: '', pinyin: '', correctAnswer: 'true' }]
    }));
  };

  const handleDeleteLine = (idx: number) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = [...(s.lines || [])];
      nl.splice(idx, 1);
      return { ...s, lines: nl };
    });
  };

  const updateLine = (idx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = [...(s.lines || [])];
      
      if (field === 'chinese') {
        const generatedPinyin = pinyinConverter(value);
        nl[idx] = { ...nl[idx], chinese: value, pinyin: generatedPinyin };
      } else {
        nl[idx] = { ...nl[idx], [field]: value };
      }
      return { ...s, lines: nl };
    });
  };

  const handleAutoPinyinAll = () => {
    updateSectionState(cardId, lessonId, safeSection.id, (s) => {
      const nl = (s.lines || []).map((line: any) => ({
        ...line,
        pinyin: line.chinese ? pinyinConverter(line.chinese) : line.pinyin
      }));
      return { ...s, lines: nl };
    });
    alert('🪄 แปลงพินอินอัตโนมัติเรียบร้อยแล้วครับ!');
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 flex items-center gap-2">
        <Edit3 size={18} /> แบบเรียน: บทความฝึกอ่าน พิจารณาถูกผิด (Other_lesson5-15)
      </h4>

      {/* 1. ส่วนตั้งค่าหัวข้อ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก (ป้ายส้ม)</label>
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
          <label className="text-[10px] font-bold text-orange-600 mb-1 block uppercase">URL ไฟล์เสียง</label>
          <input type="text" value={safeSection.audioUrl || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm focus:ring-1 focus:ring-orange-400" placeholder="วางลิ้งค์เสียง..." />
        </div>
        {/* +++ เพิ่มช่องใส่ URL รูปภาพประกอบด้านขวา +++ */}
        <div className="col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-indigo-600 mb-1 block uppercase">URL รูปภาพประกอบ (แสดงด้านขวา)</label>
          <input type="text" value={safeSection.imageUrl || ''} onChange={(e) => updateSectionState(cardId, lessonId, safeSection.id, (s) => ({ ...s, imageUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded text-sm focus:ring-1 focus:ring-indigo-400" placeholder="วางลิ้งค์รูปภาพประกอบ..." />
        </div>
      </div>

      {/* 2. ส่วนตั้งค่าคำถามและเฉลย */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <label className="text-xs font-bold text-slate-600 uppercase">คำถามและเฉลย</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">มี {safeLines.length} ข้อ</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {safeLines.map((line: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm relative items-start md:items-center">
              
              <div className="text-[14px] font-black text-white bg-orange-400 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{idx + 1}</div>
              
              <div className="flex-1 w-full">
                <input type="text" value={line.chinese || ''} onChange={(e) => updateLine(idx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-orange-400 mb-2 font-serif" placeholder="อักษรจีน..." />
                <input type="text" value={line.pinyin || ''} onChange={(e) => updateLine(idx, 'pinyin', e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-orange-400 text-slate-500" placeholder="พินอิน..." />
              </div>
              
              <div className="flex flex-col items-center gap-1 shrink-0 bg-white p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ตั้งเฉลย</span>
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                  <button onClick={() => updateLine(idx, 'correctAnswer', 'true')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${line.correctAnswer === 'true' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:bg-emerald-100'}`}>
                    ✓ ถูก
                  </button>
                  <button onClick={() => updateLine(idx, 'correctAnswer', 'false')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${line.correctAnswer === 'false' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:bg-red-100'}`}>
                    ✗ ผิด
                  </button>
                </div>
              </div>

              <button onClick={() => handleDeleteLine(idx)} className="text-slate-300 hover:text-red-500 bg-white rounded-full p-2 shadow-sm shrink-0 self-end md:self-auto">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
            <button onClick={handleAddLine} className="flex-1 py-3 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-orange-500 rounded-lg text-sm font-bold hover:bg-orange-50 transition-all">
              <PlusCircle size={20} /> เพิ่มข้อคำถาม
            </button>
            <button onClick={handleAutoPinyinAll} className="flex-1 py-3 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all">
              <Wand2 size={20} /> Auto Pinyin ทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}