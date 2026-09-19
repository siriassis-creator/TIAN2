// src/components/Other_lesson_Money.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, MicOff, CheckCircle2, RotateCcw, Eye, FileText } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FloatingLiveText from './FloatingLiveText';

interface Props {
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLessonMoney({ userRole = 'teacher', roomPin = null }: Props) {
  // Sync States
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Local States
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // ข้อมูลนักเรียน (Local)
  const [studentInfo, setStudentInfo] = useState({ name: '', class: '', number: '' });

  // ข้อมูลคำตอบนักเรียน (Local)
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.money_highlight !== undefined) setActiveHighlight(d.money_highlight);
        if (d.money_revealed !== undefined) setIsRevealed(d.money_revealed);
      }
    });
    return () => unsub();
  }, [roomPin]);

  // --- Teacher Actions ---
  const handleHighlight = async (id: string) => {
    if (userRole !== 'teacher') return;
    const newHighlight = activeHighlight === id ? null : id;
    setActiveHighlight(newHighlight);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { money_highlight: newHighlight }); } catch (e) {}
    }
  };

  const handleToggleReveal = async () => {
    if (userRole !== 'teacher') return;
    const newState = !isRevealed;
    setIsRevealed(newState);
    if (roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { money_revealed: newState }); } catch (e) {}
    }
  };

  const handleReset = async () => {
    if (userRole !== 'teacher') return;
    if (window.confirm('ต้องการล้างไฮไลต์และซ่อนเฉลยใช่หรือไม่?')) {
      setActiveHighlight(null);
      setIsRevealed(false);
      if (roomPin) {
        try { await updateDoc(doc(db, 'live_sessions', roomPin), { money_highlight: null, money_revealed: false }); } catch (e) {}
      }
    }
  };

  // --- Audio & Mic Actions ---
  const speakChinese = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.abort(); 
    setRecordingId(null);
  };

  const startListening = (expectedChinese: string, id: string) => {
    if (!expectedChinese) return;
    stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingId(id);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();
      
      if (cleanTranscript === cleanExpected || cleanExpected.includes(cleanTranscript)) {
        alert(`🎉 เก่งมาก! คุณพูดว่า: ${transcript}`);
      } else {
        alert(`คุณพูดว่า: ${transcript}\nลองใหม่อีกครั้งนะ!`);
      }
    };
    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);

    try { recognition.start(); } catch (e) { setRecordingId(null); }
  };

  // Helper Components
  const HighlightRow = ({ id, title, chinese, pinyin }: { id: string, title?: string, chinese: string, pinyin: string }) => {
    const isHighlighted = activeHighlight === id;
    const isRecording = recordingId === id;

    return (
      <div 
        onClick={() => handleHighlight(id)}
        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${userRole === 'teacher' ? 'cursor-pointer' : ''} ${
          isHighlighted ? 'bg-orange-50 border-orange-300 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
        }`}
      >
        <div className="flex-1">
          {title && <div className="text-sm font-bold text-slate-500 mb-1">{title}</div>}
          <div className="text-[20px] md:text-[24px] font-serif text-slate-800 leading-tight">{chinese}</div>
          <div className="text-[13px] md:text-[14px] text-slate-600 font-sans mt-1">{pinyin}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); speakChinese(chinese); }} className="p-2 rounded-full bg-white shadow-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="ฟังเสียง">
            <Volume2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); if (isRecording) stopListening(); else startListening(chinese, id); }}
            className={`p-2 rounded-full shadow-sm transition-all border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`} 
            title="ฝึกพูด"
          >
            {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full justify-center transition-all duration-500 font-sans text-left pb-32 pt-4 bg-slate-100">
      
      {/* === PAPER CONTAINER === */}
      <div className="bg-white w-full max-w-[900px] shadow-lg rounded-none md:rounded-xl border border-slate-200 overflow-hidden relative">
        
        {/* Decorative Top Border */}
        <div className="h-4 w-full bg-emerald-600"></div>
        <div className="h-1 w-full bg-emerald-300 mt-0.5"></div>

        <div className="p-6 md:p-12">
          
          {/* HEADER SECTION */}
          <div className="border-b-2 border-slate-800 pb-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="font-bold text-slate-800 text-lg">วิชา: ภาษาต่างประเทศ (ภาษาจีน)</div>
              <div className="text-right">
                <div className="font-bold text-slate-800 text-lg">เนื้อหา: ทบทวนสอบปลายภาค</div>
                <div className="text-slate-500 text-sm">ภาคเรียนที่ 2/2568</div>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-center text-emerald-800 my-6 tracking-wide">
              เรื่อง การอ่านจำนวนเงินภาษาจีน (中国的钱)
            </h1>

            {/* Student Info Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="font-bold whitespace-nowrap text-slate-700">ชื่อ-นามสกุล:</span>
                <input type="text" value={studentInfo.name} onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} className="border-b border-dashed border-slate-400 bg-transparent focus:outline-none flex-1 px-2 text-indigo-700 font-bold" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold whitespace-nowrap text-slate-700">ห้อง:</span>
                <input type="text" value={studentInfo.class} onChange={e => setStudentInfo({...studentInfo, class: e.target.value})} className="border-b border-dashed border-slate-400 bg-transparent focus:outline-none w-20 px-2 text-indigo-700 font-bold text-center" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold whitespace-nowrap text-slate-700">เลขที่:</span>
                <input type="text" value={studentInfo.number} onChange={e => setStudentInfo({...studentInfo, number: e.target.value})} className="border-b border-dashed border-slate-400 bg-transparent focus:outline-none w-20 px-2 text-indigo-700 font-bold text-center" />
              </div>
            </div>
          </div>

          {/* CONTENT SECTION 1 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold bg-slate-800 text-white inline-block px-4 py-1 rounded-r-full -ml-6 md:-ml-12 mb-6 shadow-sm">ตอนที่ 1 รู้จักหน่วยเงินจีน</h2>
            <p className="mb-4 text-slate-700 font-medium">จำนวนเงินจีนสามารถใช้คำต่อไปนี้</p>
            
            <div className="grid grid-cols-3 gap-4 bg-orange-50 p-4 md:p-6 rounded-xl border border-orange-100 mb-4">
              <div className="text-center font-bold text-slate-500 border-b border-orange-200 pb-2">ภาษาเขียน</div>
              <div className="text-center font-bold text-slate-500 border-b border-orange-200 pb-2"></div>
              <div className="text-center font-bold text-slate-500 border-b border-orange-200 pb-2">ภาษาพูด</div>
              
              <div className="text-center text-2xl font-serif text-slate-800">元 <span className="text-sm block text-slate-500 font-sans">yuán</span></div>
              <div className="flex items-center justify-center text-slate-400">↔</div>
              <div className="text-center text-2xl font-serif text-emerald-600 font-bold">块 <span className="text-sm block text-slate-500 font-sans font-normal">kuài</span></div>
              
              <div className="text-center text-2xl font-serif text-slate-800">角 <span className="text-sm block text-slate-500 font-sans">jiǎo</span></div>
              <div className="flex items-center justify-center text-slate-400">↔</div>
              <div className="text-center text-2xl font-serif text-emerald-600 font-bold">毛 <span className="text-sm block text-slate-500 font-sans font-normal">máo</span></div>

              <div className="text-center text-2xl font-serif text-slate-800">分 <span className="text-sm block text-slate-500 font-sans">fēn</span></div>
              <div className="flex items-center justify-center text-slate-400">↔</div>
              <div className="text-center text-2xl font-serif text-emerald-600 font-bold">分 <span className="text-sm block text-slate-500 font-sans font-normal">fēn</span></div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-center font-bold border border-emerald-200 shadow-sm">
              1 元 = 10 角 = 100 分 &nbsp;|&nbsp; ในภาษาพูด 1 块 = 10 毛 = 100 分
            </div>
          </div>

          {/* CONTENT SECTION 2 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold bg-slate-800 text-white inline-block px-4 py-1 rounded-r-full -ml-6 md:-ml-12 mb-6 shadow-sm">ตอนที่ 2 การอ่านจำนวนเงินเต็มจำนวน</h2>
            <p className="mb-4 text-slate-700 font-medium">ถ้าไม่มีเศษเงิน สามารถอ่านโดยใช้ <span className="font-bold text-orange-600 font-serif text-lg">元</span> หรือ <span className="font-bold text-emerald-600 font-serif text-lg">块</span></p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <HighlightRow id="h2-1" title="¥1" chinese="一元 / 一块" pinyin="yì yuán / yí kuài" />
              <HighlightRow id="h2-2" title="¥5" chinese="五元 / 五块" pinyin="wǔ yuán / wǔ kuài" />
              <HighlightRow id="h2-3" title="¥10" chinese="十元 / 十块" pinyin="shí yuán / shí kuài" />
              <HighlightRow id="h2-4" title="¥20" chinese="二十元 / 二十块" pinyin="èr shí yuán / èr shí kuài" />
              <HighlightRow id="h2-5" title="¥50" chinese="五十元 / 五十块" pinyin="wǔ shí yuán / wǔ shí kuài" />
              <HighlightRow id="h2-6" title="¥100" chinese="一百元 / 一百块" pinyin="yì bǎi yuán / yì bǎi kuài" />
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-4 items-start">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-bold text-indigo-900 mb-2">*** ถ้าคุยกับเพื่อนหรือซื้อของในชีวิตประจำวัน มักได้ยิน 块 มากกว่า 元 เช่น</p>
                <HighlightRow id="h2-7" chinese="这本书三十块钱。" pinyin="zhè běn shū sān shí kuài qián." />
              </div>
            </div>
          </div>

          {/* CONTENT SECTION 3 & 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <h2 className="text-xl font-bold bg-slate-800 text-white inline-block px-4 py-1 rounded-r-full -ml-6 md:-ml-12 mb-6 shadow-sm">ตอนที่ 3 มี 角/毛</h2>
              <p className="mb-4 text-slate-700 text-sm font-medium">เมื่อมี 1 ตำแหน่งหลังจุดทศนิยม จะอ่านว่า 角 หรือ 毛</p>
              <div className="space-y-2">
                <HighlightRow id="h3-1" title="¥3.5" chinese="三块五毛 / 三元五角" pinyin="sān kuài wǔ máo / sān yuán wǔ jiǎo" />
                <HighlightRow id="h3-2" title="¥5.2" chinese="五块二毛" pinyin="wǔ kuài èr máo" />
                <HighlightRow id="h3-3" title="¥8.6" chinese="八块六毛" pinyin="bā kuài liù máo" />
                <HighlightRow id="h3-4" title="¥12.3" chinese="十二块三毛" pinyin="shí èr kuài sān máo" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold bg-slate-800 text-white inline-block px-4 py-1 rounded-r-full -ml-6 md:-ml-12 mb-6 shadow-sm">ตอนที่ 4 มี 角 และ 分</h2>
              <p className="mb-4 text-slate-700 text-sm font-medium">หลังทศนิยมตำแหน่งที่ 2 จะอ่านว่า 分</p>
              <div className="space-y-2">
                <HighlightRow id="h4-1" title="¥6.23" chinese="六块二毛三分" pinyin="liù kuài èr máo sān fēn" />
                <HighlightRow id="h4-2" title="¥8.55" chinese="八块五毛五分" pinyin="bā kuài wǔ máo wǔ fēn" />
                <HighlightRow id="h4-3" title="¥2.43" chinese="两块四毛三分" pinyin="liǎng kuài sì máo sān fēn" />
              </div>
            </div>
          </div>

          {/* RULES SECTION */}
          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-200 pb-2 text-center uppercase tracking-widest">*** กฎการอ่านตัวเลขเพิ่มเติม ***</h2>
            
            <div className="space-y-6">
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                <h3 className="font-bold text-rose-800 mb-2">กฎข้อที่ 1: ในภาษาพูด สามารถละหน่วยย่อยท้ายสุดได้ เช่น:</h3>
                <div className="space-y-2">
                  <HighlightRow id="r1-1" title="3.50元 →" chinese="三块五" pinyin="sān kuài wǔ" />
                  <HighlightRow id="r1-2" title="12.80元 →" chinese="十二块八" pinyin="shí èr kuài bā" />
                  <HighlightRow id="r1-3" title="1.20元 →" chinese="一块二" pinyin="yí kuài èr" />
                </div>
              </div>

              <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                <h3 className="font-bold text-sky-800 mb-2">กฎข้อที่ 2: เมื่อหน่วย 角(毛) เป็นเลข 0</h3>
                <p className="text-sm text-sky-700 mb-3">เวลาอ่านไม่สามารถละหน่วยได้ ต้องอ่านคำว่า <strong className="text-lg font-serif">零 (líng)</strong> กำกับไว้เสมอ เช่น:</p>
                <HighlightRow id="r2-1" title="7.05元 →" chinese="七块零五分" pinyin="qī kuài líng wǔ fēn" />
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-2">กฎข้อที่ 3: การใช้ 二 และ 两 หลังจุดทศนิยม</h3>
                <p className="text-sm text-amber-700 mb-3">ตำแหน่งหลังจุดทศนิยม อ่านได้ทั้ง <strong className="text-lg font-serif">二 (èr)</strong> และ <strong className="text-lg font-serif">两 (liǎng)</strong> เช่น:</p>
                <div className="space-y-2">
                  <HighlightRow id="r3-1" title="9.2元 →" chinese="九块二毛 / 九块两毛" pinyin="jiǔ kuài èr máo / jiǔ kuài liǎng máo" />
                  <HighlightRow id="r3-2" title="8.52元 →" chinese="八块五毛二分 / 八块五毛两分" pinyin="bā kuài wǔ máo èr fēn / bā kuài wǔ máo liǎng fēn" />
                </div>
              </div>
            </div>
          </div>

          {/* EXERCISES SECTION */}
          <div className="border-t-4 border-slate-800 pt-10 relative">
            
            {/* โชว์เฉลยซ้อนทับถ้าครูกดเปิดเฉลย */}
            {isRevealed && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce-in flex items-center gap-2 z-20">
                <CheckCircle2 size={20} /> เฉลยคำตอบ
              </div>
            )}

            <h2 className="text-2xl font-black text-center text-slate-800 mb-8 tracking-widest">แบบฝึกหัด (练一练)</h2>
            
            <div className="space-y-10">
              {/* Exercise 1 */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-700">1. จงเขียนคำอ่านเป็น Pinyin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { q: "1. 五块", a: "wǔ kuài" },
                    { q: "2. 十块", a: "shí kuài" },
                    { q: "3. 三块五毛", a: "sān kuài wǔ máo" },
                    { q: "4. 八块二毛", a: "bā kuài èr máo" },
                    { q: "5. 三块五毛八", a: "sān kuài wǔ máo bā" }
                  ].map((ex, i) => (
                    <div key={`ex1-${i}`} className="flex items-center gap-3">
                      <span className="font-serif text-lg text-slate-800 w-28 shrink-0">{ex.q} ➔</span>
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="พิมพ์ Pinyin..." 
                          value={answers[`ex1-${i}`] || ''}
                          onChange={e => setAnswers({...answers, [`ex1-${i}`]: e.target.value})}
                          className={`w-full border-b-2 border-dashed bg-transparent focus:outline-none px-2 py-1 transition-colors
                            ${isRevealed ? 'border-emerald-300 text-transparent' : 'border-slate-300 text-indigo-700'}`}
                        />
                        {isRevealed && (
                          <div className="absolute inset-0 flex items-center px-2 text-emerald-600 font-bold font-sans animate-fade-in pointer-events-none">
                            {ex.a}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise 2 */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-700">2. จงเขียนเป็นภาษาจีน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { q: "1. 1.5元", a: "一块五毛 / 一块五" },
                    { q: "2. 2.10元", a: "两块一毛 / 两块一" },
                    { q: "3. 3.5元", a: "三块五毛 / 三块五" },
                    { q: "4. 8.2元", a: "八块两毛 / 八块二毛" },
                    { q: "5. 3.58元", a: "三块五毛八分" },
                    { q: "6. 12.68元", a: "十二块六毛八分" }
                  ].map((ex, i) => (
                    <div key={`ex2-${i}`} className="flex items-center gap-3">
                      <span className="font-sans font-bold text-slate-800 w-28 shrink-0">{ex.q} ➔</span>
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="พิมพ์ภาษาจีน..." 
                          value={answers[`ex2-${i}`] || ''}
                          onChange={e => setAnswers({...answers, [`ex2-${i}`]: e.target.value})}
                          className={`w-full border-b-2 border-dashed bg-transparent focus:outline-none px-2 py-1 font-serif text-lg transition-colors
                            ${isRevealed ? 'border-emerald-300 text-transparent' : 'border-slate-300 text-indigo-700'}`}
                        />
                        {isRevealed && (
                          <div className="absolute inset-0 flex items-center px-2 text-emerald-600 font-bold font-serif text-lg animate-fade-in pointer-events-none">
                            {ex.a}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      {/* === Teacher Control Panel === */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-8 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] border-2 border-slate-200 pointer-events-auto flex items-center gap-4">
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมชีทเรียน</span>
              <span className="text-sm font-bold text-slate-800">เครื่องมือสำหรับครู</span>
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <FloatingLiveText roomPin={roomPin} userRole={userRole} />

            <button 
              onClick={handleToggleReveal} 
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all ${isRevealed ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isRevealed ? <Eye size={18} /> : <FileText size={18} />} 
              {isRevealed ? 'ซ่อนเฉลยแบบฝึกหัด' : 'เปิดเฉลยแบบฝึกหัด'}
            </button>
            
            <button 
              onClick={handleReset} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-sm font-bold transition-all"
            >
              <RotateCcw size={16} /> ล้างกระดาน
            </button>
            
          </div>
        </div>
      )}

      {userRole === 'student' && <FloatingLiveText roomPin={roomPin} userRole={userRole} />}

    </div>
  );
}