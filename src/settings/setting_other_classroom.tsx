// src/settings/setting_other_classroom.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro'; 

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (hskId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherClassroom({ section, cardId, lessonId, updateSectionState }: Props) {
  return (
    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-sans mt-4 relative">
      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide border-b border-emerald-200 pb-2 inline-block">
        แบบเรียน: Classroom Chinese (ประโยคในห้องเรียน)
      </h4>
      
      {/* +++ ปรับเหลือ 2 ช่อง (หัวข้อหลัก และ หัวข้อรอง) ตามคำขอ +++ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อหลัก</label>
          <input 
            type="text" 
            value={section.mainTitleZh || ''} 
            placeholder="เช่น: 三、课堂用语 Classroom Chinese" 
            onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitleZh: e.target.value }))} 
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">หัวข้อรอง</label>
          <input 
            type="text" 
            value={section.subTitleZh || ''} 
            placeholder="เช่น: （一）教师课堂用语 Classroom Chinese for Teachers" 
            onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, subTitleZh: e.target.value }))} 
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif" 
          />
        </div>
      </div>
      {/* ++++++++++++++++++++++++++++++++++++++++++++ */}
      
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block uppercase flex items-center justify-between">
          <span>รายการประโยค (เลขข้อจะรันให้อัตโนมัติ)</span>
          <span className="text-[10px] font-normal text-slate-400">ทั้งหมด {(section.sentences || []).length} ประโยค</span>
        </label>
        
        {(section.sentences || []).map((item: any, idx: number) => (
          <div key={idx} className="flex gap-3 mb-4 pb-4 border-b border-slate-100 relative group">
            <div className="font-bold text-slate-300 text-lg w-6 text-right shrink-0 pt-1">{idx + 1}.</div>
            <div className="flex-1 grid gap-2">
              <input 
                type="text" 
                value={item.chinese || ''} 
                placeholder="ภาษาจีน (พิมพ์จีนตรงนี้ Pinyin จะขึ้นอัตโนมัติ)" 
                onChange={(e) => { 
                  const val = e.target.value;
                  const newSentences = [...(section.sentences || [])]; 
                  const autoPinyin = pinyinConverter(val);
                  newSentences[idx] = { ...newSentences[idx], chinese: val, pinyin: autoPinyin }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sentences: newSentences })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-emerald-400" 
              />
              <input 
                type="text" 
                value={item.pinyin || ''} 
                placeholder="Pinyin (สามารถแก้ไขเองได้ถ้าต้องการ)" 
                onChange={(e) => { 
                  const newSentences = [...(section.sentences || [])]; 
                  newSentences[idx] = { ...newSentences[idx], pinyin: e.target.value }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sentences: newSentences })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400 text-indigo-600" 
              />
              <input 
                type="text" 
                value={item.english || ''} 
                placeholder="คำแปล (ENG)" 
                onChange={(e) => { 
                  const newSentences = [...(section.sentences || [])]; 
                  newSentences[idx] = { ...newSentences[idx], english: e.target.value }; 
                  updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sentences: newSentences })); 
                }} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-400" 
              />
            </div>
            <button onClick={() => { const newSentences = section.sentences.filter((_: any, i: number) => i !== idx); updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sentences: newSentences })); }} className="text-slate-300 hover:text-red-500 p-2 shrink-0 transition-colors" title="ลบประโยคนี้"><Trash2 size={18} /></button>
          </div>
        ))}
        
        <button onClick={() => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, sentences: [...(s.sentences || []), { chinese: '', pinyin: '', english: '' }] })) } className="w-full mt-2 py-3 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all flex justify-center items-center gap-2">
          + เพิ่มประโยคใหม่
        </button>
      </div>
    </div>
  );
}