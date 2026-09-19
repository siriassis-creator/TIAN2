// src/components/Other_lesson5-21.tsx
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

export interface OtherLesson5_21Data {
  id?: string;
  patternType: 'other_lesson5-21';
  mainTitle: string;
  subTitle: string;
  cards: FillCharCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_21Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_21({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_21Data);
  const safeCards = safeData.cards || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Speech Assessment State
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  // Interactive Game State
  const [activeChoice, setActiveChoice] = useState<{ id: string, char: string } | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({}); // cardId -> choice char
  const [revealedCards, setRevealedCards] = useState<string[]>([]); // array of cardIds

  // ดึงตัวเลือกอักษรจีนจากคำที่ถูกซ่อนไว้ (A, B, C...)
  const choices = useMemo(() => {
    const extracted: { id: string, char: string }[] = [];
    safeCards.forEach(card => {
      let currentChar = "";
      card.tokens?.forEach(t => {
        if (t.isBlank) {
          currentChar += t.char;
        } else {
          if (currentChar) {
            if (!extracted.find(e => e.char === currentChar)) extracted.push({ id: currentChar, char: currentChar });
            currentChar = "";
          }
        }
      });
      if (currentChar) {
        if (!extracted.find(e => e.char === currentChar)) extracted.push({ id: currentChar, char: currentChar });
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
        if (d.other5_21_answers !== undefined) setStudentAnswers(d.other5_21_answers);
        if (d.other5_21_reveals !== undefined) setRevealedCards(d.other5_21_reveals);
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
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_21_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    let newReveals = [...revealedCards];
    if (!newReveals.includes(cardId)) newReveals.push(cardId);
    
    setRevealedCards(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_21_reveals: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const allReveals = ['ALL'];
    setRevealedCards(allReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_21_reveals: allReveals }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานและคำตอบทั้งหมดใช่หรือไม่?')) {
      setRevealedCards([]);
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_21_reveals: [], other5_21_answers: {} }); } catch (e) {}
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

  // Render tokens (inline blocks)
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
        const studentAns = studentAnswers[card.id];
        const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');
        const isCorrect = studentAns === expectedChar;

        return (
          <div 
            key={idx} 
            className={`inline-flex flex-col items-center justify-end mx-1 align-bottom relative cursor-pointer group/drop
              ${userRole === 'student' && !isRevealed ? 'hover:scale-105 transition-transform' : ''}
            `}
            onClick={() => handleDropzoneClick(card.id)}
            title={userRole === 'student' && !isRevealed ? "คลิกเพื่อเติมคำตอบ / ลบคำตอบ" : ""}
          >
            {/* พื้นที่สำหรับอักษรจีนที่ต้องเติม */}
            {studentAns ? (
              <span className={`text-[18px] md:text-[22px] font-serif border-b-[3px] px-3 leading-tight whitespace-nowrap
                ${isRevealed ? (isCorrect ? 'text-emerald-600 border-emerald-500' : 'text-red-500 border-red-500 line-through decoration-2') : 'text-indigo-600 border-indigo-400 bg-indigo-50/50 rounded-t-md'}
              `}>
                {studentAns}
              </span>
            ) : (
              <span className={`text-[18px] md:text-[22px] border-b-[3px] px-6 leading-tight
                ${activeChoice && userRole === 'student' ? 'border-amber-400 bg-amber-50/50 rounded-t-md animate-pulse text-transparent' : 'border-slate-300 text-transparent'}
              `}>_</span>
            )}
            
            {/* โชว์ Pinyin ถ้านักเรียนตอบลงไปแล้ว หรือเฉลยแล้ว */}
            {(studentAns || isRevealed) && (
              <span className="text-[11px] md:text-[13px] text-slate-400 font-sans mt-0.5">
                {studentAns ? pinyinConverter(studentAns) : ''}
              </span>
            )}

            {/* เฉลยข้อที่ผิด */}
            {isRevealed && !isCorrect && (
              <div className="absolute -top-6 bg-white border border-emerald-200 text-emerald-600 font-bold px-1.5 py-0.5 rounded shadow-md text-[11px] animate-bounce-in z-10 whitespace-nowrap">
                {expectedChar}
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight flex items-center gap-2">
            <div className="bg-orange-400 text-white p-1.5 rounded-full shadow-sm shrink-0">
               <Edit3 size={20} />
             </div>
            {safeData.mainTitle || '5. 看图片，选择正确的汉字。'}
          </div>
          <div className="text-[13px] md:text-[14px] font-bold text-slate-500 tracking-wide font-sans leading-tight mt-1 md:mt-0">
            {safeData.subTitle || 'ดูภาพแล้วเลือกตัวอักษรจีนที่ถูกต้อง'}
          </div>
        </div>

        {/* 2. Choices Bar (สีเหลืองนวลแบบในรูป) */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-amber-100/50 p-3 md:p-4 rounded-xl border border-amber-200/60 mb-6 shadow-sm">
          {choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isActive = activeChoice?.id === choice.id;
            const isUsed = Object.values(studentAnswers).includes(choice.char);

            return (
              <div 
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all select-none
                  ${userRole === 'student' ? 'cursor-pointer hover:-translate-y-0.5' : ''}
                  ${isActive ? 'bg-orange-500 text-white shadow-md scale-105 ring-2 ring-orange-200' : isUsed ? 'bg-slate-200 text-slate-400 opacity-60' : 'bg-transparent text-slate-700 hover:bg-amber-50'}
                `}
                title={userRole === 'student' ? "คลิกเพื่อเลือกคำตอบนี้" : ""}
              >
                <span className={`font-sans font-medium text-[16px] ${isActive ? 'text-orange-200' : isUsed ? 'text-slate-400' : 'text-slate-600'}`}>{letter}</span>
                <span className={`text-[20px] font-serif font-bold leading-none ${isActive ? 'text-white' : isUsed ? 'text-slate-400' : 'text-slate-800'}`}>
                  {choice.char}
                </span>
              </div>
            );
          })}
          {choices.length === 0 && <span className="text-slate-400 text-[11px] py-2">ยังไม่ได้กำหนดช่องว่างในหน้าตั้งค่า</span>}
        </div>

        {/* Instruction for students */}
        {userRole === 'student' && !revealedCards.includes('ALL') && (
          <div className="text-center text-orange-500 text-[11px] md:text-[12px] font-bold animate-pulse mb-4 bg-orange-50 py-1.5 rounded-lg">
            👆 คลิกเลือกตัวอักษรจีนด้านบน แล้วมาคลิกที่เส้นใต้ช่องว่างเพื่อเติมคำตอบ
          </div>
        )}

        {/* 3. Cards Grid (2 คอลัมน์) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {safeCards.map((card, idx) => {
            const isRecording = recordingId === card.id;
            const scoreData = speechScores[card.id];
            const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');

            return (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                
                {/* ฝั่งซ้าย: ข้อความและช่องว่าง */}
                <div className="flex-1 flex flex-col items-start pr-4 relative z-10">
                  <div className="flex flex-wrap items-end mb-2 pt-1 leading-loose">
                    {renderSentence(card)}
                  </div>

                  {/* แถบเครื่องมือ */}
                  <div className="flex items-center gap-1.5 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => speakChinese(card)} className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-slate-100" title="ฟังเสียงประโยคเต็ม">
                      <Volume2 size={16} />
                    </button>
                    <button onClick={() => { if (isRecording) stopListening(); else startListening(card); }} className={`p-1.5 rounded-full transition-all shadow-sm border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-100 hover:bg-emerald-50'}`} title="ฝึกพูดประโยคเต็ม">
                      {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                    {scoreData && !isRecording && (
                      <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold animate-fade-in ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</div>
                    )}
                  </div>
                </div>

                {/* ฝั่งขวา: รูปภาพประกอบ */}
                <div className="w-[80px] md:w-[100px] h-[80px] md:h-[100px] shrink-0 flex items-center justify-center bg-transparent relative z-10">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt="Card" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-300 text-[10px] bg-slate-50 px-2 py-1 rounded">ไม่มีรูปภาพ</span>
                  )}
                </div>

                {/* ปุ่มเฉลยเฉพาะข้อ สำหรับคุณครู */}
                {userRole === 'teacher' && !isRevealed && (
                  <button 
                    onClick={() => handleTeacherReveal(card.id)}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm border bg-white text-indigo-500 border-slate-100 hover:bg-indigo-50 z-20"
                  >
                    <Eye size={12}/> เฉลย
                  </button>
                )}
                
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100"
                title="ล้างกระดานและคำตอบทั้งหมด"
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