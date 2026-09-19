// src/App.tsx
import PatternFlexibleDoubleTable from './components/PatternFlexibleDoubleTable';
import PatternFlextable2cols from './components/PatternFlextable2cols';
import PatternStrokeOrderRules2 from './components/PatternStrokeOrderRules2';
import PatternCanva from './components/PatternCanva';
import PatternFlextable3cols from './components/PatternFlextable3cols';
import PatternPairwork from './components/PatternPairwork';
import PatternPreceding from './components/PatternPreceding';
import PatternDespicture from './components/PatternDespicture';
import PatternSentence4Cols from './components/PatternSentence4Cols';
import PatternSentence3Cols from './components/PatternSentence3Cols';
import PatternNote from './components/PatternNote';
import PatternDialog2 from './components/PatternDialog2';
import PatternTonemaking from './components/PatternTonemaking';
import PatternNeutraltone from './components/PatternNeutraltone';
import PatternMatchPicture from './components/PatternMatchPicture'; 

import OtherApp, { OtherSlideRenderer } from './OtherApp';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Home,
  ArrowLeft,
  GraduationCap,
  Sprout,
  BookOpen,
  MessageCircle,
  Compass,
  Trophy,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Wrench,
  Menu, 
  Users,
  UserCircle,
  Lock,
  RefreshCw,
  Key,
  LogOut,
  Eye
} from 'lucide-react';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'; 
import type { HskCardData } from './types';

import SettingsView from './Settings';
import Settings2 from './Settings2'; 
import LessonPattern1 from './components/LessonPattern1';
import LessonTones from './components/LessonTones';
import PatternTone2 from './components/PatternTone2';
import PatternSyllables from './components/PatternSyllables';
import PatternMonosyllabic from './components/PatternMonosyllabic';
import PatternSandhi from './components/PatternSandhi';
import Pattern3ColTable from './components/Pattern3ColTable';
import PatternStrokes from './components/PatternStrokes';
import PatternSinglecharacter from './components/PatternSinglecharacter'; 
import CanvasDraw from 'react-canvas-draw';

const initialHskCards: HskCardData[] = [
  {
    id: 'hsk1',
    topTextZh: '标准教程',
    topTextEn1: 'STANDARD',
    topTextEn2: 'COURSE',
    mainText: 'HSK',
    level: '1',
    title: 'ระดับเริ่มต้น',
    from: 'from-[#F28B32]/70',
    to: 'to-[#f8b175]/70',
    shadow: 'hover:shadow-[#F28B32]/50',
    Icon: Sprout,
    isEnabled: true,
    lessons: [],
  },
  {
    id: 'hsk2',
    topTextZh: '标准教程',
    topTextEn1: 'STANDARD',
    topTextEn2: 'COURSE',
    mainText: 'HSK',
    level: '2',
    title: 'ระดับพื้นฐาน',
    from: 'from-[#15A186]/70',
    to: 'to-[#3ad4b6]/70',
    shadow: 'hover:shadow-[#15A186]/50',
    Icon: BookOpen,
    isEnabled: true,
    lessons: [],
  },
  {
    id: 'hsk3',
    topTextZh: '标准教程',
    topTextEn1: 'STANDARD',
    topTextEn2: 'COURSE',
    mainText: 'HSK',
    level: '3',
    title: 'ระดับกลาง',
    from: 'from-[#E75A2A]/70',
    to: 'to-[#f3815b]/70',
    shadow: 'hover:shadow-[#E75A2A]/50',
    Icon: MessageCircle,
    isEnabled: true,
    lessons: [],
  },
  {
    id: 'hsk4',
    topTextZh: '标准教程',
    topTextEn1: 'STANDARD',
    topTextEn2: 'COURSE',
    mainText: 'HSK',
    level: '4',
    title: 'ระดับสูง-กลาง',
    from: 'from-[#B12A2F]/70',
    to: 'to-[#e25055]/70',
    shadow: 'hover:shadow-[#B12A2F]/50',
    Icon: Compass,
    isEnabled: true,
    lessons: [],
  },
  {
    id: 'hsk5',
    topTextZh: '标准教程',
    topTextEn1: 'STANDARD',
    topTextEn2: 'COURSE',
    mainText: 'HSK',
    level: '5',
    title: 'ระดับสูง',
    from: 'from-[#29549A]/70',
    to: 'to-[#5182d3]/70',
    shadow: 'hover:shadow-[#29549A]/50',
    Icon: Trophy,
    isEnabled: true,
    lessons: [],
  },
  {
    id: 'other_courses',
    topTextZh: '其他课程',
    topTextEn1: 'OTHER',
    topTextEn2: 'COURSES',
    mainText: 'OTHER',
    level: '+',
    title: 'คอร์สเรียนอื่นๆ / บทเรียนทั่วไป',
    from: 'from-[#10b981]/70',
    to: 'to-[#34d399]/70',
    shadow: 'hover:shadow-[#10b981]/50',
    Icon: Compass,
    isEnabled: true,
    lessons: [],
  },
];

