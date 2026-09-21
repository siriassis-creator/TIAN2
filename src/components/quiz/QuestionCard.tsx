import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface Option {
  id: string;
  text: string;
}

// 🎯 ใส่ export เพื่อให้ไฟล์อื่นนำ Type ไปใช้งานได้
export interface QuestionType {
  question_id: string;
  type: string; // single_choice, multiple_select, fill_blank
  question: string;
  options: Option[];
  correct_answer: string[];
  explanation: string;
}

interface Props {
  question: QuestionType;
  onAnswer: (isCorrect: boolean, userAnswer: string[]) => void;
  onNext: () => void;
}

export default function QuestionCard({ question, onAnswer, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // รีเซ็ต state เมื่อเปลี่ยนข้อ
  useEffect(() => {
    setSelected([]);
    setInputText('');
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [question]);

  const handleSubmit = () => {
    if (isSubmitted) {
      onNext();
      return;
    }

    let userAns: string[] = [];
    let correct = false;

    if (question.type === 'fill_blank') {
      userAns = [inputText.trim()];
      correct = question.correct_answer.some(
        (ans) => ans.toLowerCase() === inputText.trim().toLowerCase()
      );
    } else {
      userAns = [...selected].sort();
      const correctAns = [...question.correct_answer].sort();
      correct = JSON.stringify(userAns) === JSON.stringify(correctAns);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
    onAnswer(correct, userAns);
  };

  const toggleSelect = (id: string) => {
    if (question.type === 'single_choice') {
      setSelected([id]);
    } else if (question.type === 'multiple_select') {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
          {question.question}
          {question.type === 'multiple_select' && (
             <span className="ml-2 text-sm text-emerald-600 font-normal bg-emerald-50 px-2 py-1 rounded-md">
               (เลือกได้หลายข้อ)
             </span>
          )}
        </h2>

        {/* --- ส่วนรับคำตอบ --- */}
        <div className="space-y-3 mb-8">
          {question.type === 'fill_blank' ? (
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSubmitted}
              placeholder="พิมพ์คำตอบของคุณที่นี่..."
              className="w-full px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          ) : (
            // เช็คว่ามี options ก่อน map กันแอปพังกรณีข้อมูลตกหล่น
            question.options?.map((opt) => {
              const isSelected = selected.includes(opt.id);
              const isAnsCorrect = question.correct_answer.includes(opt.id);
              
              // กำหนดสีปุ่มตอนเฉลย
              let btnClass = isSelected
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50';

              if (isSubmitted) {
                if (isAnsCorrect) {
                  btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-800'; // ข้อที่ถูก
                } else if (isSelected && !isAnsCorrect) {
                  btnClass = 'bg-red-50 border-red-500 text-red-800'; // ข้อที่ตอบผิด
                } else {
                  btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'; // ข้อที่ไม่ได้เลือกและไม่ถูก
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSelect(opt.id)}
                  disabled={isSubmitted}
                  className={`w-full text-left px-5 py-4 border-2 rounded-xl transition-all duration-200 flex items-center justify-between ${btnClass}`}
                >
                  <span className="font-medium text-lg">
                    <span className="mr-3 font-bold opacity-50">{opt.id}.</span>
                    {opt.text}
                  </span>
                  {isSubmitted && isAnsCorrect && <CheckCircle2 className="text-emerald-500" />}
                  {isSubmitted && isSelected && !isAnsCorrect && <XCircle className="text-red-500" />}
                </button>
              );
            })
          )}
        </div>

        {/* --- ส่วนเฉลยอธิบาย --- */}
        {isSubmitted && (
          <div className={`p-4 rounded-xl mb-6 flex gap-3 items-start border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {isCorrect ? <CheckCircle2 className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold mb-1">{isCorrect ? 'ถูกต้อง!' : 'ยังไม่ถูกนะ'}</p>
              <p className="text-sm opacity-90">{question.explanation}</p>
            </div>
          </div>
        )}

        {/* --- ปุ่ม Submit / Next --- */}
        <button
          onClick={handleSubmit}
          disabled={!isSubmitted && selected.length === 0 && inputText.trim() === ''}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
            isSubmitted
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSubmitted ? 'ข้อถัดไป ➔' : 'ตรวจคำตอบ'}
        </button>
      </div>
    </div>
  );
}