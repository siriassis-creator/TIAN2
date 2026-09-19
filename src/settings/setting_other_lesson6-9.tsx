// src/settings/setting_other_lesson6-9.tsx
import React, { useEffect } from 'react';
import { Plus, Trash2, LayoutTemplate, Type, Wand2, Image as ImageIcon } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface Vocab6_9 { id: string; chinese: string; pinyin: string; thai: string; }
export interface Question6_9 { id: string; number: number; chinese: string; pinyin: string; }

export interface OtherLesson6_9Data {
  id?: string;
  patternType: 'other_lesson6-9';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  articleImageUrl: string;
  paragraphs: string[];
  vocabularies: Vocab6_9[];
  questions: Question6_9[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_9({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้นตามรูปภาพ 6-9
  const defaultData = {
    paragraphs: [
      "今年四月，我和爸爸妈妈去了北京。我们去了一个熊猫商店，商店里有趣的东西很多，有熊猫橡皮，有熊猫钢笔，也有熊猫笔袋和熊猫书包。",
      "我喜欢熊猫橡皮和熊猫钢笔。橡皮两块五，我买了两块。熊猫钢笔两百五十块，太贵了，我没买。"
    ],
    vocabularies: [
      { id: 'v1', chinese: '东西', pinyin: 'dōngxi', thai: 'สิ่งของ' },
      { id: 'v2', chinese: '钢笔', pinyin: 'gāngbǐ', thai: 'ปากกาหมึกซึม' }
    ],
    questions: [
      { id: 'q1', number: 1, chinese: '熊猫商店有什么？', pinyin: 'Xióngmāo shāngdiàn yǒu shénme?' },
      { id: 'q2', number: 2, chinese: '熊猫橡皮多少钱？', pinyin: 'Xióngmāo xiàngpí duōshao qián?' },
      { id: 'q3', number: 3, chinese: '熊猫钢笔贵吗？', pinyin: 'Xióngmāo gāngbǐ guì ma?' },
      { id: 'q4', number: 4, chinese: '泰坤买了什么？', pinyin: 'Tàikūn mǎile shénme?' }
    ]
  };

  useEffect(() => {
    if (!section.paragraphs || section.paragraphs.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }));
    }
  }, [section.id]);

  const safeData: OtherLesson6_9Data = {
    ...section,
    patternType: 'other_lesson6-9',
    mainTitle: section?.mainTitle ?? '1. 读一读，然后回答问题。',
    subTitle: section?.subTitle ?? 'ฝึกอ่านแล้วตอบคำถาม',
    audioTrack: section?.audioTrack ?? '06-05',
    audioUrl: section?.audioUrl ?? '',
    articleImageUrl: section?.articleImageUrl ?? '',
    paragraphs: Array.isArray(section?.paragraphs) && section.paragraphs.length > 0 ? section.paragraphs : defaultData.paragraphs,
    vocabularies: Array.isArray(section?.vocabularies) ? section.vocabularies : defaultData.vocabularies,
    questions: Array.isArray(section?.questions) ? section.questions : defaultData.questions,
  };

  const handleChange = (field: keyof OtherLesson6_9Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleParagraphChange = (index: number, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newPara = [...(sec.paragraphs || [])];
      newPara[index] = value;
      return { ...sec, paragraphs: newPara };
    });
  };

  const handleVocabChange = (index: number, field: keyof Vocab6_9, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newVocab = [...(sec.vocabularies || [])];
      if (newVocab[index]) {
        newVocab[index] = { ...newVocab[index], [field]: value };
        if (field === 'chinese') newVocab[index].pinyin = pinyinConverter(value);
      }
      return { ...sec, vocabularies: newVocab };
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question6_9, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newQ = [...(sec.questions || [])];
      if (newQ[index]) {
        newQ[index] = { ...newQ[index], [field]: value };
        if (field === 'chinese') newQ[index].pinyin = pinyinConverter(value);
      }
      return { ...sec, questions: newQ };
    });
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><LayoutTemplate className="text-indigo-500" /> ตั้งค่าส่วนหัวและเสียง</h3>
          <button onClick={() => updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, ...defaultData }))} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><Wand2 size={14}/> โหลดข้อมูลเริ่มต้น</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">ชื่อแทร็กเสียง</label><input type="text" value={safeData.audioTrack} onChange={(e) => handleChange('audioTrack', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">URL ไฟล์เสียง</label><input type="text" value={safeData.audioUrl} onChange={(e) => handleChange('audioUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
        </div>
      </div>

      {/* Article */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 border-b pb-3">บทความ (Pinyin จะสร้างให้อัตโนมัติในหน้าแสดงผล)</h3>
        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><ImageIcon size={12}/> รูปภาพประกอบบทความ (URL)</label><input type="text" value={safeData.articleImageUrl} onChange={(e) => handleChange('articleImageUrl', e.target.value)} placeholder="/images/..." className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
        
        {safeData.paragraphs.map((para, pIdx) => (
          <div key={pIdx} className="space-y-1">
             <label className="text-[10px] font-bold text-slate-500">ย่อหน้าที่ {pIdx + 1}</label>
             <textarea value={para} onChange={(e) => handleParagraphChange(pIdx, e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
        ))}
      </div>

      {/* Vocabularies */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 border-b pb-3">คำศัพท์ (กล่องมุมขวาล่าง)</h3>
        {safeData.vocabularies.map((v, vIdx) => (
          <div key={v.id} className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="col-span-3 space-y-1"><label className="text-[10px] font-bold text-slate-500">อักษรจีน</label><input type="text" value={v.chinese} onChange={(e) => handleVocabChange(vIdx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
            <div className="col-span-4 space-y-1"><label className="text-[10px] font-bold text-slate-500">Pinyin (Auto)</label><input type="text" value={v.pinyin} onChange={(e) => handleVocabChange(vIdx, 'pinyin', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center font-mono" /></div>
            <div className="col-span-5 space-y-1"><label className="text-[10px] font-bold text-slate-500">คำแปล</label><input type="text" value={v.thai} onChange={(e) => handleVocabChange(vIdx, 'thai', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-center" /></div>
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 border-b pb-3">คำถาม (4 ข้อ)</h3>
        {safeData.questions.map((q, qIdx) => (
          <div key={q.id} className="grid grid-cols-12 gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="col-span-12 md:col-span-5 space-y-1"><label className="text-[10px] font-bold text-orange-600">คำถามที่ {q.number} (จีน)</label><input type="text" value={q.chinese} onChange={(e) => handleQuestionChange(qIdx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 border border-orange-200 rounded text-sm" /></div>
            <div className="col-span-12 md:col-span-7 space-y-1"><label className="text-[10px] font-bold text-orange-600">Pinyin (Auto)</label><input type="text" value={q.pinyin} onChange={(e) => handleQuestionChange(qIdx, 'pinyin', e.target.value)} className="w-full px-2 py-1.5 border border-orange-200 rounded text-sm font-mono" /></div>
          </div>
        ))}
      </div>

    </div>
  );
}