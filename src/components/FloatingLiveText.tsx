// src/components/FloatingLiveText.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquareText, X, Move } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface Props {
  roomPin: string | null;
  userRole: 'teacher' | 'student';
}

export default function FloatingLiveText({ roomPin, userRole }: Props) {
  const [boardData, setBoardData] = useState({
    isVisible: false,
    text: '',
    x: 50,  
    y: 100  
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!roomPin) return;
    const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
      if (docSnap.exists() && docSnap.data().floating_text) {
        setBoardData(docSnap.data().floating_text);
      }
    });
    return () => unsub();
  }, [roomPin]);

  const updateFirebase = async (newData: any) => {
    setBoardData(newData); 
    if (roomPin && userRole === 'teacher') {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), { floating_text: newData });
      } catch (e) {
        console.error("Sync error", e);
      }
    }
  };

  const toggleBoard = () => {
    updateFirebase({ ...boardData, isVisible: !boardData.isVisible });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFirebase({ ...boardData, text: e.target.value });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (userRole !== 'teacher') return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - boardData.x,
      y: e.clientY - boardData.y
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err){}
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || userRole !== 'teacher') return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setBoardData({ ...boardData, x: newX, y: newY }); 
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging || userRole !== 'teacher') return;
    setIsDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err){}
    updateFirebase({ ...boardData }); 
  };

  if (userRole === 'student' && !boardData.isVisible) return null;

  return (
    <>
      {userRole === 'teacher' && (
        <button
          onClick={toggleBoard}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-transparent ${boardData.isVisible ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:border-indigo-200'}`}
          title={boardData.isVisible ? "ปิดกระดานคำศัพท์" : "เปิดกระดานคำศัพท์เสริม"}
        >
          <MessageSquareText size={14} /> {boardData.isVisible ? 'ปิดกระดานศัพท์' : 'เปิดกระดานศัพท์'}
        </button>
      )}

      {/* ใช้ createPortal ดันกระดานให้ออกไปวาดที่ body ชั้นนอกสุด จะได้ไม่โดนขังไว้ในแผงควบคุม */}
      {boardData.isVisible && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9998] bg-white rounded-xl shadow-2xl border-2 border-indigo-400 w-[280px] md:w-[350px] flex flex-col overflow-hidden"
          style={{ left: boardData.x, top: boardData.y }}
        >
          <div 
            className={`bg-indigo-100 p-2 flex items-center justify-between border-b border-indigo-200 ${userRole === 'teacher' ? 'cursor-move' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="flex items-center gap-2 text-indigo-800 pointer-events-none">
              <Move size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">คำศัพท์เพิ่มเติม</span>
            </div>
            {userRole === 'teacher' && (
              <button onClick={toggleBoard} className="text-indigo-500 hover:text-red-500 p-1 bg-white rounded-md shadow-sm transition-colors cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="p-3 bg-indigo-50/30">
            {userRole === 'teacher' ? (
              <textarea
                value={boardData.text}
                onChange={handleTextChange}
                placeholder="พิมพ์ตัวอักษรจีน พินอิน หรือคำแปล..."
                className="w-full h-[150px] bg-white border border-indigo-200 rounded-lg p-3 text-slate-800 text-lg font-serif focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-inner"
              />
            ) : (
              <div className="w-full min-h-[150px] bg-white border border-indigo-200 rounded-lg p-4 text-slate-800 text-[28px] font-serif whitespace-pre-wrap flex items-center justify-center text-center shadow-inner leading-tight">
                {boardData.text || <span className="text-slate-300 text-sm font-sans">คุณครูกำลังพิมพ์...</span>}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}