// src/Settings.tsx
import SettingFlexibleDoubleTable from './settings/SettingFlexibleDoubleTable';
import SettingFlextable2cols from './settings/SettingFlextable2cols';
import SettingStrokeOrderRules2 from './settings/SettingStrokeOrderRules2';
import SettingCanva from './settings/SettingCanva';
import SettingFlextable3cols from './settings/SettingFlextable3cols';
import SettingPairwork from './settings/SettingPairwork';
import SettingPreceding from './settings/SettingPreceding';
import SettingDespicture from './settings/SettingDespicture';
import SettingSentence4Cols from './settings/SettingSentence4Cols';
import SettingSentence3Cols from './settings/SettingSentence3Cols';
import SettingNote from './settings/SettingNote';
import SettingDialog2 from './settings/SettingDialog2';
import SettingTonemaking from './settings/SettingTonemaking';
import SettingMatchPicture from './settings/SettingMatchPicture';
import SettingNeutraltone from './settings/SettingNeutraltone';
import React, { useState } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  ListVideo,
  MessageSquare,
  Type,
  Palette,
  Save,
  Layers,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  PlusCircle,
} from 'lucide-react';
import type {
  HskCardData,
  LessonData,
  LessonSection,
  Dialogue,
  Vocabulary,
} from './types';

