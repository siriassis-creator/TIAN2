// src/components/Other_lesson5-8.tsx
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, X, PauseCircle, PlayCircle, Headphones, Volume2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface OtherLesson5_8Data {
  id?: string;
  patternType: 'other_lesson5-8';
  mainTitle: string;
  subTitle: string;
  audioTrack: string;
  audioUrl: string;
  topImageUrl: string;    // จะใช้แสดงเป็นรูปฝั่งซ้าย
  bottomImageUrl: string; // จะใช้แสดงเป็นรูปฝั่งขวา
  topBoxes?: any[];       // เก็บโครงสร้างไว้เผื่อข้อมูลเก่า แต่ไม่นำมาแสดงผล
  bottomBoxes?: any[];
  teacherNote?: string;
}

interface Props {
  data: OtherLesson5_8Data;
  onUpdateNote?: (newNote: string) => void;
  userRole?: 'teacher' | 'student';
  roomPin?: string | null;
}

export default function OtherLesson5_8({ data, onUpdateNote, userRole = 'teacher', roomPin = null }: Props) {
  const safeData = data || ({} as OtherLesson5_8Data);
  const fbKeyAudio = `other5_8_audio_${safeData.id || 'default'}`; 

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [tempNote, setTempNote] = useState(safeData.teacherNote || '');
  
  // Audio Player State
  const [playbackState, setPlaybackState] = useState<'idle' | 'local_playing' | 'broadcast_playing'>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalTs = useRef<number>(0);

  // ฟังก์ชันเตรียมไฟล์เสียง
  const initAudio = () => {
    if (!audioRef.current && safeData.audioUrl) {
      const audio = new Audio(safeData.audioUrl);
      audio.loop = false;
      audio.onended = () => {
        setPlaybackState('idle');
        setProgress(0);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onerror = () => {
        setPlaybackState('idle');
        audioRef.current = null;
        console.error('Audio load error');
      };
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // Firebase Sync: รับคำสั่งเสียง
  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        
        // รับคำสั่งเล่นเสียงจากครู (Broadcast)
        const audioCmd = d[fbKeyAudio];
        if (audioCmd && audioCmd.ts !== lastSignalTs.current) {
          lastSignalTs.current = audioCmd.ts;
          const audio = initAudio();
          if (audio) {
            if (audioCmd.action === 'PLAY') {
              if (Math.abs(audio.currentTime - (audioCmd.currentTime || 0)) > 1) {
                audio.currentTime = audioCmd.currentTime || 0;
              }
              if (audio.currentTime === audio.duration) audio.currentTime = 0;
              
              audio.play().then(() => {
                setPlaybackState('broadcast_playing');
              }).catch(e => console.log('Autoplay error:', e)); 
            } else if (audioCmd.action === 'PAUSE') {
              audio.pause();
              if (audioCmd.currentTime !== undefined) {
                audio.currentTime = audioCmd.currentTime;
                if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
              }
              setPlaybackState('idle');
            } else if (audioCmd.action === 'SEEK') {
                // +++ เลื่อนแถบตามครู +++
                if (audioCmd.currentTime !== undefined) {
                    audio.currentTime = audioCmd.currentTime;
                    if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
                }
            }
          }
        }
      }
    });
    return () => unsub();
  }, [roomPin, fbKeyAudio, safeData.audioUrl]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ปุ่มที่ 1: ฟังเองคนเดียว (Local Play / Pause)
  const toggleLocalAudio = () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    const audio = initAudio();
    if (!audio) return;
    
    if (playbackState === 'local_playing') {
      audio.pause();
      setPlaybackState('idle');
    } else {
      if (audio.currentTime === audio.duration) audio.currentTime = 0;
      audio.play().then(() => setPlaybackState('local_playing'));
    }
  };

  // ปุ่มที่ 2: ครูสั่ง Broadcast ไปหานักเรียนทั้งห้อง (Play / Pause)
  const toggleBroadcastAudio = async () => {
    if (!safeData.audioUrl) return alert('กรุณาระบุ URL ไฟล์เสียง');
    if (userRole !== 'teacher' || !roomPin) return;

    const newAction = playbackState === 'broadcast_playing' ? 'PAUSE' : 'PLAY';
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0; 
    
    try {
      await updateDoc(doc(db, 'live_sessions', roomPin), {
        [fbKeyAudio]: { action: newAction, ts: Date.now(), currentTime }
      });
    } catch(e) {
      console.error("Broadcast audio error", e);
    }
  };

  // +++ ฟังก์ชันเลื่อน Slider ของไฟล์เสียง +++
  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = Number(e.target.value);
      setProgress(newProgress);

      const audio = initAudio();
      if (audio && audio.duration) {
          const newTime = (newProgress / 100) * audio.duration;
          audio.currentTime = newTime;
          
          if (userRole === 'teacher' && roomPin && playbackState === 'broadcast_playing') {
              try {
                  await updateDoc(doc(db, 'live_sessions', roomPin), {
                      [fbKeyAudio]: { action: 'SEEK', ts: Date.now(), currentTime: newTime }
                  });
              } catch (err) {}
          }
      }
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
      <div className="bg-[#fcfaf7] p-6 md:p-12 rounded-xl shadow-sm border border-slate-100 flex-1 relative z-[1] pb-24">
        
        <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`absolute top-6 right-6 p-1.5 rounded transition-all z-[30] ${isNoteOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}>
          <StickyNote size={22} />
        </button>

        {/* 1. Header (ป้ายส้ม) */}
        <div className="mb-6 pl-4 flex items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-orange-400 border-2 border-orange-100">
            <Headphones size={36} />
          </div>
          <div className="inline-flex items-center justify-center bg-orange-300/80 rounded-full px-8 py-2.5 shadow-sm relative overflow-hidden">
            <span className="relative text-2xl font-bold text-white tracking-wide font-sans drop-shadow-md">
              {safeData.mainTitle || '说一说 ฝึกพูดให้คล่อง'}
            </span>
          </div>
        </div>

        {/* 2. Subtitle & Audio Control */}
        <div className="mb-12 pl-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="text-[20px] font-bold text-slate-700 tracking-wide font-sans leading-tight">
            {safeData.subTitle || '1. 听录音，说一说。 ฟังแล้วฝึกพูด'}
          </div>
          
          {/* +++ STUDENT AUDIO CONTROLS +++ */}
          {userRole !== 'teacher' && (
            <div className="flex flex-col gap-2 min-w-[250px] relative z-[30] pointer-events-auto">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm px-4 py-1.5 w-fit">
                <button onClick={toggleLocalAudio} className="flex items-center gap-2 text-slate-500 hover:text-orange-600">
                  {playbackState === 'broadcast_playing' ? <Volume2 size={18} className="animate-pulse text-orange-500" /> : (playbackState === 'local_playing' ? <PauseCircle size={18} /> : <PlayCircle size={18} />)}
                  <span className="font-bold text-xs tracking-wide">
                    {playbackState === 'broadcast_playing' ? '📢 เสียงจากครู...' : (progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : (safeData.audioTrack || '05-04'))}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2 px-2">
                  <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress} 
                      onChange={handleSeek}
                      disabled={playbackState === 'broadcast_playing'} 
                      className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500
                          ${playbackState === 'broadcast_playing' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                  />
              </div>
            </div>
          )}
        </div>

        {/* 3. Images Side-by-Side Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 relative z-[20]">
          
          {/* รูปฝั่งซ้าย (อิงจาก topImageUrl ใน Setting) */}
          <div className="flex flex-col items-center pointer-events-none">
            {safeData.topImageUrl ? (
              <img 
                src={safeData.topImageUrl} 
                alt="Image Left" 
                className="w-full h-auto rounded-3xl shadow-sm border-2 border-slate-200 object-contain hover:shadow-lg transition-shadow"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพประกอบฝั่งซ้าย
              </div>
            )}
          </div>

          {/* รูปฝั่งขวา (อิงจาก bottomImageUrl ใน Setting) */}
          <div className="flex flex-col items-center pointer-events-none">
            {safeData.bottomImageUrl ? (
              <img 
                src={safeData.bottomImageUrl} 
                alt="Image Right" 
                className="w-full h-auto rounded-3xl shadow-sm border-2 border-slate-200 object-contain hover:shadow-lg transition-shadow"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพประกอบฝั่งขวา
              </div>
            )}
          </div>

        </div>
      </div>

      {/* +++ Teacher Control Panel +++ */}
      {userRole === 'teacher' && (
        <div className={`fixed bottom-24 md:bottom-28 left-0 w-full p-4 flex justify-center pointer-events-none z-[100] transition-all duration-500 ${roomPin ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 md:py-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-2 border-slate-200 pointer-events-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
            
            {/* โซนที่ 1: ชื่อแผงควบคุม */}
            <div className="flex flex-col items-center md:items-start shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">แผงควบคุมครู</span>
              <span className="text-xs font-bold text-slate-800">เครื่องมือจัดการห้องเรียน</span>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>

            {/* โซนที่ 2: เครื่องมือเสียงครู */}
            <div className="flex flex-col gap-2 w-full md:w-[280px]">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-inner">
                  <button 
                    onClick={toggleLocalAudio} 
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 flex-1 rounded-full transition-all ${playbackState === 'local_playing' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
                  >
                    {playbackState === 'local_playing' ? <PauseCircle size={14}/> : <Headphones size={14}/>}
                    <span className="text-[10px] font-bold">
                      {progress > 0 && progress < 100 && playbackState === 'idle' ? 'ฟังต่อ' : 'ฟังเอง'}
                    </span>
                  </button>
                  <button 
                    onClick={toggleBroadcastAudio} 
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 flex-1 rounded-full transition-all ${playbackState === 'broadcast_playing' ? 'bg-orange-500 text-white font-bold shadow-md' : 'text-orange-600 hover:bg-orange-100 font-bold'}`}
                  >
                    {playbackState === 'broadcast_playing' ? <Volume2 size={14} className="animate-pulse"/> : <PlayCircle size={14}/>}
                    <span className="text-[10px]">
                      {playbackState === 'broadcast_playing' ? 'กระจายเสียง...' : (progress > 0 && progress < 100 ? 'กระจายต่อ' : 'เปิดให้ทุกคน')}
                    </span>
                  </button>
              </div>
              <div className="flex items-center px-3">
                  <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress || 0} 
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
              </div>
            </div>
          </div>
        </div>
      )}

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