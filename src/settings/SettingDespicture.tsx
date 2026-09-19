import React from 'react';
import { Trash2, Plus, Image as ImageIcon, Wand2 } from 'lucide-react';
import { pinyin } from 'pinyin-pro'; // นำเข้าไลบรารีแปลงพินอิน

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

export default function SettingDespicture({
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
        <span className="bg-indigo-100 p-1.5 rounded">🖼️</span> Setting:
        Describe Picture (อธิบายภาพ)
      </h3>

      {/* --- หัวข้อ --- */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
          ข้อมูลหัวข้อ
        </label>
        <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
          <input
            type="text"
            placeholder="ข้อ (เช่น 3)"
            value={section.sectionNumber || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, sectionNumber: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs font-bold w-full text-center"
          />
          <input
            type="text"
            placeholder="หัวข้อจีน"
            value={section.titleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
          <input
            type="text"
            placeholder="หัวข้ออังกฤษ"
            value={section.titleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="p-2 border border-slate-200 rounded text-xs w-full"
          />
        </div>
      </div>

      {/* --- ข้อมูลแต่ละข้อ (Items) --- */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="mb-4 bg-indigo-50 p-3 rounded border border-indigo-100">
          <p className="text-xs text-indigo-700 font-bold mb-1">
            💡 เคล็ดลับการซ่อนคำ (Fill-in-the-blanks)
          </p>
          <p className="text-[11px] text-indigo-600">
            พิมพ์วงเล็บเหลี่ยม{' '}
            <strong className="bg-white px-1 rounded"> [ ] </strong>{' '}
            ครอบคำที่ต้องการทำเป็นช่องว่าง <br />
            ตัวอย่าง:{' '}
            <code className="bg-white px-1 rounded text-pink-600">
              他是 [美国] 人。
            </code>{' '}
            จากนั้นกดปุ่ม <strong>Auto Pinyin</strong>{' '}
            ระบบจะสร้างพินอินให้พร้อมซ่อนคำอัตโนมัติ
          </p>
        </div>

        <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase">
          เพิ่มชุดรูปภาพและประโยค
        </label>

        {(section.items || []).map((item: any, index: number) => (
          <div
            key={index}
            className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 relative"
          >
            <button
              onClick={() => {
                const newArr = section.items.filter(
                  (_: any, i: number) => i !== index
                );
                updateData((s) => ({ ...s, items: newArr }));
              }}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 bg-white rounded p-1 shadow-sm"
            >
              <Trash2 size={16} />
            </button>

            <div className="flex flex-col gap-3 pr-8">
              {/* จัดการรูปภาพ */}
              <div className="flex gap-2 items-center">
                <ImageIcon size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="URL รูปภาพ (Drive/Dropbox)"
                  value={item.imageUrl || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.includes('drive.google.com/file/d/')) {
                      const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1])
                        val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                    } else if (val.includes('dropbox.com')) {
                      val = val
                        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                        .replace('?dl=0', '');
                    }
                    const newArr = [...(section.items || [])];
                    newArr[index].imageUrl = val;
                    updateData((s) => ({ ...s, items: newArr }));
                  }}
                  className="flex-1 p-2 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-indigo-400"
                />
                <select
                  value={item.imageAlign || 'left'}
                  onChange={(e) => {
                    const newArr = [...(section.items || [])];
                    newArr[index].imageAlign = e.target.value;
                    updateData((s) => ({ ...s, items: newArr }));
                  }}
                  className="p-2 border border-slate-200 rounded text-xs bg-white text-slate-600 outline-none"
                >
                  <option value="left">รูปอยู่ซ้าย</option>
                  <option value="right">รูปอยู่ขวา</option>
                </select>
              </div>

              {/* ข้อความ Chinese (พิมพ์อันนี้ก่อน) */}
              <input
                type="text"
                placeholder="1. พิมพ์ภาษาจีนที่นี่ (เช่น 他叫 [姚明])"
                value={item.chinese || ''}
                onChange={(e) => {
                  const newArr = [...(section.items || [])];
                  newArr[index].chinese = e.target.value;
                  updateData((s) => ({ ...s, items: newArr }));
                }}
                className="w-full p-2 border border-slate-200 rounded text-sm font-serif focus:ring-2 focus:ring-indigo-400"
              />

              {/* ข้อความ Pinyin + ปุ่ม Auto */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="2. Pinyin (กดปุ่ม Auto Pinyin เพื่อสร้างอัตโนมัติ)"
                  value={item.pinyin || ''}
                  onChange={(e) => {
                    const newArr = [...(section.items || [])];
                    newArr[index].pinyin = e.target.value;
                    updateData((s) => ({ ...s, items: newArr }));
                  }}
                  className="flex-1 p-2 border border-slate-200 rounded text-sm text-indigo-600 font-medium"
                />
                <button
                  onClick={() => {
                    if (!item.chinese) {
                      alert('กรุณาพิมพ์ภาษาจีนก่อนครับ!');
                      return;
                    }
                    // แปลงพินอิน โดยเก็บเครื่องหมาย [ ] เอาไว้ (nonZh: 'consecutive')
                    const generatedPinyin = pinyin(item.chinese, {
                      nonZh: 'consecutive',
                    });
                    const newArr = [...(section.items || [])];
                    newArr[index].pinyin = generatedPinyin;
                    updateData((s) => ({ ...s, items: newArr }));
                  }}
                  className="shrink-0 flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors border border-indigo-200 shadow-sm"
                  title="สร้างพินอินอัตโนมัติจากภาษาจีน"
                >
                  <Wand2 size={14} /> Auto Pinyin
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            updateData((s) => ({
              ...s,
              items: [
                ...(s.items || []),
                { imageUrl: '', imageAlign: 'left', pinyin: '', chinese: '' },
              ],
            }))
          }
          className="flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline bg-indigo-50 px-3 py-2 rounded-lg w-full justify-center"
        >
          <Plus size={16} /> เพิ่มรูปภาพและประโยค
        </button>
      </div>
    </div>
  );
}
