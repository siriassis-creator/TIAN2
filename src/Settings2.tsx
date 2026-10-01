// src/Settings2.tsx
import React, { useState, useEffect } from 'react';
import {
  Edit3, Trash2, Eye, EyeOff, BookOpen, ListVideo, Save, ArrowUp, ArrowDown, PlusCircle, Palette, Compass, Menu, ArrowLeft, Image as ImageIcon, Music, Code, List, Mic, MessageCircle, Users, ClipboardList, Volume2, AlignLeft
} from 'lucide-react';
import type { HskCardData, LessonData } from './types';
import { supabase } from './supabase'; 

// Import Pattern Settings ทั้งหมด
import SettingOther1 from './settings/setting_other1';
import SettingOtherClassroom from './settings/setting_other_classroom';
import SettingOtherLesson1 from './settings/setting_other_lesson1';
import SettingOtherLesson1_1 from './settings/setting_other_lesson1-1';
import SettingOtherLesson1_3 from './settings/setting_other_lesson1-3';
import SettingOtherLesson5 from './settings/setting_other_lesson5';
import SettingOtherLesson5_5 from './settings/setting_other_lesson5-5';
import SettingOtherLesson5_6 from './settings/setting_other_lesson5-6';
import SettingOtherLesson5_7 from './settings/setting_other_lesson5-7';
import SettingOtherLesson5_8 from './settings/setting_other_lesson5-8';
import SettingOtherLesson5_9 from './settings/setting_other_lesson5-9'; 
import SettingOtherLesson5_10 from './settings/setting_other_lesson5-10';
import SettingOtherLesson5_11 from './settings/setting_other_lesson5-11';
import SettingOtherLesson5_12 from './settings/setting_other_lesson5-12';
import SettingOtherLesson5_13 from './settings/setting_other_lesson5-13';
import SettingOtherLesson5_14 from './settings/setting_other_lesson5-14';
import SettingOtherLesson5_15 from './settings/setting_other_lesson5-15';
import SettingOtherLesson5_16 from './settings/setting_other_lesson5-16';
import SettingOtherLesson5_17 from './settings/setting_other_lesson5-17';
import SettingOtherLesson5_18 from './settings/setting_other_lesson5-18';
import SettingOtherLesson5_19 from './settings/setting_other_lesson5-19';
import SettingOtherLesson5_20 from './settings/setting_other_lesson5-20';
import SettingOtherLesson5_21 from './settings/setting_other_lesson5-21';
import SettingOtherLesson5_22 from './settings/setting_other_lesson5-22';
import SettingOtherLesson5_23 from './settings/setting_other_lesson5-23';
import SettingOtherLesson5_24 from './settings/setting_other_lesson5-24';
import SettingOtherLesson5_25 from './settings/setting_other_lesson5-25';
import SettingOtherLesson6_1 from './settings/setting_other_lesson6-1';
import SettingOtherLesson6_2 from './settings/Setting_other_lesson6-2';
import SettingOtherLesson6_3 from './settings/setting_other_lesson6-3';
import SettingOtherLesson6_4 from './settings/setting_other_lesson6-4';
import SettingOtherLesson6_5 from './settings/setting_other_lesson6-5';
import SettingOtherLesson6_6 from './settings/setting_other_lesson6-6';
import SettingOtherLesson6_7 from './settings/setting_other_lesson6-7';
import SettingOtherLesson6_8 from './settings/setting_other_lesson6-8';
import SettingOtherLesson6_9 from './settings/setting_other_lesson6-9';
import SettingOtherLesson6_10 from './settings/setting_other_lesson6-10';
import SettingOtherLesson6_11 from './settings/setting_other_lesson6-11';
import SettingOtherLesson6_12 from './settings/setting_other_lesson6-12';
import SettingOtherLesson6_13 from './settings/setting_other_lesson6-13';
import SettingOtherLesson6_14 from './settings/setting_other_lesson6-14';
import SettingOtherLesson6_15 from './settings/setting_other_lesson6-15';
import SettingOtherLesson6_16 from './settings/setting_other_lesson6-16';
import SettingOtherLesson6_17 from './settings/setting_other_lesson6-17';
import SettingOtherLesson6_18 from './settings/setting_other_lesson6-18';

const PATTERN_LABELS: Record<string, string> = {
  'dynamic_json': '🧩 โหลดหน้าจอจาก JSON (Dynamic)',
  'other_pattern_1': 'Pattern: แบบเรียนทั่วไป 1',
  'other_classroom': 'Pattern: Classroom Chinese (ประโยคในห้องเรียน)',
  'other_lesson1': 'Pattern: Lesson Text (บทสนทนาและรูปภาพ)',
  'other_lesson1-1': 'Pattern: New Words (คำศัพท์ใหม่ 4 คอลัมน์)',
  'other_lesson1-3': 'Pattern: Phonetics (สัทอักษรและรูปภาพ)',
  'other_lesson5': 'Pattern: Character Intro (แนะนำตัวละคร 5 คอลัมน์)',
  'other_lesson5-5': 'Pattern: Flashcards (การ์ดพลิกฝึกฟัง 4 คอลัมน์)',
  'other_lesson5-6': 'Pattern: Match Game (ลากเส้นจับคู่)',
  'other_lesson5-7': 'Pattern: Listen & Sequence (ฟังแล้วเรียงลำดับ)',
  'other_lesson5-8': 'Pattern: Step Reveal (โชว์ข้อความทีละกล่อง)',
  'other_lesson5-9': 'Pattern: Image Match (โยงเส้นจับคู่รูปภาพ บน-ล่าง)',
  'other_lesson5-10': 'Pattern: Word Web (กิจกรรมคู่ ดูภาพฝึกพูด)',
  'other_lesson5-11': 'Pattern: Fill Pinyin (เติมพินอินในช่องว่าง)',
  'other_lesson5-12': 'Pattern: Word Ladder (ต่อคำขยายความไล่ระดับสี)',
  'other_lesson5-13': 'Pattern: Speed Game (เกมใครไวใครได้ เลือกภาพ)',
  'other_lesson5-14': 'Pattern: Story Reading (บทความฝึกอ่านมีรูปประกอบ)',
  'other_lesson5-15': 'Pattern: T/F Quiz (บทความฝึกอ่าน พิจารณาถูกผิด)',
  'other_lesson5-16': 'Pattern: Fill Blanks (เติมคำในช่องว่าง จิ้มเพื่อเติม)',
  'other_lesson5-17': 'Pattern: Char & Phrases (จำอักษรและวลีประกอบ การ์ดพลิกได้)',
  'other_lesson5-18': 'Pattern: Radicals Table (ตารางหมวดอักษร พลิกได้)',
  'other_lesson5-19': 'Pattern: Multiple Choice (วงกลมเลือกตัวอักษรจีน)',
  'other_lesson5-20': 'Pattern: Header & Image (โจทย์ข้อความและรูปภาพ)',
  'other_lesson5-21': 'Pattern: Fill Characters (เติมอักษรจีนในช่องว่าง 2 คอลัมน์)',
  'other_lesson5-22': 'Pattern: Trace & Flip (สมุดคัดลายมือ เขียนครบแล้วพลิก)',
  'other_lesson5-23': 'Pattern: Compare & Write (เปรียบเทียบประโยคซ้าย-ขวา)',
  'other_lesson5-24': 'Pattern: Match Image & Letter (ดูภาพและพิมพ์อักษรตอบ)',
  'other_lesson5-25': 'Pattern: Alternating Fill (เติมคำศัพท์ สลับรูปซ้ายขวา)',
  'other_lesson6-1': '6-1: 听一听 การ์ดคำศัพท์พลิกได้ (ฟังเสียง)',
  'other_lesson6-2': '6-2: เติมคำในช่องว่างจากตัวเลือก (ฟังเสียง)',
  'other_lesson6-3': '6-3: เรียงลำดับตัวเลข (ฟังเสียง)',
  'other_lesson6-4': '6-4: ฝึกพูด (ซ้าย-ขวา)',
  'other_lesson6-5': '6-5: กิจกรรมคู่ (ถามราคา)',
  'other_lesson6-6': '6-6: กิจกรรมหรรษา (เติมพินอิน)',
  'other_lesson6-7': '6-7: ต่อคำขยายความ (ขั้นบันได)',
  'other_lesson6-8': '6-8: เกมโยนยางลบ (การ์ด 3D)',
  'other_lesson6-9': '6-9: ฝึกอ่านบทความแล้วตอบคำถาม',
  'other_lesson6-10': '6-10: อ่านประโยคและเลือกภาพให้ตรงกัน',
  'other_lesson6-11': '6-11: ฝึกอ่านตัวอักษรและเรียนรู้หมวดอักษร',
  'other_lesson6-12': '6-12: เติมคำในช่องว่างและประกอบอักษรจีน',
  'other_lesson6-13': '6-13: ลำดับขีดและประโยคพร้อมแบบฝึกหัด',
  'other_lesson6-14': '6-14: รู้หรือไม่ (สกุลเงิน)',
  'other_lesson6-15': '6-15: ฝึกเขียนและพูดเปรียบเทียบ',
  'other_lesson6-16': '6-16: ทดสอบความจำ (จับคู่ภาพกับข้อความ)',
  'other_lesson6-17': '6-17: อ่านและเลือกรูปภาพ (2 การ์ดต่อแถว)',
  'other_lesson6-18': '6-18: วัดสมองประลองความรู้ (ประโยค Pinyin/จีน)',
  'other_lesson_money': 'Money: ชีทเรียนเรื่องเงิน (中国的钱)'
};

