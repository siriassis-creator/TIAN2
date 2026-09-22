// src/OtherApp.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, ChevronRight, BookOpen, Bot, ClipboardList, Printer, Pencil, Eye, EyeOff, Users, Trash2, X } from 'lucide-react';
import Settings2 from './Settings2';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore'; 
import CanvasDraw from 'react-canvas-draw';

import LessonPattern1 from './components/LessonPattern1';
import LessonTones from './components/LessonTones';
import PatternTone2 from './components/PatternTone2';
import PatternSyllables from './components/PatternSyllables';
import PatternMonosyllabic from './components/PatternMonosyllabic';
import PatternSandhi from './components/PatternSandhi';
import Pattern3ColTable from './components/Pattern3ColTable';
import PatternStrokes from './components/PatternStrokes';
import PatternSinglecharacter from './components/PatternSinglecharacter';
import PatternNeutraltone from './components/PatternNeutraltone';
import PatternMatchPicture from './components/PatternMatchPicture';
import PatternTonemaking from './components/PatternTonemaking';
import PatternDialog2 from './components/PatternDialog2';
import PatternNote from './components/PatternNote';
import PatternSentence3Cols from './components/PatternSentence3Cols';
import PatternSentence4Cols from './components/PatternSentence4Cols';
import PatternDespicture from './components/PatternDespicture';
import PatternPreceding from './components/PatternPreceding';
import PatternPairwork from './components/PatternPairwork';
import PatternFlextable3cols from './components/PatternFlextable3cols';
import PatternCanva from './components/PatternCanva';
import PatternStrokeOrderRules2 from './components/PatternStrokeOrderRules2';
import PatternFlextable2cols from './components/PatternFlextable2cols';
import PatternFlexibleDoubleTable from './components/PatternFlexibleDoubleTable';
import FloatingLiveText from './components/FloatingLiveText'; 

import OtherPattern1 from './components/Other_pattern_1';
import OtherClassroom from './components/Other_classroom';
import OtherLesson1 from './components/Other_lesson1';
import OtherLesson1_1 from './components/Other_lesson1-1';
import OtherLesson1_3 from './components/Other_lesson1-3';
import OtherLesson5 from './components/Other_lesson5';
import OtherLesson5_5 from './components/Other_lesson5-5';
import OtherLesson5_6 from './components/Other_lesson5-6';
import OtherLesson5_7 from './components/Other_lesson5-7';
import OtherLesson5_8 from './components/Other_lesson5-8';
import OtherLesson5_9 from './components/Other_lesson5-9';
import OtherLesson5_10 from './components/Other_lesson5-10';
import OtherLesson5_11 from './components/Other_lesson5-11';
import OtherLesson5_12 from './components/Other_lesson5-12';
import OtherLesson5_13 from './components/Other_lesson5-13';
import OtherLesson5_14 from './components/Other_lesson5-14';
import OtherLesson5_15 from './components/Other_lesson5-15';
import OtherLessonMoney from './components/Other_lesson_Money';
import OtherLesson6_1 from './components/Other_lesson6-1';
import OtherLesson5_16 from './components/Other_lesson5-16';
import OtherLesson5_17 from './components/Other_lesson5-17';
import OtherLesson5_18 from './components/Other_lesson5-18';
import OtherLesson5_19 from './components/Other_lesson5-19';
import OtherLesson5_20 from './components/Other_lesson5-20';
import OtherLesson5_21 from './components/Other_lesson5-21';
import OtherLesson5_22 from './components/Other_lesson5-22';
import OtherLesson5_23 from './components/Other_lesson5-23';
import OtherLesson5_24 from './components/Other_lesson5-24';
import OtherLesson5_25 from './components/Other_lesson5-25';
import OtherLesson6_2 from './components/Other_lesson6-2';
import OtherLesson6_3 from './components/Other_lesson6-3';
import OtherLesson6_4 from './components/Other_lesson6-4';
import OtherLesson6_5 from './components/Other_lesson6-5';
import OtherLesson6_6 from './components/Other_lesson6-6';
import OtherLesson6_7 from './components/Other_lesson6-7';
import OtherLesson6_8 from './components/Other_lesson6-8';
import OtherLesson6_9 from './components/Other_lesson6-9';
import OtherLesson6_10 from './components/Other_lesson6-10';
import OtherLesson6_11 from './components/Other_lesson6-11';
import OtherLesson6_12 from './components/Other_lesson6-12';
import OtherLesson6_13 from './components/Other_lesson6-13';
import OtherLesson6_14 from './components/Other_lesson6-14';
import OtherLesson6_15 from './components/Other_lesson6-15';
import OtherLesson6_16 from './components/Other_lesson6-16';
import OtherLesson6_17 from './components/Other_lesson6-17';
import OtherLesson6_18 from './components/Other_lesson6-18';

