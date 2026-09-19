import React from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Volume2, Type, LayoutTemplate, Wand2 } from 'lucide-react';

export interface Card6_2 {
  id: string;
  imageUrl: string;
  prefix: string;
  blankAnswer: string;
  suffix: string;
}

export interface OtherLesson6_2Data {
  id?: string;
  patternType: 'other_lesson6-2';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  cards: Card6_2[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_2({ section, cardId, lessonId, updateSectionState }: Props) {
  // สร้างข้อมูลพื้นฐานถ้ายังไม่มี
  const safeData: OtherLesson6_2Data = {
    patternType: 'other_lesson6-2',
    mainTitle: section?.mainTitle ?? '2. 听录音，选择正确的词语。',
    subTitle: section?.subTitle ?? 'ฟังแล้วเลือกคำศัพท์ที่ถูกต้อง',
    audioTrack: section?.audioTrack ?? '06-02',
    audioUrl: section?.audioUrl ?? '',
    cards: section?.cards ?? [],
    ...section
  };

  const handleChange = (field: keyof OtherLesson6_2Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleCardChange = (index: number, field: keyof Card6_2, value: string) => {
    const newCards = [...safeData.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    handleChange('cards', newCards);
  };

  const addCard = () => {
    const newCard: Card6_2 = {
      id: `card_${Date.now()}`,
      imageUrl: '',
      prefix: '',
      blankAnswer: '',
      suffix: '。'
    };
    handleChange('cards', [...safeData.cards, newCard]);
  };

  const removeCard = (index: number) => {
    const newCards = [...safeData.cards];
    newCards.splice(index, 1);
    handleChange('cards', newCards);
  };

  // ฟังก์ชันช่วยเติมข้อมูลเริ่มต้นอัตโนมัติตามหนังสือเรียน
  const loadDefaultTemplate = () => {
    if (safeData.cards.length > 0) {
      if (!window.confirm('มีข้อมูลอยู่แล้ว ต้องการโหลดข้อมูลเริ่มต้นทับไปเลยหรือไม่?')) return;
    }
    
    const defaultCards: Card6_2[] = [
      { id: `card_${Date.now()}_1`, imageUrl: '', prefix: '橡皮', blankAnswer: '五毛', suffix: '。' },
      { id: `card_${Date.now()}_2`, imageUrl: '', prefix: '笔记本', blankAnswer: '十块', suffix: '。' },
      { id: `card_${Date.now()}_3`, imageUrl: '', prefix: '汉语书', blankAnswer: '二十二块', suffix: '。' },
      { id: `card_${Date.now()}_4`, imageUrl: '', prefix: '铅笔', blankAnswer: '一块', suffix: '。' },
      { id: `card_${Date.now()}_5`, imageUrl: '', prefix: '书包', blankAnswer: '一百块', suffix: '。' },
      { id: `card_${Date.now()}_6`, imageUrl: '', prefix: '笔袋', blankAnswer: '五十二块', suffix: '。' }
    ];
    
    handleChange('cards', defaultCards);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* 1. ข้อมูลส่วนหัว (Header Data) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3">
          <LayoutTemplate className="text-indigo-500" />
          ตั้งค่าส่วนหัว (Header)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">หัวข้อหลัก (จีน)</label>
            <input
              type="text"
              value={safeData.mainTitle}
              onChange={(e) => handleChange('mainTitle', e.target.value)}
              placeholder="เช่น 2. 听录音，选择正确的词语。"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">คำอธิบาย (ไทย)</label>
            <input
              type="text"
              value={safeData.subTitle}
              onChange={(e) => handleChange('subTitle', e.target.value)}
              placeholder="เช่น ฟังแล้วเลือกคำศัพท์ที่ถูกต้อง"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Volume2 size={14} /> ชื่อแทร็กเสียง
            </label>
            <input
              type="text"
              value={safeData.audioTrack}
              onChange={(e) => handleChange('audioTrack', e.target.value)}
              placeholder="เช่น 06-02"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Volume2 size={14} /> URL ไฟล์เสียง
            </label>
            <input
              type="text"
              value={safeData.audioUrl}
              onChange={(e) => handleChange('audioUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. รายการการ์ดคำถาม (Question Cards) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Type className="text-orange-500" />
              ชุดคำถาม (เติมคำในช่องว่าง)
            </h3>
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              {safeData.cards.length} ข้อ
            </span>
          </div>
          <button
            onClick={loadDefaultTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm"
          >
            <Wand2 size={14} /> โหลดข้อมูลเริ่มต้นตามหนังสือ
          </button>
        </div>

        {/* ข้อความแจ้งเตือนอธิบายการใช้งาน */}
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs border border-blue-100 flex items-start gap-2">
          <span className="font-bold shrink-0">💡 วิธีการกรอก:</span>
          <p>
            คำใน <b>"คำตอบช่องว่าง"</b> จะถูกดึงไปสร้างเป็นป้ายตัวเลือก (A, B, C...) อัตโนมัติ.
            หากช่องไหนไม่มีข้อความ ให้ปล่อยว่างไว้ (เช่น ไม่มีคำต่อท้าย).
          </p>
        </div>

        <div className="space-y-4">
          {safeData.cards.map((card, index) => (
            <div key={card.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all hover:border-indigo-300 hover:shadow-md">
              
              <div className="cursor-move text-slate-300 hover:text-indigo-500 mt-2 shrink-0">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 space-y-4">
                {/* แถว 1: รูปภาพ */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <ImageIcon size={12} /> รูปภาพประกอบ (ข้อ {index + 1})
                  </label>
                  <input
                    type="text"
                    value={card.imageUrl}
                    onChange={(e) => handleCardChange(index, 'imageUrl', e.target.value)}
                    placeholder="URL รูปภาพ (เช่น รูปยางลบ, สมุด)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* แถว 2: โครงสร้างประโยค */}
                <div className="grid grid-cols-12 gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-sm items-end">
                  
                  {/* ส่วนหน้า */}
                  <div className="col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      <span>ส่วนหน้าประโยค</span>
                      <span className="text-slate-300">Prefix</span>
                    </label>
                    <input
                      type="text"
                      value={card.prefix}
                      onChange={(e) => handleCardChange(index, 'prefix', e.target.value)}
                      placeholder="เช่น 橡皮"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-base font-serif text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* ช่องว่าง (คำตอบ) */}
                  <div className="col-span-4 space-y-1 relative">
                    <label className="text-[10px] font-bold text-orange-500 flex justify-between">
                      <span>คำตอบช่องว่าง</span>
                      <span className="text-orange-300">Answer</span>
                    </label>
                    <input
                      type="text"
                      value={card.blankAnswer}
                      onChange={(e) => handleCardChange(index, 'blankAnswer', e.target.value)}
                      placeholder="เช่น 五毛"
                      className="w-full px-2 py-1.5 bg-orange-50 border border-orange-300 rounded text-base font-serif text-center text-orange-700 focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                    />
                  </div>

                  {/* ส่วนหลัง */}
                  <div className="col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      <span>ส่วนท้ายประโยค</span>
                      <span className="text-slate-300">Suffix</span>
                    </label>
                    <input
                      type="text"
                      value={card.suffix}
                      onChange={(e) => handleCardChange(index, 'suffix', e.target.value)}
                      placeholder="เช่น 。"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-base font-serif text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  
                </div>

              </div>

              {/* ปุ่มลบ */}
              <button
                onClick={() => removeCard(index)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 h-fit"
                title="ลบข้อนี้"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={addCard}
            className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Plus size={18} /> เพิ่มข้อใหม่
          </button>
        </div>
      </div>
    </div>
  );
}