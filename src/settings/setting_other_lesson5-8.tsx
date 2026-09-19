// src/settings/setting_other_lesson5-8.tsx
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

export default function SettingOtherLesson5_8({ section, cardId, lessonId, updateSectionState }: Props) {
  
  useEffect(() => {
    if (!section.topBoxes || section.topBoxes.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '说一说 ฝึกพูดให้คล่อง',
        subTitle: '1. 听录音，说一说，然后连一连。 ฟังแล้วฝึกพูด จากนั้นโยงเส้นจับคู่',
        audioTrack: '05-04',
        topImageUrl: 'https://s.imgz.io/2026/09/06/Gemini_Generated_Image_ph7m7qph7m7qph7m8b09dfed5709e5f6.jpeg',
        bottomImageUrl: 'https://s.imgz.io/2026/09/06/Gemini_Generated_Image_ke2xvqke2xvqke2xa8e2a3fb9f9988c1.jpeg',
        topBoxes: [
          { id: 't1', chinese: '给我一双筷子，谢谢！', pinyin: 'Gěi wǒ yì shuāng kuàizi, xièxie!', translation: 'ขอตะเกียบให้ฉันคู่หนึ่ง ขอบใจจ้ะ', voiceGender: 'girl' },
          { id: 't2', chinese: '给我一块面包，谢谢！', pinyin: 'Gěi wǒ yí kuài miànbāo, xièxie!', translation: 'ขอขนมปังให้ฉันชิ้นหนึ่ง ขอบใจจ้ะ', voiceGender: 'boy' },
          { id: 't3', chinese: '给我一个勺子，谢谢！', pinyin: 'Gěi wǒ yí gè sháozi, xièxie!', translation: 'ขอช้อนให้ฉันคันหนึ่ง ขอบใจจ้ะ', voiceGender: 'boy' },
          { id: 't4', chinese: '给我一杯果汁，谢谢！', pinyin: 'Gěi wǒ yì bēi guǒzhī, xièxie!', translation: 'ขอน้ำผลไม้ให้ฉันแก้วหนึ่ง ขอบใจจ้ะ', voiceGender: 'girl' }
        ],
        bottomBoxes: [
          { id: 'b1', chinese: '给你筷子。', pinyin: 'Gěi nǐ kuàizi.', translation: 'ตะเกียบของเธอ', voiceGender: 'girl' },
          { id: 'b2', chinese: '给你面包。', pinyin: 'Gěi nǐ miànbāo.', translation: 'ขนมปังของเธอ', voiceGender: 'girl' },
          { id: 'b3', chinese: '给你勺子。', pinyin: 'Gěi nǐ sháozi.', translation: 'ช้อนของเธอ', voiceGender: 'girl' },
          { id: 'b4', chinese: '没有果汁了，你喝可乐吗？', pinyin: 'Méiyǒu guǒzhī le, nǐ hē kělè ma?', translation: 'ไม่มีน้ำผลไม้แล้ว เธอจะดื่มโค้กไหม', voiceGender: 'girl' },
          { id: 'b5', chinese: '好的，谢谢！', pinyin: 'Hǎo de, xièxie!', translation: 'โอเค ขอบใจจ้ะ', voiceGender: 'girl' }
        ]
      }));
    }
  }, []);

  const renderBoxInputs = (boxList: any[], listKey: 'topBoxes' | 'bottomBoxes') => {
    return (
      <div className="space-y-3">
        {boxList.map((box: any, idx: number) => (
          <div key={box.id || idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative flex flex-col gap-2 shadow-sm">
            
            <button 
              onClick={() => { const newBoxes = boxList.filter((_: any, i: number) => i !== idx); updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, [listKey]: newBoxes })); }} 
              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full p-0.5"
            >
              <Trash2 size={16} />
            </button>

            <div className="font-bold text-rose-500 text-xs mb-1">กล่องข้อความที่ {idx + 1}</div>

            <input 
              type="text" 
              value={box.chinese || ''} 
              placeholder="ภาษาจีน (Pinyin ออโต้)" 
              onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].chinese = e.target.value; nb[idx].pinyin = pinyinConverter(e.target.value); return { ...s, [listKey]: nb }; })} 
              className="w-full px-2 py-1.5 text-sm border rounded font-serif focus:ring-1 focus:ring-rose-400" 
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                value={box.pinyin || ''} 
                placeholder="Pinyin" 
                onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].pinyin = e.target.value; return { ...s, [listKey]: nb }; })} 
                className="w-1/2 px-2 py-1.5 text-sm border rounded text-indigo-600 focus:ring-1 focus:ring-rose-400" 
              />
              <input 
                type="text" 
                value={box.translation || ''} 
                placeholder="แปลไทย" 
                onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].translation = e.target.value; return { ...s, [listKey]: nb }; })} 
                className="w-1/2 px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-rose-400" 
              />
            </div>

            <div className="flex gap-2 mt-1 border-t border-slate-200 pt-2">
              <div className="w-full">
                <label className="text-[10px] text-slate-500 block mb-1">เสียงอ่าน (TTS)</label>
                <select 
                  value={box.voiceGender || 'default'} 
                  onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nb = [...s[listKey]]; nb[idx].voiceGender = e.target.value; return { ...s, [listKey]: nb }; })}
                  className="w-full border rounded px-1 py-1 text-xs text-slate-600 focus:ring-1 focus:ring-rose-400"
                >
                  <option value="default">เสียงพื้นฐาน</option>
                  <option value="boy">เด็กผู้ชาย (เสียงทุ้ม)</option>
                  <option value="girl">เด็กผู้หญิง (เสียงแหลม)</option>
                </select>
              </div>
            </div>

          </div>
        ))}
        <button 
          onClick={() => updateSectionState(cardId, lessonId, section.id, (s) => ({ 
            ...s, 
            [listKey]: [...(s[listKey] || []), { id: Date.now().toString(), chinese: '', pinyin: '', translation: '', voiceGender: 'default' }] 
          }))} 
          className="w-full py-2 border-2 border-dashed border-rose-200 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-50 transition-all text-center"
        >
          + เพิ่มกล่องข้อความ
        </button>
      </div>
    );
  };

  return (
    <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100 font-sans mt-4 relative">
      <h4 className="font-bold text-rose-800 mb-4 text-sm uppercase tracking-wide border-b border-rose-200 pb-2 inline-block">
        แบบเรียน: Step Reveal (โชว์ข้อความทีละกล่อง ตามตำแหน่งหนังสือ)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก (ป้ายส้ม)</label>
          <input type="text" value={section.mainTitle || ''} placeholder="เช่น: 说一说 ฝึกพูดให้คล่อง" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-rose-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อย่อย</label>
          <input type="text" value={section.subTitle || ''} placeholder="เช่น: 1. 听录音..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, subTitle: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-rose-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Track No.</label>
          <input type="text" value={section.audioTrack || ''} placeholder="เช่น: 05-04" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioTrack: e.target.value }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-rose-400" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Audio Link</label>
          <input type="text" value={section.audioUrl || ''} placeholder="วางลิงก์ไฟล์เสียง..." onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, audioUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-rose-400" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">ส่วนที่ 1 (รูปบน 4 กล่อง)</label>
          <div className="mb-4">
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Image URL (รูปบน)</label>
            <input type="text" value={section.topImageUrl || ''} placeholder="ลิงก์รูปบน" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, topImageUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-rose-400" />
          </div>
          {renderBoxInputs(section.topBoxes || [], 'topBoxes')}
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">ส่วนที่ 2 (รูปล่าง 5 กล่อง)</label>
          <div className="mb-4">
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Image URL (รูปล่าง)</label>
            <input type="text" value={section.bottomImageUrl || ''} placeholder="ลิงก์รูปล่าง" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, bottomImageUrl: formatDriveUrl(e.target.value) }))} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-rose-400" />
          </div>
          {renderBoxInputs(section.bottomBoxes || [], 'bottomBoxes')}
        </div>
      </div>

    </div>
  );
}