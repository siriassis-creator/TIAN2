// src/OtherApp.tsx
import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronRight, BookOpen, Bot } from 'lucide-react';
import Settings2 from './Settings2';

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
  canSeeMenu?: (menuKey: 'home' | 'other_home' | 'settings' | 'settings_other') => boolean;
}

export function OtherSlideRenderer({ 
  slide, 
  updateNote,
  userRole = 'teacher',
  roomPin = null,
  allSlides = [] 
}: { 
  slide: any, 
  updateNote?: (note: string) => void,
  userRole?: 'teacher' | 'student',
  roomPin?: string | null,
  allSlides?: any[] 
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
          case 'other_lesson5-9': 
             return <OtherLesson5_9 data={{ ...slide, characters: lesson5Characters }} onUpdateNote={updateNote} userRole={userRole} roomPin={roomPin} />;
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
  
  // 🎯 AI ChatBot States
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatLessonTitle, setChatLessonTitle] = useState('');
  const [chatLessonContext, setChatLessonContext] = useState('');

  // 🎯 ฟังก์ชันกวาดข้อมูลแบบครอบจักรวาล (ดึงข้อมูลให้ AI อ่านแบบไม่ตกหล่น)
  const handleOpenChatForLesson = (lesson: any) => {
    const title = lesson.titleCn ? `บทที่ ${lesson.lessonNumber}: ${lesson.titleCn}` : `บทที่ ${lesson.lessonNumber}`;
    
    let contextData: string[] = [];
    
    lesson.sections.forEach((sec: any) => {
      // 1. ดึงชื่อหัวข้อ
      const title1 = sec.mainTitle || sec.mainTitle1 || sec.titleZh || sec.titleZh1 || '';
      const title2 = sec.mainTitle2 || sec.titleZh2 || '';
      const sub1 = sec.subTitle || sec.subTitle1 || sec.titleEn || sec.titleEn1 || '';
      const sub2 = sec.subTitle2 || sec.titleEn2 || '';
      let textBlock = `[หัวข้อ: ${title1} ${title2} ${sub1} ${sub2}]`.trim();

      // 2. ดึงคำศัพท์ (กวาดจากทุกชื่อตัวแปรที่เป็นไปได้)
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

      // 3. ดึงประโยค / บทสนทนา
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
      
      // 4. ดึงเนื้อหาแบบความเรียงยาวๆ
      if (sec.content) textBlock += ` [เนื้อหา: ${sec.content}]`;
      if (sec.text && typeof sec.text === 'string') textBlock += ` [ข้อความ: ${sec.text}]`;

      if (textBlock.trim()) {
        contextData.push(textBlock.trim());
      }
    });

    setChatLessonTitle(title);
    
    // 🎯 ระบบ Clean ข้อมูลก่อนส่งให้ AI เพื่อป้องกัน JSON พังจากอักขระพิเศษ
    let safeContext = contextData.join(' | '); 
    safeContext = safeContext.replace(/[\"\'\\]/g, ""); // ลบเครื่องหมายคำพูดและ backslash
    safeContext = safeContext.replace(/\n/g, " ");    // เปลี่ยนการขึ้นบรรทัดใหม่เป็นช่องว่าง
    safeContext = safeContext.substring(0, 15000);    // ตัดความยาวไม่ให้เกิน limit

    setChatLessonContext(safeContext); 
    setShowChatBot(true);
  };

  if (currentView === 'settings_other') {
    return (
      <div className="p-6 md:p-10 w-full relative z-10">
        <Settings2
          hskCards={hskCards}
          setHskCards={setHskCards}
          menuNames={menuNames}
          setMenuNames={setMenuNames}
          onSave={() => saveToFirebase(hskCards)}
        />
      </div>
    );
  }

  if (currentView === 'other_home') {
    return (
      <div className="p-6 md:p-10 w-full relative z-10">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight">
            {menuNames.other_home}
          </h1>
          <p className="text-slate-500 mt-2">
            เลือกคอร์สเพื่อเริ่มต้นการสอน
          </p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
          {hskCards
            .filter((c) => c.isEnabled && !c.id.startsWith('hsk'))
            .map((card) => {
              const IconComp = card.Icon;
              return (
                <div
                  key={card.id}
                  onClick={() => setCurrentView(card.id)}
                  className={`group relative aspect-[4/5] cursor-pointer rounded-2xl border border-white/40 shadow-lg transition-all hover:-translate-y-2 bg-gradient-to-br ${card.from} ${card.to} overflow-hidden flex flex-col items-center py-6 px-4 text-white`}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-125 transition-transform">
                    {IconComp && (
                      <IconComp className="w-32 h-32" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="relative z-10 w-full flex flex-col items-center h-full justify-between text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">
                        {card.topTextZh}
                      </span>
                      <span className="text-[0.6rem] font-bold tracking-[0.15em] opacity-90 uppercase">
                        {card.topTextEn1}
                      </span>
                    </div>
                    <div className="my-1">
                      <span className="text-6xl font-black drop-shadow-md">
                        {card.mainText}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-7xl font-black drop-shadow-lg inline-block">
                        {card.level}
                      </span>
                    </div>
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
        
        {/* ===================== โหมด 1: หน้าสารบัญ (Table of Contents) ===================== */}
        {activeSectionId === null && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setCurrentView('other_home')}
                className="flex items-center text-slate-500 hover:text-emerald-600 font-medium transition-colors"
              >
                <ArrowLeft className="mr-2" /> กลับหน้าหลักคอร์ส
              </button>
              
              <button
                onClick={() => startPresentation(course)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Play size={18} fill="currentColor" /> เริ่มสอน Slide Show (ทุกหน้า)
              </button>
            </div>
            
            <h2 className="text-4xl font-bold text-slate-700 mb-10 border-b-4 border-emerald-100 pb-4 inline-block">
              สารบัญ: {course.mainText} {course.level}
            </h2>

            {activeLessons.length === 0 ? (
              <div className="bg-white/40 p-10 rounded-3xl border border-white/60 shadow-sm text-center text-slate-500">
                ยังไม่มีบทเรียนที่เปิดแสดงผลในคอร์สนี้
              </div>
            ) : (
              <div className="w-full space-y-12">
                {activeLessons.map((lesson: any, lIdx: number) => (
                  <div key={lesson.id} className="w-full">
                    
                    {/* 🎯 Header บทเรียน + ปุ่ม AI */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-emerald-700 flex items-center gap-3">
                        <BookOpen size={24} className="text-emerald-500" />
                        {lesson.titleCn ? `第 ${lesson.lessonNumber} 课: ${lesson.titleCn}` : `บทที่ ${lesson.lessonNumber}`} 
                        {lesson.titleEn && <span className="text-slate-500 font-normal text-xl">({lesson.titleEn})</span>}
                      </h3>
                      
                      {/* ปุ่มเปิดแชทกับ AI โดยส่งข้อมูลของบทนี้ไปทั้งหมด */}
                      <button
                        onClick={() => handleOpenChatForLesson(lesson)}
                        className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                      >
                        <Bot size={20} /> ทบทวนกับ AI ติวเตอร์
                      </button>
                    </div>
                    
                    {/* ลิสต์รายการสารบัญ (Card ยาวๆ แถวละ 1 บท) */}
                    <div className="flex flex-col gap-4">
                      {lesson.sections.map((sec: any, sIdx: number) => {
                        const title1 = sec.mainTitle || sec.mainTitle1 || sec.titleZh || sec.titleZh1;
                        const title2 = sec.mainTitle2 || sec.titleZh2;
                        const displayTitle = [title1, title2].filter(Boolean).join(' | ') || `เนื้อหาส่วนที่ ${sIdx + 1}`;

                        const sub1 = sec.subTitle || sec.subTitle1 || sec.titleEn || sec.titleEn1;
                        const sub2 = sec.subTitle2 || sec.titleEn2;
                        const displaySub = [sub1, sub2].filter(Boolean).join(' | ');

                        return (
                          <div 
                            key={sec.id}
                            onClick={() => setActiveSectionId(sec.id)}
                            className="w-full bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                               <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100 shrink-0">
                                  {sIdx + 1}
                               </div>
                               <div className="flex flex-col">
                                  <h4 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                     {displayTitle}
                                  </h4>
                                  {displaySub && (
                                     <p className="text-sm text-slate-500 line-clamp-1">{displaySub}</p>
                                  )}
                               </div>
                            </div>
                            <div className="shrink-0 pl-4 flex items-center gap-3">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); startPresentation(course, sec.id); }}
                                 className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                                 title="เริ่ม Slide Show เฉพาะหน้านี้"
                               >
                                  <Play size={14} fill="currentColor" /> Slide
                               </button>
                               <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-500 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                                  <ChevronRight size={20} />
                               </div>
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

        {/* ===================== โหมด 2: หน้าเรียนทีละบท (เปิดเฉพาะตอนคลิกจากสารบัญ) ===================== */}
        {activeSectionId !== null && (
          <div className="animate-fade-in w-full">
             
             {/* ปุ่มกลับสารบัญ */}
             <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-50">
               <button
                 onClick={() => setActiveSectionId(null)}
                 className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold bg-slate-50 hover:bg-emerald-50 px-5 py-2 rounded-xl transition-colors"
               >
                 <ArrowLeft size={18} /> กลับไปหน้าสารบัญ
               </button>
               
               <button
                  onClick={() => startPresentation(course, activeSectionId)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
               >
                  <Play size={16} fill="currentColor" /> นำเสนอหน้านี้ (Slide)
               </button>
             </div>

             {/* หา Section ที่ถูกคลิก แล้ว Render Component */}
             {activeLessons.map((lesson: any, lIdx: number) => 
               lesson.sections.map((sec: any, sIdx: number) => {
                 if (sec.id !== activeSectionId) return null; // 🎯 ซ่อนบทอื่นๆ ทั้งหมด โหลดแค่บทเดียว!

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

        {/* === กระดานคำศัพท์เสริม (Floating Board) แสดงทุกหน้าของ OtherApp === */}
        <FloatingLiveText roomPin={roomPin} userRole={userRole} />
        
        {/* === 🤖 AI ChatBot === */}
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

  return null;
}