// src/components/PresentationViewer.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eraser,
} from 'lucide-react';
import CanvasDraw from 'react-canvas-draw';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { OtherSlideRenderer } from '../OtherApp'; // ต้อง import ตัวเรนเดอร์มาใช้ด้วย

export default function PresentationViewer({ sections, onClose, userRole = 'teacher', roomPin = null }: any) {
  const [index, setIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<any>(null);
  const currentSection = sections[index];
  
  // +++ เพิ่ม Ref สำหรับตรวจจับการเลื่อนจอของ Content Area +++
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // +++ ระบบซิงค์ตำแหน่งการเลื่อนจอ (Scroll Sync) +++
  useEffect(() => {
    if (!roomPin || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    // ฝั่งครู: ส่งค่า % การเลื่อนจอไปยัง Firebase
    if (userRole === 'teacher') {
      let timeoutId: any;
      const handleScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const scrollHeight = container.scrollHeight - container.clientHeight;
          const scrollPercent = scrollHeight > 0 ? container.scrollTop / scrollHeight : 0;
          
          updateDoc(doc(db, 'live_sessions', roomPin), { 
            globalScrollPercent: scrollPercent 
          }).catch(() => {});
        }, 150); // ดีเลย์นิดหน่อยกันเซิร์ฟเวอร์ทำงานหนัก
      };

      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    } 
    
    // ฝั่งนักเรียน: รับค่า % จาก Firebase มาเลื่อนจอตามครู
    if (userRole === 'student') {
      const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.globalScrollPercent !== undefined) {
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const targetY = data.globalScrollPercent * scrollHeight;
            
            // เลื่อนกล่อง content แบบนุ่มนวล
            container.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        }
      });
      return () => unsub();
    }
  }, [userRole, roomPin, index]); // ใส่ index ด้วยเพื่อให้ระบบผูก event ใหม่ทุกครั้งที่เปลี่ยนหน้า

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col overflow-hidden">
      {/* Top Control Bar */}
      <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-indigo-400 font-bold">
            {currentSection.lessonTitle || 'Presentation'}
          </span>
          <span className="text-slate-500">|</span>
          <span>Section {index + 1}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Whiteboard Tools (เฉพาะครูถึงจะวาดได้) */}
          {userRole === 'teacher' && (
            <div className="flex bg-slate-800 rounded-lg p-1 mr-4">
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`p-2 rounded ${isDrawing ? 'bg-indigo-600' : ''}`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => canvasRef.current?.clear()}
                className="p-2 text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
          <button onClick={onClose} className="p-2 hover:bg-red-600 rounded">
            <X />
          </button>
        </div>
      </div>

      {/* Main Content Area (ใส่ Ref ตรงนี้เพื่อดักจับ Scroll) */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 relative bg-slate-50 overflow-auto p-10"
      >
        {isDrawing && userRole === 'teacher' && (
          <div className="absolute inset-0 z-[1000] cursor-crosshair">
            <CanvasDraw
              ref={canvasRef}
              brushColor="#ff0000"
              canvasWidth={window.innerWidth}
              canvasHeight={window.innerHeight - 150}
              backgroundColor="transparent"
              lazyRadius={0}
            />
          </div>
        )}

        {/* เรนเดอร์ Pattern ต่างๆ ด้วย OtherSlideRenderer */}
        <div className="max-w-6xl mx-auto w-full">
            <OtherSlideRenderer 
                slide={currentSection} 
                userRole={userRole} 
                roomPin={roomPin}
                allSlides={sections} 
            />
        </div>
      </div>

      {/* Bottom Navigation (ให้ครูกดเปลี่ยนหน้าได้เท่านั้น) */}
      {userRole === 'teacher' && (
        <div className="h-20 bg-white border-t flex items-center justify-between px-10 shrink-0">
          <button
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1);
              canvasRef.current?.clear();
            }}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 rounded-full disabled:opacity-30"
          >
            <ChevronLeft /> ก่อนหน้า
          </button>

          <div className="text-slate-400 font-medium">
            Slide {index + 1} / {sections.length}
          </div>

          <button
            disabled={index === sections.length - 1}
            onClick={() => {
              setIndex(index + 1);
              canvasRef.current?.clear();
            }}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full disabled:opacity-30"
          >
            ถัดไป <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}