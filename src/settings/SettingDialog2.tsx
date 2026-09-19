import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (
    cardId: string,
    lessonId: string,
    sectionId: string,
    updater: (s: any) => any
  ) => void;
}

export default function SettingDialog2({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) => {
    updateSectionState(cardId, lessonId, section.id, updater);
  };

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-slate-50/50">
      <h3 className="font-bold text-indigo-500 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <span className="bg-indigo-100 p-1.5 rounded">💬</span> Setting: Dialog
        Type 2
      </h3>

      {/* Basic Info */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          1. ข้อมูลพื้นฐาน
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="ข้อ (เช่น 3)"
            value={section.sectionNumber || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, sectionNumber: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold w-full"
          />
          <input
            type="text"
            placeholder="หัวข้อจีน (เช่น 在学校)"
            value={section.titleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
          <input
            type="text"
            placeholder="หัวข้ออังกฤษ (เช่น In the school)"
            value={section.titleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <input
            type="text"
            placeholder="Track (03-3)"
            value={section.audioTrack || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, audioTrack: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold text-indigo-600 w-full"
          />
          <input
            type="text"
            placeholder="URL ไฟล์เสียง (Drive/Dropbox)"
            value={section.audioUrl || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, audioUrl: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <input
          type="text"
          placeholder="URL รูปภาพ"
          value={section.imageUrl || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, imageUrl: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs"
        />
      </div>

      {/* Dialogues */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          2. บทสนทนา
        </label>
        {(section.dialogues || []).map((dialogue: any, index: number) => (
          <div
            key={index}
            className="bg-slate-50 p-3 rounded border border-slate-200 mb-3 relative"
          >
            <button
              onClick={() => {
                const newArr = section.dialogues.filter(
                  (_: any, i: number) => i !== index
                );
                updateData((s) => ({ ...s, dialogues: newArr }));
              }}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white rounded p-1"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-[60px_1fr] gap-2 mb-2 pr-6">
              <input
                type="text"
                placeholder="A / B"
                value={dialogue.speaker || ''}
                onChange={(e) => {
                  const newArr = [...section.dialogues];
                  newArr[index].speaker = e.target.value;
                  updateData((s) => ({ ...s, dialogues: newArr }));
                }}
                className="p-2 border border-slate-200 rounded text-xs font-bold text-center"
              />
              <input
                type="text"
                placeholder="Pinyin"
                value={dialogue.pinyin || ''}
                onChange={(e) => {
                  const newArr = [...section.dialogues];
                  newArr[index].pinyin = e.target.value;
                  updateData((s) => ({ ...s, dialogues: newArr }));
                }}
                className="p-2 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ภาษาจีน"
                value={dialogue.chinese || ''}
                onChange={(e) => {
                  const newArr = [...section.dialogues];
                  newArr[index].chinese = e.target.value;
                  updateData((s) => ({ ...s, dialogues: newArr }));
                }}
                className="p-2 border border-slate-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="คำแปลอังกฤษ"
                value={dialogue.english || ''}
                onChange={(e) => {
                  const newArr = [...section.dialogues];
                  newArr[index].english = e.target.value;
                  updateData((s) => ({ ...s, dialogues: newArr }));
                }}
                className="p-2 border border-slate-200 rounded text-xs"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              dialogues: [
                ...(s.dialogues || []),
                { speaker: '', pinyin: '', chinese: '', english: '' },
              ],
            }))
          }
          className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:underline"
        >
          <Plus size={12} /> เพิ่มประโยค
        </button>
      </div>

      {/* New Words */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          3. New Words
        </label>
        {(section.newWords || []).map((word: any, index: number) => (
          <div
            key={index}
            className="flex gap-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100"
          >
            <input
              type="number"
              placeholder="ลำดับ"
              value={word.no || ''}
              onChange={(e) => {
                const newArr = [...section.newWords];
                newArr[index].no = parseInt(e.target.value);
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="w-12 p-2 border border-slate-200 rounded text-xs text-center"
            />
            <input
              type="text"
              placeholder="อักษรจีน"
              value={word.character || ''}
              onChange={(e) => {
                const newArr = [...section.newWords];
                newArr[index].character = e.target.value;
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="w-20 p-2 border border-slate-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Pinyin"
              value={word.pinyin || ''}
              onChange={(e) => {
                const newArr = [...section.newWords];
                newArr[index].pinyin = e.target.value;
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="w-24 p-2 border border-slate-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="ชนิด(v.)"
              value={word.type || ''}
              onChange={(e) => {
                const newArr = [...section.newWords];
                newArr[index].type = e.target.value;
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="w-16 p-2 border border-slate-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="ความหมาย"
              value={word.meaning || ''}
              onChange={(e) => {
                const newArr = [...section.newWords];
                newArr[index].meaning = e.target.value;
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="flex-1 p-2 border border-slate-200 rounded text-xs"
            />
            <button
              onClick={() => {
                const newArr = section.newWords.filter(
                  (_: any, i: number) => i !== index
                );
                updateData((s) => ({ ...s, newWords: newArr }));
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              newWords: [
                ...(s.newWords || []),
                {
                  no: (s.newWords?.length || 0) + 1,
                  character: '',
                  pinyin: '',
                  type: '',
                  meaning: '',
                },
              ],
            }))
          }
          className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:underline"
        >
          <Plus size={12} /> เพิ่มคำศัพท์ใหม่
        </button>
      </div>

      {/* Proper Nouns */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          4. Proper Nouns
        </label>
        {(section.properNouns || []).map((word: any, index: number) => (
          <div
            key={index}
            className="flex gap-2 mb-2 bg-indigo-50/50 p-2 rounded border border-indigo-100"
          >
            <input
              type="number"
              placeholder="ลำดับ"
              value={word.no || ''}
              onChange={(e) => {
                const newArr = [...section.properNouns];
                newArr[index].no = parseInt(e.target.value);
                updateData((s) => ({ ...s, properNouns: newArr }));
              }}
              className="w-12 p-2 border border-slate-200 rounded text-xs text-center"
            />
            <input
              type="text"
              placeholder="อักษรจีน"
              value={word.character || ''}
              onChange={(e) => {
                const newArr = [...section.properNouns];
                newArr[index].character = e.target.value;
                updateData((s) => ({ ...s, properNouns: newArr }));
              }}
              className="w-20 p-2 border border-slate-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Pinyin"
              value={word.pinyin || ''}
              onChange={(e) => {
                const newArr = [...section.properNouns];
                newArr[index].pinyin = e.target.value;
                updateData((s) => ({ ...s, properNouns: newArr }));
              }}
              className="w-28 p-2 border border-slate-200 rounded text-xs"
            />
            <input
              type="text"
              placeholder="ความหมาย"
              value={word.meaning || ''}
              onChange={(e) => {
                const newArr = [...section.properNouns];
                newArr[index].meaning = e.target.value;
                updateData((s) => ({ ...s, properNouns: newArr }));
              }}
              className="flex-1 p-2 border border-slate-200 rounded text-xs"
            />
            <button
              onClick={() => {
                const newArr = section.properNouns.filter(
                  (_: any, i: number) => i !== index
                );
                updateData((s) => ({ ...s, properNouns: newArr }));
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              properNouns: [
                ...(s.properNouns || []),
                {
                  no: (s.properNouns?.length || 0) + 1,
                  character: '',
                  pinyin: '',
                  meaning: '',
                },
              ],
            }))
          }
          className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:underline"
        >
          <Plus size={12} /> เพิ่ม Proper Nouns
        </button>
      </div>
    </div>
  );
}