import ChatBot from './components/ChatBot';
import QuizContainer from './components/quiz/QuizContainer';
import PrintableQuiz from './components/quiz/PrintableQuiz'; 
import QuizEditor from './components/quiz/QuizEditor';

import mockQuizDataLesson1 from './data/quizDataLesson1.json';
import mockQuizDataLesson2 from './data/quizDataLesson2.json';
import mockQuizDataLesson3 from './data/quizDataLesson3.json';
import mockQuizDataLesson4 from './data/quizDataLesson4.json';
import mockQuizDataLesson5_6 from './data/quizData.json';
import mockQuizDataLesson6 from './data/quizDataLesson6.json';

const getRandomQuestions = (questions: any[], count: number) => {
  if (!questions || questions.length === 0) return [];
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

interface OtherAppProps {
  currentView: string;
  setCurrentView: (v: string) => void;
  hskCards: any[];
  setHskCards: any;
  menuNames: any;
  setMenuNames: any;
  startPresentation: (course: any, startSectionId?: string) => void;
  saveToFirebase: (data: any[]) => void;
  roomPin?: string | null;
  userRole?: 'teacher' | 'student';
  appLoginRole?: 'guest' | 'teacher' | 'student' | 'admin';
  canSeeMenu?: (menuKey: 'home' | 'other_home' | 'settings' | 'settings_other' | 'quiz_home' | 'ai_tutor') => boolean;
}

export function OtherSlideRenderer({ 
  slide, updateNote, userRole = 'teacher', roomPin = null, allSlides = [] 
}: { 
  slide: any, updateNote?: (note: string) => void, userRole?: 'teacher' | 'student', roomPin?: string | null, allSlides?: any[] 
}) {
  if (!slide || !slide.patternType.startsWith('other_')) return null;
  const lesson5Slide = allSlides.find((s: any) => s.patternType === 'other_lesson5');
  const lesson5Characters = lesson5Slide ? lesson5Slide.characters : [];

  return (
    <div key={slide.id} className="w-full">
      {(() => {
        switch (slide.patternType) {
          case 'other_pattern_1': return <OtherPattern1 data={slide} onUpdateNote={updateNote} />;
          case 'other_classroom': return <OtherClassroom data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson1': return <OtherLesson1 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson1-1': return <OtherLesson1_1 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson1-3': return <OtherLesson1_3 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson5': return <OtherLesson5 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson5-5': return <OtherLesson5_5 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-6': return <OtherLesson5_6 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-7': return <OtherLesson5_7 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-8': return <OtherLesson5_8 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-9': return <OtherLesson5_9 data={{ ...slide, characters: lesson5Characters }} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-10': return <OtherLesson5_10 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-11': return <OtherLesson5_11 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-12': return <OtherLesson5_12 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-13': return <OtherLesson5_13 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-14': return <OtherLesson5_14 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-15': return <OtherLesson5_15 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson_money': return <OtherLessonMoney userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-1': return <OtherLesson6_1 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-16': return <OtherLesson5_16 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-17': return <OtherLesson5_17 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson5-18': return <OtherLesson5_18 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson5-19': return <OtherLesson5_19 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-20': return <OtherLesson5_20 data={slide} onUpdateNote={updateNote} />;
          case 'other_lesson5-21': return <OtherLesson5_21 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-22': return <OtherLesson5_22 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-23': return <OtherLesson5_23 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-24': return <OtherLesson5_24 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson5-25': return <OtherLesson5_25 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-2': return <OtherLesson6_2 data={slide} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-3': return <OtherLesson6_3 data={slide as any} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-4': return <OtherLesson6_4 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-5': return <OtherLesson6_5 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-6': return <OtherLesson6_6 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-7': return <OtherLesson6_7 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-8': return <OtherLesson6_8 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-9': return <OtherLesson6_9 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-10': return <OtherLesson6_10 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-11': return <OtherLesson6_11 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-12': return <OtherLesson6_12 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-13': return <OtherLesson6_13 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-14': return <OtherLesson6_14 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-15': return <OtherLesson6_15 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-16': return <OtherLesson6_16 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-17': return <OtherLesson6_17 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          case 'other_lesson6-18': return <OtherLesson6_18 data={slide as any} userRole={userRole} roomPin={roomPin} />;
          default: return null;
        }
      })()}
    </div>
  );
}

export default function OtherApp({
  currentView,
  setCurrentView,
  hskCards,
  setHskCards,
  menuNames,
  setMenuNames,
  startPresentation,
  saveToFirebase,
  roomPin = null, 
  userRole = 'teacher',
  appLoginRole,
  canSeeMenu
}: OtherAppProps) {
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeQuizData, setActiveQuizData] = useState<any[] | null>(null);
  const [printQuizData, setPrintQuizData] = useState<{data: any[], title: string} | null>(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatLessonTitle, setChatLessonTitle] = useState('');
  const [chatLessonContext, setChatLessonContext] = useState('');

  useEffect(() => {
    if (currentView === 'quiz_home' && activeQuizData === null) {
      const params = new URLSearchParams(window.location.search);
      const qIdsParam = params.get('qIds');
      
      if (qIdsParam) {
        const idsArray = qIdsParam.split(',');
        const allQuestions = [
          ...(mockQuizDataLesson1 || []),
          ...(mockQuizDataLesson2 || []),
          ...(mockQuizDataLesson3 || []),
          ...(mockQuizDataLesson4 || []),
          ...(mockQuizDataLesson5_6 || []),
          ...(mockQuizDataLesson6 || [])
        ];
        const matchedQuestions = idsArray.map(id => allQuestions.find((q: any) => q.question_id === id)).filter(Boolean);
        if (matchedQuestions.length > 0) {
          setActiveQuizData(matchedQuestions as any);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [currentView, activeQuizData]);

  const handleOpenChatForLesson = (lesson: any) => {
    const title = lesson.titleCn ? `บทที่ ${lesson.lessonNumber}: ${lesson.titleCn}` : `บทที่ ${lesson.lessonNumber}`;
    let contextData: string[] = [];
    lesson.sections.forEach((sec: any) => {
      const title1 = sec.mainTitle || sec.mainTitle1 || sec.titleZh || sec.titleZh1 || '';
      const title2 = sec.mainTitle2 || sec.titleZh2 || '';
      const sub1 = sec.subTitle || sec.subTitle1 || sec.titleEn || sec.titleEn1 || '';
      const sub2 = sec.subTitle2 || sec.titleEn2 || '';
      let textBlock = `[หัวข้อ: ${title1} ${title2} ${sub1} ${sub2}]`.trim();

      const vocabList = sec.vocabulary || sec.words || sec.newWords || sec.characters || sec.data || [];
      if (Array.isArray(vocabList) && vocabList.length > 0) {
        const words = vocabList.map((v:any) => {
          const zh = v.word || v.character || v.zh || v.text || v.hanzi || '';
          const py = v.pinyin || v.py || '';
          const th = v.translation || v.meaning || v.th || v.en || '';
          if (!zh) return '';
          return `${zh} (${py}) = ${th}`;
        }).filter(Boolean).join(', ');
        if (words) textBlock += ` [คำศัพท์: ${words}]`;
      }

      const sentenceList = sec.sentences || sec.dialogue || sec.dialogues || [];
      if (Array.isArray(sentenceList) && sentenceList.length > 0) {
        const sentences = sentenceList.map((s:any) => {
          const zh = s.zh || s.sentence || s.text || s.character || '';
          const py = s.pinyin || s.py || '';
          const th = s.th || s.translation || s.meaning || s.en || '';
          if (!zh) return '';
          return `${zh} (${py}) = ${th}`;
        }).filter(Boolean).join(' | ');
        if (sentences) textBlock += ` [ประโยค: ${sentences}]`;
      }
      
      if (sec.content) textBlock += ` [เนื้อหา: ${sec.content}]`;
      if (sec.text && typeof sec.text === 'string') textBlock += ` [ข้อความ: ${sec.text}]`;
      if (textBlock.trim()) { contextData.push(textBlock.trim()); }
    });

    setChatLessonTitle(title);
    let safeContext = contextData.join(' | '); 
    safeContext = safeContext.replace(/[\"\'\\]/g, ""); 
    safeContext = safeContext.replace(/\n/g, " ");    
    safeContext = safeContext.substring(0, 15000);    

    setChatLessonContext(safeContext); 
    setShowChatBot(true);
  };

  // =========================================================================
  // 🎯 โหมดหน้าต่าง AI ติวเตอร์ (AI Tutor Home)
  // =========================================================================
  if (currentView === 'ai_tutor') {
    return (
      <div className="p-4 md:p-10 w-full relative z-10 min-h-screen">
        <div className="animate-fade-in">
          <header className="mb-8 md:mb-12 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-extrabold text-blue-600 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <Bot size={32} className="md:w-10 md:h-10 text-blue-500" />
              {menuNames.ai_tutor || 'AI ติวเตอร์ส่วนตัว'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-lg">
              เลือกบทเรียนที่ต้องการทบทวน AI จะช่วยอธิบายเนื้อหาและตอบข้อสงสัยของคุณทันที
            </p>
          </header>

          <div className="flex flex-col gap-8 md:gap-10 max-w-5xl">
            {hskCards.filter(c => c.isEnabled && !c.id.startsWith('hsk')).map(course => {
              const activeLessons = course.lessons?.filter((l: any) => l.isEnabled !== false) || [];
              if (activeLessons.length === 0) return null;
              
              return (
                <section key={course.id} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3">
                    <BookOpen className="text-blue-500 w-5 h-5 md:w-6 md:h-6" /> คอร์ส: {course.mainText} {course.level}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {activeLessons.map((lesson: any) => (
                      <div 
                        key={lesson.id}
                        onClick={() => handleOpenChatForLesson(lesson)}
                        className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 p-5 md:p-6 rounded-2xl cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col gap-3 md:gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 p-3 rounded-full shrink-0">
                            <Bot size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-blue-700 line-clamp-1">
                              {lesson.lessonNumber ? `บทที่ ${lesson.lessonNumber}` : 'บทเรียน'}
                            </h4>
                            <p className="text-blue-600/80 text-xs md:text-sm mt-1 line-clamp-2">
                              {lesson.titleCn || 'เนื้อหาทบทวน'} {lesson.titleEn ? `(${lesson.titleEn})` : ''}
                            </p>
                          </div>
                        </div>
                        <button className="mt-auto w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2">
                          เริ่มคุยกับ AI
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
        
        <FloatingLiveText roomPin={roomPin} userRole={userRole} />
        {showChatBot && (
          <ChatBot 
             lessonTitle={chatLessonTitle} 
             lessonContext={chatLessonContext} 
             onClose={() => setShowChatBot(false)} 
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 🎯 โหมดระบบจัดการข้อสอบ (Quiz Editor)
  // =========================================================================
  if (currentView === 'quiz_editor') {
    return (
      <div className="p-4 md:p-10 w-full relative z-10 min-h-screen">
        <div className="animate-fade-in w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm sticky top-[60px] md:top-0 z-[45]">
            <button onClick={() => setCurrentView('quiz_home')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors text-sm md:text-base w-full md:w-auto justify-center md:justify-start">
              <ArrowLeft size={18} /> กลับไปหน้าแบบทดสอบ
            </button>
          </div>
          <QuizEditor />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🎯 โหมดหน้าแบบทดสอบ (Quiz Home)
  // =========================================================================
  if (currentView === 'quiz_home') {
    if (printQuizData !== null) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-200 w-full h-full overflow-y-auto print:static print:h-auto print:overflow-visible print:bg-white print:block">
          <PrintableQuiz data={printQuizData.data} title={printQuizData.title} onClose={() => setPrintQuizData(null)} />
        </div>
      );
    }
    return (
      <div className="p-4 md:p-10 w-full relative z-10 min-h-screen">
        {activeQuizData === null ? (
          <div className="animate-fade-in">
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-amber-600 tracking-tight flex items-center justify-center md:justify-start gap-3"><ClipboardList size={32} className="md:w-10 md:h-10 text-amber-500" />{menuNames.quiz_home || 'แบบทดสอบ'}</h1>
                <p className="text-slate-500 mt-2 text-sm md:text-lg">เลือกรูปแบบการทดสอบ ทำแบบออนไลน์ 10 ข้อ หรือพิมพ์เป็นกระดาษข้อสอบ</p>
              </div>
              {/* 🎯 ปุ่มสำหรับเข้าหน้าแก้ไขข้อสอบ (เฉพาะครู/แอดมิน) */}
              {(appLoginRole === 'teacher' || appLoginRole === 'admin') && (
                <button 
                  onClick={() => setCurrentView('quiz_editor')} 
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Pencil size={20} /> ระบบจัดการข้อสอบ (Quiz Editor)
                </button>
              )}
            </header>
            <div className="flex flex-col gap-8 md:gap-10 max-w-5xl">
              
              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 1</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-indigo-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-indigo-500/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson1 || []).filter((q: any) => q.question_id?.includes('PRE')), 10) as any); }} className="py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson1 || []).filter((q: any) => q.question_id?.includes('PRE')), title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 1' }); }} className="py-2.5 md:py-3 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson1 || []).filter((q: any) => q.question_id?.includes('POST')), 10) as any); }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson1 || []).filter((q: any) => q.question_id?.includes('POST')), title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 1' }); }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-cyan-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 2</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-cyan-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-cyan-600/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson2 || []).filter((q: any) => q.question_id?.includes('PRE')), 10) as any); }} className="py-2.5 md:py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson2 || []).filter((q: any) => q.question_id?.includes('PRE')), title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 2' }); }} className="py-2.5 md:py-3 bg-white text-cyan-600 border border-cyan-200 hover:bg-cyan-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson2 || []).filter((q: any) => q.question_id?.includes('POST')), 10) as any); }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson2 || []).filter((q: any) => q.question_id?.includes('POST')), title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 2' }); }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 3</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-purple-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-purple-600/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson3 || []).filter((q: any) => q.question_id?.includes('PRE')), 10) as any); }} className="py-2.5 md:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson3 || []).filter((q: any) => q.question_id?.includes('PRE')), title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 3' }); }} className="py-2.5 md:py-3 bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson3 || []).filter((q: any) => q.question_id?.includes('POST')), 10) as any); }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson3 || []).filter((q: any) => q.question_id?.includes('POST')), title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 3' }); }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-rose-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 4</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-rose-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-rose-600/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson4 || []).filter((q: any) => q.question_id?.includes('PRE')), 10) as any); }} className="py-2.5 md:py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson4 || []).filter((q: any) => q.question_id?.includes('PRE')), title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 4' }); }} className="py-2.5 md:py-3 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson4 || []).filter((q: any) => q.question_id?.includes('POST')), 10) as any); }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson4 || []).filter((q: any) => q.question_id?.includes('POST')), title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 4' }); }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 5</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-orange-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-orange-600/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson5_6 || []).filter((q: any) => q.question_id?.includes('PRE')), 10) as any); }} className="py-2.5 md:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson5_6 || []).filter((q: any) => q.question_id?.includes('PRE')), title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 5' }); }} className="py-2.5 md:py-3 bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { setActiveQuizData(getRandomQuestions((mockQuizDataLesson5_6 || []).filter((q: any) => q.question_id?.includes('POST')), 10) as any); }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { setPrintQuizData({ data: (mockQuizDataLesson5_6 || []).filter((q: any) => q.question_id?.includes('POST')), title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 5' }); }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b-2 border-slate-100 pb-3 md:pb-4 flex items-center gap-2 md:gap-3"><BookOpen className="text-violet-500 w-5 h-5 md:w-6 md:h-6" /> แบบทดสอบ: บทที่ 6</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-violet-700">แบบทดสอบก่อนเรียน (Pre-test)</h4><p className="text-violet-600/80 text-xs md:text-sm mt-1">วัดพื้นฐานก่อนเริ่มเรียน</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { 
                          if (!Array.isArray(mockQuizDataLesson6)) return alert("❌ ข้อผิดพลาด: โครงสร้างไฟล์ quizDataLesson6.json ต้องเป็นรูปแบบ Array");
                          const pre = mockQuizDataLesson6.filter((q: any) => q.question_id?.includes('PRE'));
                          if (pre.length === 0) return alert("❌ ไม่พบข้อสอบ Pre-test: กรุณาเช็คว่าในไฟล์ JSON มีข้อที่ 'question_id' มีคำว่า 'PRE' อยู่หรือไม่");
                          setActiveQuizData(getRandomQuestions(pre, 10) as any); 
                        }} className="py-2.5 md:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { 
                          if (!Array.isArray(mockQuizDataLesson6)) return alert("❌ ข้อผิดพลาด: โครงสร้างไฟล์ quizDataLesson6.json ต้องเป็นรูปแบบ Array");
                          const pre = mockQuizDataLesson6.filter((q: any) => q.question_id?.includes('PRE'));
                          if (pre.length === 0) return alert("❌ ไม่พบข้อสอบ Pre-test: กรุณาเช็คว่าในไฟล์ JSON มีข้อที่ 'question_id' มีคำว่า 'PRE' อยู่หรือไม่");
                          setPrintQuizData({ data: pre, title: 'แบบทดสอบก่อนเรียน (Pre-test) - บทที่ 6' }); 
                        }} className="py-2.5 md:py-3 bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow">
                    <div><h4 className="text-lg md:text-xl font-bold text-emerald-700">แบบทดสอบหลังเรียน (Post-test)</h4><p className="text-emerald-600/80 text-xs md:text-sm mt-1">วัดความเข้าใจหลังเรียนจบ</p></div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => { 
                          if (!Array.isArray(mockQuizDataLesson6)) return alert("❌ ข้อผิดพลาด: โครงสร้างไฟล์ quizDataLesson6.json ต้องเป็นรูปแบบ Array");
                          const post = mockQuizDataLesson6.filter((q: any) => q.question_id?.includes('POST'));
                          if (post.length === 0) return alert("❌ ไม่พบข้อสอบ Post-test: กรุณาเช็คว่าในไฟล์ JSON มีข้อที่ 'question_id' มีคำว่า 'POST' อยู่หรือไม่");
                          setActiveQuizData(getRandomQuestions(post, 10) as any); 
                        }} className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Play size={18} /> สุ่มทำ 10 ข้อ</button>
                      <button onClick={() => { 
                          if (!Array.isArray(mockQuizDataLesson6)) return alert("❌ ข้อผิดพลาด: โครงสร้างไฟล์ quizDataLesson6.json ต้องเป็นรูปแบบ Array");
                          const post = mockQuizDataLesson6.filter((q: any) => q.question_id?.includes('POST'));
                          if (post.length === 0) return alert("❌ ไม่พบข้อสอบ Post-test: กรุณาเช็คว่าในไฟล์ JSON มีข้อที่ 'question_id' มีคำว่า 'POST' อยู่หรือไม่");
                          setPrintQuizData({ data: post, title: 'แบบทดสอบหลังเรียน (Post-test) - บทที่ 6' }); 
                        }} className="py-2.5 md:py-3 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-sm text-xs md:text-sm flex flex-col items-center justify-center gap-1"><Printer size={18} /> สร้างเอกสาร A4</button>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        ) : (
          <div className="animate-fade-in w-full">
            <div className="flex items-center justify-between mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm sticky top-[60px] md:top-0 z-[45]">
              <button onClick={() => setActiveQuizData(null)} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors text-sm md:text-base w-full md:w-auto justify-center md:justify-start">
                <ArrowLeft size={18} /> ออกจากแบบทดสอบ
              </button>
            </div>
            <QuizContainer quizData={activeQuizData} onExit={() => setActiveQuizData(null)} />
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'settings_other') {
    return (
      <div className="p-6 md:p-10 w-full relative z-10">
        <Settings2 hskCards={hskCards} setHskCards={setHskCards} menuNames={menuNames} setMenuNames={setMenuNames} onSave={() => saveToFirebase(hskCards)} />
      </div>
    );
  }

  if (currentView === 'other_home') {
    return (
      <div className="p-6 md:p-10 w-full relative z-10">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight">{menuNames.other_home}</h1>
          <p className="text-slate-500 mt-2">เลือกคอร์สเพื่อเริ่มต้นการสอน</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full max-w-xs sm:max-w-none mx-auto">
          {hskCards.filter((c) => c.isEnabled && !c.id.startsWith('hsk')).map((card) => {
            const IconComp = card.Icon;
            return (
              <div key={card.id} onClick={() => setCurrentView(card.id)} className={`group relative aspect-[4/5] cursor-pointer rounded-2xl border border-white/40 shadow-lg transition-all hover:-translate-y-2 bg-gradient-to-br ${card.from} ${card.to} overflow-hidden flex flex-col items-center py-6 px-4 text-white`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-125 transition-transform">
                  {IconComp && <IconComp className="w-32 h-32" strokeWidth={1.5} />}
                </div>
                <div className="relative z-10 w-full flex flex-col items-center h-full justify-between text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">{card.topTextZh}</span>
                    <span className="text-[0.6rem] font-bold tracking-[0.15em] opacity-90 uppercase">{card.topTextEn1}</span>
                  </div>
                  <div className="my-1"><span className="text-6xl font-black drop-shadow-md">{card.mainText}</span></div>
                  <div className="mb-2"><span className="text-7xl font-black drop-shadow-lg inline-block">{card.level}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const course = hskCards.find((c) => c.id === currentView && !c.id.startsWith('hsk'));

  if (course) {
    const activeLessons = course.lessons?.filter((l: any) => l.isEnabled !== false) || [];

    return (
      <div className="p-6 md:p-10 w-full relative z-10">
        {activeSectionId === null && activeQuizData === null && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setCurrentView('other_home')} className="flex items-center text-slate-500 hover:text-emerald-600 font-medium transition-colors">
                <ArrowLeft className="mr-2" /> กลับหน้าหลักคอร์ส
              </button>
              <button onClick={() => startPresentation(course)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
                <Play size={18} fill="currentColor" /> เริ่มสอน Slide Show (ทุกหน้า)
              </button>
            </div>
            <h2 className="text-4xl font-bold text-slate-700 mb-10 border-b-4 border-emerald-100 pb-4 inline-block">สารบัญ: {course.mainText} {course.level}</h2>

            {activeLessons.length === 0 ? (
              <div className="bg-white/40 p-10 rounded-3xl border border-white/60 shadow-sm text-center text-slate-500">ยังไม่มีบทเรียนที่เปิดแสดงผลในคอร์สนี้</div>
            ) : (
              <div className="w-full space-y-12">
                {activeLessons.map((lesson: any, lIdx: number) => (
                  <div key={lesson.id} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-emerald-700 flex items-center gap-3">
                        <BookOpen size={24} className="text-emerald-500" />
                        {lesson.titleCn ? `第 ${lesson.lessonNumber} 课: ${lesson.titleCn}` : `บทที่ ${lesson.lessonNumber}`} 
                        {lesson.titleEn && <span className="text-slate-500 font-normal text-xl">({lesson.titleEn})</span>}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      {lesson.sections.map((sec: any, sIdx: number) => {
                        if (sec.patternType === 'quiz') {
                          return (
                            <div key={sec.id} onClick={() => setActiveQuizData(sec.quizData || [])} className="w-full bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 shadow-sm cursor-pointer flex items-center justify-between transition-all group">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><ClipboardList size={20} /></div>
                                <div className="flex flex-col"><h4 className="text-xl font-bold text-indigo-900 mb-1">แบบทดสอบ: {sec.mainTitle || sec.titleZh || 'วัดความรู้'}</h4></div>
                              </div>
                              <div className="shrink-0 pl-4"><button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm group-hover:bg-indigo-700 transition-colors">เริ่มทำข้อสอบ</button></div>
                            </div>
                          );
                        }

                        const title1 = sec.mainTitle || sec.mainTitle1 || sec.titleZh || sec.titleZh1;
                        const title2 = sec.mainTitle2 || sec.titleZh2;
                        const displayTitle = [title1, title2].filter(Boolean).join(' | ') || `เนื้อหาส่วนที่ ${sIdx + 1}`;
                        const sub1 = sec.subTitle || sec.subTitle1 || sec.titleEn || sec.titleEn1;
                        const sub2 = sec.subTitle2 || sec.titleEn2;
                        const displaySub = [sub1, sub2].filter(Boolean).join(' | ');

                        return (
                          <div key={sec.id} onClick={() => setActiveSectionId(sec.id)} className="w-full bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between transition-all group">
                            <div className="flex items-center gap-4 flex-1">
                               <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100 shrink-0">{sIdx + 1}</div>
                               <div className="flex flex-col">
                                  <h4 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">{displayTitle}</h4>
                                  {displaySub && <p className="text-sm text-slate-500 line-clamp-1">{displaySub}</p>}
                               </div>
                            </div>
                            <div className="shrink-0 pl-4 flex items-center gap-3">
                               <button onClick={(e) => { e.stopPropagation(); startPresentation(course, sec.id); }} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5" title="เริ่ม Slide Show เฉพาะหน้านี้">
                                  <Play size={14} fill="currentColor" /> Slide
                                </button>
                               <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-500 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors"><ChevronRight size={20} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSectionId !== null && (
          <div className="animate-fade-in w-full">
             <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-50">
               <button onClick={() => setActiveSectionId(null)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold bg-slate-50 hover:bg-emerald-50 px-5 py-2 rounded-xl transition-colors"><ArrowLeft size={18} /> กลับไปหน้าสารบัญ</button>
               <button onClick={() => startPresentation(course, activeSectionId)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"><Play size={16} fill="currentColor" /> นำเสนอหน้านี้ (Slide)</button>
             </div>
             {activeLessons.map((lesson: any, lIdx: number) => 
               lesson.sections.map((sec: any, sIdx: number) => {
                 if (sec.id !== activeSectionId) return null;
                 const updateNote = (newNote: string) => {
                   const updated = [...hskCards];
                   const cIdx = updated.findIndex((c) => c.id === currentView);
                   updated[cIdx].lessons[lIdx].sections[sIdx].teacherNote = newNote;
                   setHskCards(updated);
                 };
                 return (
                   <div key={sec.id} className="w-full">
                     {sec.patternType === 'pattern1' && <LessonPattern1 data={{ ...sec, newWords: sec.vocabulary }} onUpdateNote={updateNote} />}
                     {sec.patternType === 'pattern2' && <LessonTones data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternTone2' && <PatternTone2 data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternSyllables' && <PatternSyllables data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternMonosyllabic' && <PatternMonosyllabic data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternSandhi' && <PatternSandhi data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'pattern3ColTable' && <Pattern3ColTable data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternStrokes' && <PatternStrokes data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternSinglecharacter' && <PatternSinglecharacter data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'neutraltone' && <PatternNeutraltone data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternmatchpicture' && <PatternMatchPicture data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patterntonemaking' && <PatternTonemaking data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patterndialog2' && <PatternDialog2 data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternnote' && <PatternNote data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternsentence3cols' && <PatternSentence3Cols data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternsentence4cols' && <PatternSentence4Cols data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patterndespicture' && <PatternDespicture data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternpreceding' && <PatternPreceding data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternpairwork' && <PatternPairwork data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patternflextable3cols' && <PatternFlextable3cols data={sec} onUpdateNote={updateNote} />}
                     {sec.patternType === 'patterncanva' && <PatternCanva data={sec} />}
                     {sec.patternType === 'patternStrokeOrderRules2' && <PatternStrokeOrderRules2 data={sec} />}
                     {sec.patternType === 'patternFlextable2cols' && <PatternFlextable2cols data={sec} />}
                     {sec.patternType === 'patternFlexibleDoubleTable' && <PatternFlexibleDoubleTable data={sec} />}
                     <OtherSlideRenderer slide={sec} updateNote={updateNote} allSlides={lesson.sections} userRole={userRole} roomPin={roomPin} />
                   </div>
                 );
               })
             )}
          </div>
        )}

        {activeQuizData !== null && (
          <div className="animate-fade-in w-full">
             <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-50">
               <button onClick={() => setActiveQuizData(null)} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold bg-slate-50 hover:bg-red-50 px-5 py-2 rounded-xl transition-colors"><ArrowLeft size={18} /> ออกจากแบบทดสอบ (ข้อมูลจะไม่บันทึก)</button>
             </div>
             <QuizContainer quizData={activeQuizData} onExit={() => setActiveQuizData(null)} />
          </div>
        )}

        <FloatingLiveText roomPin={roomPin} userRole={userRole} />
      </div>
    );
  }

  return null;
}