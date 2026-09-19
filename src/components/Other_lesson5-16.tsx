// src/components/Other_lesson5-16.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface FillToken {
  id: string;
  char: string;
  pinyin: string;
  isBlank: boolean;
}

export interface FillCard {
  id: string;
  tokens: FillToken[];
  imageUrl: string;
}

export interface OtherLesson5_16Data {
  id?: string;
  patternType: 'other_lesson5-16';
  mainTitle: string;
  subTitle: string;
  cards: FillCard[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_16Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_16({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_16Data);
  const safeCards = safeData.cards || [];

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Speech Assessment State
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<string, { score: number, transcript: string }>>({});
  const recognitionRef = useRef<any>(null);

  // Interactive Game State
  const [activeChoice, setActiveChoice] = useState<{ id: string, pinyin: string } | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({}); // cardId -> choice pinyin
  const [revealedCards, setRevealedCards] = useState<string[]>([]); // array of cardIds

  // ดึงตัวเลือกพินอิน
  const choices = useMemo(() => {
    const extracted: { id: string, pinyin: string }[] = [];
    safeCards.forEach(card => {
      let currentPinyin = "";
      card.tokens?.forEach(t => {
        if (t.isBlank) {
          currentPinyin += t.pinyin + " ";
        } else {
          if (currentPinyin) {
            const py = currentPinyin.trim();
            if (!extracted.find(e => e.pinyin === py)) extracted.push({ id: py, pinyin: py });
            currentPinyin = "";
          }
        }
      });
      if (currentPinyin) {
        const py = currentPinyin.trim();
        if (!extracted.find(e => e.pinyin === py)) extracted.push({ id: py, pinyin: py });
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
        if (d.other5_16_answers !== undefined) setStudentAnswers(d.other5_16_answers);
        if (d.other5_16_reveals !== undefined) setRevealedCards(d.other5_16_reveals);
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
      newAnswers[cardId] = activeChoice.pinyin;
      setActiveChoice(null); 
    } else {
      delete newAnswers[cardId]; 
    }

    setStudentAnswers(newAnswers);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_16_answers: newAnswers }); } catch (e) {}
    }
  };

  const handleTeacherReveal = async (cardId: string) => {
    if (userRole !== 'teacher') return;
    let newReveals = [...revealedCards];
    if (!newReveals.includes(cardId)) newReveals.push(cardId);
    
    setRevealedCards(newReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_16_reveals: newReveals }); } catch (e) {}
    }
  };

  const handleTeacherRevealAll = async () => {
    if (userRole !== 'teacher') return;
    const allReveals = ['ALL'];
    setRevealedCards(allReveals);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_16_reveals: allReveals }); } catch (e) {}
    }
  };

  const handleTeacherReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างกระดานและคำตอบทั้งหมดใช่หรือไม่?')) {
      setRevealedCards([]);
      setStudentAnswers({});
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { other5_16_reveals: [], other5_16_answers: {} }); } catch (e) {}
      }
    }
  };

  const speakChinese = (card: FillCard) => {
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

  const startListening = (card: FillCard) => {
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

  // Group tokens for rendering
  const renderSentence = (card: FillCard) => {
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
          <div key={idx} className="inline-flex flex-col items-center mx-0.5 align-bottom">
            <span className="text-[18px] md:text-[20px] font-serif text-slate-800 leading-tight">{g.chars.join('')}</span>
            <span className="text-[11px] md:text-[12px] text-slate-500 font-sans mt-0.5">{g.pinyins.join(' ')}</span>
          </div>
        );
      } else {
        const expectedPinyin = g.pinyins.join(' ').trim();
        const studentAns = studentAnswers[card.id];
        const isRevealed = revealedCards.includes(card.id) || revealedCards.includes('ALL');
        const isCorrect = studentAns === expectedPinyin;

        return (
          <div 
            key={idx} 
            className={`inline-flex flex-col items-center justify-end mx-1 align-bottom relative cursor-pointer group/drop
              ${userRole === 'student' && !isRevealed ? 'hover:scale-105 transition-transform' : ''}
            `}
            onClick={() => handleDropzoneClick(card.id)}
            title={userRole === 'student' && !isRevealed ? "คลิกเพื่อเติมคำตอบ / ลบคำตอบ" : ""}
          >
            <span className="text-[18px] md:text-[20px] font-serif text-slate-800 leading-tight mb-0.5">
              {g.chars.join('')}
            </span>

            {studentAns ? (
              <span className={`text-[12px] md:text-[14px] font-sans font-bold border-b-2 px-2 pb-0.5 leading-tight whitespace-nowrap
                ${isRevealed ? (isCorrect ? 'text-emerald-600 border-emerald-500' : 'text-red-500 border-red-500') : 'text-indigo-600 border-indigo-400 bg-indigo-50/50 rounded-t-md'}
              `}>
                {studentAns}
              </span>
            ) : (
              <span className={`text-[12px] md:text-[14px] border-b-2 px-4 pb-0.5 leading-tight
                ${activeChoice && userRole === 'student' ? 'border-orange-400 bg-orange-50/50 rounded-t-md animate-pulse text-transparent' : 'border-slate-300 text-transparent'}
              `}>_</span>
            )}
            
            {isRevealed && !isCorrect && (
              <div className="absolute -bottom-5 bg-white border border-emerald-200 text-emerald-600 font-bold px-1.5 py-0.5 rounded shadow-md text-[10px] animate-bounce-in z-10 whitespace-nowrap">
                {expectedPinyin}
              </div>
            )}
            
            {isRevealed && studentAns && (
              <div className="absolute -right-3 top-[40%] animate-fade-in z-10">
                {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500 bg-white rounded-full" /> : <XCircle size={14} className="text-red-500 bg-white rounded-full" />}
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
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 pr-8">
          <div className="text-[16px] md:text-[18px] font-bold text-slate-800 tracking-wide font-sans leading-tight">
            {safeData.mainTitle || '2. 看图片，选择正确的词语，完成句子。'}
          </div>
          <div className="text-[13px] md:text-[14px] font-bold text-slate-500 tracking-wide font-sans leading-tight">
            {safeData.subTitle || 'ดูภาพแล้วเลือกคำศัพท์ไปเติมลงในช่องว่างให้ถูกต้อง'}
          </div>
        </div>

        {/* 2. Choices Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-emerald-50/50 p-3 md:p-4 rounded-xl border border-emerald-100 mb-4 shadow-sm">
          {choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isActive = activeChoice?.id === choice.id;
            const isUsed = Object.values(studentAnswers).includes(choice.pinyin);

            return (
              <div 
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all select-none
                  ${userRole === 'student' ? 'cursor-pointer hover:-translate-y-0.5' : ''}
                  ${isActive ? 'bg-orange-500 text-white shadow-md scale-105 ring-2 ring-orange-200' : isUsed ? 'bg-slate-200 text-slate-400 opacity-60' : 'bg-white text-slate-700 shadow-sm border border-slate-100 hover:border-emerald-300'}
                `}
                title={userRole === 'student' ? "คลิกเพื่อเลือกคำตอบนี้" : ""}
              >
                <span className={`font-bold text-[14px] ${isActive ? 'text-orange-200' : isUsed ? 'text-slate-400' : 'text-emerald-600'}`}>{letter}</span>
                <span className={`text-[16px] font-sans font-bold leading-none tracking-wide ${isActive ? 'text-white' : isUsed ? 'text-slate-400' : 'text-emerald-700'}`}>
                  {choice.pinyin}
                </span>
              </div>
            );
          })}
          {choices.length === 0 && <span className="text-slate-400 text-[11px] py-2">ยังไม่ได้กำหนดช่องว่างในหน้าตั้งค่า</span>}
        </div>

        {/* Instruction for students */}
        {userRole === 'student' && !revealedCards.includes('ALL') && (
          <div className="text-center text-orange-500 text-[11px] md:text-[12px] font-bold animate-pulse mb-3 bg-orange-50 py-1.5 rounded-lg">
            👆 คลิกเลือกคำศัพท์ด้านบน แล้วมาคลิกที่เส้นใต้ช่องว่างเพื่อเติมคำตอบพินอิน
          </div>
        )}

        {/* 3. Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20">
          {safeCards.map((card, idx) => {
            const isRecording = recordingId === card.id;
            const scoreData = speechScores[card.id];

            return (
              <div key={card.id} className="bg-orange-50/50 rounded-2xl border border-orange-100 p-3 md:p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative">
                
                {/* Number Badge */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                  {idx + 1}
                </div>

                {/* Sentence */}
                <div className="flex flex-wrap items-end justify-center min-h-[60px] mb-3 pt-1">
                  {renderSentence(card)}
                </div>

                {/* Image (พื้นหลังสีขาว ไม่มีกรอบ/เงา ให้เป็นเนื้อเดียว) */}
                <div className="flex-1 flex items-center justify-center bg-white min-h-[90px] w-full">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt="Card" className="max-w-full max-h-[90px] object-contain" />
                  ) : (
                    <span className="text-slate-300 text-[10px]">ไม่มีรูปภาพ</span>
                  )}
                </div>

                {/* Bottom Tools */}
                <div className="mt-3 flex items-center justify-between border-t border-orange-100/50 pt-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => speakChinese(card)} className="p-1.5 rounded-full bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-slate-100" title="ฟังเสียงประโยคเต็ม">
                      <Volume2 size={16} />
                    </button>
                    <button onClick={() => { if (isRecording) stopListening(); else startListening(card); }} className={`p-1.5 rounded-full transition-all shadow-sm border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-slate-100 hover:bg-emerald-50'}`} title="ฝึกพูดประโยคเต็ม">
                      {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                    {scoreData && !isRecording && (
                      <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold animate-fade-in ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</div>
                    )}
                  </div>
                  
                  {/* ปุ่มเฉลยเฉพาะข้อ สำหรับคุณครู */}
                  {userRole === 'teacher' && !revealedCards.includes('ALL') && (
                    <button 
                      onClick={() => handleTeacherReveal(card.id)}
                      disabled={revealedCards.includes(card.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm border ${revealedCards.includes(card.id) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-indigo-600 border-slate-100 hover:bg-indigo-50'}`}
                    >
                      {revealedCards.includes(card.id) ? <CheckCircle2 size={12}/> : <Eye size={12}/>} 
                      {revealedCards.includes(card.id) ? 'เฉลยแล้ว' : 'เฉลยข้อนี้'}
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