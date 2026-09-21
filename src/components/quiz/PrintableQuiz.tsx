// src/components/quiz/PrintableQuiz.tsx
import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Link as LinkIcon, RefreshCw, FileText, Download } from 'lucide-react'; // 🎯 เพิ่มไอคอน Download
import type { QuestionType } from './QuestionCard';

interface Props {
  data: QuestionType[];
  title: string;
  onClose: () => void;
}

export default function PrintableQuiz({ data, title, onClose }: Props) {
  const [printCount, setPrintCount] = useState(20); 
  const [questions, setQuestions] = useState<QuestionType[]>([]);

  const generateQuiz = (count: number) => {
    if (!data || data.length === 0) return;
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, count));
  };

  useEffect(() => {
    const initialCount = Math.min(20, data.length);
    setPrintCount(initialCount);
    generateQuiz(initialCount);
  }, [data]);

  const handleCopyLink = () => {
    const ids = questions.map(q => q.question_id).join(',');
    const realUrl = `https://laoshi-tian.vercel.app/?view=quiz_home&qIds=${ids}`;
    navigator.clipboard.writeText(realUrl);
    alert(`คัดลอกลิงก์แบบทดสอบสำเร็จ!\n\n${realUrl}\n\nเมื่อส่งให้นักเรียน ระบบจะดึงข้อสอบชุดนี้มาให้ทำออนไลน์ครับ`);
  };

  const getAnswerDisplay = (q: QuestionType) => {
    if (q.type === 'fill_blank') {
      return q.correct_answer.join(' หรือ '); 
    }
    const answers = q.correct_answer.map(ansId => {
      const opt = q.options?.find(o => o.id === ansId);
      return opt ? `${ansId}. ${opt.text}` : ansId;
    });
    return answers.join(', ');
  };

  return (
    <div className="min-h-screen bg-slate-200 md:p-8 flex justify-center print:bg-white print:p-0 print:block print:min-h-0">
      
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}
      </style>

      {/* 🎯 แถบเครื่องมือตั้งค่า (ปรับขนาดให้พอดีบนมือถือ) */}
      <div className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1.5 md:gap-2 print:hidden z-50 bg-white/95 p-2 md:p-3 rounded-2xl shadow-xl backdrop-blur-md border border-slate-200 items-center w-[96%] md:w-auto">
        <button onClick={onClose} className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl flex items-center gap-1 font-bold transition-all text-sm">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">ปิดหน้าต่าง</span><span className="sm:hidden">ปิด</span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-1.5 px-1 md:px-2">
          <span className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1">
            <FileText size={16} className="text-indigo-500" /> <span className="hidden sm:inline">จำนวนข้อ:</span>
          </span>
          <input 
            type="number" min={1} max={data.length} value={printCount}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val > data.length) val = data.length;
              setPrintCount(val);
            }}
            className="w-12 md:w-16 border-2 border-indigo-200 focus:border-indigo-500 rounded-lg text-center font-bold py-1 outline-none text-indigo-700 text-sm"
          />
          <span className="text-xs font-medium text-slate-400">/ {data.length}</span>
        </div>

        <button onClick={() => generateQuiz(printCount)} className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center gap-1 text-sm font-bold transition-all">
          <RefreshCw size={16} /> <span className="hidden sm:inline">สุ่มใหม่</span><span className="sm:hidden">สุ่ม</span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        <button onClick={handleCopyLink} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center gap-1 font-bold transition-all text-sm">
          <LinkIcon size={16} /> <span className="hidden sm:inline">คัดลอกลิงก์</span><span className="sm:hidden">คัดลอก</span>
        </button>
        
        {/* 🎯 ปุ่มปริ้น/ดาวน์โหลด แยกหน้าจอ */}
        <button onClick={() => window.print()} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 font-bold transition-all text-sm">
          <Printer size={16} className="hidden sm:block" /> 
          <Download size={16} className="sm:hidden" />
          <span className="hidden sm:inline">พิมพ์ A4</span>
          <span className="sm:hidden">Export PDF</span>
        </button>
      </div>

      {/* 🎯 กระดาษข้อสอบ */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mt-28 md:mt-16 p-6 md:p-[20mm] shadow-2xl print:shadow-none print:max-w-none print:w-full print:mt-0 print:p-0 text-black print:block print:min-h-0">
        
        <div className="text-center mb-8 md:mb-10 pb-4 md:pb-6 border-b-2 border-black">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">{title}</h1>
          <div className="flex flex-wrap justify-between items-end mt-6 md:mt-8 text-sm md:text-lg font-medium">
            <div className="border-b border-black pb-1 w-full md:w-3/5 text-left mb-4 md:mb-0 flex items-end">
              <span className="mr-2 whitespace-nowrap">ชื่อ-นามสกุล / 姓名：</span>
              <span className="w-full text-transparent">......................................................</span>
            </div>
            <div className="border-b border-black pb-1 w-full md:w-1/3 text-left flex items-end">
              <span className="mr-2 whitespace-nowrap">คะแนน / 成绩：</span>
              <span className="w-full text-center tracking-widest">/ {questions.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {questions.map((q, idx) => (
            <div key={q.question_id || idx} className="break-inside-avoid print:mb-6">
              <p className="font-bold text-base md:text-lg mb-2 md:mb-3 leading-relaxed text-justify">
                {idx + 1}. {q.question}
                {q.type === 'multiple_select' && (
                  <span className="text-xs md:text-sm font-normal text-slate-500 ml-2">(เลือกได้หลายข้อ)</span>
                )}
              </p>

              {q.type === 'fill_blank' ? (
                <div className="mt-4 md:mt-6 mb-3 md:mb-4 pl-4 md:pl-6">
                  <span className="inline-block w-full max-w-md border-b-2 border-dotted border-slate-400 h-6"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 md:gap-y-3 gap-x-6 pl-4 md:pl-6 mt-2 md:mt-3">
                  {q.options?.map((opt: any) => (
                    <div key={opt.id} className="flex items-start gap-2 md:gap-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center"></div>
                      <div className="text-sm md:text-base leading-relaxed">
                        <span className="font-bold mr-2">{opt.id}.</span> 
                        {opt.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="break-before-page pt-8 md:pt-10 mt-8 md:mt-10 print:mt-0 print:pt-0 print:border-t-0 border-t-2 border-dashed border-slate-300">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center bg-slate-100 py-3 rounded-lg print:bg-transparent print:border-b-2 print:border-black print:pb-4">
            เฉลยแบบทดสอบ (Answer Key)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 md:gap-y-4 gap-x-8 bg-slate-50 p-4 md:p-6 rounded-xl print:bg-transparent print:p-0">
            {questions.map((q, idx) => (
              <div key={`ans-${idx}`} className="text-sm md:text-base flex items-start border-b border-slate-200 print:border-slate-300 pb-2 break-inside-avoid">
                <span className="font-bold mr-2 md:mr-3 text-indigo-700 print:text-black shrink-0">{idx + 1}.</span> 
                <span className="font-medium text-slate-800 print:text-black leading-relaxed">
                  {getAnswerDisplay(q)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}