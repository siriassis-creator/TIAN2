// src/components/ChatBot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2, VolumeX, X, Loader2, Bot, Cpu } from 'lucide-react';

interface ChatBotProps {
  lessonTitle: string;
  lessonContext: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const QuizBlock = ({ quiz, onSend, isLast, speak, isLoading }: any) => {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || !quiz.is_active) return null;

  return (
    <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-5 shadow-sm w-full lg:max-w-[90%] mt-3">
      <div className="font-bold text-indigo-900 mb-4 border-b border-indigo-200/60 pb-3 flex justify-between items-center">
        <span className="flex items-center gap-2 text-base">📝 แบบทดสอบความเข้าใจ</span>
        {quiz.question_cn && (
          <button onClick={() => speak(quiz.question_cn, 'zh-CN')} className="text-indigo-600 hover:text-indigo-800 bg-indigo-100 p-2 rounded-full transition-colors shadow-sm">
            <Volume2 size={18} />
          </button>
        )}
      </div>
      
      <div className="mb-5 pl-1">
        <div className="text-xl font-bold text-slate-800">{quiz.question_cn}</div>
        <div className="text-[15px] text-slate-600 font-mono mt-1.5">{quiz.question_pinyin}</div>
        <div className="text-[15px] text-slate-700 mt-1">{quiz.question_th}</div>
      </div>

      <div className="space-y-3">
        {quiz.options?.map((opt: any, i: number) => (
          <label 
            key={i} 
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selected === opt.id 
                ? 'bg-indigo-100/50 border-indigo-400 shadow-sm' 
                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <input 
              type="radio" 
              name={`quiz-opt-${quiz.question_cn}`}
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => !submitted && setSelected(opt.id)}
              disabled={submitted || !isLast || isLoading}
              className="mt-1 w-4 h-4 text-indigo-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-lg">{opt.text_cn}</span>
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); speak(opt.text_cn, 'zh-CN'); }} 
                  className="text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 p-1.5 rounded-full transition-colors"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <div className="text-sm text-slate-500 font-mono mt-1">{opt.text_pinyin}</div>
              <div className="text-sm text-slate-600 mt-0.5">{opt.text_th}</div>
            </div>
          </label>
        ))}
      </div>

      {isLast && !submitted && (
        <button 
          onClick={() => {
            if(selected) {
              setSubmitted(true);
              onSend(`ฉันขอตอบตัวเลือก: ${selected}`);
            }
          }}
          disabled={!selected || isLoading}
          className="mt-5 w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md flex justify-center items-center gap-2 text-base"
        >
          ส่งคำตอบ <Send size={18} />
        </button>
      )}
    </div>
  );
};

