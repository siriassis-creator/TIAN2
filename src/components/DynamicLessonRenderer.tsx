// src/components/DynamicLessonRenderer.tsx
import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, MessageCircle, BookOpen, PenTool, Image as ImageIcon, Music, HelpCircle, XCircle, Send, X, Monitor, Trophy, Edit3, Trash2 } from 'lucide-react';
import { SharedTeacherPanel } from './SharedTeacherPanel';
import { HanziWordWriter } from './SharedHanzi';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

export default function DynamicLessonRenderer({ data, userRole, roomPin }: any) {
  let lessonData: any = null;

  // === States สำหรับ Live Session ===
  const [liveSessionData, setLiveSessionData] = useState<any>(null);
  
  // === States สำหรับนักเรียน ===
  const [studentName, setStudentName] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [studentFlipped, setStudentFlipped] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState<string | null>(null);

  // === States สำหรับครู ===
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x:number, y:number}[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  try {
    const parsed = typeof data.jsonData === 'string' ? JSON.parse(data.jsonData) : data.jsonData;
    lessonData = parsed.lesson ? parsed.lesson : parsed;
  } catch (error) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-200 text-center">
          <h2 className="text-2xl font-bold mb-2">❌ โครงสร้าง JSON ไม่ถูกต้อง</h2>
        </div>
      </div>
    );
  }

  // === 🔄 ระบบซิงค์กระดานสด (Firebase) ===
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.dynamic_board?.ts !== liveSessionData?.dynamic_board?.ts) {
            setStudentFlipped(false);
            setStudentAnswer(null);
        }
        setLiveSessionData(d);
      }
    });
    return () => unsub();
  }, [roomPin, liveSessionData?.dynamic_board?.ts]);

  const broadcastToStudent = async (type: string, payload: any) => {
    if (userRole !== 'teacher' || !roomPin) return;
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), {
        dynamic_board: { type, data: payload, ts: Date.now(), lines: [] }
      });
      setIsDrawMode(false);
    } catch (e) { console.error(e); }
  };

  const clearStudentBoard = async () => {
    if (userRole !== 'teacher' || !roomPin) return;
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), { dynamic_board: null });
      setIsDrawMode(false);
    } catch (e) { console.error(e); }
  };

  const clearDrawings = async () => {
    if (userRole !== 'teacher' || !roomPin) return;
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), { 'dynamic_board.lines': [] });
    } catch (e) { console.error(e); }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (userRole !== 'teacher' || !isDrawMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath([{x, y}]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (userRole !== 'teacher' || !isDrawMode || currentPath.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath(prev => [...prev, {x, y}]);
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (userRole !== 'teacher' || !isDrawMode || currentPath.length === 0) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (roomPin && currentPath.length > 1) {
       const newLines = [...(liveSessionData?.dynamic_board?.lines || []), currentPath];
       await updateDoc(doc(db, 'live_sessions', roomPin), { 'dynamic_board.lines': newLines });
    }
    setCurrentPath([]);
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

  const handleStudentAnswer = async (opt: string) => {
    if (studentAnswer || !isJoined || !studentName) return; 
    setStudentAnswer(opt);
    speak(opt);
    if (opt === liveSessionData?.dynamic_board?.data?.correctAnswer) {
        if (roomPin) {
            await updateDoc(doc(db, 'live_sessions', roomPin), {
                [`scores.${studentName}`]: increment(10)
            });
        }
    }
  };

  // =========================================================================
  // 🎨 COMPONENT กลาง: เรนเดอร์บอร์ดแบบ Responsive (มือถือไม่ล้น)
  // =========================================================================
  const renderLiveBoardContent = (boardItem: any, isTeacherOverlay: boolean) => {
    if (!boardItem) return null;
    const { type, data } = boardItem;

    return (
      <div className="w-full relative pointer-events-auto">
         
         {type === 'intro' && (
           <div className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl text-center border-4 border-indigo-200 w-full mx-auto">
             <div className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-indigo-900 mb-4 drop-shadow-sm">{data.hanzi}</div>
             <div className="text-xl md:text-3xl text-indigo-600 mb-2 md:mb-4 font-medium">{data.pinyin}</div>
             <div className="text-lg md:text-2xl text-slate-600 font-bold">{data.thai}</div>
           </div>
         )}

         {type === 'passage' && (
           <div className="bg-amber-50 p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-amber-200 w-full mx-auto">
             <div className="text-2xl md:text-4xl font-serif text-slate-800 mb-4 md:mb-6 leading-relaxed md:leading-loose text-justify">{data.hanzi}</div>
             <div className="text-xl md:text-2xl text-amber-700 mb-4 md:mb-6 leading-relaxed text-justify">{data.pinyin}</div>
             <div className="text-base md:text-xl text-slate-600 border-t-2 border-amber-200/50 pt-4 md:pt-6 leading-relaxed">{data.thai}</div>
           </div>
         )}

         {type === 'dialogue' && (
           <div className="w-full flex flex-col gap-4 md:gap-6">
             {data.map((chat: any, dIdx: number) => {
               const isA = chat.speaker === 'A';
               return (
                 <div key={dIdx} className={`flex w-full gap-2 md:gap-4 ${isA ? 'justify-start' : 'justify-end'}`}>
                   {isA && <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xl md:text-2xl shrink-0 shadow-lg">{chat.speaker}</div>}
                   <div className={`max-w-[85%] md:max-w-[80%] p-4 md:p-6 rounded-3xl shadow-xl border-2 ${isA ? 'bg-white border-slate-200 rounded-tl-none' : 'bg-emerald-50 border-emerald-300 rounded-tr-none text-right'}`}>
                     <div className="text-2xl md:text-4xl font-serif text-slate-800 mb-1 md:mb-2 leading-snug">{chat.hanzi}</div>
                     <div className="text-lg md:text-2xl text-blue-600 mb-1 md:mb-2">{chat.pinyin}</div>
                     <div className="text-base md:text-xl text-slate-500">{chat.thai}</div>
                   </div>
                   {!isA && <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xl md:text-2xl shrink-0 shadow-lg">{chat.speaker}</div>}
                 </div>
               );
             })}
           </div>
         )}

         {type === 'pattern' && (
           <div className="bg-rose-50 p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-rose-200 w-full mx-auto">
             <div className="inline-block bg-rose-500 text-white px-4 md:px-6 py-2 rounded-xl text-xl md:text-3xl font-bold mb-4 md:mb-6 shadow-md">{data.structure}</div>
             <div className="text-lg md:text-2xl text-rose-700 font-bold mb-6 md:mb-8">ความหมาย: {data.meaningThai}</div>
             <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-inner border border-rose-100">
               <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-2">ตัวอย่างประโยค</div>
               {data.examples.map((ex: any, eIdx: number) => (
                 <div key={eIdx} className="flex flex-col mb-4 last:mb-0">
                   <span className="text-xl md:text-3xl font-serif text-slate-800 mb-1">{ex.hanzi}</span>
                   <span className="text-base md:text-lg text-rose-500 mb-1">{ex.pinyin}</span>
                   <span className="text-base md:text-lg text-slate-500">{ex.thai}</span>
                 </div>
               ))}
             </div>
           </div>
         )}

         {type === 'image' && (
           <div className="w-full bg-white p-3 md:p-4 rounded-3xl shadow-2xl border-4 border-slate-200 mx-auto">
             <img src={data.imageUrl} alt={data.imageAlt} className="w-full h-auto rounded-2xl" />
           </div>
         )}

         {type === 'vocab' && (
           <div className="group relative [perspective:1000px] h-[300px] md:h-[450px] w-full max-w-md md:max-w-xl mx-auto cursor-pointer shadow-2xl rounded-3xl" onClick={() => { if(!isTeacherOverlay) setStudentFlipped(!studentFlipped); speak(data.hanzi); }}>
             <div className={`absolute w-full h-full transition-all duration-700 [transform-style:preserve-3d] rounded-3xl ${studentFlipped && !isTeacherOverlay ? '[transform:rotateY(180deg)]' : ''}`}>
               <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-4 border-indigo-200 rounded-3xl flex flex-col items-center justify-center p-6 md:p-8">
                 <div className="text-7xl md:text-[120px] font-serif text-slate-800 mb-4 md:mb-6 drop-shadow-md">{data.hanzi}</div>
                 {!isTeacherOverlay && <div className="text-sm md:text-xl text-indigo-500 bg-indigo-50 px-4 md:px-6 py-2 rounded-full animate-pulse">แตะเพื่อพลิกดูความหมาย</div>}
                 {isTeacherOverlay && <div className="text-sm md:text-xl text-indigo-500 font-bold mt-2 md:mt-4">{data.pinyin} - {data.thai}</div>}
               </div>
               <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex flex-col items-center justify-center p-6 md:p-8 text-white text-center">
                 <div className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 drop-shadow-sm">{data.pinyin}</div>
                 <div className="text-xl md:text-3xl mb-4 md:mb-6">{data.thai}</div>
                 {data.classifier && <div className="text-sm md:text-lg bg-white/20 px-3 md:px-4 py-1.5 rounded-full">ลักษณนาม: {data.classifier}</div>}
               </div>
             </div>
           </div>
         )}

         {type === 'quiz' && (
           <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-amber-200 w-full mx-auto">
              <div className="text-center mb-6 md:mb-10">
                 <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-800 mb-2 md:mb-4 leading-snug">{typeof data.question === 'string' ? data.question : data.question?.hanzi}</h2>
                 {data.question?.pinyin && <p className="text-lg md:text-2xl text-amber-600 mb-1 md:mb-2">{data.question.pinyin}</p>}
                 {data.question?.thai && <p className="text-base md:text-xl text-slate-500">{data.question.thai}</p>}
                 <button onClick={() => speak(typeof data.question === 'string' ? data.question : data.question?.hanzi)} className="mx-auto mt-4 flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full font-bold hover:bg-amber-100 transition-colors text-sm md:text-base"><Volume2 size={18}/> ฟังเสียงโจทย์</button>
              </div>

              {data.options && data.options.length > 0 ? (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                       {data.options.map((opt: string, oIdx: number) => {
                          const isAnswered = !!studentAnswer;
                          const isThisSelected = studentAnswer === opt;
                          const isThisCorrect = opt === data.correctAnswer;
                          
                          let btnClass = "bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300";
                          
                          if (!isTeacherOverlay && isAnswered) {
                            if (isThisCorrect) btnClass = "bg-green-500 border-green-600 text-white font-bold shadow-lg md:scale-[1.02]";
                            else if (isThisSelected) btnClass = "bg-red-500 border-red-600 text-white font-bold shadow-lg";
                            else btnClass = "bg-slate-100 border-slate-200 text-slate-300 opacity-50";
                          }
                          if (isTeacherOverlay && isThisCorrect) {
                             btnClass = "bg-green-100 border-green-400 text-green-800 font-bold border-4";
                          }

                          return (
                            <button key={oIdx} onClick={() => { if(!isTeacherOverlay && !isAnswered) handleStudentAnswer(opt); }} disabled={isAnswered || isTeacherOverlay} className={`p-4 md:p-6 border-2 rounded-2xl text-lg md:text-2xl transition-all flex items-center justify-center gap-2 md:gap-3 shadow-sm ${btnClass}`}>
                              {(!isTeacherOverlay && isAnswered && isThisCorrect) && <CheckCircle2 size={24}/>}
                              {(!isTeacherOverlay && isAnswered && isThisSelected && !isThisCorrect) && <XCircle size={24}/>}
                              {opt}
                            </button>
                          );
                       })}
                    </div>
                    {!isTeacherOverlay && studentAnswer && (
                       <div className="mt-6 md:mt-8 text-center animate-fade-in">
                          <div className={`inline-block px-4 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-lg md:text-2xl shadow-md w-full md:w-auto ${studentAnswer === data.correctAnswer ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-red-100 text-red-700 border-2 border-red-300'}`}>
                             {studentAnswer === data.correctAnswer ? '🎉 ถูกต้อง! (+10 คะแนน)' : '❌ ตอบผิดจ้า ลองใหม่ข้อหน้านะ!'}
                          </div>
                       </div>
                    )}
                 </>
              ) : (
                 <div className="mt-6 md:mt-8 bg-indigo-50 border-4 border-dashed border-indigo-200 rounded-3xl p-6 md:p-10 text-center flex flex-col items-center gap-3 md:gap-4">
                   <MessageCircle size={48} className="text-indigo-400 animate-bounce md:w-16 md:h-16" />
                   <span className="text-xl md:text-3xl font-bold text-indigo-600">ข้อนี้ตอบปากเปล่า!</span>
                   <span className="text-sm md:text-xl text-slate-500">คุณครูเตรียมเรียกชื่อตอบได้เลยครับ</span>
                 </div>
              )}
           </div>
         )}
      </div>
    );
  };

  // =========================================================================
  // 🎓 STUDENT VIEW (นักเรียน)
  // =========================================================================
  if (userRole === 'student') {
    if (!isJoined) {
       return (
         <div className="flex w-full min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-indigo-500 animate-fade-in">
               <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">เข้าห้องเรียน</h1>
               <p className="text-slate-500 mb-6 md:mb-8 text-sm md:text-base">กรุณาพิมพ์ชื่อของคุณเพื่อสะสมคะแนน</p>
               <input type="text" placeholder="พิมพ์ชื่อ (เช่น น้องเอ)" value={studentName} onChange={(e)=>setStudentName(e.target.value)} className="w-full text-center text-lg md:text-xl font-bold p-3 md:p-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none mb-4 md:mb-6 bg-slate-50" />
               <button onClick={() => { if(studentName.trim()) setIsJoined(true); }} disabled={!studentName.trim()} className="w-full bg-indigo-600 text-white font-bold text-lg md:text-xl p-3 md:p-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95">เข้าเรียน 🚀</button>
            </div>
         </div>
       );
    }

    const boardItem = liveSessionData?.dynamic_board;

    return (
      <div className="flex flex-col w-full min-h-screen relative bg-slate-200 overflow-hidden">
        
        <style>
          {`
            @keyframes dealCard {
              0% { transform: translateY(-100vh) rotate(-15deg) scale(0.5); opacity: 0; }
              60% { transform: translateY(5vh) rotate(5deg) scale(1.05); opacity: 1; }
              100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            }
            .animate-deal { animation: dealCard 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          `}
        </style>

        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cbd5e1 2px, transparent 2px), linear-gradient(90deg, #cbd5e1 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        {!boardItem ? (
           <div className="flex flex-col items-center justify-center text-slate-400 gap-4 md:gap-6 flex-1 z-10 p-4">
              <Monitor size={80} className="opacity-20 mb-2 md:w-[100px] md:h-[100px]" />
              <div className="w-16 h-16 md:w-20 md:h-20 border-8 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="font-bold text-xl md:text-3xl animate-pulse mt-2 md:mt-4 bg-white/50 px-6 py-2 rounded-full text-center">รอคุณครูส่งเนื้อหา...</span>
           </div>
        ) : (
           <div className="w-full flex-1 z-10 overflow-y-auto p-4 md:p-8 flex justify-center items-center">
              <div className="w-full max-w-4xl relative">
                 {/* ✨ ใส่ Key เพื่อให้แอนิเมชันเล่นใหม่ทุกครั้งที่ข้อความเปลี่ยน */}
                 <div key={boardItem.ts} className="animate-deal w-full relative">
                    {renderLiveBoardContent(boardItem, false)}
                    
                    {/* ชั้นสำหรับวาดเขียน (หุ้มเนื้อหาพอดีเป๊ะ) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[100]" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {boardItem?.lines?.map((line: any, i: number) => (
                         <polyline key={i} points={line.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      ))}
                    </svg>
                 </div>
              </div>
           </div>
        )}

        {/* ข้อมูลนักเรียนมุมซ้ายล่าง (มือถือจะย่อขนาดลง) */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-[200] bg-white/90 backdrop-blur px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 md:gap-3">
           <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
           <span className="font-bold text-slate-700 text-sm md:text-lg max-w-[100px] md:max-w-none truncate">{studentName}</span>
           <span className="font-bold text-amber-500 bg-amber-50 px-2 py-1 md:px-3 rounded-xl ml-1 md:ml-2 text-xs md:text-base whitespace-nowrap">🏆 {(liveSessionData?.scores?.[studentName] || 0)} แต้ม</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 👩‍🏫 TEACHER VIEW (ครู)
  // =========================================================================
  const renderImageForTeacherList = (img: any) => {
    if (!img) return null;
    return (
      <div className="relative mb-6 group w-full">
         {img.imageUrl ? <img src={img.imageUrl} alt={img.imageAlt} className="w-full max-w-md mx-auto rounded-3xl shadow-sm object-cover" /> : <div className="w-full max-w-md mx-auto bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 text-indigo-400"><ImageIcon size={48} className="opacity-50" /><span className="text-sm font-bold text-indigo-600 px-4 py-1 bg-indigo-100 rounded-full">{img.imageAlt || 'ภาพประกอบ'}</span></div>}
         <button onClick={() => broadcastToStudent('image', img)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold shadow-2xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 scale-100 md:scale-90 group-hover:scale-100 text-sm md:text-base whitespace-nowrap"><Send size={18}/> ส่งรูปนี้ขึ้นจอเด็ก</button>
      </div>
    );
  };

  const isLiveActive = !!liveSessionData?.dynamic_board;

  return (
    <div className="flex w-full min-h-screen transition-all duration-500 items-start mt-4 md:mt-8 font-sans text-left relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      
      {/* 🎯 TEACHER LIVE OVERLAY (หน้าจอจำลองตอนส่งให้เด็ก) */}
      {isLiveActive && (
         <div className="fixed inset-0 z-[6000] bg-slate-800 flex flex-col items-center justify-center overflow-hidden p-2 md:p-6">
            
            {/* แถบเครื่องมือควบคุมด้านบน (มือถือจะหดเล็กลง) */}
            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md px-2 md:px-4 py-2 rounded-2xl shadow-xl flex items-center justify-between gap-1 md:gap-2 border-2 border-indigo-200 mb-2 md:mb-4 shrink-0 overflow-x-auto">
               <div className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-100 text-indigo-800 font-bold rounded-xl flex items-center gap-1.5 md:gap-2 text-xs md:text-base whitespace-nowrap"><Monitor size={16} className="animate-pulse hidden md:block"/> จอเด็ก</div>
               
               <div className="flex items-center gap-1 md:gap-2">
                 <button onClick={() => setIsDrawMode(!isDrawMode)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-1 md:gap-2 transition-colors border-2 text-xs md:text-base whitespace-nowrap ${isDrawMode ? 'bg-rose-500 text-white border-rose-600 shadow-inner' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}><Edit3 size={16}/> {isDrawMode ? 'กำลังเขียน...' : 'ปากกา'}</button>
                 <button onClick={clearDrawings} className="px-2 md:px-3 py-1.5 md:py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="ล้างรอยปากกา"><Trash2 size={16}/></button>
               </div>
               
               <button onClick={clearStudentBoard} className="px-3 py-1.5 md:px-6 md:py-2 bg-slate-800 hover:bg-black text-white rounded-xl font-bold flex items-center gap-1 md:gap-2 transition-colors text-xs md:text-base whitespace-nowrap"><X size={16}/> ปิดกระดาน</button>
            </div>

            {/* พื้นหลังบอร์ดครูที่สามารถเลื่อน (Scroll) ได้แบบเด็ก */}
            <div className="w-full max-w-4xl flex-1 bg-slate-100 rounded-3xl shadow-2xl overflow-y-auto border-4 border-indigo-500 relative flex justify-center items-center p-4">
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cbd5e1 2px, transparent 2px), linear-gradient(90deg, #cbd5e1 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
               
               <div className="w-full relative">
                 {renderLiveBoardContent(liveSessionData.dynamic_board, true)}

                 {/* ชั้นสำหรับวาดเขียน คลุมทับแค่กล่องเนื้อหา */}
                 <svg 
                    className={`absolute inset-0 w-full h-full z-[100] touch-none ${isDrawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`} 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                 >
                    {liveSessionData.dynamic_board.lines?.map((line: any, i: number) => (
                       <polyline key={`s-${i}`} points={line.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    ))}
                    {currentPath.length > 0 && (
                       <polyline points={currentPath.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                 </svg>
               </div>
            </div>

            {/* Leaderboard Panel (ขวาล่าง หรือตรงกลางล่างในมือถือ) */}
            <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 left-4 md:left-auto z-[200] bg-white/95 backdrop-blur-md p-3 md:p-5 rounded-3xl shadow-2xl border border-slate-200 md:max-w-sm w-auto max-h-[30vh] md:max-h-[40vh] flex flex-col">
               <h3 className="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 md:pb-3 mb-2 md:mb-3"><Trophy className="text-amber-500 w-4 h-4 md:w-6 md:h-6"/> ตารางคะแนน</h3>
               <div className="overflow-y-auto flex-1 space-y-2 pr-1 md:pr-2 text-xs md:text-base">
                  {!liveSessionData.scores || Object.keys(liveSessionData.scores).length === 0 ? (
                     <div className="text-center text-slate-400 py-2 md:py-4 font-medium">รอเด็กตอบคำถาม...</div>
                  ) : (
                     Object.entries(liveSessionData.scores).sort(([,a]:any, [,b]:any) => b - a).map(([name, score]: any, idx: number) => (
                        <div key={name} className="flex items-center justify-between bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                           <div className="flex items-center gap-2 md:gap-3">
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold ${idx===0 ? 'bg-amber-100 text-amber-600' : idx===1 ? 'bg-slate-200 text-slate-600' : idx===2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{idx+1}</div>
                              <span className="font-bold text-slate-700 truncate max-w-[100px] md:max-w-none">{name}</span>
                           </div>
                           <span className="font-black text-emerald-600 ml-2">{score} แต้ม</span>
                        </div>
                     ))
                  )}
               </div>
            </div>

         </div>
      )}

      {/* ==================================================================== */}
      {/* 📚 NORMAL TEACHER LESSON VIEW (รายการบทเรียนแบบเต็มๆ ไม่ย่อ) */}
      {/* ==================================================================== */}
      {!isLiveActive && <SharedTeacherPanel userRole={userRole} roomPin={roomPin} isSlideVisible={true} />}

      <div className="flex-1 w-full p-3 md:p-8 relative z-[1] pb-32 max-w-5xl mx-auto">
        
        <div className="mb-6 md:mb-8 text-center md:text-left bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-3 shadow-sm">บทที่ {lessonData.lessonNumber} | {lessonData.topic}</div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-1 md:mb-2">{lessonData.titleChinese}</h1>
            <p className="text-lg md:text-xl text-emerald-600 font-medium mb-1">{lessonData.titlePinyin}</p>
            <p className="text-sm md:text-lg text-slate-500">{lessonData.titleThai}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8 w-full">
          {lessonData.pages.map((page: any, index: number) => {
            const c = page.content || {}; 
            
            return (
              <div key={page.id || index} className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative group/page">
                <div className="absolute top-3 right-4 md:top-4 md:right-6 text-xs md:text-sm font-bold text-slate-300">หน้า {page.pageNumber || index + 1}</div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4 border-b border-slate-100 pb-2 md:pb-3 flex items-center gap-2 pr-12"><BookOpen className="text-indigo-500 w-5 h-5 md:w-6 md:h-6"/> {page.title}</h2>
                
                {page.instructionThai && <p className="text-slate-500 mb-4 md:mb-6 bg-slate-50 inline-block px-3 py-1.5 md:px-4 rounded-lg text-xs md:text-sm border border-slate-100">📌 {page.instructionThai}</p>}

                {renderImageForTeacherList(page.image)}

                {/* ปุ่มส่งเนื้อหา: Intro */}
                {c.introText && (
                  <div className="relative group mb-4 md:mb-6">
                    <button onClick={() => broadcastToStudent('intro', c.introText)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-indigo-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"><Send size={14}/> ส่งขึ้นจอเด็ก</button>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-6 rounded-2xl border border-indigo-100 text-center">
                      <div className="text-2xl md:text-3xl font-serif font-bold text-indigo-900 mb-2">{c.introText.hanzi}</div>
                      <div className="text-sm md:text-base text-slate-600">{c.introText.thai}</div>
                    </div>
                  </div>
                )}

                {/* ปุ่มส่งเนื้อหา: Passage */}
                {c.passage && (
                  <div className="relative group mb-4 md:mb-6">
                    <button onClick={() => broadcastToStudent('passage', c.passage)} className="absolute top-2 left-2 md:top-4 md:left-4 bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"><Send size={14}/> ส่งขึ้นจอเด็ก</button>
                    <div className="bg-amber-50 p-4 md:p-6 rounded-2xl border border-amber-200 mt-8 md:mt-0">
                      <div className="text-xl md:text-2xl font-serif text-slate-800 mb-2">{c.passage.hanzi}</div>
                      <div className="text-xs md:text-sm text-slate-600">{c.passage.thai}</div>
                    </div>
                  </div>
                )}

                {/* ปุ่มส่งเนื้อหา: Dialogue (แบบเต็มแล้ว) */}
                {c.dialogue && (
                  <div className="relative group mb-4 md:mb-6 w-full">
                    <button onClick={() => broadcastToStudent('dialogue', c.dialogue)} className="absolute -top-3 right-2 md:right-4 bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"><Send size={14}/> ส่งบทสนทนานี้ขึ้นจอเด็ก</button>
                    <div className="flex flex-col gap-3 md:gap-4 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 mt-4 overflow-x-auto">
                      {c.dialogue.map((chat: any, dIdx: number) => (
                        <div key={dIdx} className={`flex w-full gap-2 md:gap-3 ${chat.speaker === 'A' ? 'justify-start' : 'justify-end'}`}>
                           {chat.speaker === 'A' && <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs md:text-base shrink-0">{chat.speaker}</div>}
                           <div className={`p-2 md:p-3 rounded-xl border max-w-[85%] ${chat.speaker === 'A' ? 'bg-white rounded-tl-none' : 'bg-emerald-50 rounded-tr-none text-right'}`}>
                             <div className="text-base md:text-xl font-serif text-slate-800">{chat.hanzi}</div>
                             <div className="text-xs md:text-sm text-slate-500">{chat.thai}</div>
                           </div>
                           {chat.speaker !== 'A' && <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs md:text-base shrink-0">{chat.speaker}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ปุ่มส่งเนื้อหา: Patterns */}
                {c.patterns && (
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {c.patterns.map((pattern: any, pIdx: number) => (
                      <div key={pIdx} className="relative group bg-rose-50 p-4 md:p-5 rounded-2xl border border-rose-100">
                        <button onClick={() => broadcastToStudent('pattern', pattern)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-rose-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"><Send size={14}/> ส่งไวยากรณ์นี้ขึ้นจอเด็ก</button>
                        <div className="inline-block bg-rose-500 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-base md:text-lg font-bold mb-2 shadow-sm">{pattern.structure}</div>
                        <div className="text-rose-700 font-medium ml-1 text-xs md:text-sm">แปลว่า: {pattern.meaningThai}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ปุ่มส่งเนื้อหา: Vocabularies (แบบเต็ม) */}
                {(c.vocabularies) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mb-4 md:mb-6">
                    {c.vocabularies.map((vocab: any, vIdx: number) => (
                      <div key={vIdx} className="relative group flex flex-col bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-colors pt-8">
                        <button onClick={() => broadcastToStudent('vocab', vocab)} className="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-md z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Send size={12}/> ส่งขึ้นจอเด็ก</button>
                        <div className="text-3xl md:text-4xl font-serif text-slate-800 mb-1 text-center">{vocab.hanzi}</div>
                        <div className="text-sm md:text-base text-indigo-500 font-bold text-center">{vocab.pinyin}</div>
                        <div className="text-xs md:text-sm text-slate-600 text-center mt-1">{vocab.thai}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ปุ่มส่งเนื้อหา: แบบฝึกหัด (Quiz) (แบบเต็ม) */}
                {(c.exercises || c.questions) && (
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {(c.exercises || c.questions).map((ex: any, qIdx: number) => {
                      const qText = typeof ex.question === 'string' ? ex.question : ex.question?.hanzi;
                      return (
                        <div key={qIdx} className="relative group bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-2xl hover:border-indigo-300 transition-colors md:pr-32">
                          <button onClick={() => broadcastToStudent('quiz', ex)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all active:scale-95"><Send size={14}/> ส่งข้อนี้ขึ้นจอเด็ก</button>
                          <div className="flex gap-2 md:gap-3 mb-2 pt-8 md:pt-0">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs text-white bg-indigo-400 shrink-0">{ex.itemNumber || ex.questionNumber || qIdx + 1}</div>
                            <span className="text-sm md:text-base font-serif font-bold text-slate-800">{qText}</span>
                          </div>
                          {ex.options && (
                            <div className="flex flex-wrap gap-2 pl-7 md:pl-9 text-xs md:text-sm text-slate-500">
                              {ex.options.map((o:string, i:number) => <span key={i} className={`bg-white px-2 py-1 rounded border ${o === ex.correctAnswer ? 'border-green-400 text-green-700 bg-green-50 font-bold' : 'border-slate-200'}`}>{o}</span>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}