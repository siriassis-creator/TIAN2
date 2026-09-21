// src/components/quiz/ScoreSummary.tsx
import React from 'react';
import { Trophy, RefreshCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { QuestionType } from './QuestionCard';

interface Props {
  questions: QuestionType[];
  userAnswers: Record<string, { isCorrect: boolean; answer: string[] }>;
  onRestart: () => void;
  onExit: () => void;
}

export default function ScoreSummary({ questions, userAnswers, onRestart, onExit }: Props) {
  const totalQuestions = questions.length;
  const correctCount = Object.values(userAnswers).filter((ans) => ans.isCorrect).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // หาข้อที่ตอบผิด
  const incorrectQuestions = questions.filter((q) => !userAnswers[q.question_id]?.isCorrect);

  // 🎯 ฟังก์ชันดึง Text เฉลยให้ถูกต้อง
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
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* --- การ์ดคะแนน --- */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full mb-6">
          <Trophy className="text-emerald-500 w-10 h-10 md:w-12 md:h-12" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">สรุปผลการทดสอบ</h2>
        <p className="text-slate-500 text-base md:text-lg mb-6 md:mb-8">คุณทำได้ {correctCount} จาก {totalQuestions} ข้อ</p>
        
        <div className="flex justify-center items-center gap-4 text-5xl md:text-6xl font-black text-emerald-600 mb-8 md:mb-10">
          {scorePercent}%
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <button onClick={onRestart} className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm md:text-base">
            <RefreshCcw size={18} /> ทำใหม่อีกครั้ง
          </button>
          <button onClick={onExit} className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm md:text-base">
            กลับสู่เมนูหลัก <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* --- ทบทวนข้อที่ผิด --- */}
      {incorrectQuestions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
            ทบทวนข้อที่ตอบผิด ({incorrectQuestions.length} ข้อ)
          </h3>
          <div className="space-y-6">
            {incorrectQuestions.map((q, index) => (
              <div key={q.question_id} className="bg-red-50/50 p-4 md:p-5 rounded-2xl border border-red-100">
                <p className="font-bold text-slate-800 mb-3 text-sm md:text-base leading-relaxed">
                  <span className="text-red-500 mr-2">ข้อที่ {index + 1}:</span> 
                  {q.question}
                </p>
                <div className="bg-white p-4 rounded-xl text-sm md:text-base text-slate-700 shadow-sm border border-emerald-100">
                  <div className="font-bold text-emerald-600 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={18} /> คำตอบที่ถูกต้อง:
                  </div>
                  <div className="bg-emerald-50 inline-block px-3 py-1.5 rounded-lg text-emerald-800 font-semibold mb-3">
                    {getAnswerDisplay(q)}
                  </div>
                  {q.explanation && (
                    <div className="text-slate-500 text-sm border-t border-slate-100 pt-2 mt-1">
                      <span className="font-bold text-slate-600">คำอธิบาย: </span>{q.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}