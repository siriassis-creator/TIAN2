import React from 'react';

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

export default function SettingTonemaking({
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
        <span className="bg-indigo-100 p-1.5 rounded">📝</span> Setting: Tone
        Marking
      </h3>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
          1 & 2. หัวข้อหลัก
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={section.titleZh || ''}
            placeholder="ข้อความจีน 1 (เช่น: 拼音规则...)"
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm"
          />
          <input
            type="text"
            value={section.titleEn || ''}
            placeholder="ข้อความอังกฤษ 1 (เช่น: Rules of Pinyin...)"
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm"
          />
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          3 & 4. เนื้อหาคำอธิบายหลัก
        </label>
        <textarea
          value={section.contentZh || ''}
          placeholder="ข้อความจีน 2 (คำอธิบาย)"
          onChange={(e) =>
            updateData((s) => ({ ...s, contentZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-sm font-sans h-24"
        />
        <textarea
          value={section.contentEn || ''}
          placeholder="ข้อความอังกฤษ 2 (คำอธิบาย)"
          onChange={(e) =>
            updateData((s) => ({ ...s, contentEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-sm font-sans h-24"
        />
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          5. ข้อความก่อนตาราง และ ไฟล์เสียง
        </label>
        <div className="grid grid-cols-[100px_1fr] gap-3 mb-2">
          <input
            type="text"
            placeholder="Track (02-8)"
            value={section.audioTrack || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, audioTrack: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold text-indigo-600 w-full"
          />
          <input
            type="text"
            placeholder="URL ไฟล์เสียง (รองรับ Google Drive / Dropbox)"
            value={section.audioUrl || ''}
            onChange={(e) => {
              let val = e.target.value;
              if (val.includes('drive.google.com/file/d/')) {
                const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                  val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                }
              } else if (val.includes('dropbox.com')) {
                val = val
                  .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                  .replace('?dl=0', '');
              }
              updateData((s) => ({ ...s, audioUrl: val }));
            }}
            className="p-2 border border-slate-200 rounded text-xs w-full focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <input
          type="text"
          value={section.footerTextZh || ''}
          placeholder="คำสั่ง (จีน) เช่น: 朗读下列音节..."
          onChange={(e) =>
            updateData((s) => ({ ...s, footerTextZh: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans"
        />
        <input
          type="text"
          value={section.footerTextEn || ''}
          placeholder="คำสั่ง (ENG) เช่น: Read the syllables aloud..."
          onChange={(e) =>
            updateData((s) => ({ ...s, footerTextEn: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-xs font-sans"
        />
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
          6. ตารางคำศัพท์ฝึกอ่าน (4 คอลัมน์)
        </label>
        <textarea
          value={(section.practiceWords || []).join(', ')}
          onChange={(e) => {
            const wordsArray = e.target.value
              .split(',')
              .map((w) => w.trim())
              .filter((w) => w !== '');
            updateData((s) => ({ ...s, practiceWords: wordsArray }));
          }}
          placeholder="พิมพ์พินอินคั่นด้วยลูกน้ำ เช่น: xuéxiào, bāng máng, lánqiú, nǚ'ér"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 resize-none h-24"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          ใช้ลูกน้ำ (,) เพื่อแบ่งคำ ระบบจะจัดเป็น 4 คอลัมน์ให้อัตโนมัติ
        </p>
      </div>
    </div>
  );
}
