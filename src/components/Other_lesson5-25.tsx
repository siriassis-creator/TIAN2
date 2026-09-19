// src/components/Other_lesson5-25.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, CheckCircle2, XCircle, Eye, Edit3 } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface FillCharToken {
  id: string;
  char: string;
  pinyin: string;
  isBlank: boolean;
}

export interface FillCharCard {
  id: string;
  tokens: FillCharToken[];
  imageUrl: string;
}

export interface OtherLesson5_25Data {
  id?: string;
  patternType: 'other_lesson5-25';
  mainTitle: string;
  subTitle: string;
  cards: FillCharCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_25Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

// สีวงกลมขอบด้านนอก
const CIRCLE_COLORS = ['border-[#ba87c9]', 'border-[#f0a969]', 'border-[#6ab3b5]', 'border-[#8ab04b]', 'border-[#ec7c7b]'];

export default function OtherLesson5_25({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_25Data);
  const safeCards = safeData.cards || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  const [activeChoice, setActiveChoice] = useState<{ id: string, char: string, pinyin: string } | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({}); // cardId -> choice char
  const [revealedCards, setRevealedCards] = useState<string[]>([]); // array of cardIds

  // ดึงตัวเลือกอักษรจีนจากคำที่ถูกซ่อนไว้ (A, B, C...)
  const choices = useMemo(() => {
    const extracted: { id: string, char: string, pinyin: string }[] = [];
    safeCards.forEach(card => {
      let currentChar = "";
      let currentPinyin = "";
      card.tokens?.forEach(t => {
        if (t.isBlank) {
          currentChar += t.char;
          currentPinyin += t.pinyin + " ";
        } else {
          if (currentChar) {
            if (!extracted.find(e => e.char === currentChar)) extracted.push({ id: currentChar, char: currentChar, pinyin: currentPinyin.trim() });
            currentChar = ""; currentPinyin = "";
          }
        }
      });
      if (currentChar) {
        if (!extracted.find(e => e.char === currentChar)) extracted.push({ id: currentChar, char: currentChar, pinyin: currentPinyin.trim() });
      }
    });
    return extracted;
  }, [safeCards]);

  useEffect(() => {
    return () => { stopListening(); };
  }, []);

  // Firebase Sync
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.other5_25_answers !== undefined) setStudentAnswers(d.other5_25_answers);
        if (d.other5_25_reveals !== undefined) setRevealedCards(d.other5_25_reveals);
      }
    });
    return () => unsub();
  }, [roomPin]);

  const handleChoiceClick = (choice: any) => {
    if (userRole !== 'student') return;
    setActiveChoice(activeChoice?.id === choice.id ? null : choice);
  };

  const handleDropzoneClick = async (cardId: string) => {
    if (userRole !== 'student' || revealedCards.includes(cardId) || revealedCards.includes('ALL')) return;

    let newAnswers = { ...studentAnswers };
    if (activeChoice) {
      newAnswers[cardId] = activeChoice.char;
      setActiveChoice(null); 
    } else {
      delete newAnswers[cardId]; 
    }

    setStudentAnswers(newAnswers);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_25_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    let newReveals = [...revealedCards];
    if (!newReveals.includes(cardId)) newReveals.push(cardId);
    
    setRevealedCards(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_25_reveals: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const allReveals = ['ALL'];
    setRevealedCards(allReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_25_reveals: allReveals }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานและคำตอบทั้งหมดใช่หรือไม่?')) {
      setRevealedCards([]);
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_25_reveals: [], other5_25_answers: {} }); } catch (e) {}
      }
    }
  };

  const speakChinese = (card: FillCharCard) => {
    const fullText = card.tokens.map(t => t.char).join('');
    if (!fullText) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'zh-CN'; utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
  };

  const startListening = (card: FillCharCard) => {
    const fullText = card.tokens.map(t => t.char).join('');
    if (!fullText) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; recognition.interimResults = false; recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(card.id);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = fullText.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      setSpeechScores(prev => ({ ...prev, [card.id]: { score: calculatedScore, transcript } }));
    };
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);

    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Render tokens
  const renderSentence = (card: FillCharCard) => {
    const groups: { isBlank: boolean, chars: string[], pinyins: string[] }[] = [];
    let currentGroup = { isBlank: card.tokens[0]?.isBlank, chars: [] as string[], pinyins: [] as string[] };
    
    card.tokens.forEach(t => {
      if (t.isBlank === currentGroup.isBlank) {
        currentGroup.chars.push(t.char);
        currentGroup.pinyins.push(t.pinyin);
      } else {
        if (currentGroup.chars.length > 0) groups.push(currentGroup);
        currentGroup = { isBlank: t.isBlank, chars: [t.char], pinyins: [t.pinyin] };
      }
    });
    if (currentGroup.chars.length > 0) groups.push(currentGroup);

    return groups.map((g, idx) => {
      if (!g.isBlank) {
        return (
          <div key={idx} className="inline-flex flex-col items-center mx-[1px] align-bottom">
            <span className="text-[18px] md:text-[22px] font-serif text-slate-800 leading-tight">{g.chars.join('')}</span>
            <span className="text-[11px] md:text-[13px] text-slate-500 font-sans mt-0.5">{g.pinyins.join(' ')}</span>
          </div>
        );
      } else {
        const expectedChar = g.chars.join('');
        const expectedPinyin = g.pinyins.join(' ');
        const studentAns = studentAnswers[card.id];
        const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');
        const isCorrect = studentAns === expectedChar;

        return (
          <div 
            key={idx} 
            className={`inline-flex flex-col items-center justify-end mx-2 align-bottom relative cursor-pointer group/drop
              ${userRole === 'student' && !isRevealed ? 'hover:scale-105 transition-transform' : ''}
            `}
            onClick={() => handleDropzoneClick(card.id)}
            title={userRole === 'student' && !isRevealed ? "คลิกเพื่อเติมคำตอบ / ลบคำตอบ" : ""}
          >
            {studentAns ? (
              <span className={`text-[18px] md:text-[22px] font-serif border-b-2 border-slate-400 px-4 leading-tight whitespace-nowrap
                ${isRevealed ? (isCorrect ? 'text-emerald-600 border-emerald-500' : 'text-red-500 border-red-500 line-through decoration-2') : 'text-indigo-600 border-indigo-400'}
              `}>
                {studentAns}
              </span>
            ) : (
              <span className={`text-[18px] md:text-[22px] border-b-2 px-8 leading-tight
                ${activeChoice && userRole === 'student' ? 'border-orange-400 bg-orange-50/50 rounded-t-md animate-pulse text-transparent' : 'border-slate-300 text-transparent'}
              `}>_</span>
            )}
            
            {/* แสดง Pinyin ถ้านักเรียนตอบลงไปแล้ว หรือเฉลยแล้ว */}
            {(studentAns || isRevealed) && (
              <span className="text-[11px] md:text-[13px] text-slate-500 font-sans mt-0.5">
                {studentAns ? pinyinConverter(studentAns) : ''}
              </span>
            )}

            {/* เฉลยข้อที่ผิด */}
            {isRevealed && !isCorrect && (
              <div className="absolute -top-7 bg-white border border-emerald-200 text-emerald-600 font-bold px-1.5 py-0.5 rounded shadow-md text-[11px] animate-bounce-in z-10 flex flex-col items-center leading-none">
                <span>{expectedChar}</span>
                <span className="text-[9px] font-normal">{expectedPinyin}</span>
              </div>
            )}
            
            {/* ไอคอนตรวจคำตอบ */}
            {isRevealed && studentAns && (
              <div className="absolute -right-3 top-[20%] animate-fade-in z-10">
                {isCorrect ? <CheckCircle2 size={16} className="text-emerald-500 bg-white rounded-full" /> : <XCircle size={16} className="text-red-500 bg-white rounded-full" />}
              </div>
            )}
          </div>
        );
      }
    });
  };

  if (!safeData.patternType) {
    return (
      <div className="w-full p-10 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left overflow-x-hidden relative">
      <div className="bg-[#fcfaf7] p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] min-h-[500px] flex flex-col">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-4 right-4 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={20} />
        </button>

        {/* 1. Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
             <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={20} />
             </div>
             {safeData.mainTitle || '2. 看图片，选择正确的词语，完成句子。'}
          </div>
          <div className="text-[13px] md:text-[15px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'ดูภาพแล้วเลือกคำศัพท์ไปเติมลงในช่องว่างให้ถูกต้อง'}
          </div>
        </div>

        {/* 2. Choices Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10 bg-orange-100/60 p-4 md:p-5 rounded-2xl border border-orange-200/50 mb-8 max-w-4xl mx-auto w-full shadow-sm" style={{ borderStyle: 'dashed' }}>
          {choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C...
            const isActive = activeChoice?.id === choice.id;
            const isUsed = Object.values(studentAnswers).includes(choice.char);

            return (
              <div 
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all select-none
                  ${userRole === 'student' ? 'cursor-pointer hover:-translate-y-0.5' : ''}
                  ${isActive ? 'bg-white text-orange-600 shadow-md scale-105 ring-2 ring-orange-400' : isUsed ? 'bg-slate-200/50 text-slate-400 opacity-60' : 'bg-transparent text-slate-700 hover:bg-white/60'}
                `}
                title={userRole === 'student' ? "คลิกเพื่อเลือกคำตอบนี้" : ""}
              >
                <span className={`font-sans font-bold text-[18px] ${isActive ? 'text-orange-500' : isUsed ? 'text-slate-400' : 'text-slate-700'}`}>{letter}</span>
                <div className="flex flex-col items-center">
                  <span className={`text-[20px] font-serif font-bold leading-none ${isActive ? 'text-orange-600' : isUsed ? 'text-slate-400' : 'text-slate-800'}`}>
                    {choice.char}
                  </span>
                  <span className="text-[11px] font-sans text-slate-500 mt-1">{choice.pinyin}</span>
                </div>
              </div>
            );
          })}
          {choices.length === 0 && <span className="text-slate-400 text-[11px] py-2">ยังไม่ได้กำหนดช่องว่างในหน้าตั้งค่า</span>}
        </div>

        {/* Instruction for students */}
        {userRole === 'student' && !revealedCards.includes('ALL') && (
          <div className="text-center text-orange-500 text-[12px] font-bold animate-pulse mb-6 bg-orange-50 py-1.5 rounded-lg mx-auto max-w-lg w-full">
            👆 คลิกเลือกตัวเลือก A,B,C... ด้านบน แล้วมาคลิกที่ช่องว่างเพื่อเติมคำตอบ
          </div>
        )}

        {/* 3. Cards Grid (สลับซ้าย-ขวา) */}
        <div className="flex flex-col gap-6 md:gap-8 pb-24 w-full max-w-4xl mx-auto px-4 md:px-12">
          {safeCards.map((card, idx) => {
            const isLeft = idx % 2 === 0; // สลับรูปซ้ายขวา
            const circleColor = CIRCLE_COLORS[idx % CIRCLE_COLORS.length];
            const isRecording = recordingId === card.id;
            const scoreData = speechScores[card.id];
            const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');

            return (
              <div key={card.id} className="relative w-full my-2">

                {/* Number Badge (สลับซ้าย-ขวา ตามรูป) */}
                <div className={`absolute -top-3 md:top-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-[11px] md:text-sm shadow-md ring-4 ring-[#fcfaf7] z-20
                  ${isLeft ? '-left-2 md:-left-8' : '-right-2 md:-right-8'}
                `}>
                  {idx + 1}
                </div>

                <div className={`relative bg-white rounded-[32px] border-2 border-slate-100 shadow-sm flex items-center min-h-[100px] md:min-h-[120px] transition-all hover:border-orange-200
                  ${isLeft ? 'ml-6 md:ml-10 pl-16 md:pl-20 pr-4 md:pr-8' : 'mr-6 md:mr-10 pr-16 md:pr-20 pl-4 md:pl-8'}
                `}>

                  {/* Image Circle (Overlapping) - เอาเงาที่รูปออก */}
                  <div className={`absolute top-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center border-[5px] md:border-[6px] ${circleColor} shadow-md z-10
                    ${isLeft ? '-left-10 md:-left-14' : '-right-10 md:-right-14'}
                  `}>
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt="vocab" className="max-w-[70%] max-h-[70%] object-contain" />
                    ) : (
                      <span className="text-slate-300 text-[10px]">ไม่มีรูป</span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className={`flex-1 py-4 md:py-6 flex flex-col justify-center ${isLeft ? 'items-start' : 'items-start md:pl-8'}`}>
                    <div className="flex flex-wrap items-end leading-loose">
                      {renderSentence(card)}
                    </div>
                    
                    {/* Tools (Mic/Speaker) */}
                    <div className="mt-3 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <button onClick={() => speakChinese(card)} className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-slate-100" title="ฟังเสียงประโยคเต็ม">
                        <Volume2 size={14} />
                      </button>
                      <button onClick={() => { if (isRecording) stopListening(); else startListening(card); }} className={`p-1.5 rounded-full transition-all shadow-sm border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-100 hover:bg-emerald-50'}`} title="ฝึกพูดประโยคเต็ม">
                        {isRecording ? <Mic size={14} /> : <MicOff size={14} />}
                      </button>
                      {scoreData && !isRecording && (
                        <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold animate-fade-in ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</div>
                      )}
                    </div>
                  </div>

                  {/* ปุ่มเฉลยเฉพาะข้อ สำหรับคุณครู */}
                  {userRole === 'teacher' && !isRevealed && (
                    <button 
                      onClick={() => handleTeacherReveal(card.id)}
                      className={`absolute top-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm border bg-white/90 text-indigo-500 border-slate-200 hover:bg-indigo-50 z-20
                        ${isLeft ? 'right-4' : 'left-4'}
                      `}
                    >
                      <Eye size={12}/> เฉลย
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher Control Panel */}
        {userRole === 'teacher' && (
          <div className={`fixed bottom-8 md:bottom-12 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
                <span className="text-xs font-bold text-slate-800">ระบบตรวจคำตอบ</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              
              <button 
                onClick={handleTeacherRevealAll} 
                disabled={revealedCards.includes('ALL')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${revealedCards.includes('ALL') ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
              >
                <Eye size={14} /> เฉลยทุกข้อ
              </button>
              
              <button 
                onClick={handleTeacherReset} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 shadow-sm"
              >
                ล้างกระดาน
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Note Sidebar */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden z-[40] ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
        <div className="flex items-center justify-between mb-4 shrink-0 text-left">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Note</span>
          <button onClick={() => setIsNoteOpen(false)} className="text-amber-300 hover:text-amber-600"><X size={16} /></button>
        </div>
        <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="จดบันทึก..." className="flex-1 w-full bg-white/80 rounded-lg p-3 text-sm text-amber-900 focus:outline-none border border-amber-50 resize-none mb-4" />
        <button onClick={() => { onUpdateNote?.(tempNote); alert('Saved'); }} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm">SAVE NOTE</button>
      </div>
    </div>
  );
}