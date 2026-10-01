// src/components/DynamicLessonRenderer.tsx
import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, MessageCircle, BookOpen, Image as ImageIcon, Music, HelpCircle, XCircle, Send, X, Monitor, Trophy, Edit3, Trash2, ChevronDown, Users, RotateCcw, LogOut, List, AlignLeft, Mic, ClipboardList, PenTool, Save, PlusCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { SharedTeacherPanel } from './SharedTeacherPanel';
import { HanziWordWriter } from './SharedHanzi';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment, deleteField } from 'firebase/firestore';
import { supabase } from '../supabase';

// =========================================================
// 🧩 Helper Functions & External Components
// =========================================================
const extractImageAssets = (obj: any, currentPath: (string|number)[] = [], labelCtx: string = 'เนื้อหา', assets: any[] = []) => {
  if (!obj || typeof obj !== 'object') return assets;
  let currentLabel = obj.hanzi || obj.title || obj.question || obj.questionHanzi || obj.topic || obj.sectionTitle || labelCtx;
  if (obj.image !== undefined && typeof obj.image === 'object' && !Array.isArray(obj.image) && obj.image !== null) {
      assets.push({ path: [...currentPath, 'image'], type: 'image', node: obj.image, label: currentLabel });
  }
  for (const key in obj) {
      if (key === 'image' || key === 'audio') continue;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractImageAssets(obj[key], [...currentPath, isNaN(Number(key)) ? key : Number(key)], currentLabel, assets);
      }
  }
  return assets;
};

const setValueByPath = (obj: any, path: (string|number)[], value: any) => {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) { curr = curr[path[i]]; }
  curr[path[path.length - 1]] = value;
};

const SmartForm = ({ data, onChange }: any) => {
  const editableKeys = ['hanzi', 'pinyin', 'thai', 'text', 'question', 'questionHanzi', 'questionPinyin', 'questionThai', 'answer', 'correctAnswer', 'explanation', 'explanationThai', 'title', 'titleChinese', 'titlePinyin', 'titleThai', 'sectionTitle', 'instructionThai', 'topic', 'time', 'timeSpan', 'actionHanzi', 'actionPinyin', 'actionThai', 'statementHanzi', 'statementPinyin', 'statementThai', 'wordHanzi', 'partialPinyin', 'correctPinyin', 'meaningThai', 'termHanzi', 'termPinyin', 'timeRange', 'contentThai', 'descriptionThai', 'radicalHanzi', 'radicalPinyin', 'labelHanzi', 'labelPinyin', 'labelThai', 'passageTitle', 'missingPartText', 'sampleAnswer'];

  const renderNode = (node: any, path: (string|number)[]) => {
      if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
          const key = path[path.length - 1];
          if (editableKeys.includes(String(key))) {
              return (
                  <div key={path.join('.')} className="mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded w-max">{String(key)}</label>
                      <textarea value={String(node)} onChange={(e) => onChange(path, e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded outline-none resize-none font-medium text-slate-700 p-2 focus:border-indigo-300" rows={String(node).length > 40 ? 2 : 1} />
                  </div>
              );
          }
          return null;
      }
      if (Array.isArray(node)) {
          return <div key={path.join('.')} className="pl-3 ml-2 border-l-2 border-indigo-100 flex flex-col gap-2 my-2 w-full">{node.map((child, idx) => renderNode(child, [...path, idx]))}</div>;
      }
      if (typeof node === 'object' && node !== null) {
          return <div key={path.join('.')} className="flex flex-col gap-1 w-full">{Object.keys(node).map(key => renderNode(node[key], [...path, key]))}</div>;
      }
      return null;
  };
  return <div className="flex flex-col w-full">{renderNode(data, [])}</div>;
};

const speak = (text: string) => {
  if (!text) return;
  if ('speechSynthesis' in window) { 
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text); 
      utterance.lang = 'zh-CN'; 
      window.speechSynthesis.speak(utterance); 
  }
};

const TTSBtn = ({ text, size = 16, className = "" }: { text: string, size?: number, className?: string }) => {
   if (!text) return null;
   return (
     <button 
       type="button" 
       onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(text); }} 
       className={`inline-flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-full transition-colors shadow-sm active:scale-95 shrink-0 ${className}`} 
       title="ฟังเสียงอ่าน"
     >
       <Volume2 size={size} />
     </button>
   );
};

const HanziDisplay = ({ text, enableHanzi, className = "", style }: { text: string, enableHanzi: boolean, className?: string, style?: React.CSSProperties }) => {
   if (!text) return null;
   if (enableHanzi) {
      return (
         <div className={`hover:scale-105 transition-transform cursor-pointer inline-flex justify-center shrink-0 ${className}`} style={style}>
            <HanziWordWriter text={text} />
         </div>
      );
   }
   return <span className={className} style={style}>{text}</span>;
};