// 🎯 ฟังก์ชันสแกนหาจุดที่ต้องอัปโหลดรูปภาพ (Image เท่านั้น ส่วน Audio ให้กรอกเป็น URL ระดับหน้า)
const extractImageAssets = (obj: any, currentPath: (string|number)[] = [], labelCtx: string = 'เนื้อหา', assets: any[] = []) => {
  if (!obj || typeof obj !== 'object') return assets;
  let currentLabel = obj.hanzi || obj.title || obj.question || obj.questionHanzi || obj.topic || obj.sectionTitle || labelCtx;

  if (obj.image !== undefined && typeof obj.image === 'object' && !Array.isArray(obj.image) && obj.image !== null) {
      assets.push({ path: [...currentPath, 'image'], type: 'image', node: obj.image, label: currentLabel });
  }

  for (const key in obj) {
      if (key === 'image' || key === 'audio') continue;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractImageAssets(obj[key], [...currentPath, isNaN(Number(key)) ? key : Number(key)], currentLabel, assets);
      }
  }
  return assets;
};

// 🎯 ฟังก์ชันช่วยยัด URL กลับเข้าไปใน JSON
const updateJsonByPath = (obj: any, path: (string|number)[], field: string, value: any) => {
  let curr = obj;
  for (let i = 0; i < path.length; i++) { curr = curr[path[i]]; }
  curr[field] = value;
};

// 🎯 ฟังก์ชันอัปเดตค่า Text ใน JSON ผ่าน Form อัตโนมัติ
const setValueByPath = (obj: any, path: (string|number)[], value: any) => {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) { curr = curr[path[i]]; }
  curr[path[path.length - 1]] = value;
};

