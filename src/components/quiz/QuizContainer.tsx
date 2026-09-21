import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
// 🎯 แยก import type ออกมาเพื่อป้องกัน Error: SyntaxError does not provide an export named
import type { QuestionType } from './QuestionCard'; 
import ScoreSummary from './ScoreSummary';

interface Props {
  quizData: QuestionType[];
  onExit: () => void;
}

export default function QuizContainer({ quizData, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { isCorrect: boolean; answer: string[] }>>({});
  const [isFinished, setIsFinished] = useState(false);

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!quizData || quizData.length === 0) {
    return <div className="text-center p-10 text-slate-500">ไม่พบข้อมูลแบบทดสอบ</div>;
  }

  const handleAnswer = (isCorrect: boolean, answer: string[]) => {
    const currentQ = quizData[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.question_id]: { isCorrect, answer },
    }));
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setIsFinished(false);
  };

  const currentQuestion = quizData[currentIndex];
  const progressPercent = ((currentIndex + 1) / quizData.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {!isFinished ? (
        <>
          {/* --- Progress Bar --- */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-lg font-bold text-slate-500">
                ข้อที่ {currentIndex + 1} <span className="font-normal text-sm">/ {quizData.length}</span>
              </h3>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <QuestionCard 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            onNext={handleNext} 
          />
        </>
      ) : (
        <ScoreSummary 
          questions={quizData} 
          userAnswers={userAnswers} 
          onRestart={handleRestart} 
          onExit={onExit} 
        />
      )}
    </div>
  );
}