export default function ChatBot({ lessonTitle, lessonContext, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState<'th-TH' | 'zh-CN'>('th-TH'); 
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  
  // 🎯 เพิ่ม deepseek เข้าไปใน Type
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'chatgpt' | 'groq' | 'cloudflare' | 'deepseek'>('gemini');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const stopAudio = () => {
    isPlayingRef.current = false;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initialJson = JSON.stringify({
      message: `สวัสดีครับ! วันนี้เรามาทบทวนบทเรียน "${lessonTitle}" กันเถอะ\n同学们好！今天我们来复习一下 "${lessonTitle}" 这节课。\n(Tóngxué men hǎo! Jīntiān wǒmen lái fùxí yíxià zhè jié kè.)\n\nมีคำศัพท์ไหนอยากให้ครูอธิบาย ให้แปลประโยค หรือ **อยากลองทำแบบทดสอบ** พิมพ์บอกครูได้เลยนะ! สามารถดูรายละเอียดข้างล่างได้เลยครับ`,
      vocabularies: [],
      quiz: { is_active: false }
    });
    setMessages([
      { role: 'model', parts: [{ text: initialJson }] }
    ]);
  }, [lessonTitle]);

  const speak = async (text: string, defaultLang: 'zh-CN' | 'th-TH' = 'th-TH') => {
    stopAudio(); 
    isPlayingRef.current = true;

    let cleanText = text.replace(/\([a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+\)/g, '');
    cleanText = cleanText.replace(/[\[\]\-\*\_]/g, '');

    const segments = cleanText.split(/([\u4e00-\u9fa5]+)/g);

    for (const segment of segments) {
      if (!isPlayingRef.current) break; 
      if (!segment.trim()) continue;

      const isChinese = /[\u4e00-\u9fa5]/.test(segment);
      const langCode = isChinese ? 'zh-CN' : (defaultLang === 'zh-CN' ? 'zh-CN' : 'th');

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: segment, lang: langCode })
        });

        if (response.ok && isPlayingRef.current) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          await new Promise((resolve) => {
            audio.onended = resolve;
            audio.onerror = resolve; 
            audio.play();
          });
        }
      } catch (e) {
        console.error("ระบบดึงเสียงทำงานผิดพลาด:", e);
      }
    }
  };

  const triggerAutoSpeak = (replyText: string) => {
    if (!isAutoSpeak) return; 
    
    try {
      let cleanText = replyText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIdx = cleanText.indexOf('{');
      const endIdx = cleanText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
          cleanText = cleanText.substring(startIdx, endIdx + 1);
      }
      const parsed = JSON.parse(cleanText);
      
      if (parsed.message) {
        speak(parsed.message, 'th-TH');
      }
    } catch (e) {
      speak(replyText, 'th-TH');
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const newUserMsg: Message = { role: 'user', parts: [{ text: textToSend }] };
    const historyToKeep = messages.filter((msg, idx) => !(idx === 0 && msg.role === 'model'));
    const newHistoryForApi = [...historyToKeep, newUserMsg].slice(-6);

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    const systemInstruction = `
      คุณคือ "AI คุณครู" ครูสอนภาษาจีน
      หน้าทึ่: พูดคุย ดึงข้อมูลจาก DATABASE มาอธิบาย แปลประโยค หรือ "สร้างแบบทดสอบ" ให้นักเรียน
      
      --- DATABASE ---
      หัวข้อ: ${lessonTitle}
      ข้อมูล: ${lessonContext}
      ---------------
      
      กฎเหล็กการตอบ (สำคัญมาก):
      1. ต้องตอบกลับมาเป็น JSON Format เท่านั้น ขึ้นต้นด้วย { และจบด้วย } ห้ามมีข้อความเกริ่นนำหรือลงท้าย
      2. โครงสร้าง JSON ต้องเป็นไปตามนี้:
      {
        "message": "คำตอบแบบสั้น กระชับที่สุด และต้องลงท้ายด้วยคำว่า 'สามารถดูรายละเอียดข้างล่างได้เลยค่ะ/ครับ' เสมอ ห้ามอธิบายยาวๆ ในช่องนี้เด็ดขาด",
        "vocabularies": [
          {
            "meaning": "คำแปล",
            "reading_th": "คำอ่านภาษาไทย (เช่น เสวีย-เสี้ยว)",
            "pinyin": "พินอิน",
            "chinese": "อักษรจีน",
            "example_cn": "ประโยคตัวอย่างภาษาจีน",
            "example_pinyin": "พินอินประโยคตัวอย่าง",
            "example_th": "คำแปลประโยคตัวอย่าง"
          }
        ],
        "quiz": {
          "is_active": true หรือ false,
          "question_cn": "คำถามภาษาจีน",
          "question_pinyin": "พินอินคำถาม",
          "question_th": "คำถามภาษาไทย",
          "options": [
            { "id": "A", "text_cn": "จีน", "text_pinyin": "พินอิน", "text_th": "ไทย" }
          ]
        }
      }
      3. การสร้างแบบทดสอบ: สร้างทีละ 1 ข้อ มี 3-4 ตัวเลือก เมื่อนักเรียนตอบ ให้เฉลยใน message สั้นๆ และส่งข้อต่อไปมาใน quiz
      4. การแปลประโยคหรือกลุ่มคำ: ตอบสรุปสั้นๆ ใน message แล้วค่อยนำคำศัพท์ "แยกทีละคำ" ใส่ลงใน vocabularies เพื่อให้การ์ดคำศัพท์ทำงาน
      5. กฎคำอ่านภาษาไทย: ช่อง "reading_th" บังคับเขียนคำอ่านภาษาไทยเทียบเสียงพินอินให้ถูกต้องเสมอ
      6. ห้ามใช้เครื่องหมาย Enter หรือเว้นบรรทัดแบบปกติภายใน JSON
    `;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistoryForApi,
          systemInstruction: systemInstruction,
          provider: selectedProvider
        })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
        triggerAutoSpeak(data.reply);
      } else {
        const errorDetail = String(typeof data.error === 'object' ? JSON.stringify(data.error) : (data.error || 'ไม่ทราบสาเหตุ'));
        const errorLower = errorDetail.toLowerCase();
        const isRateLimit = response.status === 429 || errorLower.includes('limit') || errorLower.includes('quota') || errorLower.includes('429');

        const fallbackMsg = JSON.stringify({
          message: isRateLimit 
            ? `ตอนนี้คุณครู ${selectedProvider} สอนนักเรียนเยอะมากจนโควต้าเต็มแล้วค่ะ 😅 รบกวนรอสัก 1-2 นาที หรือสลับไปถาม "คุณครูท่านอื่น" ที่แถบด้านบนแทนก่อนนะคะ!`
            : `อ๊ะ! คุณครู ${selectedProvider} พบข้อผิดพลาดนิดหน่อยค่ะ (${errorDetail}) รบกวนนักเรียนลองสลับไปถามคุณครูท่านอื่นแทนก่อนนะคะ 🙏`,
          vocabularies: [],
          quiz: { is_active: false }
        });
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: fallbackMsg }] }]);
        triggerAutoSpeak(fallbackMsg);
      }
    } catch (err) {
      const fallbackMsg = JSON.stringify({
        message: "ระบบขัดข้อง หรือ อินเทอร์เน็ตมีปัญหาค่ะ 😥 รบกวนตรวจสอบสัญญาณ หรือลองเปลี่ยนคุณครูที่แถบด้านบนดูนะคะ!",
        vocabularies: [],
        quiz: { is_active: false }
      });
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: fallbackMsg }] }]);
      triggerAutoSpeak(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const fallbackMsg = JSON.stringify({
        message: "เบราว์เซอร์ของนักเรียนไม่รองรับระบบพิมพ์ด้วยเสียงค่ะ แนะนำให้ใช้ Google Chrome หรือ Safari ในมือถือนะคะ 🎤",
        vocabularies: [],
        quiz: { is_active: false }
      });
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: fallbackMsg }] }]);
      triggerAutoSpeak(fallbackMsg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = micLang; 
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript); 
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const renderModelMessage = (text: string, isLast: boolean) => {
    try {
      const safeText = typeof text === 'string' ? text : JSON.stringify(text);
      let cleanText = safeText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const startIdx = cleanText.indexOf('{');
      const endIdx = cleanText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
          cleanText = cleanText.substring(startIdx, endIdx + 1);
      }
      
      const parsed = JSON.parse(cleanText);
      
      return (
        <div className="flex flex-col gap-3 w-full">
          {parsed.message && (
            <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{String(parsed.message)}</p>
              <button 
                onClick={() => speak(String(parsed.message), 'th-TH')} 
                className="mt-3 text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors w-max"
              >
                <Volume2 size={16} /> ฟังเสียงคุณครู
              </button>
            </div>
          )}

          {Array.isArray(parsed.vocabularies) && parsed.vocabularies.length > 0 && (
            <div className="flex flex-col gap-3 w-full">
              {parsed.vocabularies.map((v: any, i: number) => (
                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm text-sm font-sans w-full lg:max-w-[85%]">
                  <div className="font-bold text-emerald-800 mb-3 border-b border-emerald-200/50 pb-2 text-base">
                    📖 {v.meaning || '-'}
                  </div>
                  <div className="grid grid-cols-[70px_1fr] gap-y-3 gap-x-2 text-sm items-center">
                    <div className="text-slate-500 font-semibold">การอ่าน:</div>
                    <div className="text-slate-700 font-medium">{v.reading_th || v.reading || '-'}</div>
                    
                    <div className="text-slate-500 font-semibold">Pinyin:</div>
                    <div className="text-slate-700">{v.pinyin || '-'}</div>
                    
                    <div className="text-slate-500 font-semibold mt-1">เขียน:</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xl font-bold text-slate-800 leading-none">{v.chinese || '-'}</span>
                      {v.chinese && (
                        <button onClick={() => speak(v.chinese, 'zh-CN')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-100 p-1.5 rounded-full">
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {(v.example_cn || v.example_th) && (
                    <div className="mt-4 pt-3 border-t border-emerald-200/50">
                      <div className="text-[11px] text-slate-400 font-bold uppercase mb-1.5">ตัวอย่างประโยค</div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-800 text-base">{v.example_cn || ''}</span>
                          {v.example_pinyin && <span className="text-slate-500 text-sm font-mono">{v.example_pinyin}</span>}
                          <span className="text-slate-600 text-sm">{v.example_th || ''}</span>
                        </div>
                        {v.example_cn && (
                          <button onClick={() => speak(v.example_cn, 'zh-CN')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-100 p-2 rounded-full shrink-0 mt-0.5">
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <QuizBlock 
            quiz={parsed.quiz} 
            onSend={handleSend} 
            isLast={isLast} 
            speak={speak} 
            isLoading={isLoading} 
          />
        </div>
      );
    } catch (e) {
      console.error("JSON Parse Error: ", e);
      const fallbackText = typeof text === 'string' ? text : JSON.stringify(text);
      return (
        <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{fallbackText}</p>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-50 flex flex-col z-[9999] overflow-hidden">
      
      <div className="bg-emerald-600 text-white p-3 shadow-md z-10 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col gap-3">
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Bot size={26} />
              <h3 className="font-bold text-lg">AI ติวเตอร์ภาษาจีน</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsAutoSpeak(!isAutoSpeak);
                  stopAudio(); 
                }}
                className={`p-2 rounded-xl transition-colors shadow-sm flex items-center gap-1 ${
                  isAutoSpeak ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-100/20 hover:bg-slate-100/30 text-emerald-100'
                }`}
                title={isAutoSpeak ? "ปิดเสียงพูดอัตโนมัติ" : "เปิดเสียงพูดอัตโนมัติ"}
              >
                {isAutoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <button onClick={onClose} className="hover:bg-emerald-500 p-2 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-emerald-700/60 p-2 rounded-xl border border-emerald-400/30">
            <Cpu size={18} className="text-emerald-100 shrink-0 ml-1" />
            <select 
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as any)}
              className="bg-transparent border-none text-white outline-none w-full cursor-pointer font-medium text-base"
            >
              <option value="gemini" className="text-slate-800">คุณครู GeGe</option>
              <option value="groq" className="text-slate-800">คุณครู LUNA</option>
              <option value="cloudflare" className="text-slate-800">คุณครู SKY</option>
              <option value="chatgpt" className="text-slate-800">คุณครู GPT</option>
              {/* 🎯 เพิ่มคุณครู DeepSeek ในเมนูให้เลือก */}
              <option value="deepseek" className="text-slate-800">คุณครู DeepSeek</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-[#f8fafc]">
        <div className="w-full max-w-3xl space-y-6 pb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-2xl p-4 shadow-sm bg-emerald-100 text-emerald-950 rounded-tr-none">
                  <p className="text-[15px] leading-relaxed">{msg.parts[0].text}</p>
                </div>
              ) : (
                renderModelMessage(msg.parts[0].text, idx === messages.length - 1)
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3 border border-slate-200 text-slate-500 text-sm">
                <Loader2 className="animate-spin w-5 h-5 text-emerald-500" /> คุณครูกำลังคิดคำตอบ...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-center shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-3xl flex items-center gap-3">
          <button 
            onClick={() => setMicLang(prev => prev === 'th-TH' ? 'zh-CN' : 'th-TH')}
            className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-3 rounded-2xl hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            {micLang === 'th-TH' ? '🇹🇭 พูดไทย' : '🇨🇳 พูดจีน'}
          </button>

          <button 
            onClick={toggleListen}
            className={`p-3.5 rounded-full flex-shrink-0 transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <Mic size={20} />
          </button>
          <input 
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
            placeholder="พิมพ์ถาม สั่งให้แปล หรือขอให้ครูทำแบบทดสอบได้เลย..."
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3.5 text-[15px] focus:ring-2 focus:ring-emerald-500 outline-none w-full"
          />
          <button 
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="p-3.5 bg-emerald-600 text-white rounded-full flex-shrink-0 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}