// =======================================================================
// 🧩 COMPONENT: Smart Form (สร้างช่องกรอกข้อความอัตโนมัติตาม Key ใน JSON)
// =======================================================================
const SmartForm = ({ data, onChange }: any) => {
  const editableKeys = ['hanzi', 'pinyin', 'thai', 'text', 'question', 'questionHanzi', 'questionPinyin', 'questionThai', 'answer', 'correctAnswer', 'explanation', 'explanationThai', 'title', 'titleChinese', 'titlePinyin', 'titleThai', 'sectionTitle', 'instructionThai', 'topic', 'time', 'timeSpan', 'actionHanzi', 'actionPinyin', 'actionThai', 'statementHanzi', 'statementPinyin', 'statementThai', 'wordHanzi', 'partialPinyin', 'correctPinyin', 'meaningThai', 'termHanzi', 'termPinyin', 'timeRange', 'contentThai', 'descriptionThai', 'radicalHanzi', 'radicalPinyin'];

  const renderNode = (node: any, path: (string|number)[]) => {
      if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
          const key = path[path.length - 1];
          if (editableKeys.includes(String(key))) {
              return (
                  <div key={path.join('.')} className="mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded w-max">{String(key)}</label>
                      <textarea
                          value={String(node)}
                          onChange={(e) => onChange(path, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded outline-none resize-none font-medium text-slate-700 p-2 focus:border-indigo-300"
                          rows={String(node).length > 40 ? 2 : 1}
                      />
                  </div>
              );
          }
          return null;
      }
      if (Array.isArray(node)) {
          return (
              <div key={path.join('.')} className="pl-3 ml-2 border-l-2 border-indigo-100 flex flex-col gap-2 my-2 w-full">
                  {node.map((child, idx) => renderNode(child, [...path, idx]))}
              </div>
          );
      }
      if (typeof node === 'object' && node !== null) {
          return (
              <div key={path.join('.')} className="flex flex-col gap-1 w-full">
                  {Object.keys(node).map(key => renderNode(node[key], [...path, key]))}
              </div>
          );
      }
      return null;
  };

  return <div className="flex flex-col w-full">{renderNode(data, [])}</div>;
};

// 🔊 Component ปุ่มลำโพง (TTS)
const TTSBtn = ({ text }: { text: string }) => {
   if (!text) return null;
   return (
     <button type="button" className="ml-1 inline-flex items-center justify-center p-1 bg-indigo-100 text-indigo-600 rounded-full" title="ฟังเสียงอ่าน">
       <Volume2 size={14} />
     </button>
   );
};

// =======================================================================
// 🧩 COMPONENT: Mini Preview (จำลองหน้าจอแสดงผลสดๆ)
// =======================================================================
const MiniPreview = ({ page }: { page: any }) => {
  if (!page) return null;
  const getImgUrl = (img: any) => img?.url || img?.imageUrl;
  const getAudUrl = (aud: any) => aud?.url || aud?.audioUrl;

  return (
    <div className="w-full bg-slate-100 min-h-[400px] rounded-3xl p-4 md:p-8 flex flex-col gap-6 relative pointer-events-none scale-100 origin-top">
       
       <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 relative">
          <div className="absolute top-4 right-6 text-xs font-bold text-slate-300">หน้า {page.pageNumber || page.sortOrder || '?'}</div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><BookOpen className="text-indigo-500 w-5 h-5"/> {page.title || 'ไม่มีชื่อหน้า'}</h2>
          {page.instructionThai && <p className="text-slate-500 mb-4 bg-slate-50 inline-block px-3 py-1.5 rounded-lg text-xs md:text-sm">📌 {page.instructionThai}</p>}
          
          {getImgUrl(page.image) && <img src={getImgUrl(page.image)} className="w-full max-w-sm mx-auto rounded-2xl shadow-sm mb-6 object-cover" alt="img" />}
          
          {/* 🎯 แสดง Audio Player 1 อันสำหรับหน้านี้ */}
          {getAudUrl(page.audio) && (
            <div className="bg-slate-200 w-full max-w-xs mx-auto rounded-xl p-3 mb-6 flex flex-col items-center gap-2 border border-slate-300">
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1"><Music size={14}/> ไฟล์เสียงประจำหน้า</span>
              <audio controls className="w-full h-8 scale-90"><source src={getAudUrl(page.audio)} type="audio/mpeg" /></audio>
            </div>
          )}

          {/* 🎯 Advanced Quiz Preview */}
          {page.type === 'advanced_quiz' && (
             <div className="bg-white border-2 border-indigo-100 p-6 rounded-2xl">
                {page.stimulus && (
                  <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                    <span className="font-bold text-indigo-800 block mb-2">{page.stimulus.title || 'ข้อมูลอ้างอิง'}</span>
                    {page.stimulus.type === 'dialogue' ? (
                       <>
                         <div className="text-lg md:text-xl font-serif text-slate-800 whitespace-pre-line leading-relaxed font-semibold">{page.stimulus.hanzi}</div>
                         {page.stimulus.pinyin && <div className="text-base md:text-lg text-indigo-600 whitespace-pre-line mt-2">{page.stimulus.pinyin}</div>}
                         {page.stimulus.thai && <div className="text-sm md:text-base text-slate-500 whitespace-pre-line mt-2">{page.stimulus.thai}</div>}
                       </>
                    ) : (
                       <>
                         <div className="text-xl font-serif text-slate-800 mb-2 leading-relaxed font-semibold">{page.stimulus.hanzi}</div>
                         {page.stimulus.pinyin && <div className="text-lg text-indigo-600 mb-1">{page.stimulus.pinyin}</div>}
                         {page.stimulus.thai && <div className="text-base text-slate-600">{page.stimulus.thai}</div>}
                       </>
                    )}
                  </div>
                )}
                <div className="text-xl font-bold font-serif text-slate-800 mb-6 text-center">{page.question || page.questionHanzi}</div>
                {page.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {page.options.map((opt:any, i:number) => (
                        <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${(page.answer||page.correctAnswer)?.includes(opt.id) ? 'bg-green-100 border-green-400 font-bold text-green-800' : 'bg-slate-50 border-slate-200'}`}>
                           {opt.id && <span className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm">{opt.id}</span>}
                           <span className="text-lg font-serif">{opt.text || opt.hanzi}</span>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          )}

          {/* 🎯 Sections (Lesson 8 Format) Preview */}
          {page.sections && page.sections.length > 0 && (
             <div className="flex flex-col gap-6 w-full">
                {page.sections.map((sec: any, sIdx: number) => (
                   <div key={sIdx} className="w-full">
                      {sec.type === 'heading' && (
                         <div className="text-center bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100">
                            <h3 className="text-xl font-bold text-slate-800">{sec.titleChinese}</h3>
                            <p className="text-indigo-600 font-semibold">{sec.titlePinyin}</p>
                            <p className="text-slate-600 text-xs mt-1">{sec.titleThai}</p>
                         </div>
                      )}
                      {sec.type === 'vocabulary_cards' && (
                         <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><List size={16} className="text-indigo-500"/> {sec.sectionTitle}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                               {sec.items?.map((item: any) => (
                                  <div key={item.id} className="bg-slate-50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center">
                                     {getImgUrl(item.image) && <img src={getImgUrl(item.image)} className="w-16 h-16 object-cover rounded-xl mb-2" />}
                                     <span className="text-2xl font-serif text-slate-800 font-semibold">{item.hanzi}</span>
                                     <span className="text-xs text-indigo-500 font-semibold">{item.pinyin}</span>
                                     <span className="text-[10px] text-slate-600">{item.thai}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                      {sec.type === 'dialogue_section' && (
                         <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-blue-500"/> {sec.sectionTitle}</h3>
                            <div className="space-y-4">
                               {sec.dialogues?.map((d: any) => (
                                  <div key={d.dialogueNumber} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                     <h4 className="font-bold text-blue-800 text-xs mb-3 bg-blue-100 inline-block px-2 py-1 rounded">บทสนทนา {d.dialogueNumber}: {d.topic}</h4>
                                     <div className="flex flex-col gap-2">
                                       {d.lines?.map((chat: any, dIdx: number) => (
                                         <div key={dIdx} className={`flex w-full gap-2 ${chat.speaker === 'A' ? 'justify-start' : 'justify-end'}`}>
                                           {chat.speaker === 'A' && <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">{chat.speaker}</div>}
                                           <div className={`p-2 rounded-lg border max-w-[85%] bg-white`}>
                                             <div className="text-sm font-serif text-slate-800 font-semibold">{chat.hanzi}</div>
                                             <div className="text-[10px] text-slate-500">{chat.thai}</div>
                                           </div>
                                           {chat.speaker !== 'A' && <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">{chat.speaker}</div>}
                                         </div>
                                       ))}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                      {/* อ่านกำหนดการ */}
                      {sec.type === 'reading_schedule_exercise' && (
                        <div>
                           <h3 className="text-sm font-bold text-slate-700 mb-2">{sec.sectionTitle}</h3>
                           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                              <h4 className="font-bold text-emerald-800 text-center mb-3 text-sm">{sec.scheduleTitle}</h4>
                              <div className="bg-white rounded-lg overflow-hidden border border-emerald-200">
                                 <table className="w-full text-xs text-left">
                                    <thead className="bg-emerald-100 text-emerald-800"><tr><th className="p-2">เวลา</th><th className="p-2">กิจกรรม</th></tr></thead>
                                    <tbody>
                                       {sec.scheduleItems?.map((item:any, i:number) => (
                                          <tr key={i} className="border-b border-slate-100"><td className="p-2 font-bold text-slate-600">{item.time}</td><td className="p-2"><div className="font-bold font-serif text-slate-800 text-sm">{item.hanzi}</div><div className="text-[10px] text-slate-500">{item.thai}</div></td></tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                      )}
                      {/* ทดสอบท้ายบท */}
                      {sec.type === 'end_of_lesson_quiz' && (
                        <div>
                           <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-1"><ClipboardList size={16}/> {sec.sectionTitle}</h3>
                           <div className="space-y-3">
                              {sec.questions?.map((q:any, qIdx:number) => (
                                 <div key={q.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                    <div className="font-bold text-slate-800 text-sm mb-2">{q.itemNumber || qIdx+1}. {q.questionHanzi || q.question}</div>
                                    {q.options && (
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                          {q.options.map((o:any) => <div key={o.id} className={`px-3 py-1.5 rounded-lg border text-xs ${q.correctAnswer === o.id ? 'bg-green-100 border-green-400 font-bold' : 'bg-white'}`}>{o.id}. {o.hanzi || o.text}</div>)}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};


// =======================================================================
// 🧩 COMPONENT: ระบบแก้ไข JSON แยกหน้า (Page-Level Editor หลัก)
// =======================================================================
const DynamicJsonSectionEditor = ({ sec, lesson, selectedCard, updateSectionState }: any) => {
  const [viewMode, setViewMode] = useState<'raw'|number>('raw');
  const [pageText, setPageText] = useState('');
  const [livePageObj, setLivePageObj] = useState<any>(null);
  const [jsonError, setJsonError] = useState('');

  // วิเคราะห์โครงสร้าง JSON ปัจจุบัน
  let parsed = null;
  let items: any[] = [];
  let rootKey = '';
  let isQuiz = false;
  let isParsable = false;

  try {
      if (sec.jsonData) {
         parsed = JSON.parse(sec.jsonData);
         if (parsed?.preTest?.questions) { items = parsed.preTest.questions; isQuiz = true; rootKey = 'preTest'; isParsable = true; }
         else if (parsed?.postTest?.questions) { items = parsed.postTest.questions; isQuiz = true; rootKey = 'postTest'; isParsable = true; }
         else if (parsed?.quiz?.questions) { items = parsed.quiz.questions; isQuiz = true; rootKey = 'quiz'; isParsable = true; }
         else if (parsed?.lesson?.pages) { items = parsed.lesson.pages; rootKey = 'lesson'; isParsable = true; }
         else if (parsed?.pages) { items = parsed.pages; rootKey = ''; isParsable = true; }
      }
  } catch(e) {}

  // หากเปิดมาครั้งแรก ให้เข้าโหมดหน้า 1 ทันทีถ้าทำได้
  useEffect(() => {
     if (isParsable && items.length > 0 && viewMode === 'raw' && !jsonError) {
        openPage(0);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParsable]);

  // Sync Live Preview ทุกครั้งที่ pageText ถูกแก้
  useEffect(() => {
      try {
          if (pageText.trim()) {
              const obj = JSON.parse(pageText);
              setLivePageObj(obj);
              setJsonError('');
          }
      } catch(e) {
          // ถ้า JSON ผิดพลาด ยังคงเก็บ Preview ตัวเก่าไว้ ไม่ให้จอขาว
      }
  }, [pageText]);

  const openPage = (idx: number) => {
      if (!items[idx]) return;
      setViewMode(idx);
      setPageText(JSON.stringify(items[idx], null, 2));
      setLivePageObj(items[idx]);
      setJsonError('');
  };

  const savePage = () => {
      try {
          const newObj = JSON.parse(pageText);
          const newParsed = JSON.parse(sec.jsonData);
          if(rootKey && isQuiz) newParsed[rootKey].questions[viewMode as number] = newObj;
          else if (rootKey === 'lesson') newParsed.lesson.pages[viewMode as number] = newObj;
          else if (rootKey === '') newParsed.pages[viewMode as number] = newObj;

          updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
          setJsonError('');
          alert('✅ บันทึกเนื้อหาหน้านี้สำเร็จ');
      } catch(e:any) {
          setJsonError('❌ โครงสร้าง JSON ไม่ถูกต้อง: ' + e.message);
      }
  };

  // ฟังก์ชันยิงเมื่อฟอร์มอัตโนมัติ (Smart Form) มีการพิมพ์แก้ไข
  const handleFieldChange = (path: (string|number)[], newValue: string) => {
      try {
          const newObj = JSON.parse(pageText);
          setValueByPath(newObj, path, newValue);
          setPageText(JSON.stringify(newObj, null, 2)); // จะ trigger useEffect -> Live Preview ทันที
      } catch(e) {}
  };

  const addNewPage = () => {
      try {
          const newParsed = JSON.parse(sec.jsonData);
          const newPage = isQuiz 
            ? { id: `q_${Date.now()}`, type: "single_choice", question: "คำถามข้อใหม่", options: [] } 
            : { id: `p_${Date.now()}`, type: "content", title: "หน้าใหม่", sections: [] };
          
          if(rootKey && isQuiz) newParsed[rootKey].questions.push(newPage);
          else if (rootKey === 'lesson') newParsed.lesson.pages.push(newPage);
          else if (rootKey === '') newParsed.pages.push(newPage);

          updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
          alert('✅ เพิ่มหน้าใหม่สำเร็จแล้ว (ต่อท้ายสุด)');
      } catch(e) {
          alert('❌ ไม่สามารถเพิ่มหน้าได้ เนื่องจากโครงสร้างหลักมีปัญหา กรุณาแก้ไขแบบรวม (Raw) ก่อน');
      }
  };

  const deleteCurrentPage = () => {
      if (typeof viewMode !== 'number') return;
      if (!window.confirm(`ยืนยันการลบ ${isQuiz ? 'ข้อ' : 'หน้า'} ที่ ${viewMode + 1} ออกใช่หรือไม่?`)) return;
      try {
          const newParsed = JSON.parse(sec.jsonData);
          if(rootKey && isQuiz) newParsed[rootKey].questions.splice(viewMode, 1);
          else if (rootKey === 'lesson') newParsed.lesson.pages.splice(viewMode, 1);
          else if (rootKey === '') newParsed.pages.splice(viewMode, 1);

          updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
          setViewMode('raw'); 
      } catch(e) {}
  };

  // 🎯 ดึงเฉพาะช่องใส่ Image ออกมาให้ Supabase
  const activeImageAssets = viewMode === 'raw' ? extractImageAssets(parsed) : extractImageAssets(livePageObj);

  return (
    <div className="mt-4 p-5 bg-slate-100 border border-slate-200 rounded-2xl shadow-inner flex flex-col gap-6">
       
       {/* 🎯 แถบควบคุมด้านบน */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
         <label className="text-xl font-black text-indigo-800 flex items-center gap-2">
           <Code className="text-indigo-500"/> ระบบแก้ไขโครงสร้างอัจฉริยะ (JSON Builder)
         </label>
         <button onClick={() => {
             const defaultJson = JSON.stringify({ lesson: { pages: [ { type: 'intro', title: 'บทนำ', image: { url: null, alt: 'รูปภาพประกอบ' }, audio: { url: null }, sections: [] } ] } }, null, 2);
             updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: defaultJson}));
           }} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95">
           + วางโครงร่างตั้งต้น (ล้างค่าเดิม)
         </button>
       </div>

       {/* 🎯 แถบเมนูเลือกหน้า (Page Navigation Tabs) */}
       {isParsable && items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
             <button onClick={() => { setViewMode('raw'); setJsonError(''); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'raw' ? 'bg-slate-800 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
                โครงสร้างรวม (Raw)
             </button>
             <div className="w-px h-6 bg-slate-300 mx-1"></div>
             {items.map((it:any, idx:number) => (
                <button key={idx} onClick={() => openPage(idx)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === idx ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-indigo-50'}`}>
                   {isQuiz ? `ข้อ ${idx + 1}` : `หน้า ${idx + 1}`}
                </button>
             ))}
             <button onClick={addNewPage} className="ml-auto px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-bold transition-all flex items-center gap-1 shadow-sm">
                <PlusCircle size={16} /> เพิ่ม
             </button>
          </div>
       )}

       {/* 🎯 พื้นที่แสดงผลหลัก (แบ่งครึ่งซ้าย-ขวา ถ้าอยู่ในโหมดหน้า) */}
       {viewMode === 'raw' ? (
          <div>
            <textarea
              value={sec.jsonData || ''}
              onChange={(e) => updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: e.target.value}))}
              className="w-full h-[600px] p-5 rounded-xl border-4 border-slate-300 focus:border-indigo-500 font-mono text-sm leading-relaxed outline-none whitespace-pre overflow-wrap-normal shadow-inner"
              style={{ color: '#a5d6ff', backgroundColor: '#0d1117' }} 
              spellCheck="false"
            />
          </div>
       ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
             
             {/* ซ้าย: Live Preview */}
             <div className="bg-slate-800 p-2 md:p-6 rounded-3xl shadow-2xl flex flex-col items-center max-h-[800px] overflow-y-auto border-4 border-slate-900 relative">
                <div className="absolute top-4 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-md flex items-center gap-1"><Eye size={14}/> LIVE PREVIEW</div>
                <div className="w-full mt-10">
                   <MiniPreview page={livePageObj} />
                </div>
             </div>

             {/* ขวา: Tools & Editors */}
             <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2">
                
                {/* 1. Smart Form: แก้ไขข้อความ (Quick Edit) */}
                <div className="bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 border-b border-indigo-200 pb-3"><Edit3 size={20}/> ฟอร์มแก้ไขข้อความ (อัปเดตสด)</h4>
                   <SmartForm data={livePageObj} onChange={handleFieldChange} />
                </div>

                {/* 2. Audio URL Input (Dropbox 1 ไฟล์ต่อหน้า) */}
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Music size={20} className="text-amber-500" /> ลิงก์ไฟล์เสียงประจำหน้า (Dropbox / URL)
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">แนบลิงก์ไฟล์เสียงสำหรับหน้านี้ 1 ไฟล์ (ถ้ามี) แนะนำให้ใช้ Dropbox เปลี่ยน dl=0 เป็น dl=1 หรือ raw=1</p>
                  <input 
                     type="text"
                     placeholder="https://..."
                     value={livePageObj?.audio?.url || livePageObj?.audio?.audioUrl || ''}
                     onChange={(e) => {
                        const val = e.target.value;
                        const newPageObj = JSON.parse(pageText);
                        if (!newPageObj.audio) newPageObj.audio = {};
                        newPageObj.audio.url = val;
                        
                        setPageText(JSON.stringify(newPageObj, null, 2));
                        
                        const newParsed = JSON.parse(sec.jsonData);
                        if(rootKey && isQuiz) newParsed[rootKey].questions[viewMode as number] = newPageObj;
                        else if (rootKey === 'lesson') newParsed.lesson.pages[viewMode as number] = newPageObj;
                        else if (rootKey === '') newParsed.pages[viewMode as number] = newPageObj;
                        updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
                     }}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400"
                  />
                  {(livePageObj?.audio?.url || livePageObj?.audio?.audioUrl) && (
                     <div className="mt-3 bg-slate-100 p-2 rounded-lg">
                        <audio controls className="w-full h-8"><source src={livePageObj?.audio?.url || livePageObj?.audio?.audioUrl} type="audio/mpeg" /></audio>
                     </div>
                  )}
                </div>

                {/* 3. Image Manager */}
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ImageIcon size={20} className="text-indigo-500" /> จัดการไฟล์รูปภาพ (Supabase)
                  </h4>
                  {activeImageAssets.length === 0 ? (
                      <p className="text-sm text-slate-400">ไม่พบจุดที่ต้องใส่รูปภาพในหน้านี้</p>
                  ) : (
                      <div className="flex flex-col gap-3">
                        {activeImageAssets.map((asset, aIdx) => {
                          const currentUrl = asset.node.imageUrl || asset.node.url;

                          return (
                            <div key={aIdx} className="flex flex-col lg:flex-row lg:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-100 text-indigo-600">
                                  <ImageIcon size={20} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800 line-clamp-1">{asset.label}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                                <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                                  {currentUrl ? (
                                      <img src={currentUrl} alt="preview" className="w-full h-full object-cover" />
                                  ) : (
                                      <span className="text-[8px] text-slate-400 font-bold text-center leading-tight">ไม่มี<br/>ไฟล์</span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                  <input 
                                    type="file" accept="image/*" id={`upload-${sec.id}-${viewMode}-${aIdx}`} className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if(!file) return;
                                      try {
                                        const bucketName = 'quiz-images'; 
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `media_${Date.now()}_${aIdx}.${fileExt}`;
                                        
                                        const { error } = await supabase.storage.from(bucketName).upload(`lessons/images/${fileName}`, file);
                                        if (error) { alert("อัปโหลดไม่สำเร็จ: " + error.message); return; }
                                        
                                        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(`lessons/images/${fileName}`);
                                        const fileUrl = publicUrlData.publicUrl;
                                        
                                        const newPageObj = JSON.parse(pageText);
                                        updateJsonByPath(newPageObj, asset.path, 'url', fileUrl);
                                        setPageText(JSON.stringify(newPageObj, null, 2)); 
                                        
                                        const newParsed = JSON.parse(sec.jsonData);
                                        if(rootKey && isQuiz) newParsed[rootKey].questions[viewMode as number] = newPageObj;
                                        else if (rootKey === 'lesson') newParsed.lesson.pages[viewMode as number] = newPageObj;
                                        else if (rootKey === '') newParsed.pages[viewMode as number] = newPageObj;
                                        updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
                                        
                                      } catch (err: any) { alert("เกิดข้อผิดพลาด: " + err.message); }
                                    }}
                                  />
                                  <button onClick={() => document.getElementById(`upload-${sec.id}-${viewMode}-${aIdx}`)?.click()} className="px-2 py-1 text-white rounded text-xs font-bold shadow-sm w-full bg-indigo-600 hover:bg-indigo-700">
                                    อัปโหลด
                                  </button>
                                  {currentUrl && (
                                    <button onClick={() => {
                                        if(window.confirm('ต้องการลบไฟล์นี้จากโค้ดหรือไม่?')) {
                                          const newPageObj = JSON.parse(pageText);
                                          if (asset.node.hasOwnProperty('imageUrl')) updateJsonByPath(newPageObj, asset.path, 'imageUrl', null);
                                          updateJsonByPath(newPageObj, asset.path, 'url', null);
                                          
                                          setPageText(JSON.stringify(newPageObj, null, 2));
                                          
                                          const newParsed = JSON.parse(sec.jsonData);
                                          if(rootKey && isQuiz) newParsed[rootKey].questions[viewMode as number] = newPageObj;
                                          else if (rootKey === 'lesson') newParsed.lesson.pages[viewMode as number] = newPageObj;
                                          else if (rootKey === '') newParsed.pages[viewMode as number] = newPageObj;
                                          updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: JSON.stringify(newParsed, null, 2)}));
                                        }
                                      }} className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-bold w-full">
                                      ลบออก
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  )}
                </div>

                {/* 4. Raw JSON & Actions */}
                <div className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800">
                   <details className="group mb-4">
                      <summary className="font-bold text-emerald-400 cursor-pointer outline-none flex items-center gap-2"><Code size={18}/> เปิดแก้โค้ด JSON ขั้นสูง (Raw)</summary>
                      <textarea
                          value={pageText}
                          onChange={(e) => setPageText(e.target.value)}
                          className="w-full h-[400px] mt-4 p-4 rounded-xl border-2 border-emerald-900 focus:border-emerald-500 font-mono text-xs leading-relaxed outline-none whitespace-pre overflow-wrap-normal"
                          style={{ color: '#a5d6ff', backgroundColor: '#0d1117' }} 
                          spellCheck="false"
                      />
                   </details>

                   {jsonError && <p className="mb-4 text-xs text-red-400 font-bold bg-red-900/30 p-3 rounded-lg border border-red-800">{jsonError}</p>}
                   
                   <div className="flex gap-4">
                      <button onClick={savePage} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2">
                         <Save size={18}/> บันทึกหน้านี้
                      </button>
                      <button onClick={deleteCurrentPage} className="px-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-3 rounded-xl transition-colors border border-red-500/30">
                         <Trash2 size={20} />
                      </button>
                   </div>
                </div>

             </div>
          </div>
       )}
    </div>
  );
};