// =================== ฟังก์ชันแปลงลิงก์ Media อัตโนมัติ (รองรับทั้ง Dropbox และ Google Drive) ===================
const formatDriveUrl = (url: string) => {
  if (!url) return url;

  // 1. ถ้าเป็นลิงก์จาก Dropbox
  if (url.includes('dropbox.com')) {
    // แปลงโดเมนเป็น dl.dropboxusercontent.com
    let newUrl = url.replace(
      /(www\.)?dropbox\.com/,
      'dl.dropboxusercontent.com'
    );
    // เปลี่ยน dl=0 เป็น dl=1 เพื่อบังคับให้ดาวน์โหลด/สตรีมโดยตรง
    newUrl = newUrl.replace('?dl=0', '?dl=1').replace('&dl=0', '&dl=1');
    return newUrl;
  }

  // 2. ถ้าเป็นลิงก์จาก Google Drive
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) {
    return `https://drive.google.com/uc?export=download&id=${matchD[1]}`;
  }
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/uc?export=download&id=${matchId[1]}`;
  }

  return url;
};
interface SettingsProps {
  hskCards: HskCardData[];
  setHskCards: React.Dispatch<React.SetStateAction<HskCardData[]>>;
  onSave: () => void;
}

export default function SettingsView({
  hskCards,
  setHskCards,
  onSave,
}: SettingsProps) {
  const [activeSettingTab, setActiveSettingTab] = useState('lessons');
  const [selectedHskId, setSelectedHskId] = useState<string>(
    hskCards[0]?.id || ''
  );

  // =================== การจัดการฝั่งหน้าปก (Original UI) ===================
  const handleUpdateCard = (
    id: string,
    field: keyof HskCardData,
    value: any
  ) => {
    setHskCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const handleDeleteCard = (id: string) => {
    if (
      window.confirm(
        'คุณแน่ใจหรือไม่ว่าต้องการลบหน้าปกเมนูนี้? บทเรียนด้านในจะหายไปด้วย'
      )
    ) {
      setHskCards((prev) => prev.filter((card) => card.id !== id));
      if (selectedHskId === id) setSelectedHskId(hskCards[0]?.id || '');
    }
  };

  const handleAddCard = () => {
    const currentLevels = hskCards.map((c) => parseInt(c.level) || 0);
    const newLevel =
      currentLevels.length > 0 ? Math.max(...currentLevels) + 1 : 1;
    const newCard: HskCardData = {
      id: `hsk${newLevel}_${Date.now()}`,
      topTextZh: '标准教程',
      topTextEn1: 'STANDARD',
      topTextEn2: 'COURSE',
      mainText: 'HSK',
      level: `${newLevel}`,
      title: `ระดับใหม่ ${newLevel}`,
      from: `from-[#6366f1]/70`,
      to: `to-[#a5b4fc]/70`,
      shadow: `hover:shadow-[#6366f1]/50`,
      Icon: BookOpen,
      isEnabled: true,
      lessons: [],
    };
    setHskCards([...hskCards, newCard]);
  };

  // =================== การจัดการบทเรียน (เพิ่ม เลื่อน/แทรก/ซ่อน) ===================
  const handleUpdateLesson = (
    hskId: string,
    lessonId: string,
    field: keyof LessonData,
    value: any
  ) => {
    setHskCards((prev) =>
      prev.map((card) =>
        card.id === hskId
          ? {
              ...card,
              lessons: (card.lessons || []).map((lesson) =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
              ),
            }
          : card
      )
    );
  };

  // ฟังก์ชันเลื่อนบทเรียน (ขึ้น/ลง)
  const handleMoveLesson = (
    hskId: string,
    lessonIndex: number,
    direction: 'up' | 'down'
  ) => {
    setHskCards((prev) =>
      prev.map((card) => {
        if (card.id === hskId) {
          const newLessons = [...card.lessons];
          if (direction === 'up' && lessonIndex > 0) {
            const temp = newLessons[lessonIndex];
            newLessons[lessonIndex] = newLessons[lessonIndex - 1];
            newLessons[lessonIndex - 1] = temp;
          } else if (
            direction === 'down' &&
            lessonIndex < newLessons.length - 1
          ) {
            const temp = newLessons[lessonIndex];
            newLessons[lessonIndex] = newLessons[lessonIndex + 1];
            newLessons[lessonIndex + 1] = temp;
          }
          // รีเซ็ตเลขบทใหม่ให้เรียงกัน
          newLessons.forEach((l, idx) => (l.lessonNumber = idx + 1));
          return { ...card, lessons: newLessons };
        }
        return card;
      })
    );
  };

  // ฟังก์ชันแทรกบทเรียนใหม่
  const handleInsertLesson = (hskId: string, insertAtIndex: number) => {
    setHskCards((prev) =>
      prev.map((card) => {
        if (card.id === hskId) {
          const newLessons = [...card.lessons];
          newLessons.splice(insertAtIndex, 0, {
            id: `l_${Date.now()}`,
            lessonNumber: 0,
            titleCn: '',
            titleEn: '',
            sections: [],
            isEnabled: true,
          });
          // รีเซ็ตเลขบทใหม่ให้เรียงกัน
          newLessons.forEach((l, idx) => (l.lessonNumber = idx + 1));
          return { ...card, lessons: newLessons };
        }
        return card;
      })
    );
  };

  // ฟังก์ชันซ่อน/แสดง บทเรียน
  const handleToggleLessonVisibility = (hskId: string, lessonId: string) => {
    setHskCards((prev) =>
      prev.map((card) => {
        if (card.id === hskId) {
          return {
            ...card,
            lessons: card.lessons.map((l) =>
              l.id === lessonId
                ? { ...l, isEnabled: l.isEnabled === false ? true : false }
                : l
            ),
          };
        }
        return card;
      })
    );
  };

  const updateSectionState = (
    hskId: string,
    lessonId: string,
    sectionId: string,
    updater: (sec: any) => any
  ) => {
    setHskCards((prev) =>
      prev.map((card) =>
        card.id === hskId
          ? {
              ...card,
              lessons: (card.lessons || []).map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      sections: lesson.sections.map((sec) =>
                        sec.id === sectionId ? updater(sec) : sec
                      ),
                    }
                  : lesson
              ),
            }
          : card
      )
    );
  };

  const handleDeleteSection = (
    hskId: string,
    lessonId: string,
    sectionId: string
  ) => {
    if (window.confirm('คุณต้องการลบเนื้อหาส่วนนี้ใช่หรือไม่?')) {
      setHskCards((prev) =>
        prev.map((card) =>
          card.id === hskId
            ? {
                ...card,
                lessons: (card.lessons || []).map((lesson) =>
                  lesson.id === lessonId
                    ? {
                        ...lesson,
                        sections: lesson.sections.filter(
                          (sec) => sec.id !== sectionId
                        ),
                      }
                    : lesson
                ),
              }
            : card
        )
      );
    }
  };

  const handleAddSection = (hskId: string, lessonId: string) => {
    setHskCards((prev) =>
      prev.map((card) =>
        card.id === hskId
          ? {
              ...card,
              lessons: (card.lessons || []).map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      sections: [
                        ...lesson.sections,
                        {
                          id: `sec_${Date.now()}`,
                          patternType: 'pattern1',
                          sectionNumber: '1',
                          audioTrack: '',
                          audioUrl: '',
                          imageUrl: '',
                          dialogues: [],
                          vocabulary: [],
                          initials: [],
                          finals: [],
                          introTextZh: '',
                          introTextEn: '',
                          footerTextZh: '',
                          footerTextEn: '',
                          examples: [],
                          rows: [],
                          words: [],
                        },
                      ],
                    }
                  : lesson
              ),
            }
          : card
      )
    );
  };
  const [importTarget, setImportTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const selectedCard = hskCards.find((c) => c.id === selectedHskId);
  const extractHex = (twClass: string, defaultHex: string) =>
    twClass.match(/#([0-9A-Fa-f]{6})/i)?.[0] || defaultHex;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">ตั้งค่าระบบ</h2>
          <p className="text-slate-500 mt-2">
            จัดการเนื้อหาผ่านระบบ Cloud Firestore
          </p>
        </div>
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" /> บันทึกข้อมูลลง Cloud
        </button>
      </header>

      {/* Tabs Control */}
      <div className="flex gap-4 mb-8 border-b border-slate-200/50 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveSettingTab('cover')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeSettingTab === 'cover'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center">
            <Edit3 className="w-4 h-4 mr-2" /> ปรับแต่งหน้าปก
          </div>
        </button>
        <button
          onClick={() => {
            setActiveSettingTab('lessons');
            if (!selectedHskId) setSelectedHskId(hskCards[0]?.id || '');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeSettingTab === 'lessons'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center">
            <ListVideo className="w-4 h-4 mr-2" /> ตั้งค่าบทเรียน
          </div>
        </button>
      </div>

      {/* VIEW: COVER SETTINGS */}
      {activeSettingTab === 'cover' && (
        <div className="space-y-6">
          {hskCards.map((card) => (
            <div
              key={card.id}
              className={`bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border ${
                card.isEnabled
                  ? 'border-white/80'
                  : 'border-red-200 bg-red-50/30'
              } p-6 flex flex-col md:flex-row gap-6`}
            >
              <div
                className={`w-32 h-40 rounded-lg flex flex-col items-center justify-between py-4 text-white shadow-md bg-gradient-to-br ${card.from} ${card.to} shrink-0`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold">{card.topTextZh}</span>
                  <span className="text-[0.4rem] tracking-widest leading-tight">
                    {card.topTextEn1}
                  </span>
                </div>
                <span className="text-2xl font-black">{card.mainText}</span>
                <span className="text-4xl font-black">{card.level}</span>
              </div>
              <div className="flex-1 flex flex-col font-sans">
                <div className="flex justify-between items-center mb-4 font-sans">
                  <h3 className="text-lg font-bold text-slate-700 font-sans">
                    หน้าปก {card.mainText} {card.level}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateCard(card.id, 'isEnabled', !card.isEnabled)
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        card.isEnabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {card.isEnabled ? (
                        <>
                          <Eye size={16} /> แสดงบนเว็บ
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} /> ซ่อนจากเว็บ
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/50 p-4 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-500 uppercase mb-1">
                      <Palette className="w-3 h-3 mr-1" /> สีหลัก
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={extractHex(card.from, '#475569')}
                        onChange={(e) => {
                          const hex = e.target.value;
                          handleUpdateCard(card.id, 'from', `from-[${hex}]/70`);
                          handleUpdateCard(
                            card.id,
                            'shadow',
                            `hover:shadow-[${hex}]/50`
                          );
                        }}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={extractHex(card.from, '#475569')}
                        readOnly
                        className="w-20 px-2 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-500 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      สีรอง
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={extractHex(card.to, '#94a3b8')}
                        onChange={(e) =>
                          handleUpdateCard(
                            card.id,
                            'to',
                            `to-[${e.target.value}]/70`
                          )
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={extractHex(card.to, '#94a3b8')}
                        readOnly
                        className="w-20 px-2 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-500 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      คำอธิบายไทย
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'title', e.target.value)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      จีน (บน)
                    </label>
                    <input
                      type="text"
                      value={card.topTextZh}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'topTextZh', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      ENG 1
                    </label>
                    <input
                      type="text"
                      value={card.topTextEn1}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'topTextEn1', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      ENG 2
                    </label>
                    <input
                      type="text"
                      value={card.topTextEn2}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'topTextEn2', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      เลข/หลัก
                    </label>
                    <input
                      type="text"
                      value={card.level}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'level', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddCard}
            className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all"
          >
            + เพิ่มหน้าปกคอร์สใหม่
          </button>
        </div>
      )}

      {/* VIEW: LESSON SETTINGS */}
      {activeSettingTab === 'lessons' && (
        <div className="flex flex-col md:flex-row gap-6 font-sans">
          <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            {hskCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedHskId(card.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedHskId === card.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/60 text-slate-600 border border-white/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} /> {card.mainText} {card.level}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/80 p-6 min-h-[500px]">
            {selectedCard ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">
                  จัดการบทเรียน:{' '}
                  <span className="text-indigo-600">
                    {selectedCard.mainText} {selectedCard.level}
                  </span>
                </h3>
                {selectedCard.lessons.map((lesson, lIdx) => (
                  <div
                    key={lesson.id}
                    className={`bg-white rounded-xl p-5 border shadow-sm transition-all ${
                      lesson.isEnabled === false
                        ? 'opacity-60 border-dashed border-slate-300'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                          บทที่ {lesson.lessonNumber}
                        </span>
                        <button
                          onClick={() =>
                            handleToggleLessonVisibility(
                              selectedCard.id,
                              lesson.id
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                            lesson.isEnabled === false
                              ? 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {lesson.isEnabled === false ? (
                            <>
                              <EyeOff size={14} /> ซ่อนอยู่
                            </>
                          ) : (
                            <>
                              <Eye size={14} /> กำลังแสดง
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            handleMoveLesson(selectedCard.id, lIdx, 'up')
                          }
                          disabled={lIdx === 0}
                          title="เลื่อนขึ้น"
                          className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-30 transition-all"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleMoveLesson(selectedCard.id, lIdx, 'down')
                          }
                          disabled={lIdx === selectedCard.lessons.length - 1}
                          title="เลื่อนลง"
                          className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-30 transition-all"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleInsertLesson(selectedCard.id, lIdx + 1)
                          }
                          title="แทรกบทเรียนต่อจากนี้"
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 ml-2 transition-all"
                        >
                          <PlusCircle size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'ยืนยันการลบบทเรียนนี้เนื้อหาทั้งหมดจะหายไป?'
                              )
                            ) {
                              setHskCards((prev) =>
                                prev.map((c) => {
                                  if (c.id === selectedCard.id) {
                                    const newLessons = c.lessons.filter(
                                      (l) => l.id !== lesson.id
                                    );
                                    newLessons.forEach(
                                      (l, idx) => (l.lessonNumber = idx + 1)
                                    );
                                    return { ...c, lessons: newLessons };
                                  }
                                  return c;
                                })
                              );
                            }
                          }}
                          title="ลบบทเรียน"
                          className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 ml-1 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <input
                        type="text"
                        value={lesson.titleCn}
                        placeholder="ชื่อบท (จีน)"
                        onChange={(e) =>
                          handleUpdateLesson(
                            selectedCard.id,
                            lesson.id,
                            'titleCn',
                            e.target.value
                          )
                        }
                        className="px-3 py-2 bg-slate-50 border rounded-lg text-sm font-sans"
                      />
                      <input
                        type="text"
                        value={lesson.titleEn}
                        placeholder="ชื่อบท (ENG)"
                        onChange={(e) =>
                          handleUpdateLesson(
                            selectedCard.id,
                            lesson.id,
                            'titleEn',
                            e.target.value
                          )
                        }
                        className="px-3 py-2 bg-slate-50 border rounded-lg text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-4 font-sans">
                      {lesson.sections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/20 font-sans"
                        >
                          <div className="flex justify-between items-center mb-4 border-b pb-2 font-sans">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-indigo-600 text-sm">
                                ส่วนที่ {sIdx + 1}
                              </span>
                              <select
                                value={sec.patternType}
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      patternType: e.target.value,
                                    })
                                  )
                                }
                                className="text-[10px] bg-white border border-indigo-200 rounded px-2 py-0.5 font-bold text-indigo-700 uppercase"
                              >
                                <option value="pattern1">
                                  Pattern 1: Dialogue
                                </option>
                                <option value="pattern2">
                                  Pattern 2: Tones Table
                                </option>
                                <option value="patternTone2">
                                  Pattern 3: Tone Graphs
                                </option>
                                <option value="patternSyllables">
                                  Pattern 4: Syllables Table
                                </option>
                                <option value="patternMonosyllabic">
                                  Pattern 5: Monosyllabic (Images 1:1)
                                </option>
                                <option value="patternSandhi">
                                  Pattern 6: Tone Sandhi (Table + Audio)
                                </option>
                                <option value="pattern3ColTable">
                                  Pattern 7: 3-Column Table
                                </option>
                                <option value="patternStrokes">
                                  Pattern 8: Strokes (Image Mode)
                                </option>
                                <option value="patternSinglecharacter">
                                  Pattern 9: Single-Component Characters
                                </option>
                                <option value="neutraltone">
                                  Pattern: Neutral Tone (เสียงเบา)
                                </option>
                                <option value="patternmatchpicture">
                                  Pattern: Match Picture (จับคู่ภาพ)
                                </option>
                                <option value="patterntonemaking">
                                  Pattern: Tone Marking (การเติมวรรณยุกต์)
                                </option>
                                <option value="patterndialog2">
                                  Pattern: Dialog Type 2 (มีรูปไม่ทับข้อความ)
                                </option>
                                <option value="patternnote">
                                  Pattern: Grammar Note (อธิบายไวยากรณ์)
                                </option>
                                <option value="patternsentence3cols">
                                  Pattern: Sentence Table 3 Cols (ตารางไวยากรณ์
                                  3 ช่อง)
                                </option>
                                <option value="patternsentence4cols">
                                  Pattern: Sentence Table 4 Cols (ตารางไวยากรณ์
                                  4 ช่อง)
                                </option>
                                <option value="patterndespicture">
                                  Pattern: Describe Picture
                                  (อธิบายภาพพร้อมช่องว่าง)
                                </option>
                                <option value="patternpreceding">
                                  Pattern: Stroke Order Rules (กฎลำดับขีด)
                                </option>
                                <option value="patternpairwork">
                                  Pattern: Pair Work Dialogue (บทสนทนาโต้ตอบ)
                                </option>
                                <option value="patternflextable3cols">
                                  Pattern: Flexible 3-Column Table
                                </option>
                                <option value="patterncanva">
                                  Pattern: Canva Presentation
                                </option>
                                <option value="patternStrokeOrderRules2">
                                  Pattern: Stroke Order Rules 2 (Table + Image)
                                </option>

                                <option value="patternFlextable2cols">
                                  Pattern: Flexible Table (2 Columns)
                                </option>
                                <option value="patternFlexibleDoubleTable">
                                  Pattern: Flexible Double Table (2-Tier Header)
                                </option>
                              </select>
                            </div>

                            <button
                              onClick={() =>
                                handleDeleteSection(
                                  selectedCard.id,
                                  lesson.id,
                                  sec.id
                                )
                              }
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <input
                              type="text"
                              value={sec.sectionNumber || ''}
                              placeholder="เลขข้อ (เว้นว่างได้)"
                              onChange={(e) =>
                                updateSectionState(
                                  selectedCard.id,
                                  lesson.id,
                                  sec.id,
                                  (s) => ({
                                    ...s,
                                    sectionNumber: e.target.value,
                                  })
                                )
                              }
                              className="px-3 py-1.5 bg-white border rounded text-sm font-sans"
                            />
                            <input
                              type="text"
                              value={sec.audioTrack || ''}
                              placeholder="Track (01-5)"
                              onChange={(e) =>
                                updateSectionState(
                                  selectedCard.id,
                                  lesson.id,
                                  sec.id,
                                  (s) => ({ ...s, audioTrack: e.target.value })
                                )
                              }
                              className="px-3 py-1.5 bg-white border rounded text-sm font-sans"
                            />
                            <input
                              type="text"
                              value={sec.audioUrl || ''}
                              placeholder="Audio URL"
                              onChange={(e) =>
                                updateSectionState(
                                  selectedCard.id,
                                  lesson.id,
                                  sec.id,
                                  (s) => ({
                                    ...s,
                                    audioUrl: formatDriveUrl(e.target.value),
                                  })
                                )
                              }
                              className="px-3 py-1.5 bg-white border rounded text-sm font-sans"
                            />
                          </div>

                          {/* Pattern 3 & 4 Fields */}
                          {(sec.patternType === 'patternTone2' ||
                            sec.patternType === 'patternSyllables' ||
                            sec.patternType === 'patternStrokes') && (
                            <div className="space-y-4">
                              <textarea
                                value={sec.introTextZh}
                                placeholder="เนื้อหา (จีน)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      introTextZh: e.target.value,
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs"
                              />
                              <textarea
                                value={sec.introTextEn}
                                placeholder="เนื้อหา (ENG)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      introTextEn: e.target.value,
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs"
                              />
                            </div>
                          )}

                          {/* Pattern 6: Tone Sandhi (Table + Audio Footer) */}
                          {sec.patternType === 'patternSandhi' && (
                            <div className="space-y-4 font-sans text-left mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
                                    หัวข้อ (จีน)
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.titleZh || ''}
                                    placeholder="เช่น: 两个三声音节的连读变调"
                                    onChange={(e) =>
                                      updateSectionState(
                                        selectedCard.id,
                                        lesson.id,
                                        sec.id,
                                        (s) => ({
                                          ...s,
                                          titleZh: e.target.value,
                                        })
                                      )
                                    }
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
                                    หัวข้อ (ENG)
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.titleEn || ''}
                                    placeholder="เช่น: Tone Sandhi: 3rd tone + 3rd tone"
                                    onChange={(e) =>
                                      updateSectionState(
                                        selectedCard.id,
                                        lesson.id,
                                        sec.id,
                                        (s) => ({
                                          ...s,
                                          titleEn: e.target.value,
                                        })
                                      )
                                    }
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                  />
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  Text & Description
                                </label>
                                <textarea
                                  value={sec.introTextZh || ''}
                                  placeholder="คำอธิบาย (จีน)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        introTextZh: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                                <textarea
                                  value={sec.introTextEn || ''}
                                  placeholder="คำอธิบาย (ENG)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        introTextEn: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  Tone Sandhi Rows (3rd + 3rd)
                                </label>
                                {(sec.rows || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 mb-2 border-b pb-2 items-center"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Col 1 (เช่น nǐ (你))"
                                        value={row.col1 || ''}
                                        onChange={(e) => {
                                          const newRows = [...sec.rows];
                                          newRows[rIdx] = {
                                            ...newRows[rIdx],
                                            col1: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Col 2 (เช่น hǎo (好))"
                                        value={row.col2 || ''}
                                        onChange={(e) => {
                                          const newRows = [...sec.rows];
                                          newRows[rIdx] = {
                                            ...newRows[rIdx],
                                            col2: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Col 3 (เช่น ní)"
                                        value={row.col3 || ''}
                                        onChange={(e) => {
                                          const newRows = [...sec.rows];
                                          newRows[rIdx] = {
                                            ...newRows[rIdx],
                                            col3: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Col 4 (เช่น hǎo)"
                                        value={row.col4 || ''}
                                        onChange={(e) => {
                                          const newRows = [...sec.rows];
                                          newRows[rIdx] = {
                                            ...newRows[rIdx],
                                            col4: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="p-1 border rounded text-[10px]"
                                      />
                                      <button
                                        onClick={() => {
                                          const newRows = sec.rows.filter(
                                            (_: any, i: number) => i !== rIdx
                                          );
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="text-red-400 hover:text-red-500 p-1"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        rows: [
                                          ...(s.rows || []),
                                          {
                                            col1: '',
                                            col2: '',
                                            col3: '',
                                            col4: '',
                                          },
                                        ],
                                      })
                                    )
                                  }
                                  className="text-[10px] text-indigo-600 font-bold mt-1"
                                >
                                  + เพิ่มแถวตาราง
                                </button>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  Footer Text (ส่วนที่มีไฟล์เสียง)
                                </label>
                                <textarea
                                  value={sec.footerTextZh || ''}
                                  placeholder="ข้อความด้านล่าง (จีน)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        footerTextZh: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                                <textarea
                                  value={sec.footerTextEn || ''}
                                  placeholder="ข้อความด้านล่าง (ENG)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        footerTextEn: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                              </div>

                              {/* ---> ส่วนที่เพิ่มใหม่: ช่องกรอกคำศัพท์ตารางล่างสุด <--- */}
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  คำศัพท์แบบฝึกหัด (ตารางล่างสุด)
                                </label>
                                <textarea
                                  value={(sec.practiceWords || []).join(', ')}
                                  onChange={(e) => {
                                    const wordsArray = e.target.value
                                      .split(',')
                                      .map((w) => w.trim())
                                      .filter((w) => w !== '');

                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        practiceWords: wordsArray,
                                      })
                                    );
                                  }}
                                  placeholder="พิมพ์พินอินคั่นด้วยลูกน้ำ เช่น: nǐ hǎo, kěyǐ, fǔdǎo, xiǎojiě"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-400 resize-none h-20 shadow-inner"
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                  <span className="font-bold text-amber-500">
                                    💡 เคล็ดลับ:
                                  </span>
                                  ใช้ลูกน้ำ (,) เพื่อขึ้นคำใหม่
                                  ระบบจะนำไปจัดเป็น 4 คอลัมน์ให้อัตโนมัติ
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Pattern 7: 3-Column Table (Chinese/Pinyin/Translation) */}
                          {sec.patternType === 'pattern3ColTable' && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4">
                              <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                3-Column Table Rows
                              </label>
                              {(sec.rows || []).map(
                                (row: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="grid grid-cols-3 gap-2 mb-2 border-b pb-2 items-center relative"
                                  >
                                    <input
                                      type="text"
                                      placeholder="จีน"
                                      value={row.chinese || ''}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          chinese: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Pinyin"
                                      value={row.pinyin || ''}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          pinyin: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="แปล"
                                        value={row.translation || ''}
                                        onChange={(e) => {
                                          const newRows = [...sec.rows];
                                          newRows[rIdx] = {
                                            ...newRows[rIdx],
                                            translation: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="flex-1 p-1 border rounded text-[10px]"
                                      />
                                      <button
                                        onClick={() => {
                                          const newRows = sec.rows.filter(
                                            (_: any, i: number) => i !== rIdx
                                          );
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="text-red-400"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                              <button
                                onClick={() =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      rows: [
                                        ...(s.rows || []),
                                        {
                                          chinese: '',
                                          pinyin: '',
                                          translation: '',
                                        },
                                      ],
                                    })
                                  )
                                }
                                className="text-[10px] text-indigo-600 font-bold mt-2 inline-block"
                              >
                                + เพิ่มคำในตาราง
                              </button>
                            </div>
                          )}

                          {/* Pattern 9: Single-Component Characters */}
                          {sec.patternType === 'patternSinglecharacter' && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                  type="text"
                                  placeholder="หัวข้อ (จีน)"
                                  value={sec.titleZh || ''}
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({ ...s, titleZh: e.target.value })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs"
                                />
                                <input
                                  type="text"
                                  placeholder="หัวข้อ (ENG)"
                                  value={sec.titleEn || ''}
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({ ...s, titleEn: e.target.value })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs"
                                />
                              </div>

                              <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                Items (รายการคำศัพท์และรูปภาพ)
                              </label>

                              {(sec.rows || []).map(
                                (row: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="mb-4 border border-slate-100 p-4 rounded bg-slate-50 relative shadow-inner"
                                  >
                                    <button
                                      onClick={() => {
                                        const nr = sec.rows.filter(
                                          (_: any, i: number) => i !== rIdx
                                        );
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: nr })
                                        );
                                      }}
                                      className="absolute right-2 top-2 text-red-400 hover:text-red-500"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <div className="flex flex-col gap-3 pr-8">
                                      <textarea
                                        placeholder="1. Text จีน"
                                        value={row.chinese || ''}
                                        onChange={(e) => {
                                          const nr = [...sec.rows];
                                          nr[rIdx].chinese = e.target.value;
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: nr })
                                          );
                                        }}
                                        className="w-full p-2 border rounded text-xs font-serif"
                                      />
                                      <textarea
                                        placeholder="2. Text ENG"
                                        value={row.english || ''}
                                        onChange={(e) => {
                                          const nr = [...sec.rows];
                                          nr[rIdx].english = e.target.value;
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: nr })
                                          );
                                        }}
                                        className="w-full p-2 border rounded text-xs"
                                      />
                                      <input
                                        type="text"
                                        placeholder="3. Image URL (URL รูปภาพ)"
                                        value={row.imageUrl || ''}
                                        onChange={(e) => {
                                          const nr = [...sec.rows];
                                          nr[rIdx].imageUrl = e.target.value;
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: nr })
                                          );
                                        }}
                                        className="w-full p-2 border rounded text-xs"
                                      />
                                    </div>
                                  </div>
                                )
                              )}

                              <button
                                onClick={() =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      rows: [
                                        ...(s.rows || []),
                                        {
                                          chinese: '',
                                          english: '',
                                          imageUrl: '',
                                        },
                                      ],
                                    })
                                  )
                                }
                                className="text-[10px] text-indigo-600 font-bold mt-2 inline-block"
                              >
                                + เพิ่มรายการ
                              </button>
                            </div>
                          )}

                          {/* Pattern 5: Monosyllabic (Images 1:1) */}
                          {sec.patternType === 'patternMonosyllabic' && (
                            <div className="space-y-4 font-sans text-left mt-4">
                              <textarea
                                value={sec.titleZh || ''}
                                placeholder="หัวข้อย่อย (จีน)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      titleZh: e.target.value,
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs font-sans"
                              />
                              <textarea
                                value={sec.titleEn || ''}
                                placeholder="หัวข้อย่อย (ENG)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      titleEn: e.target.value,
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs font-sans"
                              />
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  Words List (1:1 Images)
                                </label>
                                {(sec.words || []).map(
                                  (w: any, wIdx: number) => (
                                    <div
                                      key={wIdx}
                                      className="grid grid-cols-2 gap-2 mb-2 border-b pb-2"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={w.imageUrl}
                                        onChange={(e) => {
                                          const newWords = [...sec.words];
                                          newWords[wIdx] = {
                                            ...newWords[wIdx],
                                            imageUrl: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, words: newWords })
                                          );
                                        }}
                                        className="p-1 border rounded text-[10px]"
                                      />
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Pinyin"
                                          value={w.pinyin}
                                          onChange={(e) => {
                                            const newWords = [...sec.words];
                                            newWords[wIdx] = {
                                              ...newWords[wIdx],
                                              pinyin: e.target.value,
                                            };
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, words: newWords })
                                            );
                                          }}
                                          className="flex-1 p-1 border rounded text-[10px]"
                                        />
                                        <button
                                          onClick={() => {
                                            const newWords = sec.words.filter(
                                              (_: any, i: number) => i !== wIdx
                                            );
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, words: newWords })
                                            );
                                          }}
                                          className="text-red-400 hover:text-red-500"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        words: [
                                          ...(s.words || []),
                                          { imageUrl: '', pinyin: '' },
                                        ],
                                      })
                                    )
                                  }
                                  className="text-[10px] text-indigo-600 font-bold mt-2"
                                >
                                  + เพิ่มรูปภาพ
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Pattern 8: Strokes (Image Mode) */}
                          {sec.patternType === 'patternStrokes' && (
                            <div className="space-y-4 font-sans text-left mt-4 border-t pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  placeholder="หัวข้อ (จีน)"
                                  value={sec.titleZh || ''}
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({ ...s, titleZh: e.target.value })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs"
                                />
                                <input
                                  type="text"
                                  placeholder="หัวข้อ (ENG)"
                                  value={sec.titleEn || ''}
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({ ...s, titleEn: e.target.value })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs"
                                />
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  Text & Description
                                </label>
                                <textarea
                                  value={sec.introTextZh || ''}
                                  placeholder="คำอธิบาย (จีน)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        introTextZh: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                                <textarea
                                  value={sec.introTextEn || ''}
                                  placeholder="คำอธิบาย (ENG)"
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        introTextEn: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full p-2 border rounded text-xs font-sans"
                                />
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  Stroke Rows (Image Mode)
                                </label>
                                {(sec.rows || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="mb-6 border border-slate-100 p-4 rounded bg-slate-50 relative shadow-inner"
                                    >
                                      <button
                                        onClick={() => {
                                          const newRows = sec.rows.filter(
                                            (_: any, i: number) => i !== rIdx
                                          );
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({ ...s, rows: newRows })
                                          );
                                        }}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-500"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <div className="grid grid-cols-2 gap-3 mb-4">
                                        <input
                                          type="text"
                                          placeholder="URL รูปตัวเขียน (เล็ก)"
                                          value={row.strokeImgUrl || ''}
                                          onChange={(e) => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].strokeImgUrl =
                                              e.target.value;
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="p-1.5 border rounded text-[10px]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="URL รูปทิศทาง (ใหญ่)"
                                          value={row.directionImgUrl || ''}
                                          onChange={(e) => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].directionImgUrl =
                                              e.target.value;
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="p-1.5 border rounded text-[10px]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="ชื่อจีน (เช่น 横)"
                                          value={row.nameZh || ''}
                                          onChange={(e) => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].nameZh = e.target.value;
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="p-1.5 border rounded text-[10px]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Pinyin"
                                          value={row.pinyin || ''}
                                          onChange={(e) => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].pinyin = e.target.value;
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="p-1.5 border rounded text-[10px]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="ชื่ออังกฤษ (Direction)"
                                          value={row.directionName || ''}
                                          onChange={(e) => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].directionName =
                                              e.target.value;
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="p-1.5 border rounded text-[10px] col-span-2"
                                        />
                                      </div>
                                      <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                                        <label className="text-[10px] font-bold text-indigo-400 block">
                                          EXAMPLES
                                        </label>
                                        {(row.examples || []).map(
                                          (ex: any, exIdx: number) => (
                                            <div
                                              key={exIdx}
                                              className="flex gap-2"
                                            >
                                              <input
                                                type="text"
                                                placeholder="ตัวจีน"
                                                value={ex.character || ''}
                                                onChange={(e) => {
                                                  const nr = [...sec.rows];
                                                  const nEx = [
                                                    ...nr[rIdx].examples,
                                                  ];
                                                  nEx[exIdx] = {
                                                    ...nEx[exIdx],
                                                    character: e.target.value,
                                                  };
                                                  nr[rIdx].examples = nEx;
                                                  updateSectionState(
                                                    selectedCard.id,
                                                    lesson.id,
                                                    sec.id,
                                                    (s) => ({
                                                      ...s,
                                                      rows: nr,
                                                    })
                                                  );
                                                }}
                                                className="w-14 p-1 border rounded text-[10px]"
                                              />
                                              <input
                                                type="text"
                                                placeholder="Pinyin"
                                                value={ex.pinyin || ''}
                                                onChange={(e) => {
                                                  const nr = [...sec.rows];
                                                  const nEx = [
                                                    ...nr[rIdx].examples,
                                                  ];
                                                  nEx[exIdx] = {
                                                    ...nEx[exIdx],
                                                    pinyin: e.target.value,
                                                  };
                                                  nr[rIdx].examples = nEx;
                                                  updateSectionState(
                                                    selectedCard.id,
                                                    lesson.id,
                                                    sec.id,
                                                    (s) => ({
                                                      ...s,
                                                      rows: nr,
                                                    })
                                                  );
                                                }}
                                                className="w-16 p-1 border rounded text-[10px]"
                                              />
                                              <input
                                                type="text"
                                                placeholder="แปล"
                                                value={ex.meaning || ''}
                                                onChange={(e) => {
                                                  const nr = [...sec.rows];
                                                  const nEx = [
                                                    ...nr[rIdx].examples,
                                                  ];
                                                  nEx[exIdx] = {
                                                    ...nEx[exIdx],
                                                    meaning: e.target.value,
                                                  };
                                                  nr[rIdx].examples = nEx;
                                                  updateSectionState(
                                                    selectedCard.id,
                                                    lesson.id,
                                                    sec.id,
                                                    (s) => ({
                                                      ...s,
                                                      rows: nr,
                                                    })
                                                  );
                                                }}
                                                className="flex-1 p-1 border rounded text-[10px]"
                                              />
                                              <button
                                                onClick={() => {
                                                  const nr = [...sec.rows];
                                                  nr[rIdx].examples = nr[
                                                    rIdx
                                                  ].examples.filter(
                                                    (_: any, i: number) =>
                                                      i !== exIdx
                                                  );
                                                  updateSectionState(
                                                    selectedCard.id,
                                                    lesson.id,
                                                    sec.id,
                                                    (s) => ({ ...s, rows: nr })
                                                  );
                                                }}
                                                className="text-red-400"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          )
                                        )}
                                        <button
                                          onClick={() => {
                                            const nr = [...sec.rows];
                                            nr[rIdx].examples = [
                                              ...(nr[rIdx].examples || []),
                                              {
                                                character: '',
                                                pinyin: '',
                                                meaning: '',
                                              },
                                            ];
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({ ...s, rows: nr })
                                            );
                                          }}
                                          className="text-[10px] text-indigo-500 font-bold mt-1"
                                        >
                                          + เพิ่มตัวอย่าง
                                        </button>
                                      </div>
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        rows: [
                                          ...(s.rows || []),
                                          {
                                            strokeImgUrl: '',
                                            nameZh: '',
                                            pinyin: '',
                                            directionName: '',
                                            directionImgUrl: '',
                                            examples: [],
                                          },
                                        ],
                                      })
                                    )
                                  }
                                  className="text-[10px] text-indigo-600 font-bold mt-1"
                                >
                                  + เพิ่มแถวเส้นขีด
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Pattern 3 Tone Graph Inputs */}
                          {sec.patternType === 'patternTone2' && (
                            <div className="bg-white p-3 rounded-lg border border-indigo-100 font-sans mt-4">
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                                Examples 4 Tones
                              </label>
                              {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="flex gap-2 mt-1">
                                  <input
                                    type="text"
                                    placeholder="Pinyin"
                                    value={sec.examples?.[idx]?.pinyin || ''}
                                    onChange={(e) => {
                                      const newEx = [
                                        ...(sec.examples || [{}, {}, {}, {}]),
                                      ];
                                      newEx[idx] = {
                                        ...newEx[idx],
                                        pinyin: e.target.value,
                                      };
                                      updateSectionState(
                                        selectedCard.id,
                                        lesson.id,
                                        sec.id,
                                        (s) => ({ ...s, examples: newEx })
                                      );
                                    }}
                                    className="w-full p-1 border rounded text-[10px]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="จีน"
                                    value={sec.examples?.[idx]?.chinese || ''}
                                    onChange={(e) => {
                                      const newEx = [
                                        ...(sec.examples || [{}, {}, {}, {}]),
                                      ];
                                      newEx[idx] = {
                                        ...newEx[idx],
                                        chinese: e.target.value,
                                      };
                                      updateSectionState(
                                        selectedCard.id,
                                        lesson.id,
                                        sec.id,
                                        (s) => ({ ...s, examples: newEx })
                                      );
                                    }}
                                    className="w-full p-1 border rounded text-[10px]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="แปล"
                                    value={
                                      sec.examples?.[idx]?.translation || ''
                                    }
                                    onChange={(e) => {
                                      const newEx = [
                                        ...(sec.examples || [{}, {}, {}, {}]),
                                      ];
                                      newEx[idx] = {
                                        ...newEx[idx],
                                        translation: e.target.value,
                                      };
                                      updateSectionState(
                                        selectedCard.id,
                                        lesson.id,
                                        sec.id,
                                        (s) => ({ ...s, examples: newEx })
                                      );
                                    }}
                                    className="w-full p-1 border rounded text-[10px]"
                                  />
                                </div>
                              ))}
                              <textarea
                                value={
                                  sec.syllables
                                    ?.map((r: any) => r.join(', '))
                                    .join('\n') || ''
                                }
                                placeholder="Syllables Grid (บรรทัดละแถว คั่นด้วยคอมมา)"
                                onChange={(e) => {
                                  const rows = e.target.value
                                    .split('\n')
                                    .map((r) =>
                                      r
                                        .split(',')
                                        .map((i) => i.trim())
                                        .filter((i) => i !== '')
                                    );
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({ ...s, syllables: rows })
                                  );
                                }}
                                className="w-full p-2 border rounded text-xs h-24 font-mono mt-4"
                              />
                            </div>
                          )}

                          {/* Pattern 1 (สมบูรณ์ 100%) */}
                          {sec.patternType === 'pattern1' && (
                            <div className="space-y-4 font-sans text-left mt-4">
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">
                                  Image URL (รูปภาพประจำบท)
                                </label>
                                <input
                                  type="text"
                                  value={sec.imageUrl || ''}
                                  placeholder="วาง URL รูปภาพที่นี่..."
                                  onChange={(e) =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        imageUrl: e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  Dialogues (บทสนทนา)
                                </label>
                                {(sec.dialogues || []).map(
                                  (d: any, dIdx: number) => (
                                    <div
                                      key={dIdx}
                                      className="grid gap-2 mb-3 border-b pb-3"
                                    >
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="ผู้พูด"
                                          value={d.speaker || ''}
                                          onChange={(e) => {
                                            const newDialogues = [
                                              ...sec.dialogues,
                                            ];
                                            newDialogues[dIdx] = {
                                              ...newDialogues[dIdx],
                                              speaker: e.target.value,
                                            };
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({
                                                ...s,
                                                dialogues: newDialogues,
                                              })
                                            );
                                          }}
                                          className="w-20 p-1 border rounded text-[10px]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Pinyin"
                                          value={d.pinyin || ''}
                                          onChange={(e) => {
                                            const newDialogues = [
                                              ...sec.dialogues,
                                            ];
                                            newDialogues[dIdx] = {
                                              ...newDialogues[dIdx],
                                              pinyin: e.target.value,
                                            };
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({
                                                ...s,
                                                dialogues: newDialogues,
                                              })
                                            );
                                          }}
                                          className="flex-1 p-1 border rounded text-[10px]"
                                        />
                                        <button
                                          onClick={() => {
                                            const newDialogues =
                                              sec.dialogues.filter(
                                                (_: any, i: number) =>
                                                  i !== dIdx
                                              );
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({
                                                ...s,
                                                dialogues: newDialogues,
                                              })
                                            );
                                          }}
                                          className="text-red-400 hover:text-red-500"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="ภาษาจีน"
                                        value={d.chinese || ''}
                                        onChange={(e) => {
                                          const newDialogues = [
                                            ...sec.dialogues,
                                          ];
                                          newDialogues[dIdx] = {
                                            ...newDialogues[dIdx],
                                            chinese: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              dialogues: newDialogues,
                                            })
                                          );
                                        }}
                                        className="w-full p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="คำแปล"
                                        value={d.english || ''}
                                        onChange={(e) => {
                                          const newDialogues = [
                                            ...sec.dialogues,
                                          ];
                                          newDialogues[dIdx] = {
                                            ...newDialogues[dIdx],
                                            english: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              dialogues: newDialogues,
                                            })
                                          );
                                        }}
                                        className="w-full p-1 border rounded text-[10px]"
                                      />
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        dialogues: [
                                          ...(s.dialogues || []),
                                          {
                                            speaker: '',
                                            pinyin: '',
                                            chinese: '',
                                            english: '',
                                          },
                                        ],
                                      })
                                    )
                                  }
                                  className="text-[10px] text-indigo-600 font-bold"
                                >
                                  + เพิ่มบทสนทนา
                                </button>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                  Vocabulary (คำศัพท์ใหม่)
                                </label>
                                {(sec.vocabulary || []).map(
                                  (v: any, vIdx: number) => (
                                    <div
                                      key={vIdx}
                                      className="grid grid-cols-2 gap-2 mb-3 border-b pb-3"
                                    >
                                      <input
                                        type="number"
                                        placeholder="No."
                                        value={v.no || ''}
                                        onChange={(e) => {
                                          const newVocab = [...sec.vocabulary];
                                          newVocab[vIdx] = {
                                            ...newVocab[vIdx],
                                            no: parseInt(e.target.value) || 0,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              vocabulary: newVocab,
                                            })
                                          );
                                        }}
                                        className="w-full p-1 border rounded text-[10px]"
                                      />
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Pinyin"
                                          value={v.pinyin || ''}
                                          onChange={(e) => {
                                            const newVocab = [
                                              ...sec.vocabulary,
                                            ];
                                            newVocab[vIdx] = {
                                              ...newVocab[vIdx],
                                              pinyin: e.target.value,
                                            };
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({
                                                ...s,
                                                vocabulary: newVocab,
                                              })
                                            );
                                          }}
                                          className="flex-1 p-1 border rounded text-[10px]"
                                        />
                                        <button
                                          onClick={() => {
                                            const newVocab =
                                              sec.vocabulary.filter(
                                                (_: any, i: number) =>
                                                  i !== vIdx
                                              );
                                            updateSectionState(
                                              selectedCard.id,
                                              lesson.id,
                                              sec.id,
                                              (s) => ({
                                                ...s,
                                                vocabulary: newVocab,
                                              })
                                            );
                                          }}
                                          className="text-red-400 hover:text-red-500"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="จีน"
                                        value={v.character || ''}
                                        onChange={(e) => {
                                          const newVocab = [...sec.vocabulary];
                                          newVocab[vIdx] = {
                                            ...newVocab[vIdx],
                                            character: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              vocabulary: newVocab,
                                            })
                                          );
                                        }}
                                        className="w-full p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="ประเภท (v, n...)"
                                        value={v.type || ''}
                                        onChange={(e) => {
                                          const newVocab = [...sec.vocabulary];
                                          newVocab[vIdx] = {
                                            ...newVocab[vIdx],
                                            type: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              vocabulary: newVocab,
                                            })
                                          );
                                        }}
                                        className="w-full p-1 border rounded text-[10px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="แปล"
                                        value={v.meaning || ''}
                                        onChange={(e) => {
                                          const newVocab = [...sec.vocabulary];
                                          newVocab[vIdx] = {
                                            ...newVocab[vIdx],
                                            meaning: e.target.value,
                                          };
                                          updateSectionState(
                                            selectedCard.id,
                                            lesson.id,
                                            sec.id,
                                            (s) => ({
                                              ...s,
                                              vocabulary: newVocab,
                                            })
                                          );
                                        }}
                                        className="col-span-2 w-full p-1 border rounded text-[10px]"
                                      />
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() =>
                                    updateSectionState(
                                      selectedCard.id,
                                      lesson.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        vocabulary: [
                                          ...(s.vocabulary || []),
                                          {
                                            no: (s.vocabulary?.length || 0) + 1,
                                            character: '',
                                            pinyin: '',
                                            type: '',
                                            meaning: '',
                                          },
                                        ],
                                      })
                                    )
                                  }
                                  className="text-[10px] text-indigo-600 font-bold"
                                >
                                  + เพิ่มคำศัพท์
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Pattern 2 */}
                          {sec.patternType === 'pattern2' && (
                            <div className="space-y-3 font-sans mt-4">
                              <textarea
                                value={(sec.initials || []).join(', ')}
                                placeholder="Initials (b, p, m, f...)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      initials: e.target.value
                                        .split(',')
                                        .map((v) => v.trim()),
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs font-sans"
                              />
                              <textarea
                                value={(sec.finals || []).join(', ')}
                                placeholder="Finals (a, o, e, i...)"
                                onChange={(e) =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      finals: e.target.value
                                        .split(',')
                                        .map((v) => v.trim()),
                                    })
                                  )
                                }
                                className="w-full p-2 border rounded text-xs font-sans"
                              />
                            </div>
                          )}

                          {/* Pattern 4 (Syllables Table) */}
                          {sec.patternType === 'patternSyllables' && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4">
                              <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">
                                Syllable Rows
                              </label>
                              {(sec.rows || []).map(
                                (row: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="grid grid-cols-4 gap-2 mb-2 border-b pb-2"
                                  >
                                    <input
                                      type="text"
                                      placeholder="Syllable"
                                      value={row.syllable}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          syllable: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Initial"
                                      value={row.initial}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          initial: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Final"
                                      value={row.final}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          final: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Tone"
                                      value={row.tone}
                                      onChange={(e) => {
                                        const newRows = [...sec.rows];
                                        newRows[rIdx] = {
                                          ...newRows[rIdx],
                                          tone: e.target.value,
                                        };
                                        updateSectionState(
                                          selectedCard.id,
                                          lesson.id,
                                          sec.id,
                                          (s) => ({ ...s, rows: newRows })
                                        );
                                      }}
                                      className="p-1 border rounded text-[10px]"
                                    />
                                  </div>
                                )
                              )}
                              <button
                                onClick={() =>
                                  updateSectionState(
                                    selectedCard.id,
                                    lesson.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      rows: [
                                        ...(s.rows || []),
                                        {
                                          syllable: '',
                                          initial: '',
                                          final: '',
                                          tone: '',
                                        },
                                      ],
                                    })
                                  )
                                }
                                className="text-[10px] text-indigo-600 font-bold"
                              >
                                + เพิ่มแถวตาราง
                              </button>
                            </div>
                          )}
                          {sec.patternType === 'neutraltone' && (
                            <SettingNeutraltone
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternmatchpicture' && (
                            <SettingMatchPicture
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patterntonemaking' && (
                            <SettingTonemaking
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patterndialog2' && (
                            <SettingDialog2
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternnote' && (
                            <SettingNote
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternsentence3cols' && (
                            <SettingSentence3Cols
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternsentence4cols' && (
                            <SettingSentence4Cols
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patterndespicture' && (
                            <SettingDespicture
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternpreceding' && (
                            <SettingPreceding
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternpairwork' && (
                            <SettingPairwork
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternflextable3cols' && (
                            <SettingFlextable3cols
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patterncanva' && (
                            <SettingCanva
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}

                          {sec.patternType === 'patternStrokeOrderRules2' && (
                            <SettingStrokeOrderRules2
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternFlextable2cols' && (
                            <SettingFlextable2cols
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                          {sec.patternType === 'patternFlexibleDoubleTable' && (
                            <SettingFlexibleDoubleTable
                              section={sec}
                              cardId={selectedCard.id}
                              lessonId={lesson.id}
                              updateSectionState={updateSectionState}
                            />
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() =>
                          handleAddSection(selectedCard.id, lesson.id)
                        }
                        className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold font-sans transition-all hover:bg-indigo-100"
                      >
                        + เพิ่มส่วนเนื้อหาใหม่ในบทนี้
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setHskCards((prev) =>
                      prev.map((c) =>
                        c.id === selectedCard.id
                          ? {
                              ...c,
                              lessons: [
                                ...c.lessons,
                                {
                                  id: `l_${Date.now()}`,
                                  lessonNumber: c.lessons.length + 1,
                                  titleCn: '',
                                  titleEn: '',
                                  sections: [],
                                  isEnabled: true,
                                },
                              ],
                            }
                          : c
                      )
                    )
                  }
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all font-sans"
                >
                  + เพิ่มบทเรียนใหม่ท้ายสุด
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 font-sans">
                <BookOpen size={48} className="mb-4 opacity-20 font-sans" />
                <p>เลือกคอร์สทางซ้ายเพื่อเริ่มตั้งค่า</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button
          onClick={onSave}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl transition-all hover:-translate-y-1 active:scale-95 text-lg border-2 border-white/20"
        >
          <Save size={24} />
          บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}
