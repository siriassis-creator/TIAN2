// src/components/quiz/PrintableQuiz.tsx
import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Link as LinkIcon, RefreshCw, FileText } from 'lucide-react';
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

  // 🎯 ดึง ID ข้อสอบที่สุ่มได้ไปต่อท้าย URL 
  const handleCopyLink = () => {
    const ids = questions.map(q => q.question_id).join(',');
    const realUrl = `https://laoshi-tian.vercel.app/?view=quiz_home&qIds=${ids}`;
    navigator.clipboard.writeText(realUrl);
    alert(`คัดลอกลิงก์แบบทดสอบสำเร็จ!\n\n${realUrl}\n\nลิงก์นี้จะดึงข้อสอบ ${questions.length} ข้อ "ให้ตรงกับที่คุณเห็นบนหน้าจอเป๊ะๆ" เพื่อให้นักเรียนทำออนไลน์ครับ`);
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
    <div className="min-h-screen bg-slate-200 md:p-8 flex justify-center print:bg-white print:p-0">
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 print:hidden z-50 bg-white/95 p-3 rounded-2xl shadow-xl backdrop-blur-md border border-slate-200 items-center w-[95%] md:w-auto">
        
        <button onClick={onClose} className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl flex items-center gap-2 font-bold transition-all text-sm">
          <ArrowLeft size={16} /> ปิด
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
            <FileText size={16} className="text-indigo-500" /> จำนวนข้อ:
          </span>
          <input 
            type="number" 
            min={1} 
            max={data.length} 
            value={printCount}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val > data.length) val = data.length;
              setPrintCount(val);
            }}
            className="w-16 border-2 border-indigo-200 focus:border-indigo-500 rounded-lg text-center font-bold py-1 outline-none text-indigo-700"
          />
          <span className="text-xs font-medium text-slate-400">/ {data.length}</span>
        </div>

        <button 
          onClick={() => generateQuiz(printCount)} 
          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center gap-1.5 text-sm font-bold transition-all"
        >
          <RefreshCw size={16} /> สุ่มใหม่
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        <button onClick={handleCopyLink} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center gap-1.5 font-bold transition-all text-sm">
          <LinkIcon size={16} /> <span className="hidden sm:inline">คัดลอกลิงก์</span>
        </button>
        
        <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 font-bold transition-all text-sm">
          <Printer size={16} /> พิมพ์ A4
        </button>

      </div>

      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mt-24 md:mt-16 p-8 md:p-[20mm] shadow-2xl print:shadow-none print:max-w-none print:mt-0 print:p-0 text-black">
        
        <div className="text-center mb-10 pb-6 border-b-2 border-black">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">{title}</h1>
          <div className="flex flex-wrap justify-between items-end mt-8 text-base md:text-lg font-medium">
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

        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.question_id || idx} className="break-inside-avoid">
              <p className="font-bold text-lg mb-3 leading-relaxed text-justify">
                {idx + 1}. {q.question}
                {q.type === 'multiple_select' && (
                  <span className="text-sm font-normal text-slate-500 ml-2">(เลือกได้หลายข้อ)</span>
                )}
              </p>

              {q.type === 'fill_blank' ? (
                <div className="mt-6 mb-4 pl-6">
                  <span className="inline-block w-full max-w-md border-b-2 border-dotted border-slate-400 h-6"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pl-6 mt-3">
                  {q.options?.map((opt: any) => (
                    <div key={opt.id} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center"></div>
                      <div className="text-base leading-relaxed">
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

        <div className="break-before-page pt-10 mt-10 print:mt-0 print:border-t-0 border-t-2 border-dashed border-slate-300">
          <h2 className="text-2xl font-bold mb-8 text-center bg-slate-100 py-3 rounded-lg print:bg-transparent print:border-b-2 print:border-black">
            เฉลยแบบทดสอบ (Answer Key)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-slate-50 p-6 rounded-xl print:bg-transparent print:p-0">
            {questions.map((q, idx) => (
              <div key={`ans-${idx}`} className="text-base flex items-start border-b border-slate-200 print:border-slate-300 pb-2">
                <span className="font-bold mr-3 text-indigo-700 print:text-black shrink-0">{idx + 1}.</span> 
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