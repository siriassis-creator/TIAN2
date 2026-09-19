// src/components/ChatBot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2, X, Loader2, Bot, Cpu } from 'lucide-react';

interface ChatBotProps {
  lessonTitle: string;
  lessonContext: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// 🎯 Component สำหรับแสดงแบบทดสอบ (Quiz)
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
      
      {/* ส่วนคำถาม */}
      <div className="mb-5 pl-1">
        <div className="text-xl font-bold text-slate-800">{quiz.question_cn}</div>
        <div className="text-[15px] text-slate-600 font-mono mt-1.5">{quiz.question_pinyin}</div>
        <div className="text-[15px] text-slate-700 mt-1">{quiz.question_th}</div>
      </div>

      {/* ส่วนตัวเลือก */}
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

      {/* ปุ่มส่งคำตอบ (แสดงเฉพาะกล่องแชทล่าสุด) */}
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
  
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'chatgpt' | 'groq' | 'cloudflare'>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initialJson = JSON.stringify({
      message: `สวัสดีครับ! วันนี้เรามาทบทวนบทเรียน "${lessonTitle}" กันเถอะ\n同学们好！今天我们来复习一下 "${lessonTitle}" 这节课。\n(Tóngxué men hǎo! Jīntiān wǒmen lái fùxí yíxià zhè jié kè.)\n\nมีคำศัพท์ไหนอยากให้ครูอธิบาย ให้แปลประโยค หรือ **อยากลองทำแบบทดสอบ** พิมพ์บอกครูได้เลยนะ!`,
      vocabularies: [],
      quiz: { is_active: false }
    });
    setMessages([
      { role: 'model', parts: [{ text: initialJson }] }
    ]);
  }, [lessonTitle]);

  const speak = (text: string, lang: 'zh-CN' | 'th-TH') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\[\]\(\)\-\*\_]/g, ''); 
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang; 
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
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

    // 🎯 เพิ่มกฎข้อ 7 เพื่อกำชับเรื่องการแปลคำอ่านไทย (reading) ให้แม่นยำที่สุด
    const systemInstruction = `
      คุณคือ "AI คุณครู" ครูสอนภาษาจีน
      หน้าทึ่: พูดคุย ดึงข้อมูลจาก DATABASE มาอธิบาย แปลประโยค หรือ "สร้างแบบทดสอบ" ให้นักเรียน
      
      --- DATABASE ---
      หัวข้อ: ${lessonTitle}
      ข้อมูล: ${lessonContext}
      ---------------
      
      กฎเหล็กการตอบ (สำคัญมาก):
      1. ห้ามใช้ Markdown สัญลักษณ์พิเศษ
      2. ต้องตอบกลับมาเป็น JSON Format เท่านั้น ตามโครงสร้างนี้:
      {
        "message": "ข้อความทักทาย อธิบาย หรือแปลความหมาย (ต้องมี 3 ส่วน: 1.ไทย 2.จีน 3.พินอิน)",
        "vocabularies": [
          {
            "meaning": "คำแปล",
            "reading": "คำอ่านไทย",
            "pinyin": "พินอิน",
            "chinese": "อักษรจีน",
            "example_cn": "ประโยคตัวอย่างภาษาจีน",
            "example_pinyin": "พินอินของประโยคตัวอย่าง (ต้องมีเสมอ)",
            "example_th": "คำแปลประโยคตัวอย่าง"
          }
        ],
        "quiz": {
          "is_active": true หรือ false (ใส่ true ถ้าต้องการส่งคำถาม),
          "question_cn": "คำถามภาษาจีน",
          "question_pinyin": "พินอินคำถาม",
          "question_th": "คำถามภาษาไทย",
          "options": [
            {
              "id": "A",
              "text_cn": "ตัวเลือกจีน",
              "text_pinyin": "พินอินตัวเลือก",
              "text_th": "ไทยตัวเลือก"
            }
          ]
        }
      }
      3. **กฎการสร้างแบบทดสอบ (Quiz):**
         - หากนักเรียนขอให้สร้างแบบทดสอบ ให้สร้าง "ทีละ 1 ข้อ" ใส่ในก้อน "quiz" เสมอ
         - ต้องมีตัวเลือกอย่างน้อย 3-4 ข้อ (A, B, C, D) 
         - ห้ามตั้งคำถามซ้ำกับข้อที่ผ่านมา
      4. **กฎการเฉลยคำตอบ:**
         - เมื่อนักเรียนพิมพ์ตอบกลับมา ให้คุณเฉลยและอธิบายทันที ลงในช่อง "message"
         - หากนักเรียนขอสร้างข้อสอบหลายข้อ ให้สร้างคำถาม "ข้อต่อไป" ส่งมาพร้อมกันใน "quiz" ทันที จนกว่าจะครบ
      5. **กฎการแปลประโยคหรือกลุ่มคำ (สำคัญมาก):**
         - หากนักเรียนพิมพ์ประโยคยาวๆ หรือพิมพ์คำศัพท์มาเรียงกันหลายๆ คำเพื่อขอให้แปล ในช่อง "message" ห้ามแปลแยกเป็นข้อๆ (1, 2, 3...) เด็ดขาด! ให้ตอบสรุปรวมภาพรวมตามโครงสร้างนี้เท่านั้น:
           ประโยคภาษาจีน: [ประโยคหรือกลุ่มคำภาษาจีนทั้งหมด]
           พินอินรวม: [พินอินของประโยคหรือกลุ่มคำทั้งหมด]
           คำแปลรวม: [คำแปลภาษาไทยภาพรวม]
         - หลังจากที่สรุปภาพรวมใน "message" แล้ว ให้จับคำศัพท์ "แยกทีละคำ" ใส่ลงใน array "vocabularies" ทั้งหมด เพื่อให้ระบบนำไปสร้างเป็นการ์ดคำศัพท์
      6. ห้ามสร้างข้อความที่วนลูป หรือพิมพ์ตัวอักษรซ้ำๆ ไปมาเด็ดขาด
      7. **กฎการเขียนคำอ่านไทย (reading):** ในช่อง "reading" ให้เขียนคำอ่านภาษาไทยเทียบเสียงจากพินอินให้ใกล้เคียงและถูกต้องตามหลักภาษาไทยที่สุด โดยอิงตามการผันวรรณยุกต์ (เสียง 1=สามัญ, 2=จัตวา, 3=เอก, 4=โท) เพื่อช่วยให้นักเรียนระดับเริ่มต้นออกเสียงตามได้ง่ายและแม่นยำ
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
      } else {
        const errorDetail = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        setMessages((prev) => prev.slice(0, -1));
        alert(`AI แจ้งข้อผิดพลาด: ` + (errorDetail || 'ไม่ทราบสาเหตุ'));
      }
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('เบราว์เซอร์ของคุณไม่รองรับการพิมพ์ด้วยเสียง');

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
      const cleanText = safeText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return (
        <div className="flex flex-col gap-3 w-full">
          {/* ข้อความหลักอธิบายหรือเฉลยคำตอบ */}
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

          {/* กล่องคำศัพท์ (ถ้ามี) */}
          {Array.isArray(parsed.vocabularies) && parsed.vocabularies.length > 0 && (
            <div className="flex flex-col gap-3 w-full">
              {parsed.vocabularies.map((v: any, i: number) => (
                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm text-sm font-sans w-full lg:max-w-[85%]">
                  <div className="font-bold text-emerald-800 mb-3 border-b border-emerald-200/50 pb-2 text-base">
                    📖 {v.meaning || '-'}
                  </div>
                  <div className="grid grid-cols-[70px_1fr] gap-y-3 gap-x-2 text-sm items-center">
                    <div className="text-slate-500 font-semibold">การอ่าน:</div>
                    <div className="text-slate-700">{v.reading || '-'}</div>
                    
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

          {/* 🎯 แสดงแบบทดสอบเมื่อ AI ให้คำถามมา */}
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
            <button onClick={onClose} className="hover:bg-emerald-500 p-2 rounded-xl transition-colors">
              <X size={22} />
            </button>
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