// =========================================================
// 🚀 Main Component
// =========================================================
export default function DynamicLessonRenderer({ data, userRole, roomPin, onSaveLesson }: any) {
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  const [localJsonData, setLocalJsonData] = useState<any>(data?.jsonData);
  const [liveSessionData, setLiveSessionData] = useState<any>(null);
  
  // 📝 ข้อมูลของนักเรียน
  const [studentName, setStudentName] = useState<string>(() => localStorage.getItem('student_live_name') || '');
  const [isJoined, setIsJoined] = useState<boolean>(false); 
  const [studentFlipped, setStudentFlipped] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<any>(''); 

  const [isDrawMode, setIsDrawMode] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x:number, y:number}[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // สถานะสำหรับระบบ Edit Inline
  const [editingPageIdx, setEditingPageIdx] = useState<number | null>(null);
  const [editingPageData, setEditingPageData] = useState<any>(null);

  useEffect(() => {
    setLocalJsonData(data?.jsonData);
  }, [data?.jsonData]);

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.dynamic_board?.ts !== liveSessionData?.dynamic_board?.ts) {
            setStudentFlipped(false); setStudentAnswer(null); setDraftAnswer(''); 
        }
        setLiveSessionData(d);
      }
    });
    return () => unsub();
  }, [roomPin, liveSessionData?.dynamic_board?.ts]);

  useEffect(() => {
    if (userRole === 'student' && isJoined && studentName && roomPin) {
      const cleanKey = studentName.trim().replace(/\./g, '_');
      updateDoc(doc(db, 'live_sessions', roomPin), { [`participants.${cleanKey}`]: Date.now() }).catch(() => {});
      const handleLeave = () => { updateDoc(doc(db, 'live_sessions', roomPin), { [`participants.${cleanKey}`]: deleteField() }).catch(() => {}); };
      window.addEventListener('beforeunload', handleLeave); window.addEventListener('unload', handleLeave);
      return () => { handleLeave(); window.removeEventListener('beforeunload', handleLeave); window.removeEventListener('unload', handleLeave); };
    }
  }, [userRole, isJoined, studentName, roomPin]);

  const isLiveActive = !!liveSessionData?.dynamic_board;

  // 🎯 แก้ปัญหา Scroll: ใช้เทคนิค Fixed Position เพื่อแช่แข็งหน้าจอ ณ ตำแหน่งที่กด โดยไม่ให้เด้งกลับไปบนสุด
  useEffect(() => {
    if (isLiveActive && isTeacher) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isLiveActive, isTeacher]);
  
  const getImgUrl = (img: any) => img?.url || img?.imageUrl;
  const getImgAlt = (img: any) => img?.alt || img?.imageAlt || 'ภาพประกอบ';
  const getAudUrl = (aud: any) => aud?.url || aud?.audioUrl;

  let lessonData: any = null;
  let rootKey = '';
  let fullParsedJson: any = null;

  try {
    fullParsedJson = typeof localJsonData === 'string' ? JSON.parse(localJsonData) : localJsonData;
    const quizData = fullParsedJson.preTest || fullParsedJson.postTest || fullParsedJson.quiz;
    
    if (quizData) {
       rootKey = fullParsedJson.preTest ? 'preTest' : fullParsedJson.postTest ? 'postTest' : 'quiz';
       lessonData = {
          lessonNumber: "Quiz", topic: "แบบทดสอบ (Interactive)",
          titleChinese: quizData.title || "แบบทดสอบ",
          titleThai: `ทั้งหมด ${quizData.totalQuestions || quizData.questions?.length} ข้อ`,
          pages: (quizData.questions || []).map((q: any, idx: number) => ({
             id: q.id || `q_${idx}`, pageNumber: idx + 1, title: `ข้อที่ ${q.sortOrder || idx + 1}`,
             type: 'advanced_quiz', instructionThai: q.learningObjective || '',
             content: q, image: q.image, audio: q.audio
          }))
       };
    } else {
       rootKey = fullParsedJson.lesson ? 'lesson' : '';
       lessonData = fullParsedJson.lesson ? fullParsedJson.lesson : fullParsedJson;
    }
  } catch (error) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-200 text-center"><h2 className="text-2xl font-bold mb-2">❌ โครงสร้าง JSON ไม่ถูกต้อง</h2></div>
      </div>
    );
  }

  const handleSavePageContent = () => {
    if (editingPageIdx === null || !editingPageData) return;
    try {
        const newFullJson = { ...fullParsedJson };
        if (rootKey === 'lesson') newFullJson.lesson.pages[editingPageIdx] = editingPageData;
        else if (rootKey !== '') newFullJson[rootKey].questions[editingPageIdx] = editingPageData;
        else newFullJson.pages[editingPageIdx] = editingPageData;

        const newJsonString = JSON.stringify(newFullJson, null, 2);
        setLocalJsonData(newJsonString);

        if (onSaveLesson) {
           onSaveLesson(newJsonString);
        }
        setEditingPageIdx(null);
        setEditingPageData(null);
    } catch (err: any) {
        alert("บันทึกไม่สำเร็จ: " + err.message);
    }
  };

  const broadcastToStudent = async (type: string, payload: any) => {
    if (!isTeacher || !roomPin) return;
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), { dynamic_board: { type, data: payload, ts: Date.now(), lines: [], studentAnswers: {} } });
      setIsDrawMode(false);
    } catch (e) { console.error(e); }
  };

  const clearStudentBoard = async () => {
    if (!isTeacher || !roomPin) return;
    try { 
      await updateDoc(doc(db, 'live_sessions', roomPin), { dynamic_board: null }); 
      setIsDrawMode(false); 
    } catch (e) { console.error(e); }
  };

  const clearDrawings = async () => {
    if (!isTeacher || !roomPin) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { 'dynamic_board.lines': [] }); } catch (e) { console.error(e); }
  };

  const resetAllScoresAndStudents = async () => {
    if (!isTeacher || !roomPin) return;
    if (!window.confirm("คุณครูต้องการรีเซ็ตคะแนนและ 'ล้างรายชื่อนักเรียน' ทุกคนในห้องนี้ใช่หรือไม่?")) return;
    try { await updateDoc(doc(db, 'live_sessions', roomPin), { scores: {}, participants: {} }); } catch (e) { console.error(e); }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTeacher || !isDrawMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentPath([{x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100}]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isTeacher || !isDrawMode || currentPath.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentPath(prev => [...prev, {x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100}]);
  };
  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!isTeacher || !isDrawMode || currentPath.length === 0) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (roomPin && currentPath.length > 1) {
       await updateDoc(doc(db, 'live_sessions', roomPin), { 'dynamic_board.lines': [...(liveSessionData?.dynamic_board?.lines || []), currentPath] });
    }
    setCurrentPath([]);
  };

  const handleStudentJoin = () => {
    const trimmed = studentName.trim();
    if (trimmed && roomPin) { 
       setIsJoined(true); 
       localStorage.setItem('student_live_name', trimmed); 
    }
  };

  const handleStudentAnswer = async (opt: string) => {
    if (studentAnswer || !isJoined || !studentName) return; 
    setStudentAnswer(opt);
    
    const boardItem = liveSessionData?.dynamic_board;
    const exactAnswer = boardItem?.data?.answer || boardItem?.data?.correctAnswer || '';
    
    // ตรวจสอบคำตอบ รองรับทั้ง Array หรือ String
    let isCorrect = false;
    if (Array.isArray(exactAnswer)) {
       isCorrect = exactAnswer.some(ans => ans.toString().trim().toLowerCase() === opt.trim().toLowerCase());
    } else {
       isCorrect = opt.trim().toLowerCase() === exactAnswer.toString().trim().toLowerCase();
    }
    
    let earnedPoints = 0;
    if (isCorrect) {
       const timeTaken = Date.now() - (boardItem?.ts || Date.now());
       const timeRatio = Math.min(timeTaken / 15000, 1);
       earnedPoints = 50 + Math.round(50 * (1 - timeRatio));
    }

    if (roomPin) {
       const cleanKey = studentName.trim().replace(/\./g, '_');
       const updates: any = { [`dynamic_board.studentAnswers.${cleanKey}`]: { answer: opt, isCorrect, points: earnedPoints } };
       if (isCorrect) updates[`scores.${cleanKey}`] = increment(earnedPoints);
       await updateDoc(doc(db, 'live_sessions', roomPin), updates);
    }
  };

  const scores = liveSessionData?.scores || {};
  const participants = liveSessionData?.participants || {};
  const allStudentNames = Object.keys(participants);
  const leaderboardData = allStudentNames.map(name => ({ name, score: scores[name] || 0 })).sort((a, b) => b.score - a.score);
  const joinedCount = allStudentNames.length;

  const renderSectionContent = (sec: any, isTeacherOverlay: boolean = false, isEditingThisPage: boolean = false, sIdx: number = -1) => {
    const enableHanzi = sec.enableHanziWriter || false;
    const hzStyle = sec.hanziFontSize ? { fontSize: `${sec.hanziFontSize}px`, lineHeight: 1.2 } : undefined;
    const pyStyle = sec.pinyinFontSize ? { fontSize: `${sec.pinyinFontSize}px`, lineHeight: 1.2 } : undefined;

    return (
      <div className="w-full space-y-8 relative group/section">
        {/* 🎯 ปุ่มส่งเนื้อหา "ทั้งหมวด" ขึ้นจอ (ใช้กับหมวดที่ไม่มีปุ่มแยกย่อย) */}
        {isTeacherOverlay && !isEditingThisPage && !['picture_card', 'vocabulary_cards', 'listening_ordering', 'listening_true_false', 'dialogue_section', 'pair_speaking', 'pinyin_completion', 'end_of_lesson_quiz', 'open_questions', 'circle_target_character', 'character_tracing', 'sentence_tracing', 'sing_along', 'writing_sample_and_practice', 'hanzi_recognition', 'radical_examples'].includes(sec.type) && (
           <button onClick={() => broadcastToStudent('full_page', { title: sec.sectionTitle || 'แบบฝึกหัด/เนื้อหา', sections: [sec] })} className="absolute -top-4 right-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg opacity-0 group-hover/section:opacity-100 transition-all z-20">
              <Send size={16}/> ส่งหมวดนี้ขึ้นจอ
           </button>
        )}

        {sec.type === 'heading' && (
          <div className="text-center bg-indigo-50 p-6 md:p-8 rounded-2xl border-2 border-indigo-100 shadow-sm">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
              <HanziDisplay text={sec.titleChinese} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={sec.titleChinese} />
            </h3>
            <p className="text-lg md:text-xl text-indigo-600 font-semibold mb-1" style={pyStyle}>{sec.titlePinyin}</p>
            <p className="text-slate-600 text-sm md:text-base">{sec.titleThai}</p>
          </div>
        )}

        {sec.type === 'picture_card' && (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-4">{sec.sectionTitle}</h3>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-100 flex flex-col items-center text-center w-full max-w-sm relative group">
              {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('vocab', {hanzi: sec.item?.hanzi, pinyin: sec.item?.pinyin, thai: sec.item?.thai, image: sec.item?.image || sec.image, audio: sec.item?.audio || sec.audio})} className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={14}/> ส่งขึ้นจอ</button>}
              {getImgUrl(sec.item?.image) && <img src={getImgUrl(sec.item?.image)} alt="vocab" className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl mb-4 shadow-sm border border-slate-100" />}
              <div className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HanziDisplay text={sec.item?.hanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={sec.item?.hanzi} className="ml-2" />
              </div>
              <div className="text-xl md:text-2xl text-indigo-500 font-semibold mb-1" style={pyStyle}>{sec.item?.pinyin}</div>
              <div className="text-lg text-slate-600 mb-4">{sec.item?.thai}</div>
              {getAudUrl(sec.item?.audio) && <audio controls className="w-full h-10 outline-none"><source src={getAudUrl(sec.item?.audio)} type="audio/mpeg" /></audio>}
            </div>
          </div>
        )}

        {sec.type === 'vocabulary_cards' && (
          <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><List className="text-indigo-500 w-6 h-6"/> {sec.sectionTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sec.items?.map((item: any) => (
                <div key={item.id} className="relative group bg-white border border-indigo-100 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col items-center hover:border-indigo-400 transition-all hover:-translate-y-1">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('vocab', {hanzi: item.hanzi, pinyin: item.pinyin, thai: item.thai, image: item.image || sec.image, audio: item.audio || sec.audio})} className="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={12}/> ส่ง</button>}
                  {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt={item.hanzi} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl mb-3 shadow-sm" />}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-3xl md:text-4xl font-serif text-slate-800 font-bold">
                      <HanziDisplay text={item.hanzi} enableHanzi={enableHanzi} style={hzStyle} />
                    </span>
                    <TTSBtn text={item.hanzi} className="ml-1" />
                  </div>
                  <span className="text-sm md:text-base text-indigo-500 font-semibold text-center mb-1" style={pyStyle}>{item.pinyin}</span>
                  <span className="text-xs md:text-sm text-slate-500 text-center">{item.thai}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 นำ image และ audio ใส่เข้าไปในการกดส่งให้เด็ก */}
        {sec.type === 'listening_ordering' && (
          <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Mic className="text-amber-500 w-6 h-6"/> {sec.sectionTitle}</h3>
            <div className="flex flex-col gap-4">
              {sec.items?.map((item: any) => (
                <div key={item.id} className="relative group flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm hover:border-amber-300 transition-colors">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('passage', { hanzi: item.sentenceHanzi, pinyin: item.sentencePinyin, thai: item.sentenceThai, image: item.image || sec.image, audio: item.audio || sec.audio })} className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Send size={14}/> ส่งประโยค</button>}
                  <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-400 shrink-0 text-xl">?</div>
                  {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt="img" className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover shadow-sm" />}
                  <div className="flex-1 pr-16 md:pr-24">
                    <div className="text-lg md:text-xl font-serif text-slate-800 font-bold flex items-center gap-2">
                      <HanziDisplay text={item.sentenceHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={item.sentenceHanzi} className="ml-2" />
                    </div>
                    {item.sentencePinyin && <div className="text-sm md:text-base text-indigo-500 mt-1" style={pyStyle}>{item.sentencePinyin}</div>}
                    {item.sentenceThai && <div className="text-sm text-slate-500 mt-0.5">{item.sentenceThai}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 นำ image และ audio ใส่เข้าไปในการกดส่งให้เด็ก */}
        {sec.type === 'listening_true_false' && (
          <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Mic className="text-amber-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            {getAudUrl(sec.audio) && (
              <div className="w-full max-w-md mx-auto mb-10 bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base"><Music size={18} /> คลิปเสียงประจำแบบฝึกหัด</div>
                <audio controls className="w-full h-12 outline-none"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
              </div>
            )}
            <div className="flex flex-col gap-5">
              {sec.items?.map((item: any, i: number) => (
                <div key={item.id} className="relative group bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:border-amber-300 transition-colors">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: item.id, type: 'single_choice', question: item.sentenceHanzi, questionPinyin: item.sentencePinyin, questionThai: item.sentenceThai, options: [{id:'True', text:'ถูก', hanzi:'✓'}, {id:'False', text:'ผิด', hanzi:'✗'}], answer: item.correctAnswer === true ? 'True' : item.correctAnswer === false ? 'False' : '', explanationThai: item.explanationThai, image: item.image || sec.image, audio: item.audio || sec.audio })} className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={14}/> ส่งให้เด็กตอบ</button>}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xl md:text-2xl shrink-0 shadow-sm">{item.itemNumber || i+1}</div>
                  {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt="avatar" className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-indigo-50 shadow-sm" />}
                  <div className="flex-1 text-center md:text-left pr-20 md:pr-0">
                    <div className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
                      <HanziDisplay text={item.sentenceHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={item.sentenceHanzi} className="ml-2" />
                    </div>
                    {item.sentencePinyin && <div className="text-xl text-indigo-500 mt-2" style={pyStyle}>{item.sentencePinyin}</div>}
                    {item.sentenceThai && <div className="text-base text-slate-500 mt-1">{item.sentenceThai}</div>}
                  </div>
                  <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
                    {isEditingThisPage ? (
                       <>
                         <button onClick={() => {
                            const newData = JSON.parse(JSON.stringify(editingPageData));
                            newData.sections[sIdx].items[i].correctAnswer = true;
                            setEditingPageData(newData);
                         }} className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-bold text-3xl cursor-pointer shadow-sm transition-colors ${item.correctAnswer === true ? 'bg-green-100 text-green-700 border-green-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-green-50'}`}>✓</button>
                         <button onClick={() => {
                            const newData = JSON.parse(JSON.stringify(editingPageData));
                            newData.sections[sIdx].items[i].correctAnswer = false;
                            setEditingPageData(newData);
                         }} className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-bold text-3xl cursor-pointer shadow-sm transition-colors ${item.correctAnswer === false ? 'bg-red-100 text-red-700 border-red-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-red-50'}`}>✗</button>
                       </>
                    ) : (
                       <>
                         <span className={`w-16 h-16 rounded-2xl bg-slate-50 border-2 flex items-center justify-center font-bold text-3xl shadow-sm ${item.correctAnswer === true ? 'border-green-400 text-green-600 bg-green-50' : 'border-slate-200 text-slate-400'}`}>✓</span>
                         <span className={`w-16 h-16 rounded-2xl bg-slate-50 border-2 flex items-center justify-center font-bold text-3xl shadow-sm ${item.correctAnswer === false ? 'border-red-400 text-red-600 bg-red-50' : 'border-slate-200 text-slate-400'}`}>✗</span>
                       </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sec.type === 'dialogue_section' && (
          <div className="w-full">
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3"><MessageCircle className="text-blue-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="space-y-10">
              {sec.dialogues?.map((d: any) => (
                <div key={d.dialogueNumber} className="bg-blue-50/50 p-8 md:p-10 rounded-3xl border border-blue-100 relative group shadow-sm">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('dialogue', { lines: d.lines, image: d.image || sec.image, audio: d.audio || sec.audio })} className="absolute top-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm md:text-base font-bold flex items-center gap-2 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={18}/> ส่งบทสนทนานี้ขึ้นจอ</button>}
                  <h4 className="font-bold text-blue-800 text-base md:text-lg mb-8 bg-blue-100 inline-block px-5 py-2 rounded-xl shadow-sm">บทสนทนา {d.dialogueNumber}: {d.topic}</h4>
                  {getImgUrl(d.image) && <img src={getImgUrl(d.image)} alt="dialogue img" className="w-full max-w-md rounded-3xl mb-8 shadow-sm border border-blue-200" />}
                  
                  <div className="flex flex-col gap-6">
                    {d.lines?.map((chat: any, dIdx: number) => {
                      const isA = chat.speaker === 'A';
                      return (
                        <div key={dIdx} className={`flex w-full gap-4 md:gap-5 ${isA ? 'justify-start' : 'justify-end'}`}>
                          {isA && <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">{chat.speaker}</div>}
                          <div className={`p-5 md:p-6 rounded-3xl border max-w-[85%] shadow-sm ${isA ? 'bg-white rounded-tl-none border-slate-200' : 'bg-emerald-50 rounded-tr-none text-right border-emerald-200'}`}>
                            <div className="text-2xl md:text-3xl font-serif text-slate-800 font-semibold flex items-center gap-3">
                               <HanziDisplay text={chat.hanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={chat.hanzi} className="ml-2" />
                            </div>
                            {chat.pinyin && <div className="text-lg md:text-xl text-blue-600 mb-1 md:mb-2" style={pyStyle}>{chat.pinyin}</div>}
                            {chat.thai && <div className="text-base md:text-lg text-slate-500">{chat.thai}</div>}
                          </div>
                          {!isA && <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">{chat.speaker}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {d.questions && d.questions.length > 0 && (
                     <div className="mt-10 bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200 shadow-sm">
                        <h4 className="font-bold text-amber-800 mb-6 text-lg flex items-center gap-2"><HelpCircle size={24}/> คำถามท้ายบทสนทนา (Q&A)</h4>
                        <div className="space-y-5">
                           {d.questions.map((q: any, qIdx: number) => (
                              <div key={q.id || qIdx} className="bg-white p-5 md:p-6 rounded-2xl border border-amber-100 shadow-sm relative group/qna">
                                 {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: q.id, type: 'fill_in_blank', question: q.questionHanzi, answer: q.correctAnswer, explanationThai: q.explanationThai, image: q.image || d.image || sec.image, audio: q.audio || d.audio || sec.audio })} className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-md opacity-100 md:opacity-0 group-hover/qna:opacity-100 transition-all z-10"><Send size={16}/> ส่งข้อนี้</button>}
                                 <div className="text-xl md:text-2xl font-serif font-bold text-slate-800 pr-32 flex items-center gap-3">
                                    {q.itemNumber}. <HanziDisplay text={q.questionHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={q.questionHanzi} className="ml-2" />
                                 </div>
                                 {q.questionPinyin && <div className="text-base text-indigo-500 mt-2" style={pyStyle}>{q.questionPinyin}</div>}
                                 {q.questionThai && <div className="text-sm md:text-base text-slate-500 mt-1">{q.questionThai}</div>}
                                 {q.correctAnswer && (
                                   <div className="mt-5 pt-4 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-xl">
                                      <span className="text-base font-bold text-emerald-700 block mb-1">💡 แนวคำตอบ: </span>
                                      <span className="text-xl text-slate-800 font-serif font-bold block" style={hzStyle}>{q.correctAnswer}</span>
                                      {q.explanationThai && <span className="text-sm text-emerald-600 mt-1 block">({q.explanationThai})</span>}
                                   </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>

            {sec.questions && sec.questions.length > 0 && !sec.dialogues?.[0]?.questions && (
               <div className="mt-10 bg-amber-50 p-8 md:p-10 rounded-3xl border border-amber-200 shadow-sm">
                  <h4 className="font-bold text-amber-800 mb-8 text-xl flex items-center gap-2"><HelpCircle size={28}/> คำถามท้ายบทสนทนา (Q&A)</h4>
                  <div className="space-y-6">
                     {sec.questions.map((q: any, qIdx: number) => (
                        <div key={q.id || qIdx} className="bg-white p-6 md:p-8 rounded-3xl border border-amber-100 shadow-sm relative group/qna hover:border-amber-300 transition-colors">
                           {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: q.id, type: 'fill_in_blank', question: q.questionHanzi, answer: q.correctAnswer, explanationThai: q.explanationThai, image: q.image || sec.image, audio: q.audio || sec.audio })} className="absolute top-5 right-5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm md:text-base font-bold flex items-center gap-2 shadow-md opacity-100 md:opacity-0 group-hover/qna:opacity-100 transition-all z-10"><Send size={16}/> ส่งข้อนี้ขึ้นจอ</button>}
                           <div className="text-2xl md:text-3xl font-serif font-bold text-slate-800 pr-40 flex items-center gap-3">
                              {q.itemNumber}. <HanziDisplay text={q.questionHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={q.questionHanzi} className="ml-2" />
                           </div>
                           {q.questionPinyin && <div className="text-lg md:text-xl text-indigo-500 mt-3" style={pyStyle}>{q.questionPinyin}</div>}
                           {q.questionThai && <div className="text-base text-slate-500 mt-1">{q.questionThai}</div>}
                           {q.correctAnswer && (
                             <div className="mt-6 pt-5 border-t border-slate-100 bg-emerald-50/50 p-5 rounded-2xl">
                                <span className="text-base font-bold text-emerald-700 block mb-2">💡 แนวคำตอบ: </span>
                                <span className="text-2xl font-serif font-bold text-slate-800" style={hzStyle}>{q.correctAnswer}</span>
                                {q.explanationThai && <span className="text-base text-emerald-600 block mt-2">({q.explanationThai})</span>}
                             </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {sec.type === 'pair_speaking' && (
          <div className="w-full bg-cyan-50 p-8 md:p-10 rounded-3xl border border-cyan-100 relative group">
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 mb-8 flex items-center gap-3"><Users className="text-cyan-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            
            {sec.modelDialogue && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 mb-10 relative group/dialogue shadow-sm">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('dialogue', { lines: sec.modelDialogue, image: sec.image, audio: sec.audio })} className="absolute top-5 right-5 bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md opacity-100 md:opacity-0 group-hover/dialogue:opacity-100 transition-all z-10"><Send size={16}/> ส่งประโยคตัวอย่าง</button>}
                  <span className="font-bold text-cyan-700 text-lg block mb-5 flex items-center gap-2"><MessageCircle size={22}/> บทสนทนาตัวอย่าง:</span>
                  {sec.modelDialogue.map((chat:any, i:number) => (
                     <div key={i} className="mb-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-base shrink-0">{chat.speaker}</div>
                        <div className="flex flex-col">
                           <span className="flex items-center gap-3 text-2xl font-serif font-bold text-slate-800"><HanziDisplay text={chat.hanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={chat.hanzi} className="ml-2" /></span>
                           <span className="text-base text-slate-500 mt-1">({chat.thai})</span>
                        </div>
                     </div>
                  ))}
              </div>
            )}

            {sec.siblingCards && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sec.siblingCards.map((card:any, i:number) => (
                  <div key={card.id || i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center group/card relative hover:border-cyan-300 transition-all hover:-translate-y-2">
                    {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('vocab', {hanzi: card.labelHanzi, pinyin: card.labelPinyin, thai: card.labelThai, image: card.image || sec.image})} className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-all z-10"><Send size={14}/> ส่งขึ้นจอ</button>}
                    {getImgUrl(card.image) ? (
                      <img src={getImgUrl(card.image)} alt="img" className="w-full h-48 md:h-56 object-contain rounded-2xl mb-6 border border-slate-100" />
                    ) : (
                      <div className="w-full h-48 md:h-56 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center text-slate-300 text-base border-2 border-dashed border-slate-200">ไม่มีรูปภาพประกอบ</div>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-2 w-full">
                      <span className="text-3xl md:text-4xl font-bold font-serif text-slate-800 flex-1 whitespace-nowrap"><HanziDisplay text={card.labelHanzi} enableHanzi={enableHanzi} style={hzStyle} /></span>
                      <TTSBtn text={card.labelHanzi} className="ml-2" />
                    </div>
                    {card.labelPinyin && <div className="text-xl text-indigo-500 mt-3 font-medium" style={pyStyle}>{card.labelPinyin}</div>}
                    {card.labelThai && <div className="text-base text-slate-500 mt-1.5">{card.labelThai}</div>}
                  </div>
                ))}
              </div>
            )}

            {sec.routineCards && (
              <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
                {sec.routineCards.map((card:any, i:number) => (
                  <React.Fragment key={i}>
                    <div className="bg-white p-6 w-48 md:w-56 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center shrink-0 hover:border-cyan-300 transition-colors">
                      {getImgUrl(card.image) && <img src={getImgUrl(card.image)} alt="img" className="w-32 h-32 object-cover rounded-2xl mb-5 shadow-sm" />}
                      <div className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-base font-bold mb-4 shadow-inner">{card.timeSpan || card.time}</div>
                      <div className="flex items-center justify-center gap-2 mb-2 w-full">
                        <span className="text-2xl font-bold font-serif text-slate-800"><HanziDisplay text={card.actionHanzi || card.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></span>
                        <TTSBtn text={card.actionHanzi || card.hanzi} className="ml-1" />
                      </div>
                      {(card.actionPinyin || card.pinyin) && <div className="text-base text-indigo-500 mb-1.5" style={pyStyle}>{card.actionPinyin || card.pinyin}</div>}
                      {card.actionThai && <div className="text-sm text-slate-500">{card.actionThai || card.thai}</div>}
                    </div>
                    {i < sec.routineCards.length - 1 && <div className="hidden lg:block text-cyan-300 font-black text-4xl mx-3">➔</div>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🎯 Pinyin Completion */}
        {sec.type === 'pinyin_completion' && (
          <div className="w-full bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 mb-10 flex items-center gap-3"><Edit3 className="text-pink-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
              {sec.items?.map((item:any) => (
                <div key={item.id} className="relative group bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-100 flex flex-row items-center gap-6 shadow-md hover:border-pink-300 hover:shadow-lg transition-all duration-300">
                  {/* 🎯 นำ image และ audio ใส่เข้าไปในการกดส่งให้เด็ก */}
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: item.id, type: 'fill_in_blank', question: item.wordHanzi, answer: item.correctPinyin, explanationThai: item.meaningThai, image: item.image || sec.image, audio: item.audio || sec.audio })} className="absolute top-4 right-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={16}/> ส่งข้อนี้ให้เด็กพิมพ์ตอบ</button>}
                  
                  {/* ฝั่งซ้าย: รูปภาพ หรือ คำแปลไทย และมีปุ่มลำโพงอยู่ด้านล่าง */}
                  <div className="flex flex-col items-center justify-center w-32 md:w-40 shrink-0 gap-4">
                    <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-2 overflow-hidden">
                      {getImgUrl(item.image) ? (
                        <img src={getImgUrl(item.image)} alt="img" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold text-orange-500 text-center px-2 leading-snug">{item.meaningThai}</span>
                      )}
                    </div>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(item.wordHanzi); }} className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors active:scale-95 shrink-0" title="ฟังเสียงอ่าน">
                      <Volume2 size={24} />
                    </button>
                  </div>
                  
                  {/* ฝั่งขวา: พินอินและตัวจีน */}
                  <div className="flex-1 flex flex-row flex-wrap items-baseline gap-3 border-l-2 border-slate-100 pl-6 md:pl-8 py-4">
                    <span className="text-2xl md:text-3xl text-slate-500 font-mono font-bold tracking-[0.2em]" style={pyStyle}>
                       {item.partialPinyin?.replace(/_+/g, '___')}
                    </span>
                    <div className="text-4xl font-serif font-normal text-slate-700 ml-2">
                       <HanziDisplay text={item.wordHanzi} enableHanzi={enableHanzi} style={hzStyle} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 หน้า 6: รองรับ ร้องเพลง (sing_along) */}
        {sec.type === 'sing_along' && (
          <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-10 rounded-3xl border-2 border-amber-200 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-bold text-amber-900 mb-6 flex items-center gap-3"><Music className="text-amber-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            {getAudUrl(sec.audio) && (
              <div className="w-full max-w-lg mx-auto mb-8 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-4">
                <Music className="text-amber-500 w-6 h-6"/>
                <audio controls className="w-full h-12"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sec.lyrics?.map((lyric: any, lIdx: number) => (
                <div key={lIdx} className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-amber-100 shadow-sm">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center justify-between">
                    <span><HanziDisplay text={lyric.lineHanzi} enableHanzi={enableHanzi} style={hzStyle} /></span>
                    <TTSBtn text={lyric.lineHanzi}/>
                  </div>
                  <div className="text-lg md:text-xl text-indigo-600 mt-2 font-medium" style={pyStyle}>{lyric.linePinyin}</div>
                  <div className="text-base text-slate-500 mt-1">{lyric.lineThai}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 หน้า 7: รองรับ โยงเส้นจับคู่ (matching_exercise) */}
        {sec.type === 'matching_exercise' && (
          <div className="w-full bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 mb-8 flex items-center gap-3"><List className="text-indigo-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sec.pairs?.map((pair: any) => (
                <div key={pair.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                  <div className="flex-1">
                    <div className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center gap-2"><HanziDisplay text={pair.leftHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={pair.leftHanzi} className="ml-2" /></div>
                    <div className="text-lg text-indigo-500 mt-2" style={pyStyle}>{pair.leftPinyin}</div>
                    <div className="text-base text-slate-500 mt-1">{pair.leftThai}</div>
                  </div>
                  <span className="text-slate-300 font-bold text-3xl px-4">➔</span>
                  <div className="flex-1 text-right">
                    <div className="text-2xl md:text-3xl font-serif font-bold text-emerald-600 flex items-center justify-end gap-2"><TTSBtn text={pair.rightHanzi} className="mr-2" /> <HanziDisplay text={pair.rightHanzi} enableHanzi={enableHanzi} style={hzStyle} /></div>
                    <div className="text-lg text-indigo-500 mt-2" style={pyStyle}>{pair.rightPinyin}</div>
                    <div className="text-base text-slate-500 mt-1">{pair.rightThai}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 หน้า 7: รองรับ ตารางสัมภาษณ์เพื่อน (interview_table) */}
        {sec.type === 'interview_table' && (
          <div className="w-full bg-indigo-50/50 p-8 md:p-10 rounded-3xl border border-indigo-100">
            <h3 className="text-xl md:text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3"><Edit3 className="w-8 h-8"/> {sec.sectionTitle}</h3>
            
            {sec.dialoguePrompt && (
              <div className="bg-white p-6 rounded-2xl border border-indigo-100 mb-8 text-lg text-slate-700 shadow-sm space-y-4">
                <span className="font-bold text-indigo-700 text-base block mb-2">บทสนทนาสำหรับใช้ถาม-ตอบ:</span>
                {sec.dialoguePrompt.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base shrink-0">{d.speaker}</div>
                     <div className="flex flex-col">
                        <span className="flex items-center gap-3 font-serif text-2xl md:text-3xl font-bold text-slate-800"><HanziDisplay text={d.hanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={d.hanzi} className="ml-2" /></span>
                        <span className="text-lg text-indigo-500 mt-2" style={pyStyle}>{d.pinyin}</span>
                        <span className="text-base text-slate-500 mt-1">({d.thai})</span>
                     </div>
                  </div>
                ))}
              </div>
            )}
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-center border-collapse min-w-[700px]">
                <thead className="bg-indigo-100 text-indigo-900 text-lg font-bold">
                  <tr>
                    <th className="p-5 border-r border-indigo-200 w-20">#</th>
                    {sec.columns?.map((col: string, idx: number) => (
                      <th key={idx} className="p-5 border-r border-indigo-200 last:border-0">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: sec.rowCount || 5 }).map((_, rIdx) => (
                    <tr key={rIdx} className="border-t border-slate-100 text-lg hover:bg-indigo-50/30 transition-colors">
                      <td className="p-5 font-bold text-slate-400 border-r border-slate-100 bg-slate-50">{rIdx + 1}</td>
                      {sec.columns?.map((_: any, cIdx: number) => (
                        <td key={cIdx} className="p-5 border-r border-slate-100 last:border-0 text-slate-300">......</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🎯 หน้า 8: บทอ่านยาวพร้อมคำถามถูกผิด (reading_passage_exercise) */}
        {sec.type === 'reading_passage_exercise' && (
          <div className="w-full bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{sec.sectionTitle}</h3>
            
            {getAudUrl(sec.audio) && (
              <div className="w-full max-w-md mx-auto bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
                <Music className="text-indigo-600 w-6 h-6"/>
                <audio controls className="w-full h-12 outline-none"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
              </div>
            )}
            
            {getImgUrl(sec.image) && <img src={getImgUrl(sec.image)} alt="passage" className="w-full max-w-lg mx-auto rounded-3xl object-cover shadow-sm mb-8" />}
            
            <div className="bg-amber-50/50 p-8 md:p-10 rounded-3xl border border-amber-200">
              <h4 className="font-bold text-amber-900 text-xl md:text-2xl mb-6">{sec.passageTitle}</h4>
              <div className="text-2xl md:text-4xl font-serif text-slate-800 leading-loose tracking-wide flex items-start gap-3 mb-6 whitespace-pre-line font-medium">
                <span><HanziDisplay text={sec.passageText?.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></span> <TTSBtn text={sec.passageText?.hanzi} className="ml-2" />
              </div>
              <div className="text-xl md:text-2xl text-indigo-600 mb-4 leading-relaxed whitespace-pre-line font-medium" style={pyStyle}>{sec.passageText?.pinyin}</div>
              <div className="text-base md:text-lg text-slate-600 border-t-2 border-amber-100 pt-6 leading-relaxed whitespace-pre-line">{sec.passageText?.thai}</div>
            </div>

            {sec.trueFalseExercises && (
              <div className="space-y-5 mt-10">
                <h4 className="font-bold text-slate-700 text-xl flex items-center gap-2"><HelpCircle size={24}/> พิจารณาประโยคว่าถูกหรือผิด:</h4>
                {sec.trueFalseExercises.map((ex: any, exIdx: number) => (
                  <div key={ex.id} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative group hover:border-amber-300 transition-colors">
                    {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: ex.id, type: 'single_choice', question: ex.statementHanzi, questionPinyin: ex.statementPinyin, questionThai: ex.statementThai, options: [{id:'True', text:'ถูก', hanzi:'✓'}, {id:'False', text:'ผิด', hanzi:'✗'}], answer: ex.correctAnswer === true ? 'True' : ex.correctAnswer === false ? 'False' : '', explanationThai: ex.explanationThai, image: ex.image || sec.image, audio: ex.audio || sec.audio })} className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={16}/> ส่งข้อนี้ขึ้นจอ</button>}
                    
                    <div className="flex-1 w-full pr-24 md:pr-0">
                      <div className="font-serif font-bold text-slate-800 text-xl md:text-2xl flex items-center gap-3">
                         {ex.itemNumber}. <HanziDisplay text={ex.statementHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={ex.statementHanzi} className="ml-2" />
                      </div>
                      <div className="text-base md:text-lg text-indigo-500 mt-3" style={pyStyle}>{ex.statementPinyin}</div>
                      <div className="text-sm md:text-base text-slate-500 mt-1.5">{ex.statementThai}</div>
                    </div>
                    
                    <div className="w-full md:w-auto shrink-0 mt-5 md:mt-0 pt-5 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 md:pl-8 flex flex-col items-center justify-center gap-2">
                      {isEditingThisPage ? (
                         <div className="flex items-center gap-3">
                            <button onClick={() => {
                               const newData = JSON.parse(JSON.stringify(editingPageData));
                               newData.sections[sIdx].trueFalseExercises[exIdx].correctAnswer = true;
                               setEditingPageData(newData);
                            }} className={`px-4 py-2 rounded-xl font-bold border-2 ${ex.correctAnswer === true ? 'bg-green-100 text-green-700 border-green-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-green-50'}`}>✓ ถูก</button>
                            <button onClick={() => {
                               const newData = JSON.parse(JSON.stringify(editingPageData));
                               newData.sections[sIdx].trueFalseExercises[exIdx].correctAnswer = false;
                               setEditingPageData(newData);
                            }} className={`px-4 py-2 rounded-xl font-bold border-2 ${ex.correctAnswer === false ? 'bg-red-100 text-red-700 border-red-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-red-50'}`}>✗ ผิด</button>
                         </div>
                      ) : (
                         <span className={`px-8 py-3 rounded-2xl text-base md:text-lg font-bold shadow-sm ${ex.correctAnswer === true ? 'bg-green-100 text-green-700 border border-green-300' : ex.correctAnswer === false ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-slate-100 text-slate-500'}`}>
                           เฉลย: {ex.correctAnswer === true ? '✓ ถูก (True)' : ex.correctAnswer === false ? '✗ ผิด (False)' : 'ยังไม่เฉลย'}
                         </span>
                      )}
                      {ex.explanationThai && <span className="text-sm text-slate-500 mt-3 max-w-[250px] text-center">({ex.explanationThai})</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🎯 หน้า 9: แบบฝึกเขียนแนะนำตัวตามโครง (writing_guided_fill) */}
        {sec.type === 'writing_guided_fill' && (
          <div className="w-full bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3"><PenTool className="text-indigo-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
              <div className="text-2xl md:text-4xl font-serif text-slate-800 leading-loose tracking-wide"><HanziDisplay text={sec.template?.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></div>
              <div className="text-lg md:text-2xl text-indigo-500 leading-relaxed font-medium" style={pyStyle}>{sec.template?.pinyin}</div>
              <div className="text-base md:text-lg text-slate-500 border-t-2 border-slate-100 pt-5 mt-3 leading-relaxed">{sec.template?.thai}</div>
            </div>
          </div>
        )}

        {/* 🎯 หน้า 9: เรียนรู้อักษรจีนและหมวดอักษร (hanzi_recognition & radical_examples) */}
        {sec.type === 'hanzi_recognition' && (
          <div className="w-full bg-indigo-50/50 p-8 md:p-12 rounded-3xl border border-indigo-100 space-y-10">
            <h3 className="text-2xl md:text-3xl font-bold text-indigo-900">{sec.sectionTitle}</h3>
            
            {sec.radical && (
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-indigo-200 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
                <div className="text-8xl md:text-9xl font-serif font-black text-indigo-600 bg-indigo-50 w-40 h-40 flex items-center justify-center rounded-3xl shrink-0 shadow-inner border border-indigo-100 hover:scale-105 transition-transform cursor-pointer">
                  <HanziDisplay text={sec.radical.radicalHanzi} enableHanzi={enableHanzi} />
                </div>
                <div className="text-center sm:text-left flex-1 mt-2">
                  <div className="font-bold text-slate-800 text-2xl md:text-3xl mb-3">{sec.radical.meaningThai} <span className="text-indigo-500 font-normal">({sec.radical.radicalPinyin})</span></div>
                  <div className="text-base md:text-lg text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">{sec.radical.descriptionThai}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sec.hanziItems?.map((h: any) => (
                <div key={h.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-6 mb-8">
                     <div className="text-6xl md:text-7xl font-serif font-bold text-slate-800 bg-slate-50 w-28 h-28 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 transition-transform cursor-pointer shrink-0">
                       <HanziDisplay text={h.hanzi} enableHanzi={enableHanzi} style={hzStyle} />
                     </div>
                     <div className="flex flex-col flex-1">
                        <span className="text-2xl font-bold text-indigo-600" style={pyStyle}>{h.pinyin}</span>
                        <span className="text-base md:text-lg text-slate-500 mt-2">{h.thai}</span>
                     </div>
                     <TTSBtn text={h.hanzi} className="ml-2" />
                  </div>
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <span className="text-sm font-bold text-slate-400 block uppercase tracking-wider">คำศัพท์ที่เกี่ยวข้อง:</span>
                    {h.words?.map((w: any, wIdx: number) => (
                      <div key={wIdx} className="text-lg md:text-xl text-slate-700 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <b className="font-serif text-3xl"><HanziDisplay text={w.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></b> 
                        <span className="text-base text-indigo-400" style={pyStyle}>({w.pinyin})</span> 
                        <span className="text-base text-slate-500 ml-auto">{w.thai}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sec.type === 'radical_examples' && (
          <div className="w-full bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8">{sec.sectionTitle}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {sec.items?.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="text-6xl md:text-7xl font-serif font-bold text-slate-800 mb-4 hover:scale-110 transition-transform cursor-pointer flex justify-center">
                    <HanziDisplay text={item.hanzi} enableHanzi={enableHanzi} style={hzStyle} />
                  </div>
                  <div className="text-base md:text-lg font-bold text-indigo-500 mb-5" style={pyStyle}>{item.pinyin}</div>
                  <div className="text-sm md:text-base text-slate-500 flex flex-col gap-2 items-center">
                    {item.sampleWords?.map((w: string, wIdx: number) => <span key={wIdx} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 font-serif w-max"><HanziDisplay text={w} enableHanzi={enableHanzi} style={hzStyle} /></span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Circle Target Character */}
        {sec.type === 'circle_target_character' && (
          <div className="w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">{sec.sectionTitle}</h3>
            <div className="space-y-5">
              {sec.exercises?.map((ex: any) => (
                <div key={ex.id} className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-5">
                     <span className="font-bold text-indigo-700 bg-indigo-100 px-6 py-2.5 rounded-full text-lg flex items-center gap-3 shadow-sm">🎯 คำเป้าหมาย: <span className="font-serif text-4xl mx-1"><HanziDisplay text={ex.targetHanzi} enableHanzi={enableHanzi} style={hzStyle} /></span> ({ex.targetPinyin})</span>
                  </div>
                  <div className="space-y-4">
                    {ex.sentences?.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="text-2xl md:text-3xl font-serif text-slate-800 flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                        <span className="tracking-wide"><HanziDisplay text={s.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></span>
                        <div className="flex items-center gap-4">
                           {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('passage', {hanzi: s.hanzi, pinyin: s.pinyin, thai: s.thai, image: s.image, audio: s.audio})} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-base font-bold shadow-sm transition-colors">ส่งขึ้นจอ</button>}
                           <TTSBtn text={s.hanzi} className="ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Component Selection */}
        {sec.type === 'component_selection' && (
          <div className="w-full bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{sec.sectionTitle}</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {sec.wordBank?.map((w: string, idx: number) => (
                <span key={idx} className="bg-white border-2 border-indigo-200 px-8 py-4 rounded-2xl font-bold text-indigo-700 shadow-sm text-3xl font-serif hover:scale-105 transition-transform cursor-pointer"><HanziDisplay text={w} enableHanzi={enableHanzi} style={hzStyle} /></span>
              ))}
            </div>
            {sec.items?.map((it: any) => (
              <div key={it.id} className="text-lg md:text-xl text-slate-500 italic bg-white p-5 rounded-2xl border border-slate-200 text-center">{it.missingPartText}</div>
            ))}
          </div>
        )}

        {/* 🎯 Character Tracing */}
        {sec.type === 'character_tracing' && (
          <div className="w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3"><PenTool className="text-indigo-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sec.characters?.map((ch: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-7xl md:text-8xl font-serif font-black text-slate-800 bg-white w-32 h-32 flex items-center justify-center rounded-3xl shadow-sm border border-slate-200 group-hover:border-indigo-400 transition-colors cursor-pointer hover:scale-105 shrink-0">
                      <HanziDisplay text={ch.hanzi} enableHanzi={enableHanzi} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-600 text-2xl" style={pyStyle}>{ch.pinyin}</span>
                      <span className="text-base text-slate-500 mt-2 bg-slate-200/50 px-3 py-1.5 rounded-lg inline-block w-max">จำนวน {ch.strokeCount} ขีด</span>
                      <span className="text-sm text-slate-400 mt-4 block">คำตัวอย่าง:<br/> <b className="text-slate-600 font-serif text-2xl ml-1 leading-relaxed"><HanziDisplay text={ch.sampleWords?.join(', ')} enableHanzi={enableHanzi} style={hzStyle} /></b></span>
                    </div>
                  </div>
                  <TTSBtn text={ch.hanzi} className="ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Sentence Tracing */}
        {sec.type === 'sentence_tracing' && (
          <div className="w-full bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3"><PenTool className="text-indigo-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="space-y-6">
              {sec.sentences?.map((s: any, idx: number) => (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                  <div className="flex-1">
                    <div className="text-3xl md:text-4xl font-serif font-bold text-slate-800 tracking-wider mb-4"><HanziDisplay text={s.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></div>
                    <div className="text-lg md:text-xl text-indigo-500 font-medium" style={pyStyle}>{s.pinyin}</div>
                    <div className="text-base text-slate-500 mt-2">{s.thai}</div>
                  </div>
                  <TTSBtn text={s.hanzi} className="ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Culture Article */}
        {sec.type === 'culture_article' && (
          <div className="bg-orange-50 p-8 md:p-12 rounded-3xl border border-orange-100">
            <h3 className="text-3xl md:text-4xl font-bold text-orange-800 mb-4">{sec.titleThai}</h3>
            <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed whitespace-pre-line">{sec.contentThai}</p>
            {(sec.timeSequenceTable || sec.explanationTable) && (
              <div className="bg-white rounded-3xl overflow-hidden border border-orange-200 shadow-sm">
                <table className="w-full text-base md:text-lg text-left">
                  <thead className="bg-orange-100 text-orange-900">
                    <tr><th className="p-5">คำศัพท์</th><th className="p-5">ความหมาย</th></tr>
                  </thead>
                  <tbody>
                    {(sec.timeSequenceTable || sec.explanationTable)?.map((item:any, i:number) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-orange-50/50 transition-colors">
                        <td className="p-5 font-bold text-orange-700 text-2xl font-serif flex items-center gap-3">
                          <HanziDisplay text={item.termHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={item.termHanzi} className="ml-2" />
                        </td>
                        <td className="p-5 text-slate-700">{item.explanationThai || item.meaningThai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 🎯 Writing Sample and Practice */}
        {sec.type === 'writing_sample_and_practice' && (
          <div className="w-full bg-slate-800 text-white p-8 md:p-12 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-300">{sec.sectionTitle}</h3>
            <div className="bg-slate-700/50 p-6 md:p-8 rounded-2xl border border-slate-600">
              <div className="text-2xl md:text-3xl font-serif leading-loose mb-3 flex items-start gap-3">
                <span><HanziDisplay text={sec.sampleText?.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></span> <TTSBtn text={sec.sampleText?.hanzi} className="ml-2" />
              </div>
              <div className="text-lg md:text-xl text-indigo-400 mb-2" style={pyStyle}>{sec.sampleText?.pinyin}</div>
              <div className="text-sm md:text-base text-slate-400 border-t border-slate-600 pt-4 mt-2">{sec.sampleText?.thai}</div>
            </div>
            {sec.template && (
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 text-slate-300 text-base">
                <b className="block mb-3 text-indigo-300">โครงร่างสำหรับฝึกแต่ง:</b>
                <div className="font-serif text-xl md:text-2xl leading-loose"><HanziDisplay text={sec.template.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></div>
                <div className="text-sm text-slate-400 mt-3 border-t border-slate-700 pt-3">{sec.template.thai}</div>
              </div>
            )}
          </div>
        )}

        {/* 🎯 End of Lesson Quiz */}
        {sec.type === 'end_of_lesson_quiz' && (
          <div className="w-full space-y-8">
            <h3 className="text-2xl font-bold text-amber-700 flex items-center gap-3"><ClipboardList className="w-8 h-8"/> {sec.sectionTitle}</h3>
            {sec.wordBank && (
              <div className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200 shadow-sm">
                <span className="font-bold text-amber-900 text-lg block mb-4 flex items-center gap-2"><List size={20}/> กล่องตัวเลือกคำศัพท์ (Word Bank):</span>
                <div className="flex flex-wrap gap-3">
                  {sec.wordBank.map((wb: any) => (
                    <span key={wb.id} className="bg-white border-2 border-amber-200 px-5 py-2.5 rounded-2xl text-lg font-bold shadow-sm text-slate-700 flex items-center gap-2 hover:scale-105 transition-transform">
                      <b className="text-amber-600 bg-amber-100 w-8 h-8 flex items-center justify-center rounded-xl">{wb.id}</b> 
                      <span className="font-serif text-3xl mx-1"><HanziDisplay text={wb.hanzi} enableHanzi={enableHanzi} style={hzStyle} /></span> 
                      <span className="text-sm text-slate-500 font-normal">({wb.pinyin || wb.thai})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-6">
              {sec.questions?.map((q: any, qIdx: number) => (
                <div key={q.id} className="relative group bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-3xl hover:border-amber-300 transition-colors shadow-sm">
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { ...q, question: q.questionHanzi || q.sentencePattern || q.question, answer: q.correctAnswer || q.answer, type: q.type || 'single_choice', image: q.image || sec.image, audio: q.audio || sec.audio })} className="absolute top-6 right-6 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-transform active:scale-95 z-10"><Send size={16}/> ส่งข้อนี้ขึ้นจอเด็ก</button>}
                  
                  <div className="flex gap-4 mb-6 pr-32">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white bg-amber-500 shrink-0 shadow-sm">{q.itemNumber || q.sortOrder || qIdx + 1}</div>
                    <div className="flex flex-col justify-center">
                       <div className="text-xl md:text-3xl font-serif font-bold text-slate-800 flex items-center gap-2">
                          <HanziDisplay text={q.questionHanzi || q.sentencePattern || q.question} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={q.questionHanzi || q.sentencePattern || q.question} className="ml-2"/>
                       </div>
                       {(q.pinyin || q.questionPinyin || q.thai || q.questionThai) && (
                          <div className="mt-2 text-base text-slate-500">
                             <span className="text-indigo-500 mr-2" style={pyStyle}>{q.pinyin || q.questionPinyin}</span>
                             {q.thai || q.questionThai}
                          </div>
                       )}
                    </div>
                  </div>
                  
                  {getImgUrl(q.image) && <img src={getImgUrl(q.image)} alt="img" className="w-full max-w-md ml-16 mt-4 object-cover rounded-2xl shadow-sm border border-slate-200" />}
                  {getAudUrl(q.audio) && <audio controls className="w-full max-w-md ml-16 mt-4 h-12"><source src={getAudUrl(q.audio)} type="audio/mpeg" /></audio>}
                  
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-16 mt-6">
                      {q.options.map((o:any) => {
                         const exactAns = q.correctAnswer || q.answer;
                         const isCorrect = exactAns?.includes(o.id) || exactAns?.includes(o.hanzi);
                         return (
                           <div key={o.id || o.hanzi} className={`bg-white px-5 py-4 rounded-2xl border-2 flex items-center gap-4 ${isCorrect && !isEditingThisPage ? 'border-green-400 text-green-800 bg-green-50 font-bold shadow-sm' : 'border-slate-200 text-slate-600'}`}>
                              {o.id && <span className="bg-slate-100 w-10 h-10 flex items-center justify-center rounded-xl text-base font-bold shrink-0">{o.id}</span>}
                              <span className="text-3xl font-serif"><HanziDisplay text={o.hanzi || o.text} enableHanzi={enableHanzi} style={hzStyle} /></span>
                              {o.pinyin && <span className="text-sm text-slate-400" style={pyStyle}>({o.pinyin})</span>}
                           </div>
                         )
                      })}
                    </div>
                  )}
                  {(q.explanationThai || q.explanation || q.correctAnswer) && !isEditingThisPage && (
                     <div className="mt-8 pl-16 text-base font-bold text-emerald-700 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                       ✅ เฉลย: <HanziDisplay text={q.correctAnswer} enableHanzi={enableHanzi} style={hzStyle} /> 
                       <span className="text-sm font-normal text-emerald-600 ml-2 block mt-1">({q.explanationThai || q.explanation})</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Open Questions */}
        {sec.type === 'open_questions' && (
          <div className="w-full bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4 flex items-center gap-3"><MessageCircle className="text-indigo-500 w-8 h-8"/> {sec.sectionTitle}</h3>
            <div className="space-y-8">
              {sec.questions?.map((q: any) => (
                <div key={q.id} className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-200 relative group hover:border-indigo-300 transition-colors">
                  {/* 🎯 นำ image และ audio ใส่เข้าไปในการกดส่งให้เด็ก */}
                  {isTeacherOverlay && !isEditingThisPage && <button onClick={() => broadcastToStudent('advanced_quiz', { id: q.id, type: 'fill_in_blank', question: q.questionHanzi, answer: q.sampleAnswer, explanationThai: 'แนวคำตอบปลายเปิด', image: q.image || sec.image, audio: q.audio || sec.audio })} className="absolute top-5 right-5 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={16}/> ส่งข้อนี้เป็นกล่องพิมพ์ตอบ</button>}
                  <div className="text-2xl md:text-4xl font-serif font-bold text-slate-800 flex items-start gap-4 pr-32">
                     <span className="text-indigo-500">{q.itemNumber}.</span> 
                     <div className="flex flex-col">
                        <div className="flex items-center gap-3"><HanziDisplay text={q.questionHanzi} enableHanzi={enableHanzi} style={hzStyle} /> <TTSBtn text={q.questionHanzi} className="ml-2" /></div>
                        <div className="text-xl text-indigo-500 mt-3 font-medium font-sans" style={pyStyle}>{q.questionPinyin}</div>
                        <div className="text-lg text-slate-500 mt-1 font-sans">{q.questionThai}</div>
                     </div>
                  </div>
                  {q.sampleAnswer && !isEditingThisPage && (
                    <div className="mt-8 pt-6 border-t border-slate-200/80 text-xl text-emerald-700 bg-emerald-50/50 p-6 rounded-2xl ml-8 md:ml-12">
                      <b className="flex items-center gap-2 mb-4 text-base text-emerald-800"><Edit3 size={20}/> ตัวอย่างแนวคำตอบ:</b> 
                      <span className="font-serif text-3xl block leading-relaxed"><HanziDisplay text={q.sampleAnswer} enableHanzi={enableHanzi} style={hzStyle} /></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLiveBoardContent = (boardItem: any, isTeacherOverlay: boolean) => {
    if (!boardItem) return null;
    const { type, data: payload } = boardItem;

    return (
      <div className="w-full relative pointer-events-auto flex flex-col items-center justify-center min-h-[50vh]">
         {type === 'leaderboard' && (
           <div className="bg-gradient-to-b from-amber-400 to-orange-500 p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-amber-200 w-full max-w-2xl mx-auto text-white">
              <div className="text-center mb-8">
                 <Trophy size={80} className="mx-auto mb-4 text-yellow-200 drop-shadow-md animate-bounce" />
                 <h2 className="text-4xl md:text-6xl font-black drop-shadow-lg">ตารางคะแนนรวม</h2>
                 <p className="text-xl md:text-2xl mt-2 text-amber-100 font-medium">มีนักเรียนออนไลน์ {payload.length} คน</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 md:p-6 space-y-4 shadow-inner">
                 {!payload || payload.length === 0 ? (
                    <div className="text-center font-bold text-2xl py-8">ยังไม่มีนักเรียนเข้าร่วม</div>
                 ) : (
                    payload.map((student: any, idx: number) => (
                       <div key={student.name} className="flex items-center justify-between bg-white text-slate-800 p-4 md:p-5 rounded-2xl shadow-md border-2 border-white/50">
                          <div className="flex items-center gap-4 md:gap-5">
                             <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-sm ${idx===0 ? 'bg-amber-400 text-white ring-4 ring-amber-200' : 'bg-slate-100 text-slate-500'}`}>{idx+1}</div>
                             <span className="font-bold text-2xl md:text-3xl">{student.name}</span>
                          </div>
                          <span className="font-black text-3xl md:text-4xl text-emerald-500">{student.score} <span className="text-xl font-bold">แต้ม</span></span>
                       </div>
                    ))
                 )}
              </div>
           </div>
         )}

         {type === 'full_page' && (
           <div className="w-full bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-200 mx-auto max-w-5xl h-full overflow-y-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200 text-center">{payload.title}</h2>
              {payload.instructionThai && <p className="text-center text-slate-500 mb-8">📌 {payload.instructionThai}</p>}
              {getImgUrl(payload.image) && <img src={getImgUrl(payload.image)} className="w-full max-w-lg mx-auto rounded-2xl shadow-sm mb-8 object-cover" alt="page" />}
              {getAudUrl(payload.audio) && (
                 <div className="w-full max-w-md mx-auto mb-8 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm"><Music size={16} /> คลิปเสียงประจำหน้า</div>
                    <audio controls className="w-full h-10 outline-none"><source src={getAudUrl(payload.audio)} type="audio/mpeg" /></audio>
                 </div>
              )}
              {payload.sections && payload.sections.map((sec: any, sIdx: number) => (
                <div key={sIdx} className="mb-12 last:mb-0 w-full">
                  {renderSectionContent(sec, false)}
                </div>
              ))}
           </div>
         )}

         {(type === 'intro' || type === 'passage') && type !== 'full_page' && (
           <div className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl text-center md:text-left border-4 border-indigo-200 w-full mx-auto max-w-4xl flex flex-col items-center">
             {/* 🎯 นำภาพและเสียงที่ส่งมา แสดงบนจอเด็ก */}
             {getImgUrl(payload.image) && <img src={getImgUrl(payload.image)} alt="img" className="w-full max-w-sm object-contain rounded-2xl shadow-sm mb-6" />}
             {getAudUrl(payload.audio) && <audio controls className="w-full max-w-sm h-12 mb-6"><source src={getAudUrl(payload.audio)} type="audio/mpeg" /></audio>}
             <div className="text-xl md:text-3xl lg:text-4xl font-serif font-medium text-indigo-900 mb-4 drop-shadow-sm leading-snug whitespace-pre-line flex items-center justify-center gap-3">
                <HanziDisplay text={payload.hanzi} enableHanzi={false} /> <TTSBtn text={payload.hanzi} className="ml-2" />
             </div>
             {payload.pinyin && <div className="text-lg md:text-xl text-indigo-600 mb-2 md:mb-4 font-medium whitespace-pre-line">{payload.pinyin}</div>}
             {payload.thai && <div className="text-base md:text-lg text-slate-600 font-medium whitespace-pre-line pt-4 border-t border-indigo-100">{payload.thai}</div>}
           </div>
         )}

         {type === 'vocab' && type !== 'full_page' && (
           <div className="group relative [perspective:1000px] h-[250px] md:h-[350px] w-full max-w-sm md:max-w-md mx-auto cursor-pointer shadow-2xl rounded-3xl" onClick={() => { if(!isTeacherOverlay) setStudentFlipped(!studentFlipped); speak(payload.hanzi); }}>
             <div className={`absolute w-full h-full transition-all duration-700 [transform-style:preserve-3d] rounded-3xl ${studentFlipped && !isTeacherOverlay ? '[transform:rotateY(180deg)]' : ''}`}>
               <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-4 border-indigo-200 rounded-3xl flex flex-col items-center justify-center p-4 md:p-6">
                 {getImgUrl(payload.image) && <img src={getImgUrl(payload.image)} alt={payload.hanzi} className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl shadow-sm mb-3" />}
                 <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
                    <span className="text-4xl md:text-5xl font-serif text-slate-800 drop-shadow-md font-semibold"><HanziDisplay text={payload.hanzi} enableHanzi={false} /></span>
                    <TTSBtn text={payload.hanzi} className="ml-2" />
                 </div>
                 {!isTeacherOverlay && <div className="text-xs md:text-sm text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">แตะเพื่อพลิกดูความหมาย</div>}
                 {isTeacherOverlay && <div className="text-sm md:text-lg text-indigo-500 font-bold mt-2">{payload.pinyin} - {payload.thai}</div>}
               </div>
               <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex flex-col items-center justify-center p-4 md:p-6 text-white text-center">
                 <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 drop-shadow-sm">{payload.pinyin}</div>
                 <div className="text-lg md:text-2xl mb-2 md:mb-4">{payload.thai}</div>
               </div>
             </div>
           </div>
         )}

         {type === 'dialogue' && type !== 'full_page' && (
           <div className="w-full flex flex-col gap-4 md:gap-6 max-w-2xl mx-auto">
             {payload.map((chat: any, dIdx: number) => {
               const isA = chat.speaker === 'A';
               return (
                 <div key={dIdx} className={`flex w-full gap-2 md:gap-4 ${isA ? 'justify-start' : 'justify-end'}`}>
                   {isA && <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-lg md:text-xl shrink-0 shadow-lg">{chat.speaker}</div>}
                   <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-3xl shadow-xl border-2 ${isA ? 'bg-white border-slate-200 rounded-tl-none' : 'bg-emerald-50 border-emerald-300 rounded-tr-none text-right'}`}>
                     <div className="text-lg md:text-2xl font-serif text-slate-800 mb-1 md:mb-2 leading-snug font-semibold flex items-center gap-2">
                        <HanziDisplay text={chat.hanzi} enableHanzi={false} /> <TTSBtn text={chat.hanzi} className="ml-2" />
                     </div>
                     {chat.pinyin && <div className="text-base md:text-lg text-blue-600 mb-1">{chat.pinyin}</div>}
                     {chat.thai && <div className="text-sm md:text-base text-slate-500">{chat.thai}</div>}
                   </div>
                   {!isA && <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg md:text-xl shrink-0 shadow-lg">{chat.speaker}</div>}
                 </div>
               );
             })}
           </div>
         )}

         {type === 'advanced_quiz' && (
           <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-200 w-full mx-auto max-w-4xl">
              <div className="text-center mb-8 flex flex-col items-center">
                 {/* 🎯 แสดงภาพและเสียง */}
                 {getImgUrl(payload.image) && <img src={getImgUrl(payload.image)} alt="img" className="w-full max-w-sm object-contain rounded-2xl shadow-sm mb-6" />}
                 {getAudUrl(payload.audio) && <audio controls className="w-full max-w-sm h-12 mb-6"><source src={getAudUrl(payload.audio)} type="audio/mpeg" /></audio>}
                 <h2 className="text-xl md:text-3xl font-serif font-semibold text-slate-800 leading-snug flex items-center justify-center gap-2">
                    <HanziDisplay text={payload.question || payload.questionHanzi} enableHanzi={false} /> <TTSBtn text={payload.question || payload.questionHanzi} className="ml-2" />
                 </h2>
                 {(payload.pinyin || payload.questionPinyin) && <p className="text-lg md:text-2xl text-indigo-500 mt-2">{payload.pinyin || payload.questionPinyin}</p>}
                 {(payload.thai || payload.questionThai) && <p className="text-base md:text-lg text-slate-500 mt-1">{payload.thai || payload.questionThai}</p>}
              </div>

              {payload.options && Array.isArray(payload.options) && payload.options.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {payload.options.map((opt:any) => {
                       const val = opt.id || opt.hanzi || opt.text;
                       const isSelected = studentAnswer === val;
                       const isCorrect = val === payload.answer;
                       let btnClass = "bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-700";
                       if (studentAnswer || isTeacherOverlay) {
                          if (isSelected && isCorrect) btnClass = "bg-green-100 border-green-500 text-green-700";
                          else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-500 text-red-700";
                          else if (isCorrect) btnClass = "bg-green-50 border-green-300 text-green-600";
                          else btnClass = "bg-slate-50 border-slate-200 opacity-50";
                       }
                       return (
                          <button 
                             key={val}
                             onClick={() => handleStudentAnswer(val)}
                             disabled={!!studentAnswer || isTeacherOverlay}
                             className={`p-4 md:p-5 rounded-2xl border-4 font-bold text-xl md:text-2xl transition-all shadow-sm flex items-center justify-center gap-3 ${btnClass}`}
                          >
                             {opt.id && <span className="text-xs bg-white/50 px-2 py-1 rounded-lg">{opt.id}</span>}
                             <HanziDisplay text={opt.hanzi || opt.text} enableHanzi={false} />
                          </button>
                       );
                    })}
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-6">
                    <input 
                      type="text" 
                      value={studentAnswer ? (studentAnswer as string) : (draftAnswer as string) || ''}
                      onChange={(e) => setDraftAnswer(e.target.value)}
                      disabled={!!studentAnswer || isTeacherOverlay}
                      className={`text-center text-2xl md:text-3xl font-bold p-3 md:p-5 border-4 rounded-2xl outline-none transition-colors w-full max-w-sm ${studentAnswer ? (studentAnswer.trim().toLowerCase() === (payload.answer || '').trim().toLowerCase() ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-indigo-200 focus:border-indigo-500 bg-slate-50'}`}
                      placeholder="พิมพ์คำตอบ..."
                    />
                    {!isTeacherOverlay && !studentAnswer && (
                       <button onClick={() => { if(draftAnswer.trim()) handleStudentAnswer(draftAnswer.trim()); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-transform active:scale-95">ส่งคำตอบ</button>
                    )}
                 </div>
              )}
           </div>
         )}
      </div>
    );
  };

  const renderImageForTeacherList = (img: any) => {
    if (!img) return null;
    return (
      <div className="relative mb-8 group w-full">
         {getImgUrl(img) ? <img src={getImgUrl(img)} alt={getImgAlt(img)} className="w-full max-w-lg mx-auto rounded-3xl shadow-sm object-cover" /> : <div className="w-full max-w-lg mx-auto bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 text-indigo-400"><ImageIcon size={64} className="opacity-50" /><span className="text-base font-bold text-indigo-600 px-5 py-1.5 bg-indigo-100 rounded-full">{getImgAlt(img)}</span></div>}
         {(userRole === 'teacher' || userRole === 'admin') && <button onClick={() => broadcastToStudent('image', img)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 scale-100 md:scale-90 group-hover:scale-100 text-base whitespace-nowrap"><Send size={20}/> ส่งรูปนี้ขึ้นจอเด็ก</button>}
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen transition-all duration-500 items-start mt-4 md:mt-8 font-sans text-left relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      
      {/* CSS สำหรับ Effect แจกไพ่ (Pop In) */}
      <style>{`
        @keyframes dealCard {
          0% { transform: translateY(100vh) scale(0.5) rotate(10deg); opacity: 0; }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-deal-card {
          animation: dealCard 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* 🏆 WIDGET ลอยตัว: กระดานคะแนนและรายชื่อเด็ก */}
      {(userRole === 'teacher' || userRole === 'admin') && roomPin && (
         <div className="fixed top-24 right-6 md:top-28 md:right-8 z-[99999] flex flex-col items-end drop-shadow-2xl transition-all">
            {isLeaderboardOpen ? (
               <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-amber-300 w-80 md:w-96 overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 flex items-center justify-between cursor-pointer text-white" onClick={() => setIsLeaderboardOpen(false)}>
                     <div className="flex items-center gap-2">
                       <Trophy size={24} className="text-yellow-200 animate-bounce" />
                       <div>
                         <h3 className="font-bold text-lg leading-tight">ตารางคะแนนและผู้เรียน</h3>
                         <span className="text-xs text-amber-100 font-medium flex items-center gap-1 mt-0.5"><Users size={12}/> นักเรียนในห้อง: {joinedCount} คน</span>
                       </div>
                     </div>
                     <ChevronDown size={24} className="hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-4 max-h-[45vh] overflow-y-auto space-y-2 bg-slate-50/70">
                     {leaderboardData.length === 0 ? (
                        <div className="text-center text-slate-400 py-8 text-sm font-medium flex flex-col items-center gap-2">
                          <Users size={32} className="opacity-40" />
                          <span>ยังไม่มีนักเรียนพิมพ์ชื่อเข้าห้อง</span>
                        </div>
                     ) : (
                        leaderboardData.map((student, idx) => (
                           <div key={student.name} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${idx===0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx+1}</div>
                                 <span className="font-bold text-slate-700 text-base truncate max-w-[120px]">{student.name}</span>
                              </div>
                              <span className="font-black text-emerald-600 text-base">{student.score} แต้ม</span>
                           </div>
                        ))
                     )}
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2">
                     <button onClick={() => broadcastToStudent('leaderboard', leaderboardData)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md text-sm">
                        <Send size={16}/> ส่งกระดานคะแนนขึ้นจอเด็ก
                     </button>
                     <button onClick={resetAllScoresAndStudents} className="w-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs">
                        <RotateCcw size={14}/> ล้างรายชื่อและคะแนนห้องนี้
                     </button>
                  </div>
               </div>
            ) : (
               <button onClick={() => setIsLeaderboardOpen(true)} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-3.5 md:p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-bold hover:scale-110 border-4 border-white">
                  <Trophy size={28}/>
                  {joinedCount > 0 && <span className="bg-red-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full">{joinedCount}</span>}
               </button>
            )}
         </div>
      )}

      {/* 🎯 STUDENT LIVE VIEW (หน้าจอเด็กเวลารับข้อมูล - แอนิเมชันแจกไพ่) */}
      {isLiveActive && userRole === 'student' && (
         <div className="fixed inset-0 z-[6000] bg-slate-100/95 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden p-4 md:p-8">
            <div className="w-full relative animate-deal-card">
               {/* isTeacherOverlay = false เพื่อให้คลิกพลิกการ์ดได้ตามปกติ */}
               {renderLiveBoardContent(liveSessionData.dynamic_board, false)}
            </div>
            <svg className="absolute inset-0 w-full h-full z-[100] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
               {liveSessionData.dynamic_board.lines?.map((line: any, i: number) => <polyline key={`s-${i}`} points={line.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />)}
            </svg>
         </div>
      )}

      {/* 🎯 TEACHER LIVE OVERLAY (หน้าจอจำลองของครู) */}
      {isLiveActive && (userRole === 'teacher' || userRole === 'admin') && (
         <div className="fixed inset-0 z-[6000] bg-slate-800 flex flex-col items-center justify-center overflow-hidden p-2 md:p-6">
            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md px-2 md:px-4 py-2 rounded-2xl shadow-xl flex items-center justify-between gap-1 md:gap-2 border-2 border-indigo-200 mb-2 md:mb-4 shrink-0 overflow-x-auto">
               <div className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-100 text-indigo-800 font-bold rounded-xl flex items-center gap-1.5 md:gap-2 text-xs md:text-base"><Monitor size={16}/> กำลังแสดงบนกระดานเด็ก</div>
               <div className="flex items-center gap-1 md:gap-2">
                 <button onClick={() => setIsDrawMode(!isDrawMode)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-1 md:gap-2 border-2 text-xs md:text-base ${isDrawMode ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}><Edit3 size={16}/> {isDrawMode ? 'กำลังเขียน...' : 'โหมดปากกา'}</button>
                 <button onClick={clearDrawings} className="px-2 md:px-3 py-1.5 md:py-2 text-slate-500 hover:text-red-500 rounded-xl"><Trash2 size={16}/></button>
               </div>
               <button onClick={clearStudentBoard} className="px-3 py-1.5 md:px-6 md:py-2 bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 text-xs md:text-base"><X size={16}/> ดึงกลับ</button>
            </div>
            <div className="w-full max-w-4xl flex-1 bg-slate-100 rounded-3xl shadow-2xl overflow-y-auto border-4 border-indigo-500 relative flex justify-center items-center p-4">
               <div className="w-full relative">
                 {/* isTeacherOverlay = true เพื่อโชว์คำแปล ไม่ต้องพลิกการ์ด */}
                 {renderLiveBoardContent(liveSessionData.dynamic_board, true)}
                 
                 <svg className={`absolute inset-0 w-full h-full z-[100] ${isDrawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`} viewBox="0 0 100 100" preserveAspectRatio="none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
                    {liveSessionData.dynamic_board.lines?.map((line: any, i: number) => <polyline key={`s-${i}`} points={line.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />)}
                    {currentPath.length > 0 && <polyline points={currentPath.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
                 </svg>
               </div>
            </div>
         </div>
      )}

      {/* แถบ Panel เครื่องมือด้านซ้าย (แถบเมนูหลัก) */}
      <div className={isLiveActive ? 'hidden md:block opacity-0 pointer-events-none' : ''}>
         <SharedTeacherPanel userRole={userRole} roomPin={roomPin} isSlideVisible={true} />
      </div>

      {/* 🎯 สำหรับนักเรียน: หน้าจอรอเรียน (พิมพ์ชื่อ & รอครูส่ง Board) */}
      {userRole === 'student' && !isLiveActive && (
        <div className="flex w-full min-h-[80vh] items-center justify-center p-6 relative z-[1]">
          {!isJoined ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-indigo-100 w-full max-w-md flex flex-col items-center animate-fade-in text-center">
              <Users size={64} className="text-indigo-500 mb-6 bg-indigo-50 p-4 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 mb-2">เข้าร่วมห้องเรียน</h2>
              <p className="text-slate-500 mb-8 font-medium text-lg">PIN: {roomPin}</p>
              
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="พิมพ์ชื่อของคุณ..."
                className="w-full text-center text-2xl font-bold bg-slate-50 border-4 border-slate-200 focus:border-indigo-500 rounded-2xl px-6 py-4 outline-none mb-6 transition-colors shadow-inner placeholder:font-normal placeholder:text-xl"
                onKeyDown={(e) => { if(e.key === 'Enter') handleStudentJoin(); }}
              />
              <button 
                onClick={handleStudentJoin}
                disabled={!studentName.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} /> เริ่มเรียนกันเลย!
              </button>
            </div>
          ) : (
            <div className="text-center bg-white p-10 md:p-16 rounded-3xl shadow-xl border-4 border-indigo-50 flex flex-col items-center">
              <Monitor size={80} className="text-indigo-200 mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-slate-800 mb-3">สวัสดี, {studentName}! 👋</h2>
              <p className="text-lg text-slate-500">รอคุณครูส่งเนื้อหาหรือแบบฝึกหัดขึ้นกระดานครับ...</p>
              <div className="flex gap-3 mt-8">
                 <div className="w-4 h-4 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-4 h-4 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-4 h-4 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 สำหรับครู / แอดมิน: แสดงเนื้อหาทั้งหมดเพื่อพรีวิวและเตรียมสอน */}
      {(userRole === 'teacher' || userRole === 'admin') && !isLiveActive && (
        <div className="flex-1 w-full p-3 md:p-8 relative z-[1] pb-32 max-w-5xl mx-auto">
          
          {/* แถบสถานะห้องเรียน (PIN & จำนวนเด็ก) */}
          {roomPin && (
              <div className="mb-6 md:mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-5 md:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                 <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
                       <Users size={28} className="text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <div className="flex items-center gap-3">
                         <span className="font-bold text-xl md:text-2xl">ห้องเรียน PIN: {roomPin}</span>
                         <span className="bg-emerald-400 text-emerald-950 text-sm font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">LIVE</span>
                       </div>
                       <div className="text-sm md:text-base text-indigo-100 flex items-center gap-3 mt-1 overflow-x-auto whitespace-nowrap pb-1">
                         <span>มีนักเรียนออนไลน์ <b>{joinedCount} คน</b></span>
                         {joinedCount > 0 && <span className="text-white/60 shrink-0">|</span>}
                         <div className="flex flex-nowrap gap-2">
                           {allStudentNames.map((name: string) => (
                             <span key={name} className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 shrink-0">
                               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                               {name}
                             </span>
                           ))}
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
          )}

          <div className="mb-4 md:mb-6 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-base font-bold mb-4">บทที่ {lessonData.lessonNumber} | {lessonData.topic}</div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-3">{lessonData.titleChinese}</h1>
            <p className="text-2xl md:text-3xl text-emerald-600 font-medium mb-3">{lessonData.titlePinyin}</p>
            <p className="text-lg md:text-xl text-slate-500">{lessonData.titleThai}</p>
          </div>

          <div className="flex flex-col gap-10 md:gap-12 w-full">
            {lessonData.pages.map((page: any, index: number) => {
              return (
                <div key={page.id || index} className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative group/page">
                  
                  {/* 🎯 ปุ่มสำหรับ Edit บทเรียน Inline เฉพาะ Admin / Teacher */}
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <button 
                       onClick={() => {
                          if (editingPageIdx === index) {
                             setEditingPageIdx(null); setEditingPageData(null);
                          } else {
                             setEditingPageIdx(index); setEditingPageData(JSON.parse(JSON.stringify(page)));
                          }
                       }} 
                       className={`absolute top-6 right-6 z-20 px-5 py-2.5 rounded-xl text-base font-bold flex items-center gap-2 shadow-md transition-all ${editingPageIdx === index ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                    >
                       {editingPageIdx === index ? <X size={18} /> : <Edit3 size={18} />} 
                       {editingPageIdx === index ? 'ยกเลิกการแก้ไข' : 'แก้ไขหน้านี้'}
                    </button>
                  )}

                  <div className="absolute top-6 left-8 text-base font-bold text-slate-300">หน้า {page.pageNumber || index + 1}</div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-4 pr-20 mt-10">
                     <BookOpen className="text-indigo-500 w-8 h-8 md:w-10 md:h-10"/> {page.title}
                  </h2>
                  {page.instructionThai && <p className="text-slate-600 mb-8 bg-slate-50 inline-block px-5 py-2.5 rounded-xl text-base md:text-lg border border-slate-100">📌 {page.instructionThai}</p>}
                  
                  {/* 🎯 ปุ่มส่งหน้าเนื้อหานี้ขึ้นกระดานเด็ก */}
                  {(page.sections || page.content) && (userRole === 'teacher' || userRole === 'admin') && (
                     <div className="flex justify-end mb-10 border-b border-slate-100 pb-10">
                        <button onClick={() => broadcastToStudent('full_page', page)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md flex items-center gap-3 hover:scale-105 transition-transform">
                           <Send size={24}/> ส่งเนื้อหาทั้งหน้านี้ขึ้นจอเด็ก
                        </button>
                     </div>
                  )}

                  {/* 🎯 ส่วนหน้าต่างการแก้ไข Inline Editor */}
                  {editingPageIdx === index && editingPageData && (
                     <div className="mb-12 bg-indigo-50 p-8 rounded-3xl border-4 border-indigo-200 shadow-inner flex flex-col gap-8 relative">
                        <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-5">
                           <h3 className="text-2xl font-black text-indigo-800 flex items-center gap-3"><Edit3 size={28}/> ระบบแก้ไขเนื้อหา (หน้านี้)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-h-[500px] overflow-y-auto">
                              <h4 className="font-bold text-slate-700 mb-5 flex items-center gap-2 border-b pb-3"><AlignLeft size={20}/> แก้ไขข้อความ</h4>
                              <SmartForm data={editingPageData} onChange={(path: any, val: any) => { const newData = JSON.parse(JSON.stringify(editingPageData)); setValueByPath(newData, path, val); setEditingPageData(newData); }} />
                           </div>

                           <div className="flex flex-col gap-8">
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-3"><Music size={20}/> แก้ไขไฟล์เสียงหลักของหน้า</h4>
                                 <input type="text" placeholder="URL ไฟล์เสียง..." value={editingPageData.audio?.url || editingPageData.audio?.audioUrl || ''} onChange={(e) => {
                                    const newData = JSON.parse(JSON.stringify(editingPageData));
                                    if (!newData.audio) newData.audio = {};
                                    newData.audio.url = e.target.value;
                                    setEditingPageData(newData);
                                 }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-base outline-none focus:border-indigo-400 mb-3" />
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 max-h-[400px] overflow-y-auto">
                                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-3"><ImageIcon size={20}/> แก้ไขรูปภาพ</h4>
                                 {extractImageAssets(editingPageData).length === 0 ? <p className="text-base text-slate-400">ไม่พบจุดอัปโหลดรูป</p> : (
                                    <div className="flex flex-col gap-4">
                                       {extractImageAssets(editingPageData).map((asset, aIdx) => {
                                          const currentUrl = asset.node.imageUrl || asset.node.url;
                                          return (
                                             <div key={aIdx} className="bg-slate-50 p-4 rounded-xl border flex items-center gap-4">
                                                <div className="w-16 h-16 shrink-0 bg-white rounded-xl border overflow-hidden flex items-center justify-center">
                                                  {currentUrl ? <img src={currentUrl} className="w-full h-full object-cover" alt="prev"/> : <span className="text-xs text-slate-400">ไม่มีรูป</span>}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                   <span className="text-sm font-bold text-slate-800 line-clamp-1 block mb-3">{asset.label}</span>
                                                   <input type="file" accept="image/*" id={`up-${index}-${aIdx}`} className="hidden" onChange={async (e) => {
                                                      const file = e.target.files?.[0];
                                                      if(!file) return;
                                                      try {
                                                         const fileExt = file.name.split('.').pop();
                                                         const fileName = `media_${Date.now()}_${aIdx}.${fileExt}`;
                                                         const { error } = await supabase.storage.from('images').upload(`lessons/images/${fileName}`, file);
                                                         if (error) throw error;
                                                         const { data: pubUrl } = supabase.storage.from('images').getPublicUrl(`lessons/images/${fileName}`);
                                                         const newData = JSON.parse(JSON.stringify(editingPageData));
                                                         updateJsonByPath(newData, asset.path, 'url', pubUrl.publicUrl);
                                                         setEditingPageData(newData);
                                                      } catch (err:any) { alert('Upload failed: ' + err.message); }
                                                   }}/>
                                                   <div className="flex gap-3">
                                                      <button onClick={() => document.getElementById(`up-${index}-${aIdx}`)?.click()} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm">อัปโหลดรูป</button>
                                                      {currentUrl && <button onClick={() => {
                                                         const newData = JSON.parse(JSON.stringify(editingPageData));
                                                         updateJsonByPath(newData, asset.path, 'url', null);
                                                         setEditingPageData(newData);
                                                      }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold shadow-sm">ลบรูป</button>}
                                                   </div>
                                                </div>
                                             </div>
                                          )
                                       })}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* 🎯 Hanzi Write Toggle Per Section และช่องใส่ขนาดฟอนต์อิสระ */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-4 w-full">
                           <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-3"><PenTool size={20}/> ตั้งค่าส่วนเสริม (Hanzi / ขนาดอักษร) แยกตามหมวด</h4>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {editingPageData.sections?.map((sec: any, sIdx: number) => (
                                 <div key={sIdx} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                       <span className="mt-1">
                                         {sec.enableHanziWriter ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                                       </span>
                                       <span className="text-sm font-bold text-slate-700 flex-1">
                                          ส่วนที่ {sIdx + 1}: {sec.sectionTitle || sec.type}
                                       </span>
                                       <input type="checkbox" checked={sec.enableHanziWriter || false} onChange={(e) => {
                                          const newData = JSON.parse(JSON.stringify(editingPageData));
                                          newData.sections[sIdx].enableHanziWriter = e.target.checked;
                                          setEditingPageData(newData);
                                       }} className="hidden" />
                                    </label>

                                    <div className="flex items-center gap-3 mt-2">
                                       <div className="flex-1 flex flex-col gap-1.5">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase">ขนาดตัวจีน (px)</label>
                                          <input type="number" value={sec.hanziFontSize || ''} placeholder="เช่น 40" onChange={(e) => {
                                             const newData = JSON.parse(JSON.stringify(editingPageData));
                                             newData.sections[sIdx].hanziFontSize = e.target.value;
                                             setEditingPageData(newData);
                                          }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors" />
                                       </div>
                                       <div className="flex-1 flex flex-col gap-1.5">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase">ขนาดพินอิน (px)</label>
                                          <input type="number" value={sec.pinyinFontSize || ''} placeholder="เช่น 20" onChange={(e) => {
                                             const newData = JSON.parse(JSON.stringify(editingPageData));
                                             newData.sections[sIdx].pinyinFontSize = e.target.value;
                                             setEditingPageData(newData);
                                          }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors" />
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="flex gap-5 justify-end mt-4 pt-6 border-t-2 border-indigo-200">
                           <button onClick={() => { setEditingPageIdx(null); setEditingPageData(null); }} className="px-8 py-4 bg-white text-slate-500 hover:bg-slate-100 rounded-2xl font-bold shadow-sm text-lg">ยกเลิก</button>
                           <button onClick={handleSavePageContent} className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-md flex items-center gap-3 text-lg"><Save size={24}/> บันทึกการแก้ไขหน้านี้</button>
                        </div>
                     </div>
                  )}

                  {/* 🎯 ส่วนแสดงเนื้อหาปกติ (ใช้ตัวแปรที่ครูตั้งค่าไว้) */}
                  {renderImageForTeacherList(editingPageIdx === index ? editingPageData.image : page.image)}
                  
                  {getAudUrl(editingPageIdx === index ? editingPageData.audio : page.audio) && (
                     <div className="w-full max-w-md mx-auto mb-10 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg"><Music size={20} /> คลิปเสียงประจำหน้า</div>
                        <audio controls className="w-full h-12 outline-none"><source src={getAudUrl(editingPageIdx === index ? editingPageData.audio : page.audio)} type="audio/mpeg" /></audio>
                     </div>
                  )}

                  {(editingPageIdx === index ? editingPageData.sections : page.sections) && (editingPageIdx === index ? editingPageData.sections : page.sections).length > 0 && (
                     <div className="flex flex-col gap-12 w-full mt-8">
                        {(editingPageIdx === index ? editingPageData.sections : page.sections).map((sec: any, sIdx: number) => (
                           <div key={sIdx} className="w-full">
                              {renderSectionContent(sec, userRole === 'teacher' || userRole === 'admin', editingPageIdx === index, sIdx)}
                           </div>
                        ))}
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}