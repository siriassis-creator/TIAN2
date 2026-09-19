// src/settings/setting_other_lesson5-12.tsx
import React, { useEffect } from 'react';
import { Trash2, PlusCircle, X } from 'lucide-react'; // +++ แก้ไข: นำเข้า X ตรงนี้ครับ +++
import { pinyin as pinyinConverter } from 'pinyin-pro'; 

interface Props {
  section: any;
  cardId: string;
  lessonId: string;
  updateSectionState: (hskId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => void;
}

export default function SettingOtherLesson5_12({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data เหมือนในหนังสือเป๊ะๆ 4 บล็อค
  useEffect(() => {
    if (!section.ladders || section.ladders.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '2. 词语阶梯。 ต่อคำขยายความ',
        ladders: [
          {
            id: 'ladder-1', theme: 'pink',
            rows: [
              { id: 'l1-r1', chinese: '筷子', pinyin: 'kuàizi' },
              { id: 'l1-r2', chinese: '一双筷子', pinyin: 'yì shuāng kuàizi' },
              { id: 'l1-r3', chinese: '给我一双筷子', pinyin: 'gěi wǒ yì shuāng kuàizi' },
              { id: 'l1-r4', chinese: '妈妈给我一双筷子', pinyin: 'māma gěi wǒ yì shuāng kuàizi' }
            ]
          },
          {
            id: 'ladder-2', theme: 'pink',
            rows: [
              { id: 'l2-r1', chinese: '盘子', pinyin: 'pánzi' },
              { id: 'l2-r2', chinese: '一个盘子', pinyin: 'yí gè pánzi' },
              { id: 'l2-r3', chinese: '给我一个盘子', pinyin: 'gěi wǒ yí gè pánzi' },
              { id: 'l2-r4', chinese: '爸爸给我一个盘子', pinyin: 'bàba gěi wǒ yí gè pánzi' }
            ]
          },
          {
            id: 'ladder-3', theme: 'yellow',
            rows: [
              { id: 'l3-r1', chinese: '果汁', pinyin: 'guǒzhī' },
              { id: 'l3-r2', chinese: '一杯果汁', pinyin: 'yì bēi guǒzhī' },
              { id: 'l3-r3', chinese: '给我一杯果汁', pinyin: 'gěi wǒ yì bēi guǒzhī' },
              { id: 'l3-r4', chinese: '姐姐给我一杯果汁', pinyin: 'jiějie gěi wǒ yì bēi guǒzhī' }
            ]
          },
          {
            id: 'ladder-4', theme: 'yellow',
            rows: [
              { id: 'l4-r1', chinese: '面包', pinyin: 'miànbāo' },
              { id: 'l4-r2', chinese: '一块面包', pinyin: 'yí kuài miànbāo' },
              { id: 'l4-r3', chinese: '给我一块面包', pinyin: 'gěi wǒ yí kuài miànbāo' },
              { id: 'l4-r4', chinese: '哥哥给我一块面包', pinyin: 'gēge gěi wǒ yí kuài miànbāo' }
            ]
          }
        ]
      }));
    }
  }, []);

  const handleUpdateTheme = (ladderIdx: number, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nl = [...s.ladders];
      nl[ladderIdx].theme = value;
      return { ...s, ladders: nl };
    });
  };

  const handleUpdateRow = (ladderIdx: number, rowIdx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nl = [...s.ladders];
      nl[ladderIdx].rows[rowIdx][field] = value;
      if (field === 'chinese') {
        nl[ladderIdx].rows[rowIdx].pinyin = pinyinConverter(value);
      }
      return { ...s, ladders: nl };
    });
  };

  const handleAddRow = (ladderIdx: number) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nl = [...s.ladders];
      nl[ladderIdx].rows.push({ id: `row-${Date.now()}`, chinese: '', pinyin: '' });
      return { ...s, ladders: nl };
    });
  };

  const handleDeleteRow = (ladderIdx: number, rowIdx: number) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nl = [...s.ladders];
      nl[ladderIdx].rows.splice(rowIdx, 1);
      return { ...s, ladders: nl };
    });
  };

  const handleAddLadder = () => {
    updateSectionState(cardId, lessonId, section.id, (s) => ({
      ...s,
      ladders: [...(s.ladders || []), { id: `ladder-${Date.now()}`, theme: 'pink', rows: [{ id: `row-${Date.now()}`, chinese: '', pinyin: '' }] }]
    }));
  };

  const handleDeleteLadder = (ladderIdx: number) => {
    if(window.confirm('ลบบล็อคคำศัพท์นี้?')) {
      updateSectionState(cardId, lessonId, section.id, (s) => {
        const nl = [...s.ladders];
        nl.splice(ladderIdx, 1);
        return { ...s, ladders: nl };
      });
    }
  };

  return (
    <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100 font-sans mt-4 relative">
      <h4 className="font-bold text-pink-800 mb-4 text-sm uppercase tracking-wide border-b border-pink-200 pb-2 inline-block">
        แบบเรียน: Word Ladder (ต่อคำขยายความไล่สี)
      </h4>

      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ</label>
        <input 
          type="text" 
          value={section.mainTitle || ''} 
          placeholder="เช่น: 2. 词语阶梯。 ต่อคำขยายความ" 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-pink-400" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(section.ladders || []).map((ladder: any, lIdx: number) => (
          <div key={ladder.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
            
            <button onClick={() => handleDeleteLadder(lIdx)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500">
              <Trash2 size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-600 text-sm">บล็อคที่ {lIdx + 1}</span>
              <select 
                value={ladder.theme} 
                onChange={(e) => handleUpdateTheme(lIdx, e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:ring-1 focus:ring-pink-400"
              >
                <option value="pink">โทนสีชมพู (Pink)</option>
                <option value="yellow">โทนสีเหลือง (Yellow)</option>
                <option value="blue">โทนสีฟ้า (Blue)</option>
                <option value="green">โทนสีเขียว (Green)</option>
              </select>
            </div>

            <div className="space-y-2">
              {ladder.rows.map((row: any, rIdx: number) => (
                <div key={row.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="w-5 text-[10px] font-bold text-slate-400 text-center">{rIdx + 1}</div>
                  <input type="text" value={row.chinese} placeholder="ภาษาจีน" onChange={(e) => handleUpdateRow(lIdx, rIdx, 'chinese', e.target.value)} className="w-[45%] px-2 py-1 text-sm border rounded font-serif" />
                  <input type="text" value={row.pinyin} placeholder="Pinyin" onChange={(e) => handleUpdateRow(lIdx, rIdx, 'pinyin', e.target.value)} className="w-[45%] px-2 py-1 text-sm border rounded text-indigo-600" />
                  <button onClick={() => handleDeleteRow(lIdx, rIdx)} className="text-slate-300 hover:text-red-500 px-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleAddRow(lIdx)} 
              className="w-full mt-3 py-1.5 flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 text-slate-500 rounded text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <PlusCircle size={14} /> เพิ่มบรรทัด
            </button>

          </div>
        ))}

        <button 
          onClick={handleAddLadder} 
          className="w-full h-full min-h-[150px] py-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-pink-200 text-pink-500 rounded-lg text-sm font-bold hover:bg-pink-50 transition-all"
        >
          <PlusCircle size={24} /> เพิ่มบล็อคคำศัพท์
        </button>
      </div>

    </div>
  );
}