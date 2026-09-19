import React from 'react';
import { Layout, Plus, Trash2, Music } from 'lucide-react';

export default function SettingCanva({
  section,
  cardId,
  lessonId,
  updateSectionState,
}: any) {
  const updateData = (updater: (s: any) => any) =>
    updateSectionState(cardId, lessonId, section.id, updater);

  const addAudio = () => {
    updateData((s) => ({
      ...s,
      audioUrls: [...(s.audioUrls || []), ''],
    }));
  };

  const removeAudio = (index: number) => {
    updateData((s) => ({
      ...s,
      audioUrls: s.audioUrls.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <div className="space-y-4 font-sans text-left mt-4 border-2 border-teal-50 p-4 rounded-xl bg-teal-50/30">
      <h3 className="font-bold text-teal-600 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <Layout size={14} /> Pattern: Canva Multi-Slide
      </h3>

      <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm space-y-4">
        {/* ช่องลิงก์ Canva และความสูง (เหมือนเดิม) */}
        <input
          type="text"
          placeholder="Canva URL"
          value={section.canvaUrl || ''}
          onChange={(e) =>
            updateData((s) => ({ ...s, canvaUrl: e.target.value }))
          }
          className="w-full p-2 border border-slate-200 rounded text-sm mb-4"
        />

        {/* ส่วนจัดการเสียงหลายไฟล์ */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
            <Music size={12} /> Audio Playlist (Dropbox Links)
          </label>

          {(section.audioUrls || []).map((url: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <div className="bg-slate-100 px-3 flex items-center justify-center rounded text-[10px] font-bold text-slate-400">
                Slide {idx + 1}
              </div>
              <input
                type="text"
                placeholder="วางลิงก์ Dropbox"
                value={url}
                onChange={(e) => {
                  const newUrls = [...section.audioUrls];
                  newUrls[idx] = e.target.value;
                  updateData((s) => ({ ...s, audioUrls: newUrls }));
                }}
                className="flex-1 p-2 border border-slate-200 rounded text-xs font-mono"
              />
              <button
                onClick={() => removeAudio(idx)}
                className="text-red-300 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addAudio}
            className="w-full py-2 bg-teal-50 text-teal-600 rounded-lg text-[11px] font-bold border border-teal-100 flex items-center justify-center gap-2 hover:bg-teal-100 transition-all"
          >
            <Plus size={14} /> เพิ่มเสียงสำหรับสไลด์ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
