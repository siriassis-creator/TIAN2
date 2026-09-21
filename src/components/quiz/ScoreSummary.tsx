import React from 'react';
import { Trophy, RefreshCcw, ArrowRight } from 'lucide-react';
// 🎯 ใช้ import type เพื่อป้องกันปัญหาระบบหาโมดูลไม่เจอ
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* --- การ์ดคะแนน --- */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
          <Trophy size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">สรุปผลการทดสอบ</h2>
        <p className="text-slate-500 text-lg mb-8">คุณทำได้ {correctCount} จาก {totalQuestions} ข้อ</p>
        
        <div className="flex justify-center items-center gap-4 text-5xl font-black text-emerald-600 mb-10">
          {scorePercent}%
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            <RefreshCcw size={20} /> ทำใหม่อีกครั้ง
          </button>
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            กลับสู่บทเรียน <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* --- ทบทวนข้อที่ผิด --- */}
      {incorrectQuestions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
            ทบทวนข้อที่ตอบผิด ({incorrectQuestions.length} ข้อ)
          </h3>
          <div className="space-y-6">
            {incorrectQuestions.map((q, index) => (
              <div key={q.question_id} className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                <p className="font-bold text-slate-800 mb-2">
                  <span className="text-red-500 mr-2">ข้อที่ {index + 1}:</span> 
                  {q.question}
                </p>
                <div className="bg-white p-4 rounded-xl text-sm text-slate-600 shadow-sm">
                  <span className="font-bold text-emerald-600 block mb-1">เฉลย:</span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}