interface Settings2Props {
  hskCards: HskCardData[];
  setHskCards: React.Dispatch<React.SetStateAction<HskCardData[]>>;
  menuNames: { home: string; other_home: string; settings: string; settings_other: string; };
  setMenuNames: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
}

export default function Settings2({
  hskCards, setHskCards, menuNames, setMenuNames, onSave,
}: Settings2Props) {
  const [activeSettingTab, setActiveSettingTab] = useState('cover');
  const otherCourses = hskCards.filter((c) => !c.id.startsWith('hsk'));
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (otherCourses.length > 0 && !selectedCourseId) { setSelectedCourseId(otherCourses[0].id); }
  }, [otherCourses, selectedCourseId]);

  useEffect(() => { setEditingSectionId(null); }, [selectedCourseId]);

  const selectedCard = hskCards.find((c) => c.id === selectedCourseId);

  const extractHex = (twClass: string, defaultHex: string) => {
    return twClass.match(/#([0-9A-Fa-f]{6})/i)?.[0] || defaultHex;
  };

  const handleUpdateCard = (id: string, field: keyof HskCardData, value: any) => {
    setHskCards((prev) => prev.map((card) => card.id === id ? { ...card, [field]: value } : card ));
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน้าปกเมนูนี้? บทเรียนด้านในจะหายไปด้วย')) {
      setHskCards((prev) => prev.filter((card) => card.id !== id));
      if (selectedCourseId === id) {
        const remaining = otherCourses.filter((c) => c.id !== id);
        setSelectedCourseId(remaining.length > 0 ? remaining[0].id : '');
      }
    }
  };

  const handleAddCard = () => {
    const newId = `other_${Date.now()}`;
    const newCard: HskCardData = {
      id: newId, topTextZh: 'หมวดหมู่ใหม่', topTextEn1: 'NEW', topTextEn2: 'COURSE',
      mainText: 'OTHER', level: '1', title: `คำอธิบายคอร์สใหม่`,
      from: `from-[#10b981]/70`, to: `to-[#34d399]/70`, shadow: `hover:shadow-[#10b981]/50`,
      Icon: Compass, isEnabled: true, lessons: [],
    };
    setHskCards([...hskCards, newCard]);
    setSelectedCourseId(newId);
    setActiveSettingTab('lessons');
  };

  const handleUpdateLesson = (courseId: string, lessonId: string, field: keyof LessonData, value: any) => {
    setHskCards((prev) => prev.map((card) => card.id === courseId ? {
      ...card, lessons: (card.lessons || []).map((lesson) => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson)
    } : card ));
  };

  const handleAddSection = (courseId: string, lessonId: string, patternType: string) => {
    setHskCards((prev) => prev.map((card) => card.id === courseId ? {
      ...card, lessons: (card.lessons || []).map((lesson) => lesson.id === lessonId ? {
        ...lesson, sections: [ ...lesson.sections, { id: `other_sec_${Date.now()}`, patternType: patternType, sectionNumber: String(lesson.sections.length + 1).padStart(2, '0'), titleZh: '', titleEn: '', content: '' } ],
      } : lesson)
    } : card ));
  };

  const updateSectionState = (courseId: string, lessonId: string, sectionId: string, updater: (sec: any) => any) => {
    setHskCards((prev) => prev.map((card) => card.id === courseId ? {
      ...card, lessons: (card.lessons || []).map((lesson) => lesson.id === lessonId ? {
        ...lesson, sections: lesson.sections.map((sec) => sec.id === sectionId ? updater(sec) : sec)
      } : lesson)
    } : card ));
  };

  const moveSection = (courseId: string, lessonId: string, sectionIndex: number, direction: 'up' | 'down') => {
    setHskCards(hskCards.map(c => {
      if (c.id !== courseId) return c;
      return { ...c, lessons: c.lessons.map((l: any) => {
          if (l.id !== lessonId) return l;
          const newSections = [...l.sections];
          if (direction === 'up' && sectionIndex > 0) {
            const temp = newSections[sectionIndex - 1];
            newSections[sectionIndex - 1] = newSections[sectionIndex];
            newSections[sectionIndex] = temp;
          } else if (direction === 'down' && sectionIndex < newSections.length - 1) {
            const temp = newSections[sectionIndex + 1];
            newSections[sectionIndex + 1] = newSections[sectionIndex];
            newSections[sectionIndex] = temp;
          }
          return { ...l, sections: newSections };
        })
      };
    }));
  };

  const handleDeleteSection = (courseId: string, lessonId: string, sectionId: string) => {
    if (window.confirm('คุณต้องการลบเนื้อหาส่วนนี้ใช่หรือไม่?')) {
      setHskCards((prev) => prev.map((card) => card.id === courseId ? {
        ...card, lessons: (card.lessons || []).map((lesson) => lesson.id === lessonId ? {
          ...lesson, sections: lesson.sections.filter((sec) => sec.id !== sectionId)
        } : lesson)
      } : card ));
    }
  };

  return (
    <div className="w-full px-4 md:px-8 pb-20 font-sans mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-emerald-800">ตั้งค่าแบบเรียนทั่วไป</h2>
          <p className="text-emerald-600/70 mt-2">จัดการเนื้อหา หน้าปก และชื่อเมนู สำหรับคอร์สอื่นๆ</p>
        </div>
        <button onClick={onSave} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
          <Save className="w-5 h-5" /> บันทึกข้อมูล
        </button>
      </header>

      <div className="flex gap-4 mb-8 border-b border-emerald-200/50 pb-4 overflow-x-auto">
        <button onClick={() => setActiveSettingTab('cover')} className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${ activeSettingTab === 'cover' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50' }`}><div className="flex items-center"><Edit3 className="w-4 h-4 mr-2" /> ปรับแต่งหน้าปก</div></button>
        <button onClick={() => { setActiveSettingTab('lessons'); if (!selectedCourseId && otherCourses.length > 0) { setSelectedCourseId(otherCourses[0].id); } }} className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${ activeSettingTab === 'lessons' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50' }`}><div className="flex items-center"><ListVideo className="w-4 h-4 mr-2" /> ตั้งค่าเนื้อหาบทเรียน</div></button>
        <button onClick={() => setActiveSettingTab('menus')} className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${ activeSettingTab === 'menus' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50' }`}><div className="flex items-center"><Menu className="w-4 h-4 mr-2" /> ตั้งค่าชื่อเมนู</div></button>
      </div>

      {activeSettingTab === 'menus' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-emerald-100 p-8 font-sans animate-fade-in">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">ตั้งค่าชื่อแถบเมนูด้านข้าง (Sidebar)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div><label className="block text-sm font-bold text-slate-600 mb-2">ชื่อเมนูหน้าหลัก HSK</label><input type="text" value={menuNames.home} onChange={(e) => setMenuNames({ ...menuNames, home: e.target.value }) } className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">ชื่อเมนูหน้าหลัก คอร์สอื่นๆ</label><input type="text" value={menuNames.other_home} onChange={(e) => setMenuNames({ ...menuNames, other_home: e.target.value }) } className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">ชื่อเมนูตั้งค่า HSK</label><input type="text" value={menuNames.settings} onChange={(e) => setMenuNames({ ...menuNames, settings: e.target.value }) } className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">ชื่อเมนูตั้งค่า คอร์สอื่นๆ</label><input type="text" value={menuNames.settings_other} onChange={(e) => setMenuNames({ ...menuNames, settings_other: e.target.value, }) } className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans" /></div>
          </div>
          <div className="mt-8 bg-amber-50 text-amber-700 p-4 rounded-lg text-sm flex items-center gap-2 w-full">💡 กดปุ่ม <b>"บันทึกข้อมูล"</b> ด้านขวาล่างเพื่อบันทึกชื่อเมนูลงระบบ</div>
        </div>
      )}

      {activeSettingTab === 'cover' && (
        <div className="space-y-6 w-full animate-fade-in">
          {otherCourses.map((card) => (
            <div key={card.id} className={`bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border ${ card.isEnabled ? 'border-white/80' : 'border-red-200 bg-red-50/30' } p-6 flex flex-col md:flex-row gap-6 w-full`}>
              <div className={`w-32 h-40 rounded-lg flex flex-col items-center justify-between py-4 text-white shadow-md bg-gradient-to-br ${card.from} ${card.to} shrink-0`}>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold">{card.topTextZh}</span>
                  <span className="text-[0.4rem] tracking-widest leading-tight">{card.topTextEn1}</span>
                </div>
                <span className="text-2xl font-black">{card.mainText}</span>
                <span className="text-4xl font-black">{card.level}</span>
              </div>
              <div className="flex-1 flex flex-col font-sans w-full">
                <div className="flex justify-between items-center mb-4 font-sans">
                  <h3 className="text-lg font-bold text-slate-700 font-sans">หน้าปก: {card.mainText} {card.level}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateCard(card.id, 'isEnabled', !card.isEnabled) } className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${ card.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600' }`}>
                      {card.isEnabled ? <><Eye size={16} /> แสดงบนเว็บ</> : <><EyeOff size={16} /> ซ่อนจากเว็บ</>}
                    </button>
                    <button onClick={() => handleDeleteCard(card.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/50 p-4 rounded-xl border border-slate-100 mb-4 w-full">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-500 uppercase mb-1"><Palette className="w-3 h-3 mr-1" /> สีหลัก</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={extractHex(card.from, '#10b981')} onChange={(e) => { const hex = e.target.value; handleUpdateCard( card.id, 'from', `from-[${hex}]/70` ); handleUpdateCard( card.id, 'shadow', `hover:shadow-[${hex}]/50` ); }} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      <input type="text" value={extractHex(card.from, '#10b981')} readOnly className="w-full lg:w-20 px-2 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-500 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">สีรอง</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={extractHex(card.to, '#34d399')} onChange={(e) => handleUpdateCard( card.id, 'to', `to-[${e.target.value}]/70` ) } className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      <input type="text" value={extractHex(card.to, '#34d399')} readOnly className="w-full lg:w-20 px-2 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-500 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">คำอธิบายคอร์ส</label>
                    <input type="text" value={card.title} onChange={(e) => handleUpdateCard(card.id, 'title', e.target.value) } className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-sans" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ข้อความบนสุด 1</label><input type="text" value={card.topTextZh} onChange={(e) => handleUpdateCard(card.id, 'topTextZh', e.target.value) } className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ข้อความบนสุด 2</label><input type="text" value={card.topTextEn1} onChange={(e) => handleUpdateCard(card.id, 'topTextEn1', e.target.value) } className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ชื่อหลัก (ตัวใหญ่)</label><input type="text" value={card.mainText} onChange={(e) => handleUpdateCard(card.id, 'mainText', e.target.value) } className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ข้อความรอง (ตัวใหญ่รอง)</label><input type="text" value={card.level} onChange={(e) => handleUpdateCard(card.id, 'level', e.target.value) } className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm" /></div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleAddCard} className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-semibold hover:bg-emerald-50 flex items-center justify-center gap-2 transition-all">+ เพิ่มหน้าปกคอร์สทั่วไปใหม่</button>
        </div>
      )}

      {activeSettingTab === 'lessons' && (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
          
          <div className="w-full bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="font-bold text-emerald-800 flex items-center gap-2 whitespace-nowrap"><BookOpen size={20} /> เลือกคอร์สเพื่อจัดการเนื้อหา:</label>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="flex-1 bg-white border-2 border-emerald-100 rounded-xl px-4 py-3 font-bold text-emerald-700 focus:border-emerald-500 focus:ring-0 outline-none shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors">
              {otherCourses.length === 0 && <option value="">-- ยังไม่มีคอร์สเรียน --</option>}
              {otherCourses.map((card) => <option key={card.id} value={card.id}>{card.title} ({card.mainText} {card.level})</option> )}
            </select>
          </div>

          <div className="w-full bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-emerald-100 p-6 min-h-[500px]">
            {selectedCard ? (
              
              editingSectionId === null ? (
                <div className="space-y-8 animate-fade-in w-full">
                  <h3 className="text-2xl font-bold text-slate-800 border-b border-emerald-100 pb-4">จัดการเนื้อหาคอร์ส: <span className="text-emerald-600">{selectedCard.title}</span></h3>

                  {selectedCard.lessons.length === 0 ? (
                    <button onClick={() => setHskCards((prev) => prev.map((c) => { if (c.id === selectedCard.id) { return { ...c, lessons: [{ id: `other_l_${Date.now()}`, lessonNumber: 1, titleCn: '', titleEn: '', sections: [], isEnabled: true, }], }; } return c; }) ) } className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all">
                      + เริ่มต้นสร้างเนื้อหา (เพิ่มบทเรียนแรก)
                    </button>
                  ) : (
                    selectedCard.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="w-full bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-sm mb-8">
                        
                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 border-b border-slate-100 pb-6 w-full">
                          <div className="flex-1 w-full">
                             <label className="block text-sm font-bold text-slate-500 mb-2">กลุ่มเนื้อหา (จัดกลุ่มสารบัญให้ดูง่าย):</label>
                             <input type="text" value={lesson.titleCn} placeholder="ตัวอย่าง: หมวดบทสนทนา / บทที่ 1 แนะนำตัว" onChange={(e) => handleUpdateLesson(selectedCard.id, lesson.id, 'titleCn', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                        </div>

                        <div className="space-y-3 w-full">
                          {lesson.sections.map((sec, sIdx) => {
                            const title1 = sec.mainTitle || sec.mainTitle1 || sec.titleZh || sec.titleZh1;
                            const title2 = sec.mainTitle2 || sec.titleZh2;
                            const displayTitle = [title1, title2].filter(Boolean).join(' | ') || `เนื้อหาส่วนที่ ${sIdx + 1}`;
                            const sub1 = sec.subTitle || sec.subTitle1 || sec.titleEn || sec.titleEn1;
                            const sub2 = sec.subTitle2 || sec.titleEn2;
                            const displaySub = [sub1, sub2].filter(Boolean).join(' | ');

                            return (
                              <div key={sec.id} className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 hover:border-emerald-300 transition-all group">
                                 <div className="flex gap-4 flex-1 w-full items-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-sm shrink-0 mt-1">{sIdx + 1}</div>
                                    <div className="flex flex-col w-full justify-center">
                                       <span className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">{displayTitle}</span>
                                       {displaySub && <span className="text-sm text-slate-600 line-clamp-1 mt-0.5">{displaySub}</span>}
                                       <span className="text-xs font-bold text-emerald-600 mt-1.5">{PATTERN_LABELS[sec.patternType] || sec.patternType}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-row xl:flex-col items-center justify-end gap-2 shrink-0 border-t xl:border-t-0 xl:border-l border-emerald-100 pt-4 xl:pt-0 xl:pl-4 mt-2 xl:mt-0">
                                    <div className="flex gap-2 w-full justify-end">
                                        <button onClick={() => moveSection(selectedCard.id, lesson.id, sIdx, 'up')} disabled={sIdx === 0} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors" title="ย้ายขึ้น"><ArrowUp size={18} /></button>
                                        <button onClick={() => moveSection(selectedCard.id, lesson.id, sIdx, 'down')} disabled={sIdx === lesson.sections.length - 1} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors" title="ย้ายลง"><ArrowDown size={18} /></button>
                                        <button onClick={() => handleDeleteSection(selectedCard.id, lesson.id, sec.id)} className="p-2.5 bg-red-50 border border-red-100 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors ml-1" title="ลบหัวข้อนี้"><Trash2 size={18} /></button>
                                    </div>
                                    <button onClick={() => setEditingSectionId(sec.id)} className="w-full xl:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 whitespace-nowrap"><Edit3 size={18} /> แก้ไขเนื้อหา</button>
                                 </div>
                              </div>
                            );
                          })}
                          
                          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full border-t border-emerald-100 pt-6">
                            <select id={`select_new_pattern_${lesson.id}`} defaultValue="other_pattern_1" className="flex-1 bg-white border-2 border-emerald-200 rounded-xl px-4 py-3 font-bold text-emerald-700 outline-none focus:border-emerald-500">
                              <option value="dynamic_json">🧩 โหลดหน้าจอจาก JSON (Dynamic)</option>
                              <option value="other_pattern_1">Pattern: แบบเรียนทั่วไป 1</option>
                              <option value="other_classroom">Pattern: Classroom Chinese (ประโยคในห้องเรียน)</option>
                              <option value="other_lesson1">Pattern: Lesson Text (บทสนทนาและรูปภาพ)</option>
                              <option value="other_lesson1-1">Pattern: New Words (คำศัพท์ใหม่ 4 คอลัมน์)</option>
                              <option value="other_lesson1-3">Pattern: Phonetics (สัทอักษรและรูปภาพ)</option>
                              <option value="other_lesson5">Pattern: Character Intro (แนะนำตัวละคร 5 คอลัมน์)</option>
                              <option value="other_lesson5-5">Pattern: Flashcards (การ์ดพลิกฝึกฟัง 4 คอลัมน์)</option>
                              <option value="other_lesson5-6">Pattern: Match Game (ลากเส้นจับคู่)</option>
                              <option value="other_lesson5-7">Pattern: Listen & Sequence (ฟังแล้วเรียงลำดับ)</option>
                              <option value="other_lesson5-8">Pattern: Step Reveal (โชว์ข้อความทีละกล่อง ตามตำแหน่งหนังสือ)</option>
                              <option value="other_lesson5-9">Pattern: Image Match (โยงเส้นจับคู่รูปภาพ บน-ล่าง)</option>
                              <option value="other_lesson5-10">Pattern: Word Web (กิจกรรมคู่ ดูภาพฝึกพูด)</option>
                              <option value="other_lesson5-11">Pattern: Fill Pinyin (เติมพินอินในช่องว่าง)</option>
                              <option value="other_lesson5-12">Pattern: Word Ladder (ต่อคำขยายความไล่ระดับสี)</option>
                              <option value="other_lesson5-13">Pattern: Speed Game (เกมใครไวใครได้ เลือกภาพ)</option>
                              <option value="other_lesson5-14">Pattern: Story Reading (บทความฝึกอ่านมีรูปประกอบ)</option>
                              <option value="other_lesson5-15">Pattern: T/F Quiz (บทความฝึกอ่าน พิจารณาถูกผิด)</option>
                              <option value="other_lesson5-16">Pattern: Fill Blanks (เติมคำในช่องว่าง จิ้มเพื่อเติม)</option>
                              <option value="other_lesson5-17">Pattern: Char & Phrases (จำอักษรและวลีประกอบ การ์ดพลิกได้)</option>
                              <option value="other_lesson5-18">Pattern: Radicals Table (ตารางหมวดอักษร พลิกได้)</option>
                              <option value="other_lesson5-19">Pattern: Multiple Choice (วงกลมเลือกตัวอักษรจีน)</option>
                              <option value="other_lesson5-20">Pattern: Header & Image (โจทย์ข้อความและรูปภาพ)</option>
                              <option value="other_lesson5-21">Pattern: Fill Characters (เติมอักษรจีนในช่องว่าง 2 คอลัมน์)</option>
                              <option value="other_lesson5-22">Pattern: Trace & Flip (สมุดคัดลายมือ เขียนครบแล้วพลิก)</option>
                              <option value="other_lesson5-23">Pattern: Compare & Write (เปรียบเทียบประโยคซ้าย-ขวา)</option>
                              <option value="other_lesson5-24">Pattern: Match Image & Letter (ดูภาพและพิมพ์อักษรตอบ)</option>
                              <option value="other_lesson5-25">Pattern: Alternating Fill (เติมคำศัพท์ สลับรูปซ้ายขวา)</option>
                              <option disabled>────────── บทที่ 6 ──────────</option>
                              <option value="other_lesson6-1">6-1: 听一听 การ์ดคำศัพท์พลิกได้ (ฟังเสียง)</option>
                              <option value="other_lesson6-2">6-2: เติมคำในช่องว่างจากตัวเลือก (ฟังเสียง)</option>
                              <option value="other_lesson6-3">6-3: เรียงลำดับตัวเลข (ฟังเสียง)</option>
                              <option value="other_lesson6-4">6-4: ฝึกพูด (ซ้าย-ขวา)</option>
                              <option value="other_lesson6-5">6-5: กิจกรรมคู่ (ถามราคา)</option>
                              <option value="other_lesson6-6">6-6: กิจกรรมหรรษา (เติมพินอิน)</option>
                              <option value="other_lesson6-7">6-7: ต่อคำขยายความ (ขั้นบันได)</option>
                              <option value="other_lesson6-8">6-8: เกมโยนยางลบ (การ์ด 3D)</option>
                              <option value="other_lesson6-9">6-9: ฝึกอ่านบทความแล้วตอบคำถาม</option>
                              <option value="other_lesson6-10">6-10: อ่านประโยคและเลือกภาพให้ตรงกัน</option>
                              <option value="other_lesson6-11">6-11: ฝึกอ่านตัวอักษรและเรียนรู้หมวดอักษร</option>
                              <option value="other_lesson6-12">6-12: เติมคำในช่องว่างและประกอบอักษรจีน</option>
                              <option value="other_lesson6-13">6-13: ลำดับขีดและประโยคพร้อมแบบฝึกหัด</option>
                              <option value="other_lesson6-14">6-14: รู้หรือไม่ (สกุลเงิน)</option>
                              <option value="other_lesson6-15">6-15: ฝึกเขียนและพูดเปรียบเทียบ</option>
                              <option value="other_lesson6-16">6-16: ทดสอบความจำ (จับคู่ภาพกับข้อความ)</option>
                              <option value="other_lesson6-17">6-17: อ่านและเลือกรูปภาพ (2 การ์ดต่อแถว)</option>
                              <option value="other_lesson6-18">6-18: วัดสมองประลองความรู้ (ประโยค Pinyin/จีน)</option>
                              <option disabled>────────── พิเศษ ──────────</option>
                              <option value="other_lesson_money">Money: ชีทเรียนเรื่องเงิน (中国的钱)</option>
                            </select>
                            
                            <button onClick={() => { const selectEl = document.getElementById(`select_new_pattern_${lesson.id}`) as HTMLSelectElement; handleAddSection(selectedCard.id, lesson.id, selectEl.value); }} className="px-6 py-3 border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 flex items-center justify-center gap-2 transition-all shrink-0">
                              <PlusCircle size={18} /> เพิ่มหน้าเนื้อหาใหม่
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in w-full">
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-50 mb-6">
                    <button onClick={() => setEditingSectionId(null)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold bg-slate-50 hover:bg-emerald-50 px-5 py-2.5 rounded-xl transition-colors"><ArrowLeft size={18} /> กลับไปหน้าสารบัญ</button>
                    <span className="font-bold text-slate-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 hidden sm:inline-block">โหมดแก้ไขเนื้อหา</span>
                  </div>

                  {selectedCard.lessons.map(lesson => 
                    lesson.sections.map(sec => {
                      if (sec.id !== editingSectionId) return null; 
                      
                      return (
                        <div key={sec.id} className="w-full bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-sm">
                           {sec.patternType === 'dynamic_json' && (
                             <DynamicJsonSectionEditor sec={sec} lesson={lesson} selectedCard={selectedCard} updateSectionState={updateSectionState} />
                           )}

                           {sec.patternType === 'other_pattern_1' && <SettingOther1 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_classroom' && <SettingOtherClassroom section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson1' && <SettingOtherLesson1 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson1-1' && <SettingOtherLesson1_1 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson1-3' && <SettingOtherLesson1_3 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5' && <SettingOtherLesson5 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-5' && <SettingOtherLesson5_5 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-6' && <SettingOtherLesson5_6 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-7' && <SettingOtherLesson5_7 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-8' && <SettingOtherLesson5_8 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-9' && <SettingOtherLesson5_9 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-10' && <SettingOtherLesson5_10 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-11' && <SettingOtherLesson5_11 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-12' && <SettingOtherLesson5_12 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-13' && <SettingOtherLesson5_13 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-14' && <SettingOtherLesson5_14 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson5-15' && <SettingOtherLesson5_15 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-1' && <SettingOtherLesson6_1 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-2' && <SettingOtherLesson6_2 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-3' && <SettingOtherLesson6_3 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-4' && <SettingOtherLesson6_4 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-5' && <SettingOtherLesson6_5 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-6' && <SettingOtherLesson6_6 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-7' && <SettingOtherLesson6_7 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-8' && <SettingOtherLesson6_8 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-9' && <SettingOtherLesson6_9 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-10' && <SettingOtherLesson6_10 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-11' && <SettingOtherLesson6_11 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-12' && <SettingOtherLesson6_12 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-13' && <SettingOtherLesson6_13 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-14' && <SettingOtherLesson6_14 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-15' && <SettingOtherLesson6_15 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-16' && <SettingOtherLesson6_16 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-17' && <SettingOtherLesson6_17 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                           {sec.patternType === 'other_lesson6-18' && <SettingOtherLesson6_18 section={sec} cardId={selectedCard.id} lessonId={lesson.id} updateSectionState={updateSectionState} />}
                        </div>
                      )
                    })
                  )}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 w-full">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>เลือกคอร์สจาก Dropdown ด้านบนเพื่อเริ่มตั้งค่า</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button onClick={onSave} className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl transition-all hover:-translate-y-1 active:scale-95 text-lg border-2 border-white/20">
          <Save size={24} /> บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}