export default function App() {
  const [appLoginRole, setAppLoginRole] = useState<'guest' | 'teacher' | 'student' | 'admin'>('guest');
  const [globalTeacherPin, setGlobalTeacherPin] = useState<string>('9999'); 
  const [globalStudentPin, setGlobalStudentPin] = useState<string>('1234');
  const [globalAdminPin, setGlobalAdminPin] = useState<string>('8888'); 
  
  const [loginStep, setLoginStep] = useState<'role' | 'pin'>('role');
  const [targetRole, setTargetRole] = useState<'teacher' | 'student' | 'admin' | null>(null); 
  const [loginPinInput, setLoginPinInput] = useState('');

  const [currentView, setCurrentView] = useState('home');
  const [hskCards, setHskCards] = useState<HskCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuNames, setMenuNames] = useState({
    home: 'หน้าหลัก HSK',
    other_home: 'คอร์สอื่นๆ',
    settings: 'ตั้งค่า HSK',
    settings_other: 'ตั้งค่า คอร์สอื่นๆ',
  });

  const [menuVisibility, setMenuVisibility] = useState({
    teacher: { home: true, other_home: true, settings: true, settings_other: true },
    student: { home: true, other_home: true }
  });

  const [isPresenting, setIsPresenting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<any>(null);
  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const drawingTimeoutRef = useRef<any>(null);
  const presentationScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);

  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [roomPin, setRoomPin] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinPinInput, setJoinPinInput] = useState('');
  const [remoteDrawingData, setRemoteDrawingData] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'content', 'hsk_data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data().cards;
          
          const fetchedMenuNames = docSnap.data().menuNames;
          if (fetchedMenuNames) setMenuNames(fetchedMenuNames);

          const fetchedGlobalStudentPin = docSnap.data().globalStudentPin;
          if (fetchedGlobalStudentPin) setGlobalStudentPin(fetchedGlobalStudentPin);
          
          const fetchedGlobalTeacherPin = docSnap.data().globalTeacherPin;
          if (fetchedGlobalTeacherPin) setGlobalTeacherPin(fetchedGlobalTeacherPin);

          const fetchedGlobalAdminPin = docSnap.data().globalAdminPin;
          if (fetchedGlobalAdminPin) setGlobalAdminPin(fetchedGlobalAdminPin);

          const fetchedMenuVisibility = docSnap.data().menuVisibility;
          if (fetchedMenuVisibility) {
            setMenuVisibility((prev) => ({
              teacher: { ...prev.teacher, ...fetchedMenuVisibility.teacher },
              student: { ...prev.student, ...fetchedMenuVisibility.student }
            }));
          }

          const processedData = cloudData.map((card: any) => {
            const original = initialHskCards.find(
              (i) => i.level === card.level.toString()
            );
            return {
              ...card,
              Icon: original ? original.Icon : BookOpen,
              lessons: (card.lessons || []).map((lesson: any) => ({
                ...lesson,
                sections: (lesson.sections || []).map((sec: any) => {
                  if (
                    sec.patternType === 'patternTone2' &&
                    typeof sec.syllables === 'string'
                  ) {
                    try {
                      sec.syllables = JSON.parse(sec.syllables);
                    } catch (e) {
                      sec.syllables = [];
                    }
                  }
                  return sec;
                }),
              })),
            };
          });
          setHskCards(processedData);
        } else {
          setHskCards(initialHskCards);
        }
      } catch (e) {
        console.error('Fetch Error:', e);
        setHskCards(initialHskCards);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isPresenting && slideWrapperRef.current) {
      const updateSize = () => {
        if (slideWrapperRef.current) {
          setCanvasSize({
            width: slideWrapperRef.current.scrollWidth,
            height: slideWrapperRef.current.scrollHeight,
          });
        }
      };
      setTimeout(updateSize, 100);
      setTimeout(updateSize, 500); 
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(slideWrapperRef.current);
      return () => observer.disconnect();
    }
  }, [slideIndex, isPresenting, isDrawing]);

  useEffect(() => {
    if (isPresenting && roomPin && userRole === 'student') {
      const unsub = onSnapshot(doc(db, 'live_sessions', roomPin), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (slides.length > 0) {
            const foundIdx = slides.findIndex((s) => s.id === data.activeSlideId);
            if (foundIdx !== -1 && foundIdx !== slideIndex) {
              setSlideIndex(foundIdx);
            }
          }
          if (data.isDrawingMode !== undefined && data.isDrawingMode !== isDrawing) {
            setIsDrawing(data.isDrawingMode);
          }
          if (data.drawingData !== undefined) {
            setRemoteDrawingData(data.drawingData);
          }
          
          if (data.globalScrollPercent !== undefined && presentationScrollRef.current) {
            const container = presentationScrollRef.current;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const targetY = data.globalScrollPercent * scrollHeight;
            container.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        } else {
          alert("คุณครูได้ปิดห้องเรียนแล้ว");
          setIsPresenting(false);
          setRoomPin(null);
          setUserRole(appLoginRole === 'student' ? 'student' : 'teacher'); 
        }
      });
      return () => unsub();
    }
  }, [isPresenting, roomPin, userRole, slides, slideIndex, isDrawing]);

  useEffect(() => {
    if (userRole === 'student' && isDrawing && canvasRef.current) {
      if (remoteDrawingData) {
        try { canvasRef.current.loadSaveData(remoteDrawingData, true); } catch(e) {}
      } else {
        canvasRef.current.clear();
      }
    }
  }, [remoteDrawingData, isDrawing, canvasSize]);

  const saveToFirebase = async (updatedData: HskCardData[]) => {
    try {
      const dataToSave = updatedData.map(({ Icon, ...card }) => ({
        ...card,
        lessons: (card.lessons || []).map((lesson) => ({
          ...lesson,
          sections: (lesson.sections || []).map((sec) => {
            const newSec = { ...sec };
            if (
              newSec.patternType === 'patternTone2' &&
              Array.isArray(newSec.syllables)
            ) {
              newSec.syllables = JSON.stringify(newSec.syllables);
            }
            return newSec;
          }),
        })),
      }));
      await setDoc(doc(db, 'content', 'hsk_data'), {
        cards: dataToSave,
        menuNames: menuNames, 
        globalStudentPin: globalStudentPin, 
        globalTeacherPin: globalTeacherPin, 
        globalAdminPin: globalAdminPin,
        menuVisibility: menuVisibility,
        lastUpdated: new Date().toISOString(),
      });
      alert('✅ บันทึกข้อมูลลง Cloud สำเร็จ!');
    } catch (e) {
      alert('❌ ไม่สามารถบันทึกได้: ' + e);
    }
  };

  const startPresentation = async (course: HskCardData, startSectionId?: string) => {
    if (appLoginRole === 'student') {
      return alert('ไม่อนุญาตให้นักเรียนเริ่มโหมด Slide Show เองครับ กรุณารอคุณครูเปิดห้องเรียน');
    }

    const activeLessons = course.lessons?.filter((l) => l.isEnabled !== false) || [];
    if (!activeLessons || activeLessons.length === 0) return alert('ไม่มีบทเรียนให้แสดงผล');

    const allSlides = activeLessons.flatMap((lesson) =>
      lesson.sections.map((sec) => ({
        ...sec,
        lessonInfo: `บทที่ ${lesson.lessonNumber}: ${lesson.titleCn}`,
        courseInfo: `${course.mainText} ${course.level}`,
        vocabulary: sec.vocabulary || [],
      }))
    );

    if (allSlides.length === 0) return alert('บทเรียนยังไม่มีเนื้อหาให้แสดง');

    setSlides(allSlides);

    let initialIndex = 0;
    if (startSectionId) {
      const foundIdx = allSlides.findIndex((s) => s.id === startSectionId);
      initialIndex = foundIdx !== -1 ? foundIdx : 0;
    }
    setSlideIndex(initialIndex);

    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomPin(newPin);
    setUserRole('teacher');
    setIsDrawing(false);

    try {
      await setDoc(doc(db, 'live_sessions', newPin), {
        createdAt: new Date().toISOString(),
        courseId: course.id,
        activeSlideId: allSlides[initialIndex].id,
        isDrawingMode: false,
        drawingData: ''
      });
    } catch(e) {}

    setIsPresenting(true);
  };

  const changeSlide = async (newIndex: number) => {
    setSlideIndex(newIndex);
    canvasRef.current?.clear();
    
    if (userRole === 'teacher' && roomPin) {
      try {
        await updateDoc(doc(db, 'live_sessions', roomPin), {
          activeSlideId: slides[newIndex].id,
          drawingData: '' 
        });
      } catch(e) {}
    }
  };

  const handleJoinRoom = async () => {
    if(joinPinInput.length !== 4) return alert("กรุณากรอกรหัสห้อง 4 หลัก");
    try {
      const snap = await getDoc(doc(db, 'live_sessions', joinPinInput));
      if(snap.exists()) {
        const data = snap.data();
        setRoomPin(joinPinInput);
        setUserRole('student');
        setShowJoinModal(false);
        setJoinPinInput('');
        
        const course = hskCards.find(c => c.id === data.courseId);
        if(course) {
           const activeLessons = course.lessons?.filter((l) => l.isEnabled !== false) || [];
           const allSlides = activeLessons.flatMap((lesson) =>
             lesson.sections.map((sec) => ({
               ...sec,
               lessonInfo: `บทที่ ${lesson.lessonNumber}: ${lesson.titleCn}`,
               courseInfo: `${course.mainText} ${course.level}`,
               vocabulary: sec.vocabulary || [],
             }))
           );
           setSlides(allSlides);
           const foundIdx = allSlides.findIndex((s) => s.id === data.activeSlideId);
           setSlideIndex(foundIdx !== -1 ? foundIdx : 0);
           setIsPresenting(true);
           alert("✅ เข้าร่วมชั้นเรียนสำเร็จ! กรุณารอคุณครูเปลี่ยนสไลด์");
        } else {
           alert("เกิดข้อผิดพลาด ไม่พบข้อมูลคอร์สนี้");
        }
      } else {
        alert("❌ ไม่พบรหัสห้องนี้ หรือห้องอาจจะถูกปิดไปแล้ว");
      }
    } catch(e) {
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const toggleDrawing = async () => {
    const newState = !isDrawing;
    setIsDrawing(newState);
    if (newState && slideWrapperRef.current) {
      setCanvasSize({
        width: slideWrapperRef.current.scrollWidth,
        height: slideWrapperRef.current.scrollHeight,
      });
    }
    if (userRole === 'teacher' && roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { isDrawingMode: newState }); } catch (e) {}
    }
  };

  const clearCanvas = async () => {
    canvasRef.current?.clear();
    if (userRole === 'teacher' && roomPin) {
      try { await updateDoc(doc(db, 'live_sessions', roomPin), { drawingData: '' }); } catch (e) {}
    }
  };

  const handleTeacherScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (userRole !== 'teacher' || !roomPin) return;
    
    const container = e.currentTarget;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const scrollPercent = scrollHeight > 0 ? container.scrollTop / scrollHeight : 0;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      updateDoc(doc(db, 'live_sessions', roomPin), { 
        globalScrollPercent: scrollPercent 
      }).catch(() => {});
    }, 150); 
  };

  const handleLogout = () => {
    if (window.confirm('ต้องการออกจากระบบใช่หรือไม่?')) {
      setAppLoginRole('guest');
      setUserRole('teacher');
      setLoginStep('role');
      setTargetRole(null);
      setLoginPinInput('');
      setCurrentView('home');
      setIsPresenting(false);
      setRoomPin(null);
    }
  };

  const canSeeMenu = (menuKey: 'home' | 'other_home' | 'settings' | 'settings_other') => {
    if (appLoginRole === 'admin') return true;
    if (appLoginRole === 'teacher') return menuVisibility.teacher[menuKey as keyof typeof menuVisibility.teacher] ?? true;
    if (appLoginRole === 'student') return menuVisibility.student[menuKey as keyof typeof menuVisibility.student] ?? true;
    return false;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-indigo-600">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (appLoginRole === 'guest') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 font-sans p-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center transform transition-all border border-slate-100">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-inner shrink-0">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Learning Platform</h1>
          <p className="text-slate-500 mb-8 text-center text-sm">กรุณาเลือกโหมดการใช้งานของคุณ</p>

          {loginStep === 'role' ? (
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={() => { setTargetRole('teacher'); setLoginStep('pin'); }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                <UserCircle size={24} /> โหมดคุณครู (Teacher)
              </button>
              <button 
                onClick={() => { setTargetRole('student'); setLoginStep('pin'); }}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                <Users size={24} /> โหมดนักเรียน (Student)
              </button>
              <button 
                onClick={() => { setTargetRole('admin'); setLoginStep('pin'); }}
                className="w-full py-4 mt-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                <Settings size={24} /> โหมดผู้ดูแลระบบ (Admin)
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full items-center animate-fade-in">
              <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> 
                {targetRole === 'teacher' ? 'รหัสผ่านสำหรับคุณครู' : targetRole === 'admin' ? 'รหัสผ่านสำหรับผู้ดูแลระบบ' : 'รหัสเข้าสู่ระบบนักเรียน'}
              </div>
              <input 
                type="text" 
                maxLength={4}
                value={loginPinInput}
                onChange={(e) => setLoginPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full text-center text-4xl tracking-[0.4em] font-black p-4 border-2 rounded-2xl focus:ring-0 outline-none mb-8 text-slate-800 
                  ${targetRole === 'teacher' ? 'border-indigo-200 focus:border-indigo-500 bg-indigo-50/50' : 
                    targetRole === 'admin' ? 'border-slate-300 focus:border-slate-500 bg-slate-50/50' : 
                    'border-orange-200 focus:border-orange-500 bg-orange-50/50'}`}
                placeholder="0000"
              />
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => { setLoginStep('role'); setLoginPinInput(''); setTargetRole(null); }} 
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  ย้อนกลับ
                </button>
                <button 
                  onClick={() => {
                    if (targetRole === 'student' && loginPinInput === globalStudentPin) {
                      setAppLoginRole('student');
                      setUserRole('student');
                      setCurrentView(menuVisibility.student.home ? 'home' : 'other_home');
                    } else if (targetRole === 'teacher' && loginPinInput === globalTeacherPin) {
                      setAppLoginRole('teacher');
                      setUserRole('teacher');
                      setCurrentView(menuVisibility.teacher.home ? 'home' : 'other_home');
                    } else if (targetRole === 'admin' && loginPinInput === globalAdminPin) {
                      setAppLoginRole('admin');
                      setUserRole('teacher');
                      setCurrentView('home');
                    } else {
                      alert("❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
                    }
                  }} 
                  className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-lg
                    ${targetRole === 'teacher' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                      targetRole === 'admin' ? 'bg-slate-700 hover:bg-slate-800' : 
                      'bg-orange-500 hover:bg-orange-600'}`}
                >
                  ปลดล็อก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {showJoinModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center transform transition-all">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">ติดตามคุณครู</h2>
            <p className="text-slate-500 mb-8 text-center text-sm">กรอกรหัส 4 หลักที่ปรากฏบนหน้าจอของครู</p>
            <input 
              type="text" 
              maxLength={4}
              value={joinPinInput}
              onChange={(e) => setJoinPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-5xl tracking-[0.4em] font-black p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:ring-0 outline-none mb-8 text-slate-800"
              placeholder="0000"
            />
            <div className="flex w-full gap-4">
              <button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={handleJoinRoom} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg">เข้าร่วม</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen font-sans bg-[#f8fafc] overflow-hidden w-full">
        {/* --- Presentation Overlay --- */}
        {isPresenting && slides.length > 0 && (
          <div className="fixed inset-0 z-[2000] bg-white flex flex-col w-full h-full overflow-hidden">
            <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 z-[2001]">
              <div className="flex items-center gap-4">
                {userRole === 'teacher' && roomPin && (
                  <span className="bg-orange-500 px-3 py-1 rounded font-black text-sm tracking-widest text-white shadow-sm border border-orange-400 flex items-center gap-2">
                    <Users size={16}/> PIN: {roomPin}
                  </span>
                )}
                {userRole === 'student' && (
                  <span className="bg-indigo-500 px-3 py-1 rounded font-bold text-xs text-white shadow-sm">
                    โหมดนักเรียน
                  </span>
                )}
                
                <span className="bg-indigo-600 px-3 py-1 rounded font-bold text-sm uppercase hidden md:inline-block">
                  {slides[slideIndex].courseInfo}
                </span>
                <span className="text-indigo-200 truncate max-w-[200px] md:max-w-none">
                  {slides[slideIndex].lessonInfo}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-800 p-1 rounded-lg gap-1 border border-slate-700">
                  {userRole === 'teacher' && (
                    <>
                      <button
                        onClick={toggleDrawing}
                        className={`p-2 rounded ${
                          isDrawing ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        <Pencil size={18} />
                      </button>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 mt-1.5 mx-1"
                      />
                      <button
                        onClick={clearCanvas}
                        className="p-2 text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsPresenting(false);
                    setIsDrawing(false);
                    setRoomPin(null);
                    setUserRole(appLoginRole === 'student' ? 'student' : 'teacher'); 
                  }}
                  className="p-2 hover:bg-red-600 rounded-lg"
                >
                  <X />
                </button>
              </div>
            </div>

            <div 
              className="flex-1 bg-slate-50 overflow-auto p-4 md:p-10"
              ref={presentationScrollRef}
              onScroll={handleTeacherScroll}
            >
              <div
                className="relative w-full h-fit min-h-full"
                ref={slideWrapperRef}
              >
                {isDrawing && canvasSize.width > 0 && (
                  <div className="absolute top-0 left-0 z-[5000] cursor-crosshair">
                    <CanvasDraw
                      ref={canvasRef}
                      brushColor={brushColor}
                      brushRadius={3}
                      canvasWidth={canvasSize.width}
                      canvasHeight={canvasSize.height}
                      backgroundColor="transparent"
                      lazyRadius={0}
                      disabled={userRole === 'student'}
                      hideGrid={true}
                      onChange={(canvas: any) => {
                        if (userRole === 'teacher' && roomPin) {
                          if (drawingTimeoutRef.current) clearTimeout(drawingTimeoutRef.current);
                          drawingTimeoutRef.current = setTimeout(() => {
                            const data = canvas.getSaveData();
                            updateDoc(doc(db, 'live_sessions', roomPin), { drawingData: data }).catch(e => {});
                          }, 300); 
                        }
                      }}
                    />
                  </div>
                )}
                
                <div className="w-full relative z-[1]">
                  {slides[slideIndex].patternType === 'pattern1' && <LessonPattern1 data={{ ...slides[slideIndex], newWords: slides[slideIndex].vocabulary }} />}
                  {slides[slideIndex].patternType === 'pattern2' && <LessonTones data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternTone2' && <PatternTone2 data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternSyllables' && <PatternSyllables data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternMonosyllabic' && <PatternMonosyllabic data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternSandhi' && <PatternSandhi data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'pattern3ColTable' && <Pattern3ColTable data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternStrokes' && <PatternStrokes data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternSinglecharacter' && <PatternSinglecharacter data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'neutraltone' && <PatternNeutraltone data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternmatchpicture' && <PatternMatchPicture data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patterntonemaking' && <PatternTonemaking data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patterndialog2' && <PatternDialog2 data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternnote' && <PatternNote data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternsentence3cols' && <PatternSentence3Cols data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternsentence4cols' && <PatternSentence4Cols data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patterndespicture' && <PatternDespicture data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternpreceding' && <PatternPreceding data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternpairwork' && <PatternPairwork data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternflextable3cols' && <PatternFlextable3cols data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patterncanva' && <PatternCanva data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternStrokeOrderRules2' && <PatternStrokeOrderRules2 data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternFlextable2cols' && <PatternFlextable2cols data={slides[slideIndex]} />}
                  {slides[slideIndex].patternType === 'patternFlexibleDoubleTable' && <PatternFlexibleDoubleTable data={slides[slideIndex]} />}

                  {/* +++ ให้ OtherApp เป็นคนจัดการเรนเดอร์เนื้อหาทั้งหมดของฝั่ง Other +++ */}
                  <OtherSlideRenderer 
                    slide={slides[slideIndex]} 
                    userRole={userRole} 
                    roomPin={roomPin} 
                  />
                </div>
              </div>
            </div>

            <div className="h-20 bg-white border-t flex items-center justify-between px-10 shrink-0 z-[2001]">
              <button
                onClick={() => {
                  if (slideIndex > 0) changeSlide(slideIndex - 1);
                }}
                disabled={slideIndex === 0 || userRole === 'student'}
                className={`flex items-center gap-2 px-6 py-2 rounded-full ${userRole === 'student' ? 'bg-transparent text-transparent' : 'bg-slate-100 disabled:opacity-30'}`}
              >
                {userRole === 'teacher' && <><ChevronLeft /> ก่อนหน้า</>}
              </button>
              
              <span className={`font-bold ${userRole === 'student' ? 'text-indigo-500 animate-pulse' : 'text-slate-700'}`}>
                {userRole === 'student' ? 'กำลังติดตามหน้าจอคุณครู...' : `Slide ${slideIndex + 1} / ${slides.length}`}
              </span>
              
              <button
                onClick={() => {
                  if (slideIndex < slides.length - 1) changeSlide(slideIndex + 1);
                }}
                disabled={slideIndex === slides.length - 1 || userRole === 'student'}
                className={`flex items-center gap-2 px-6 py-2 rounded-full ${userRole === 'student' ? 'bg-transparent text-transparent' : 'bg-indigo-600 text-white disabled:opacity-30'}`}
              >
                {userRole === 'teacher' && <>ถัดไป <ChevronRight /></>}
              </button>
            </div>
          </div>
        )}

        {/* --- Sidebar --- */}
        <aside
          className={`transition-all duration-300 ease-in-out bg-white/85 border-r flex flex-col shrink-0 z-50 py-6 overflow-hidden ${
            isSidebarOpen ? 'w-64 px-4 items-stretch' : 'w-16 md:w-20 px-0 items-center'
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mb-6 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center mx-auto"
          >
            <Menu size={24} />
          </button>

          <div
            onClick={() => {
              if (canSeeMenu('home')) setCurrentView('home');
            }}
            className={`bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8 cursor-pointer shadow-sm shrink-0 transition-all mx-auto ${
              isSidebarOpen ? 'w-full h-12 gap-3 px-4 justify-start' : 'w-12 h-12'
            }`}
          >
            <OriginalGraduationCap size={28} className="shrink-0" />
            {isSidebarOpen && <span className="font-bold whitespace-nowrap overflow-hidden">Learning Platform</span>}
          </div>

          <nav className={`flex flex-col gap-4 w-full h-full ${isSidebarOpen ? '' : 'items-center'}`}>
            
            {/* 🎯 นำ CanSeeMenu มาครอบเมนู Home */}
            {canSeeMenu('home') && (
              <button
                onClick={() => setCurrentView('home')}
                title={menuNames.home}
                className={`flex items-center rounded-xl transition-all ${
                  isSidebarOpen ? 'p-3 w-full justify-start gap-3' : 'p-3 justify-center'
                } ${
                  currentView === 'home' || currentView.startsWith('hsk')
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-indigo-50'
                }`}
              >
                <Home className="shrink-0" />
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-medium">{menuNames.home}</span>}
              </button>
            )}
            
            {/* 🎯 นำ CanSeeMenu มาครอบเมนู Other */}
            {canSeeMenu('other_home') && (
              <button
                onClick={() => setCurrentView('other_home')}
                title={menuNames.other_home}
                className={`flex items-center rounded-xl transition-all ${
                  isSidebarOpen ? 'p-3 w-full justify-start gap-3' : 'p-3 justify-center'
                } ${
                  currentView === 'other_home' || (!currentView.startsWith('hsk') && currentView !== 'home' && currentView !== 'settings' && currentView !== 'settings_other')
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-emerald-50'
                }`}
              >
                <Compass className="shrink-0" />
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-medium">{menuNames.other_home}</span>}
              </button>
            )}

            {(appLoginRole === 'teacher' || appLoginRole === 'admin') && (
              <>
                {/* 🎯 นำ CanSeeMenu มาครอบเมนู Settings */}
                {canSeeMenu('settings') && (
                  <button
                    onClick={() => setCurrentView('settings')}
                    title={menuNames.settings}
                    className={`flex items-center rounded-xl transition-all ${
                      isSidebarOpen ? 'p-3 w-full justify-start gap-3' : 'p-3 justify-center'
                    } ${
                      currentView === 'settings'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-indigo-50'
                    }`}
                  >
                    <Settings className="shrink-0" />
                    {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-medium">{menuNames.settings}</span>}
                  </button>
                )}

                {/* 🎯 นำ CanSeeMenu มาครอบเมนู Settings Other */}
                {canSeeMenu('settings_other') && (
                  <button
                    onClick={() => setCurrentView('settings_other')}
                    title={menuNames.settings_other}
                    className={`flex items-center rounded-xl transition-all ${
                      isSidebarOpen ? 'p-3 w-full justify-start gap-3' : 'p-3 justify-center'
                    } ${
                      currentView === 'settings_other'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-emerald-50'
                    }`}
                  >
                    <Wrench className="shrink-0" />
                    {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-medium">{menuNames.settings_other}</span>}
                  </button>
                )}
              </>
            )}

            <div className="mt-auto mb-4 w-full flex flex-col gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                title="เข้าร่วมชั้นเรียน"
                className={`flex items-center rounded-xl transition-all w-full ${
                  isSidebarOpen ? 'p-3 justify-start gap-3 bg-orange-100 text-orange-700' : 'p-3 justify-center bg-orange-100 text-orange-700'
                } hover:bg-orange-200 hover:shadow-md shadow-sm`}
              >
                <Users className="shrink-0" />
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-bold">เข้าร่วมชั้นเรียน</span>}
              </button>

              {/* 🎯 ย้ายปุ่ม Logout มาไว้ใน Sidebar ด้านล่างสุด */}
              <button 
                onClick={handleLogout}
                title="ออกจากระบบ"
                className={`flex items-center rounded-xl transition-all w-full ${
                  isSidebarOpen ? 'p-3 justify-start gap-3 bg-red-50 text-red-600' : 'p-3 justify-center bg-red-50 text-red-600'
                } hover:bg-red-100 hover:shadow-md shadow-sm`}
              >
                <LogOut className="shrink-0" size={24} />
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden font-bold">ออกจากระบบ</span>}
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 relative overflow-y-auto w-full">

          {currentView === 'home' && canSeeMenu('home') && (
            <div className="p-6 md:p-10 w-full relative z-10">
              <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  {menuNames.home}
                </h1>
                <p className="text-slate-500 mt-2">
                  เลือกคอร์สเพื่อเริ่มต้นการเรียนการสอน
                </p>
              </header>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
                {hskCards
                  .filter((c) => c.isEnabled && c.id.startsWith('hsk')) 
                  .map((card) => {
                    const IconComp = card.Icon;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setCurrentView(card.id)}
                        className={`group relative aspect-[4/5] cursor-pointer rounded-2xl border border-white/40 shadow-lg transition-all hover:-translate-y-2 bg-gradient-to-br ${card.from} ${card.to} overflow-hidden flex flex-col items-center py-6 px-4 text-white`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-125 transition-transform">
                          {IconComp && (
                            <IconComp className="w-32 h-32" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="relative z-10 w-full flex flex-col items-center h-full justify-between text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold">
                              {card.topTextZh}
                            </span>
                            <span className="text-[0.6rem] font-bold tracking-[0.15em] opacity-90 uppercase">
                              {card.topTextEn1}
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-6xl font-black drop-shadow-md">
                              {card.mainText}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-7xl font-black drop-shadow-lg inline-block">
                              {card.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {hskCards.some((c) => c.id === currentView && c.id.startsWith('hsk')) && canSeeMenu('home') &&
            (() => {
              const course = hskCards.find((c) => c.id === currentView);
              const activeLessons =
                course?.lessons?.filter((l) => l.isEnabled !== false) || [];

              return (
                <div className="p-6 md:p-10 w-full relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <button
                      onClick={() => setCurrentView('home')}
                      className="flex items-center text-slate-500 hover:text-indigo-600 font-medium"
                    >
                      <ArrowLeft className="mr-2" /> กลับหน้าหลัก
                    </button>
                    
                    {(appLoginRole === 'teacher' || appLoginRole === 'admin') && (
                      <button
                        onClick={() => course && startPresentation(course)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <Play size={18} fill="currentColor" /> เริ่มสอน Slide Show
                      </button>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold text-slate-700 mb-10 border-b-4 border-indigo-100 pb-4 inline-block">
                    คอร์ส {course?.mainText} {course?.level}
                  </h2>

                  {activeLessons.length === 0 ? (
                    <div className="bg-white/40 p-10 rounded-3xl border border-white/60 shadow-sm text-center text-slate-500">
                      ยังไม่มีบทเรียนที่เปิดแสดงผลในคอร์สนี้
                    </div>
                  ) : (
                    <div className="w-full space-y-12">
                      {activeLessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="w-full bg-white/40 p-4 md:p-10 rounded-3xl border border-white/60 shadow-sm"
                        >
                          <h3 className="text-3xl font-bold text-indigo-700 mb-8 px-4">
                            第 {lesson.lessonNumber} 课: {lesson.titleCn}{' '}
                            {lesson.titleEn && `(${lesson.titleEn})`}
                          </h3>
                          <div className="space-y-10">
                            {lesson.sections.map((sec, sIdx) => {
                              const updateNote = (newNote: string) => {
                                const updated = [...hskCards];
                                const cIdx = updated.findIndex(
                                  (c) => c.id === currentView
                                );
                                updated[cIdx].lessons[lIdx].sections[
                                  sIdx
                                ].teacherNote = newNote;
                                setHskCards(updated);
                              };
                              return (
                                <div key={sec.id} className="w-full">
                                  {sec.patternType === 'pattern1' && <LessonPattern1 data={{ ...sec, newWords: sec.vocabulary }} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'pattern2' && <LessonTones data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternTone2' && <PatternTone2 data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternSyllables' && <PatternSyllables data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternMonosyllabic' && <PatternMonosyllabic data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternSandhi' && <PatternSandhi data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'pattern3ColTable' && <Pattern3ColTable data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternStrokes' && <PatternStrokes data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternSinglecharacter' && <PatternSinglecharacter data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'neutraltone' && <PatternNeutraltone data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternmatchpicture' && <PatternMatchPicture data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patterntonemaking' && <PatternTonemaking data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patterndialog2' && <PatternDialog2 data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternnote' && <PatternNote data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternsentence3cols' && <PatternSentence3Cols data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternsentence4cols' && <PatternSentence4Cols data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patterndespicture' && <PatternDespicture data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternpreceding' && <PatternPreceding data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternpairwork' && <PatternPairwork data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patternflextable3cols' && <PatternFlextable3cols data={sec} onUpdateNote={updateNote} />}
                                  {sec.patternType === 'patterncanva' && <PatternCanva data={sec} />}
                                  {sec.patternType === 'patternStrokeOrderRules2' && <PatternStrokeOrderRules2 data={sec} />}
                                  {sec.patternType === 'patternFlextable2cols' && <PatternFlextable2cols data={sec} />}
                                  {sec.patternType === 'patternFlexibleDoubleTable' && <PatternFlexibleDoubleTable data={sec} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {currentView === 'settings' && (appLoginRole === 'teacher' || appLoginRole === 'admin') && canSeeMenu('settings') && (
            <div className="p-6 md:p-10 w-full relative z-10 flex flex-col gap-8">
              
              {/* +++ เมนูสำหรับจัดการรหัสผ่าน (แสดงเฉพาะในหน้า Settings) +++ */}
              <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                
                {/* 1. จัดการรหัสคุณครู */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
                      <Key className="text-indigo-500" /> รหัสผ่านของคุณครู (Teacher)
                    </h3>
                    <p className="text-slate-500 text-xs">สำหรับเข้าใช้งานระบบจัดการและการสอน</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-3xl font-black tracking-widest text-indigo-600 bg-white px-6 py-2 rounded-xl shadow-inner border border-indigo-100">
                      {globalTeacherPin}
                    </div>
                    <button 
                      onClick={async () => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        if (window.confirm(`ต้องการเปลี่ยนรหัสผ่านคุณครูเป็น ${newPin} ใช่หรือไม่?`)) {
                          setGlobalTeacherPin(newPin);
                          try {
                            await updateDoc(doc(db, 'content', 'hsk_data'), { globalTeacherPin: newPin });
                            alert('✅ อัปเดตรหัสผ่านคุณครูสำเร็จ');
                          } catch(e) {}
                        }
                      }}
                      className="p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-colors shadow-sm"
                      title="สุ่มรหัสผ่านใหม่"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                {/* 2. จัดการรหัสนักเรียน */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
                      <Lock className="text-orange-500" /> รหัสเข้าสู่ระบบนักเรียน (Student)
                    </h3>
                    <p className="text-slate-500 text-xs">ให้นักเรียนใช้ปลดล็อกเพื่อเข้าศึกษาเนื้อหาด้วยตัวเอง</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-3xl font-black tracking-widest text-orange-600 bg-white px-6 py-2 rounded-xl shadow-inner border border-orange-100">
                      {globalStudentPin}
                    </div>
                    <button 
                      onClick={async () => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        if (window.confirm(`ต้องการเปลี่ยนรหัสผ่านนักเรียนเป็น ${newPin} ใช่หรือไม่?`)) {
                          setGlobalStudentPin(newPin);
                          try {
                            await updateDoc(doc(db, 'content', 'hsk_data'), { globalStudentPin: newPin });
                            alert('✅ อัปเดตรหัสผ่านนักเรียนสำเร็จ');
                          } catch(e) {}
                        }
                      }}
                      className="p-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-colors shadow-sm"
                      title="สุ่มรหัสผ่านใหม่"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                {/* 3. จัดการรหัสแอดมิน */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
                      <Settings className="text-slate-500" /> รหัสแอดมิน (Admin)
                    </h3>
                    <p className="text-slate-500 text-xs">สำหรับผู้ดูแลระบบ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-3xl font-black tracking-widest text-slate-600 bg-white px-6 py-2 rounded-xl shadow-inner border border-slate-100">
                      {globalAdminPin}
                    </div>
                    <button 
                      onClick={async () => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        if (window.confirm(`ต้องการเปลี่ยนรหัสแอดมินเป็น ${newPin} ใช่หรือไม่?`)) {
                          setGlobalAdminPin(newPin);
                          try {
                            await updateDoc(doc(db, 'content', 'hsk_data'), { globalAdminPin: newPin });
                            alert('✅ อัปเดตรหัสแอดมินสำเร็จ');
                          } catch(e) {}
                        }
                      }}
                      className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors shadow-sm"
                      title="สุ่มรหัสผ่านใหม่"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 🎯 4. จัดการการมองเห็นเมนู (เฉพาะ Admin) */}
              {appLoginRole === 'admin' && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <Eye className="text-blue-500" /> ตั้งค่าการมองเห็นเมนู (Menu Visibility)
                    </h3>
                    <p className="text-slate-500 text-xs">กำหนดว่าครูและนักเรียนจะเห็นเมนูใดบ้างที่แถบด้านซ้าย</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Teacher Visibility */}
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                      <h4 className="font-bold text-indigo-700 mb-4 flex items-center gap-2"><UserCircle size={18}/> โหมดคุณครู (Teacher)</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          { key: 'home', label: menuNames.home },
                          { key: 'other_home', label: menuNames.other_home },
                          { key: 'settings', label: menuNames.settings },
                          { key: 'settings_other', label: menuNames.settings_other }
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={menuVisibility.teacher[item.key as keyof typeof menuVisibility.teacher]} 
                              onChange={async (e) => {
                                const newVis = { ...menuVisibility, teacher: { ...menuVisibility.teacher, [item.key]: e.target.checked } };
                                setMenuVisibility(newVis);
                                try { await updateDoc(doc(db, 'content', 'hsk_data'), { menuVisibility: newVis }); } catch(err){}
                              }} 
                              className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                            />
                            <span className="text-slate-700 font-medium">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Student Visibility */}
                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                      <h4 className="font-bold text-orange-700 mb-4 flex items-center gap-2"><Users size={18}/> โหมดนักเรียน (Student)</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          { key: 'home', label: menuNames.home },
                          { key: 'other_home', label: menuNames.other_home }
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={menuVisibility.student[item.key as keyof typeof menuVisibility.student]} 
                              onChange={async (e) => {
                                const newVis = { ...menuVisibility, student: { ...menuVisibility.student, [item.key]: e.target.checked } };
                                setMenuVisibility(newVis);
                                try { await updateDoc(doc(db, 'content', 'hsk_data'), { menuVisibility: newVis }); } catch(err){}
                              }} 
                              className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer" 
                            />
                            <span className="text-slate-700 font-medium">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <SettingsView
                hskCards={hskCards}
                setHskCards={setHskCards}
                onSave={() => saveToFirebase(hskCards)}
              />
            </div>
          )}

          {/* +++ ส่ง Traffic ทุกอย่างที่ไม่ใช่ HSK และหน้าหลัก ไปที่ OtherApp +++ */}
          {(() => {
            if (!currentView.startsWith('hsk') && currentView !== 'home' && currentView !== 'settings') {
              return (
                <OtherApp
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  hskCards={hskCards}
                  setHskCards={setHskCards}
                  menuNames={menuNames}
                  setMenuNames={setMenuNames}
                  startPresentation={startPresentation}
                  saveToFirebase={saveToFirebase}
                  roomPin={roomPin}
                  userRole={userRole}
                  appLoginRole={appLoginRole} 
                  canSeeMenu={canSeeMenu}     
                />
              );
            }
            return null;
          })()}
        </main>
      </div>
    </>
  );
}

const OriginalGraduationCap = GraduationCap;