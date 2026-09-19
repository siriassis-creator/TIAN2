// src/components/Other_lesson1.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, Volume2, Mic, MicOff, PauseCircle, PlayCircle, Headphones } from 'lucide-react';
import { pinyin as pinyinConverter } from 'pinyin-pro';

export interface DialogueRow {
  speaker: string;
  chinese: string;
  pinyin: string;
}

export interface OtherLesson1Data {
  id?: string;
  patternType: 'other_lesson1';
  titleZh: string; 
  audioTrack: string;
  audioUrl: string;
  imageUrl: string;
  dialogues: DialogueRow[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson1Data;
  onUpdateNote?: (newNote: string) => void;
}

export default function OtherLesson1({ data, onUpdateNote }: Props) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(data.teacherNote || '');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [speechScores, setSpeechScores] = useState<Record<number, { score: number, transcript: string, transcriptPinyin: string }>>({});
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []);

  const toggleAudio = () => {
    if (!data.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.currentTime === audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(data.audioUrl);
      audio.loop = false;
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        audio.currentTime = 0;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        alert('ไม่สามารถโหลดไฟล์เสียงได้ กรุณาตรวจสอบ URL');
      };
      audio.load();
    }
  };

  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort(); 
    }
    setRecordingIdx(null);
  };

  const startListening = (expectedChinese: string, idx: number) => {
    stopListening();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง แนะนำให้ใช้งานผ่าน Google Chrome");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecordingIdx(idx);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const transcriptPinyin = pinyinConverter(transcript);
      
      const cleanTranscript = transcript.replace(/[。，？！、.,?!]/g, '').trim();
      const cleanExpected = expectedChinese.replace(/[。，？！、.,?!]/g, '').trim();

      let matchCount = 0;
      for (let i = 0; i < cleanTranscript.length; i++) {
        if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
      }
      
      const maxLength = Math.max(cleanExpected.length, cleanTranscript.length);
      let calculatedScore = maxLength > 0 ? Math.round((matchCount / maxLength) * 100) : 0;
      if (cleanTranscript === cleanExpected) calculatedScore = 100;

      setSpeechScores(prev => ({
        ...prev,
        [idx]: { score: calculatedScore, transcript, transcriptPinyin }
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setRecordingIdx(null);
    };

    recognition.onend = () => setRecordingIdx(null);

    try { recognition.start(); } catch (e) { setRecordingIdx(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 30) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const titleText = data.titleZh || '一 课文 Kèwén Text';
  const spaceIdx = titleText.indexOf(' ');
  const sectionNum = spaceIdx > -1 ? titleText.substring(0, spaceIdx) : '';
  const mainTitle = spaceIdx > -1 ? titleText.substring(spaceIdx + 1) : titleText;

  return (
    <div className="flex w-full gap-2 transition-all duration-500 items-start my-4 font-sans text-left">
      <div className="bg-white/50 p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative overflow-hidden z-[1]">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        <div className="flex flex-wrap items-center gap-4 mb-10 pl-4">
          <div className="inline-flex items-center bg-slate-200/80 rounded-full pr-1.5 shadow-sm overflow-hidden border border-slate-300">
            {sectionNum && (
              <span className="px-5 font-serif text-[22px] font-bold text-slate-800">
                {sectionNum}
              </span>
            )}
            <div className="bg-slate-400 text-white rounded-full px-5 py-2 flex items-center gap-3 shadow-inner">
              <span className="text-[22px] font-serif leading-none tracking-wide">{mainTitle}</span>
            </div>
          </div>
          
          <button onClick={toggleAudio} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isPlaying || progress > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-slate-300'}`}>
            <div className="relative w-5 h-5 flex items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200 shrink-0">
              <div className="absolute inset-0 transition-all duration-75" style={{ background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}%)` }} />
              <div className={`relative w-2 h-2 bg-white rounded-full shadow-sm ${isPlaying ? 'animate-pulse' : ''}`}></div>
            </div>
            {isPlaying ? <PauseCircle size={18} className="shrink-0" /> : <PlayCircle size={18} className="shrink-0" />}
            <span className="font-bold text-xs ml-1 tracking-wide">{data.audioTrack || '01'}</span>
          </button>

          <div className="bg-amber-400 text-white p-2 rounded-full shadow-sm shrink-0">
            <Headphones size={22} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 pl-4">
          
          <div className="flex-1 space-y-8">
            {(data.dialogues || []).map((dlg, idx) => {
              const isRecording = recordingIdx === idx;
              const scoreData = speechScores[idx];
              return (
                <div key={idx} className="flex items-start gap-3 relative group">
                  {dlg.speaker && (
                    <div className="text-[26px] font-serif text-slate-800 font-bold shrink-0 pt-0.5">
                      {dlg.speaker}
                    </div>
                  )}
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-[28px] font-serif text-slate-800 tracking-wide leading-none">
                        {dlg.chinese}
                      </div>
                      
                      <Volume2 
                        size={20} 
                        className="text-slate-300 hover:text-indigo-500 cursor-pointer transition-colors mt-1"
                        onClick={() => speakChinese(dlg.chinese)}
                        title="ฟังเสียงภาษาจีน"
                      />

                      <button
                        onClick={() => {
                          if (isRecording) {
                            stopListening();
                          } else {
                            startListening(dlg.chinese, idx);
                          }
                        }}
                        disabled={recordingIdx !== null && !isRecording}
                        className={`p-1.5 rounded-full transition-all border shadow-sm mt-1 ${
                          isRecording 
                          ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                          : recordingIdx !== null 
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50' 
                            : 'bg-white text-slate-400 hover:text-emerald-500 hover:border-emerald-200 border-slate-200'
                        }`}
                        title="คลิกเพื่อฝึกพูด"
                      >
                        {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                    </div>

                    <div className="text-xl text-slate-600 font-sans tracking-wide mt-1">
                      {dlg.pinyin}
                    </div>

                    {scoreData && !isRecording && (
                      <div className={`mt-2 flex items-center gap-3 w-fit px-3 py-1.5 rounded-lg border text-sm font-medium animate-fade-in ${getScoreColor(scoreData.score)}`}>
                        <div className="font-bold text-lg">{scoreData.score}%</div>
                        <div className="border-l pl-3 border-current/20 opacity-80 flex flex-col leading-tight">
                          <span>ระบบได้ยิน: "{scoreData.transcript}"</span>
                          <span className="text-[11px] opacity-75 font-sans tracking-wide">({scoreData.transcriptPinyin})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.imageUrl && (
            <div className="w-full md:w-[45%] shrink-0 flex items-start justify-center">
              <img 
                src={data.imageUrl} 
                alt="Conversation Context" 
                className="max-w-full w-auto max-h-[450px] object-contain rounded-xl" 
              />
            </div>
          )}
        </div>

      </div>

      <div className={`transition-all duration-500 ease-in-out flex flex-col bg-amber-50 rounded-xl border border-amber-100 overflow-hidden ${isNoteOpen ? 'w-[280px] opacity-100 px-4 py-6' : 'w-0 opacity-0 p-0 border-0'}`}>
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