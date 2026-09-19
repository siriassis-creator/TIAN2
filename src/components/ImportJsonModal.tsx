import React, { useState } from 'react';
import { X, FileJson, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
  patternName: string;
}

export default function ImportJsonModal({
  isOpen,
  onClose,
  onImport,
  patternName,
}: Props) {
  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <FileJson size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Import JSON Data</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Target: {patternName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            วางโค้ด JSON จาก Gemini ลงในช่องด้านล่าง:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "titleZh": "...", "dialogues": [...] }'
            className="w-full h-64 p-4 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl border-2 border-slate-800 focus:border-indigo-500 focus:outline-none transition-all"
          />
          <p className="mt-3 text-[11px] text-slate-400 italic">
            * ระบบจะทำการ Merge ข้อมูลเข้ากับ Section ปัจจุบันให้อัตโนมัติ
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onImport(jsonInput);
              setJsonInput('');
              onClose();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <CheckCircle size={18} />
            ยืนยันการ Import
          </button>
        </div>
      </div>
    </div>
  );
}
