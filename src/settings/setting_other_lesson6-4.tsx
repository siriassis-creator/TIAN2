// src/settings/setting_other_lesson6-4.tsx
import React, { useEffect } from 'react';
import { Volume2, LayoutTemplate, MessageCircle, Image as ImageIcon } from 'lucide-react';

export interface Dialogue {
  id: string;
  chinese: string;
  thai: string;
}

export interface Scenario {
  id: string;
  imageUrl: string;
  dialogues: Dialogue[];
  question: string;
}

export interface OtherLesson6_4Data {
  id?: string;
  patternType: 'other_lesson6-4';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  scenarios: Scenario[];
}

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson6_4({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // ข้อมูลตั้งต้น 2 เหตุการณ์ ตามรูปภาพหนังสือ 6-4 เป๊ะๆ
  const defaultScenarios: Scenario[] = [
    {
      id: 'scenario_1',
      imageUrl: '', // ฝั่งซ้าย ถ้ารูปมาแล้วสามารถมาเติมตรงนี้ หรือเติมผ่านหน้าเว็บได้ครับ
      dialogues: [
        { id: 'd1_1', chinese: '熊猫橡皮，真可爱！', thai: 'ยางลบหมีแพนด้า น่ารักจัง' },
        { id: 'd1_2', chinese: '请问，一块橡皮多少钱？', thai: 'ไม่ทราบว่ายางลบก้อนนี้ราคาเท่าไรครับ' },
        { id: 'd1_3', chinese: '两块五。', thai: '2.5 หยวน' }
      ],
      question: '熊猫橡皮多少钱？'
    },
    {
      id: 'scenario_2',
      imageUrl: 'https://img2.pic.in.th/00023.png', // <--- ใส่รูปลงฝั่งขวาให้แล้วครับ
      dialogues: [
        { id: 'd2_1', chinese: '这支笔多少钱？', thai: 'ปากกาด้ามนี้ราคาเท่าไรครับ' },
        { id: 'd2_2', chinese: '两百五十块。', thai: '250 หยวน' },
        { id: 'd2_3', chinese: '真贵啊！', thai: 'แพงจังเลย' }
      ],
      question: '笔多少钱？'
    }
  ];

  useEffect(() => {
    if (!section.scenarios || section.scenarios.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (sec: any) => ({
        ...sec, scenarios: defaultScenarios
      }));
    }
  }, [section.id]);

  const safeScenarios: Scenario[] = Array.isArray(section?.scenarios) && section.scenarios.length > 0 ? section.scenarios : defaultScenarios;
  const safeData: OtherLesson6_4Data = {
    ...section,
    patternType: 'other_lesson6-4',
    mainTitle: section?.mainTitle ?? '1. 听录音，说一说，然后回答问题。',
    subTitle: section?.subTitle ?? 'ฟังแล้วฝึกพูด จากนั้นตอบคำถาม',
    audioTrack: section?.audioTrack ?? '06-04',
    audioUrl: section?.audioUrl ?? '',
    scenarios: safeScenarios
  };

  const handleChange = (field: keyof OtherLesson6_4Data, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => ({ ...sec, [field]: value }));
  };

  const handleScenarioChange = (sIndex: number, field: keyof Scenario, value: any) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newScenarios = [...(sec.scenarios || [])];
      if (newScenarios[sIndex]) newScenarios[sIndex] = { ...newScenarios[sIndex], [field]: value };
      return { ...sec, scenarios: newScenarios };
    });
  };

  const handleDialogueChange = (sIndex: number, dIndex: number, field: keyof Dialogue, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (sec: any) => {
      const newScenarios = [...(sec.scenarios || [])];
      if (newScenarios[sIndex] && newScenarios[sIndex].dialogues[dIndex]) {
        newScenarios[sIndex].dialogues[dIndex] = { ...newScenarios[sIndex].dialogues[dIndex], [field]: value };
      }
      return { ...sec, scenarios: newScenarios };
    });
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      
      {/* Header Settings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><LayoutTemplate className="text-indigo-500" /> ตั้งค่าส่วนหัว (Header)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">หัวข้อหลัก (จีน)</label><input type="text" value={safeData.mainTitle} onChange={(e) => handleChange('mainTitle', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">คำอธิบาย (ไทย)</label><input type="text" value={safeData.subTitle} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Volume2 size={14} /> ชื่อแทร็กเสียง</label><input type="text" value={safeData.audioTrack} onChange={(e) => handleChange('audioTrack', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Volume2 size={14} /> URL ไฟล์เสียง</label><input type="text" value={safeData.audioUrl} onChange={(e) => handleChange('audioUrl', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-mono" /></div>
        </div>
      </div>

      {/* Scenarios Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {safeScenarios.map((scenario, sIdx) => (
          <div key={scenario.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2 border-b pb-3"><MessageCircle /> เหตุการณ์ที่ {sIdx + 1}</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ImageIcon size={12} /> URL รูปภาพเหตุการณ์</label>
              <input type="text" value={scenario.imageUrl} onChange={(e) => handleScenarioChange(sIdx, 'imageUrl', e.target.value)} placeholder="ใส่ลิงก์รูปภาพ" className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono" />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">บทสนทนา (Dialogues)</label>
              {scenario.dialogues.map((dlg, dIdx) => (
                <div key={dlg.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                     <span className="text-[10px] text-slate-400">ประโยค {dIdx+1} (จีน)</span>
                     <input type="text" value={dlg.chinese} onChange={(e) => handleDialogueChange(sIdx, dIdx, 'chinese', e.target.value)} className="w-full px-2 py-1.5 bg-white border rounded text-sm" />
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] text-slate-400">คำแปล (ไทย)</span>
                     <input type="text" value={dlg.thai} onChange={(e) => handleDialogueChange(sIdx, dIdx, 'thai', e.target.value)} className="w-full px-2 py-1.5 bg-white border rounded text-sm text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase">คำถามท้ายเหตุการณ์</label>
              <input type="text" value={scenario.question} onChange={(e) => handleScenarioChange(sIdx, 'question', e.target.value)} className="w-full px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-bold" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}