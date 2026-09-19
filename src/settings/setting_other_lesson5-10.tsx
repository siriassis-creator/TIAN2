// src/settings/setting_other_lesson5-10.tsx
import React, { useEffect } from 'react';
import { pinyin as pinyinConverter } from 'pinyin-pro'; 
import { Image as ImageIcon, LayoutPanelLeft, LayoutPanelTop } from 'lucide-react';

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

export default function SettingOtherLesson5_10({ section, cardId, lessonId, updateSectionState }: Props) {
  
  // Default Data ปรับให้ตรงกับรูปแบบใหม่ที่เป็นแนวนอน
  useEffect(() => {
    if (!section.wordRows || section.wordRows.length === 0) {
      updateSectionState(cardId, lessonId, section.id, (s) => ({
        ...s,
        mainTitle: '2. 两人一组，看一看，说一说。 กิจกรรมคู่ ดูภาพแล้วฝึกพูด',
        dialogues: [
          { id: 'd1', speaker: 'left', chinese: '给我一双筷子，谢谢！', pinyin: 'Gěi wǒ yì shuāng kuàizi, xièxie!', colorTheme: 'green', avatarUrl: '' },
          { id: 'd2', speaker: 'right', chinese: '给你筷子。', pinyin: 'Gěi nǐ kuàizi.', colorTheme: 'orange', avatarUrl: '' }
        ],
        wordRows: [
          {
            id: 'w1', center: { chinese: '双', pinyin: 'shuāng' },
            nodes: [
              { id: 'w1-1', chinese: '筷子', pinyin: 'kuàizi', imageUrl: '', imagePos: 'bottom' },
              { id: 'w1-2', chinese: '鞋', pinyin: 'xié', imageUrl: '', imagePos: 'bottom' },
              { id: 'w1-3', chinese: '袜子', pinyin: 'wàzi', imageUrl: '', imagePos: 'bottom' }
            ]
          },
          {
            id: 'w2', center: { chinese: '块', pinyin: 'kuài' },
            nodes: [
              { id: 'w2-1', chinese: '面包', pinyin: 'miànbāo', imageUrl: '', imagePos: 'right' },
              { id: 'w2-2', chinese: '蛋糕', pinyin: 'dàngāo', imageUrl: '', imagePos: 'right' }
            ]
          },
          {
            id: 'w3', center: { chinese: '个', pinyin: 'gè' },
            nodes: [
              { id: 'w3-1', chinese: '盘子', pinyin: 'pánzi', imageUrl: '', imagePos: 'bottom' },
              { id: 'w3-2', chinese: '勺子', pinyin: 'sháozi', imageUrl: '', imagePos: 'bottom' },
              { id: 'w3-3', chinese: '叉子', pinyin: 'chāzi', imageUrl: '', imagePos: 'bottom' }
            ]
          },
          {
            id: 'w4', center: { chinese: '杯', pinyin: 'bēi' },
            nodes: [
              { id: 'w4-1', chinese: '可乐', pinyin: 'kělè', imageUrl: '', imagePos: 'right' },
              { id: 'w4-2', chinese: '果汁', pinyin: 'guǒzhī', imageUrl: '', imagePos: 'right' },
              { id: 'w4-3', chinese: '水', pinyin: 'shuǐ', imageUrl: '', imagePos: 'right' },
              { id: 'w4-4', chinese: '牛奶', pinyin: 'niúnǎi', imageUrl: '', imagePos: 'right' }
            ]
          }
        ]
      }));
    }
  }, []);

  const handleWebNodeChange = (rowIdx: number, nodeIdx: number, field: string, value: string) => {
    updateSectionState(cardId, lessonId, section.id, (s) => {
      const nw = [...(s.wordRows || [])];
      nw[rowIdx].nodes[nodeIdx][field] = value;
      if (field === 'chinese') nw[rowIdx].nodes[nodeIdx].pinyin = pinyinConverter(value);
      if (field === 'imageUrl') nw[rowIdx].nodes[nodeIdx].imageUrl = formatDriveUrl(value);
      return { ...s, wordRows: nw };
    });
  };

  return (
    <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 font-sans mt-4 relative">
      <h4 className="font-bold text-orange-800 mb-4 text-sm uppercase tracking-wide border-b border-orange-200 pb-2 inline-block">
        แบบเรียน: แทนที่คำศัพท์ (จัดเรียงแนวนอน)
      </h4>

      {/* Title */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ข้อความหัวข้อ</label>
        <input 
          type="text" 
          value={section.mainTitle || ''} 
          placeholder="เช่น: 2. 两人一组..." 
          onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => ({ ...s, mainTitle: e.target.value }))} 
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-serif focus:ring-1 focus:ring-orange-400" 
        />
      </div>

      {/* Dialogues */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block uppercase border-b pb-2">
          บทสนทนา (พิมพ์ 双 และ 筷子 ลงในประโยค ระบบจะแทนที่คำให้อัตโนมัติเมื่อกดคลิก)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(section.dialogues || []).map((dialogue: any, idx: number) => (
            <div key={dialogue.id} className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col gap-2">
              <span className="font-bold text-xs text-orange-500">คนพูดฝั่ง {dialogue.speaker === 'left' ? 'ซ้าย' : 'ขวา'}</span>
              <input type="text" value={dialogue.avatarUrl || ''} placeholder="ลิงก์รูปโปรไฟล์ (เว้นไว้ใช้รูป Default)" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nd = [...s.dialogues]; nd[idx].avatarUrl = formatDriveUrl(e.target.value); return { ...s, dialogues: nd }; })} className="w-full px-2 py-1 text-xs border rounded" />
              <input type="text" value={dialogue.chinese || ''} placeholder="ภาษาจีน (เช่น 给我一双筷子)" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nd = [...s.dialogues]; nd[idx].chinese = e.target.value; nd[idx].pinyin = pinyinConverter(e.target.value); return { ...s, dialogues: nd }; })} className="w-full px-2 py-1.5 text-sm border rounded font-serif" />
              <input type="text" value={dialogue.pinyin || ''} placeholder="Pinyin (เช่น Gěi wǒ yì shuāng kuàizi)" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nd = [...s.dialogues]; nd[idx].pinyin = e.target.value; return { ...s, dialogues: nd }; })} className="w-full px-2 py-1.5 text-sm border rounded text-indigo-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Word Rows */}
      <div className="grid grid-cols-1 gap-6">
        {(section.wordRows || []).map((row: any, rIdx: number) => (
          <div key={row.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-orange-400 text-white rounded flex items-center justify-center font-bold text-xs shadow">
              {rIdx + 1}
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Center Circle Config */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex flex-col items-center shrink-0 w-full lg:w-48">
                <span className="text-[10px] font-bold text-orange-600 mb-1">วงกลม (ลักษณนาม)</span>
                <div className="flex flex-col gap-2 w-full">
                    <input type="text" value={row.center.chinese || ''} placeholder="จีน" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nw = [...s.wordRows]; nw[rIdx].center.chinese = e.target.value; nw[rIdx].center.pinyin = pinyinConverter(e.target.value); return { ...s, wordRows: nw }; })} className="w-full px-2 py-1 text-sm border rounded font-serif text-center font-bold" />
                    <input type="text" value={row.center.pinyin || ''} placeholder="Pinyin" onChange={(e) => updateSectionState(cardId, lessonId, section.id, (s) => { const nw = [...s.wordRows]; nw[rIdx].center.pinyin = e.target.value; return { ...s, wordRows: nw }; })} className="w-full px-2 py-1 text-sm border rounded text-indigo-600 text-center" />
                </div>
                </div>

                {/* Nodes Rectangles Config */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {row.nodes.map((node: any, nIdx: number) => (
                    <div key={node.id} className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">สี่เหลี่ยม {nIdx + 1} (คำนาม)</span>
                            
                            {/* Image Position Toggle */}
                            <div className="flex items-center bg-white border border-slate-200 rounded p-0.5">
                                <button 
                                    onClick={() => handleWebNodeChange(rIdx, nIdx, 'imagePos', 'right')}
                                    className={`p-1 rounded ${node.imagePos !== 'bottom' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                                    title="รูปอยู่ด้านขวา"
                                >
                                    <LayoutPanelLeft size={12} className="rotate-180" />
                                </button>
                                <button 
                                    onClick={() => handleWebNodeChange(rIdx, nIdx, 'imagePos', 'bottom')}
                                    className={`p-1 rounded ${node.imagePos === 'bottom' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                                    title="รูปอยู่ด้านล่าง"
                                >
                                    <LayoutPanelTop size={12} className="rotate-180" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input type="text" value={node.chinese} placeholder="จีน" onChange={(e) => handleWebNodeChange(rIdx, nIdx, 'chinese', e.target.value)} className="w-1/2 px-2 py-1 text-xs border rounded font-serif" />
                            <input type="text" value={node.pinyin} placeholder="Pinyin" onChange={(e) => handleWebNodeChange(rIdx, nIdx, 'pinyin', e.target.value)} className="w-1/2 px-2 py-1 text-xs border rounded text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-slate-400 shrink-0" />
                            <input type="text" value={node.imageUrl || ''} placeholder="URL รูปภาพ (ถ้ามี)" onChange={(e) => handleWebNodeChange(rIdx, nIdx, 'imageUrl', e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded" />
                        </div>
                    </div>
                ))}
                </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}