import React from 'react';
import {
  AlignLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Columns,
} from 'lucide-react';

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

export default function SettingStrokeOrderRules2({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: Props) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  // ดึงค่าเก่า ถ้าไม่มีให้แสดงค่าเริ่มต้นในช่องกรอก
  const currentHeaders =
    section.headers && section.headers.length === 3
      ? section.headers
      : ['笔顺 Rule', '例字 Example Characters', '书写顺序 Stroke Order'];

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...currentHeaders];
    newHeaders[index] = value;
    updateData((s) => ({ ...s, headers: newHeaders }));
  };

  const addRule = () => {
    updateData((s) => ({
      ...s,
      rules: [
        ...(s.rules || []),
        {
          ruleZh: '',
          ruleEn: '',
          examples: [
            { character: '', pinyin: '', english: '', strokeOrderImg: '' },
          ],
        },
      ],
    }));
  };

  const removeRule = (ruleIndex: number) => {
    updateData((s) => ({
      ...s,
      rules: s.rules.filter((_: any, i: number) => i !== ruleIndex),
    }));
  };

  const addExample = (ruleIndex: number) => {
    updateData((s) => {
      const newRules = [...(s.rules || [])];
      newRules[ruleIndex].examples.push({
        character: '',
        pinyin: '',
        english: '',
        strokeOrderImg: '',
      });
      return { ...s, rules: newRules };
    });
  };

  const removeExample = (ruleIndex: number, exampleIndex: number) => {
    updateData((s) => {
      const newRules = [...(s.rules || [])];
      newRules[ruleIndex].examples = newRules[ruleIndex].examples.filter(
        (_: any, i: number) => i !== exampleIndex
      );
      return { ...s, rules: newRules };
    });
  };

  const updateRuleField = (ruleIndex: number, field: string, value: string) => {
    updateData((s) => {
      const newRules = [...(s.rules || [])];
      newRules[ruleIndex][field] = value;
      return { ...s, rules: newRules };
    });
  };

  const updateExampleField = (
    ruleIndex: number,
    exampleIndex: number,
    field: string,
    value: string
  ) => {
    updateData((s) => {
      const newRules = [...(s.rules || [])];
      newRules[ruleIndex].examples[exampleIndex][field] = value;
      return { ...s, rules: newRules };
    });
  };

  return (
    <div className="space-y-6 font-sans text-left mt-4 border-2 border-indigo-50 p-4 rounded-xl bg-indigo-50/30">
      <h3 className="font-bold text-indigo-600 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <AlignLeft size={14} /> Pattern: Stroke Order Rules 2 (Table + Image)
      </h3>

      {/* --- Title Settings --- */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            หัวข้อหลัก (ภาษาจีน)
          </label>
          <input
            type="text"
            placeholder="เช่น 汉字的笔顺（3）..."
            value={section.titleZh || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleZh: e.target.value }))
            }
            className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            หัวข้อรอง (ภาษาอังกฤษ)
          </label>
          <input
            type="text"
            placeholder="เช่น Stroke Order (3)..."
            value={section.titleEn || ''}
            onChange={(e) =>
              updateData((s) => ({ ...s, titleEn: e.target.value }))
            }
            className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
      </div>

      {/* --- Column Headers Settings (ที่เพิ่มเข้ามาใหม่) --- */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
        <label className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-2 mb-3">
          <Columns size={12} /> ตั้งชื่อหัวตาราง (Column Headers)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block">
              คอลัมน์ 1
            </label>
            <input
              type="text"
              value={currentHeaders[0]}
              onChange={(e) => updateHeader(0, e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block">
              คอลัมน์ 2
            </label>
            <input
              type="text"
              value={currentHeaders[1]}
              onChange={(e) => updateHeader(1, e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block">
              คอลัมน์ 3
            </label>
            <input
              type="text"
              value={currentHeaders[2]}
              onChange={(e) => updateHeader(2, e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* --- Rules Loop --- */}
      <div className="space-y-4">
        {(section.rules || []).map((rule: any, ruleIdx: number) => (
          <div
            key={ruleIdx}
            className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm relative"
          >
            <button
              onClick={() => removeRule(ruleIdx)}
              className="absolute top-3 right-3 text-red-300 hover:text-red-500 bg-red-50 p-1 rounded-md transition-colors"
              title="ลบกฎข้อนี้"
            >
              <Trash2 size={16} />
            </button>

            <h4 className="text-xs font-bold text-indigo-500 mb-3 uppercase tracking-wider">
              กฎข้อที่ {ruleIdx + 1}
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="ข้อมูลคอลัมน์ 1 (บน)"
                value={rule.ruleZh || ''}
                onChange={(e) =>
                  updateRuleField(ruleIdx, 'ruleZh', e.target.value)
                }
                className="p-2 border border-slate-200 rounded text-sm bg-slate-50 font-bold"
              />
              <input
                type="text"
                placeholder="ข้อมูลคอลัมน์ 1 (ล่าง)"
                value={rule.ruleEn || ''}
                onChange={(e) =>
                  updateRuleField(ruleIdx, 'ruleEn', e.target.value)
                }
                className="p-2 border border-slate-200 rounded text-sm bg-slate-50"
              />
            </div>

            {/* --- Examples Loop --- */}
            <div className="space-y-2 mt-4 pl-4 border-l-2 border-indigo-100">
              {rule.examples.map((ex: any, exIdx: number) => (
                <div
                  key={exIdx}
                  className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100"
                >
                  <input
                    type="text"
                    placeholder="อักษรจีน"
                    value={ex.character || ''}
                    onChange={(e) =>
                      updateExampleField(
                        ruleIdx,
                        exIdx,
                        'character',
                        e.target.value
                      )
                    }
                    className="w-16 p-2 border border-slate-200 rounded text-sm text-center font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Pinyin"
                    value={ex.pinyin || ''}
                    onChange={(e) =>
                      updateExampleField(
                        ruleIdx,
                        exIdx,
                        'pinyin',
                        e.target.value
                      )
                    }
                    className="w-20 p-2 border border-slate-200 rounded text-sm text-center"
                  />
                  <input
                    type="text"
                    placeholder="คำแปล"
                    value={ex.english || ''}
                    onChange={(e) =>
                      updateExampleField(
                        ruleIdx,
                        exIdx,
                        'english',
                        e.target.value
                      )
                    }
                    className="w-24 p-2 border border-slate-200 rounded text-sm"
                  />

                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="URL รูปภาพลำดับขีด"
                      value={ex.strokeOrderImg || ''}
                      onChange={(e) =>
                        updateExampleField(
                          ruleIdx,
                          exIdx,
                          'strokeOrderImg',
                          e.target.value
                        )
                      }
                      className="w-full pl-8 p-2 border border-slate-200 rounded text-sm font-mono text-xs"
                    />
                  </div>

                  <button
                    onClick={() => removeExample(ruleIdx, exIdx)}
                    className="text-red-300 hover:text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addExample(ruleIdx)}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors"
              >
                <Plus size={12} /> เพิ่มคำศัพท์ตัวอย่าง
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRule}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[12px] font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> เพิ่มกฎใหม่ (Add New Rule)
      </button>
    </div>
  );
}
