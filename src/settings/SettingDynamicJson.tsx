// src/settings/SettingDynamicJson.tsx
import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Image as ImageIcon, Music, Code, List, Mic, MessageCircle, Users, ClipboardList, BookOpen, Volume2, AlignLeft, Send, Save, Trash2, PlusCircle, PenTool, HelpCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { HanziWordWriter } from '../components/SharedHanzi'; // 👈 นำเข้าระบบขีดเขียนอักษรจีน

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

const updateJsonByPath = (obj: any, path: (string|number)[], field: string, value: any) => {
  let curr = obj;
  for (let i = 0; i < path.length; i++) { curr = curr[path[i]]; }
  curr[field] = value;
};

const setValueByPath = (obj: any, path: (string|number)[], value: any) => {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) { curr = curr[path[i]]; }
  curr[path[path.length - 1]] = value;
};

const SmartForm = ({ data, onChange }: any) => {
  const editableKeys = ['hanzi', 'pinyin', 'thai', 'text', 'question', 'questionHanzi', 'questionPinyin', 'questionThai', 'answer', 'correctAnswer', 'explanation', 'explanationThai', 'title', 'titleChinese', 'titlePinyin', 'titleThai', 'sectionTitle', 'instructionThai', 'topic', 'time', 'timeSpan', 'actionHanzi', 'actionPinyin', 'actionThai', 'statementHanzi', 'statementPinyin', 'statementThai', 'wordHanzi', 'partialPinyin', 'correctPinyin', 'meaningThai', 'termHanzi', 'termPinyin', 'timeRange', 'contentThai', 'descriptionThai', 'radicalHanzi', 'radicalPinyin', 'labelHanzi', 'labelPinyin', 'labelThai', 'passageTitle', 'missingPartText', 'sampleAnswer'];

  const renderNode = (node: any, path: (string|number)[]) => {
      if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
          const key = path[path.length - 1];
          if (editableKeys.includes(String(key))) {
              return (
                  <div key={path.join('.')} className="mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded w-max">{String(key)}</label>
                      <textarea value={String(node)} onChange={(e) => onChange(path, e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded outline-none resize-none font-medium text-slate-700 p-2 focus:border-indigo-300" rows={String(node).length > 40 ? 2 : 1} />
                  </div>
              );
          }
          return null;
      }
      if (Array.isArray(node)) {
          return <div key={path.join('.')} className="pl-3 ml-2 border-l-2 border-indigo-100 flex flex-col gap-2 my-2 w-full">{node.map((child, idx) => renderNode(child, [...path, idx]))}</div>;
      }
      if (typeof node === 'object' && node !== null) {
          return <div key={path.join('.')} className="flex flex-col gap-1 w-full">{Object.keys(node).map(key => renderNode(node[key], [...path, key]))}</div>;
      }
      return null;
  };
  return <div className="flex flex-col w-full">{renderNode(data, [])}</div>;
};

const getImgUrl = (img: any) => img?.url || img?.imageUrl;
const getAudUrl = (aud: any) => aud?.url || aud?.audioUrl;

const speak = (text: string) => {
  if (!text) return;
  if ('speechSynthesis' in window) { 
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text); 
      utterance.lang = 'zh-CN'; 
      window.speechSynthesis.speak(utterance); 
  }
};

const TTSBtn = ({ text }: { text: string }) => {
   if (!text) return null;
   return (
     <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(text); }} className="ml-2 inline-flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-full transition-colors shadow-sm active:scale-95 shrink-0" title="ฟังเสียงอ่าน">
       <Volume2 size={16} />
     </button>
   );
};

// 🎯 ฟังก์ชันสำหรับวาดหน้าจอ Preview ให้หน้าตาตรงกัน
export const renderPreviewSectionContent = (sec: any) => {
  const isTeacherOverlay = false;
  const broadcastToStudent = (type: string, payload: any) => {};

  return (
    <div className="w-full space-y-8">
      
      {sec.type === 'heading' && (
        <div className="text-center bg-indigo-50 p-6 md:p-8 rounded-2xl border-2 border-indigo-100 shadow-sm">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            {sec.titleChinese} <TTSBtn text={sec.titleChinese} />
          </h3>
          <p className="text-lg md:text-xl text-indigo-600 font-semibold mb-1">{sec.titlePinyin}</p>
          <p className="text-slate-600 text-sm md:text-base">{sec.titleThai}</p>
        </div>
      )}

      {sec.type === 'picture_card' && (
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-4">{sec.sectionTitle}</h3>
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-100 flex flex-col items-center text-center w-full max-w-sm relative group">
            {isTeacherOverlay && <button onClick={() => broadcastToStudent('vocab', sec.item)} className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={14}/> ส่งขึ้นจอ</button>}
            {getImgUrl(sec.item?.image) && <img src={getImgUrl(sec.item?.image)} alt="vocab" className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-2xl mb-6 shadow-sm border border-slate-100" />}
            <div className="text-4xl md:text-6xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
              <HanziWordWriter text={sec.item?.hanzi} /> <TTSBtn text={sec.item?.hanzi} />
            </div>
            <div className="text-xl md:text-2xl text-indigo-500 font-semibold mb-1">{sec.item?.pinyin}</div>
            <div className="text-lg text-slate-600 mb-4">{sec.item?.thai}</div>
            {getAudUrl(sec.item?.audio) && <audio controls className="w-full h-10 outline-none"><source src={getAudUrl(sec.item?.audio)} type="audio/mpeg" /></audio>}
          </div>
        </div>
      )}

      {sec.type === 'vocabulary_cards' && (
        <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><List className="text-indigo-500"/> {sec.sectionTitle}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sec.items?.map((item: any) => (
              <div key={item.id} className="relative group bg-white border border-indigo-100 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col items-center hover:border-indigo-400 transition-all hover:-translate-y-1">
                {isTeacherOverlay && <button onClick={() => broadcastToStudent('vocab', item)} className="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"><Send size={12}/> ส่ง</button>}
                {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt={item.hanzi} className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-xl mb-4 shadow-sm" />}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="text-3xl md:text-4xl font-serif text-slate-800 font-bold hover:scale-110 transition-transform cursor-pointer">
                    <HanziWordWriter text={item.hanzi} />
                  </div>
                  <TTSBtn text={item.hanzi} />
                </div>
                <span className="text-sm md:text-base text-indigo-500 font-semibold text-center">{item.pinyin}</span>
                <span className="text-xs md:text-sm text-slate-500 text-center mt-1">{item.thai}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === 'listening_ordering' && (
        <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Mic className="text-amber-500"/> {sec.sectionTitle}</h3>
          <div className="flex flex-col gap-4">
            {sec.items?.map((item: any) => (
              <div key={item.id} className="relative group flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm hover:border-amber-300 transition-colors">
                {isTeacherOverlay && <button onClick={() => broadcastToStudent('passage', { hanzi: item.sentenceHanzi, pinyin: item.sentencePinyin, thai: item.sentenceThai })} className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Send size={14}/> ส่งประโยค</button>}
                <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-400 shrink-0 text-xl">?</div>
                {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt="img" className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover shadow-sm" />}
                <div className="flex-1 pr-16 md:pr-24">
                  <div className="text-lg md:text-xl font-serif text-slate-800 font-bold flex items-center gap-2">
                    {item.sentenceHanzi} <TTSBtn text={item.sentenceHanzi} />
                  </div>
                  {item.sentencePinyin && <div className="text-sm md:text-base text-indigo-500 mt-1">{item.sentencePinyin}</div>}
                  {item.sentenceThai && <div className="text-sm text-slate-500 mt-0.5">{item.sentenceThai}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === 'listening_true_false' && (
        <div className="w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Mic className="text-amber-500"/> {sec.sectionTitle}</h3>
          {getAudUrl(sec.audio) && (
            <div className="w-full max-w-md mx-auto mb-8 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm"><Music size={16} /> คลิปเสียงประจำแบบฝึกหัด</div>
              <audio controls className="w-full h-10 outline-none"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {sec.items?.map((item: any, i: number) => (
              <div key={item.id} className="relative group bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-5 hover:border-amber-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">{item.itemNumber || i+1}</div>
                {getImgUrl(item.image) && <img src={getImgUrl(item.image)} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 shadow-sm" />}
                <div className="flex-1 text-center md:text-left pr-20 md:pr-0">
                  <div className="text-xl font-serif font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                    {item.sentenceHanzi} <TTSBtn text={item.sentenceHanzi} />
                  </div>
                  {item.sentencePinyin && <div className="text-base text-indigo-500 mt-1">{item.sentencePinyin}</div>}
                  {item.sentenceThai && <div className="text-sm text-slate-500 mt-0.5">{item.sentenceThai}</div>}
                </div>
                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center">
                  <span className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl cursor-pointer shadow-sm">✓</span>
                  <span className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl cursor-pointer shadow-sm">✗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === 'dialogue_section' && (
        <div className="w-full">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><MessageCircle className="text-blue-500 w-6 h-6"/> {sec.sectionTitle}</h3>
          <div className="space-y-8">
            {sec.dialogues?.map((d: any) => (
              <div key={d.dialogueNumber} className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100 relative group">
                <h4 className="font-bold text-blue-800 text-sm md:text-base mb-6 bg-blue-100 inline-block px-4 py-1.5 rounded-lg shadow-sm">บทสนทนา {d.dialogueNumber}: {d.topic}</h4>
                {getImgUrl(d.image) && <img src={getImgUrl(d.image)} alt="dialogue img" className="w-full max-w-sm rounded-2xl mb-6 shadow-sm border border-blue-200" />}
                
                <div className="flex flex-col gap-4">
                  {d.lines?.map((chat: any, dIdx: number) => {
                    const isA = chat.speaker === 'A';
                    return (
                      <div key={dIdx} className={`flex w-full gap-3 md:gap-4 ${isA ? 'justify-start' : 'justify-end'}`}>
                        {isA && <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-base md:text-lg shrink-0 shadow-sm">{chat.speaker}</div>}
                        <div className={`p-4 md:p-5 rounded-2xl border max-w-[85%] shadow-sm ${isA ? 'bg-white rounded-tl-none border-slate-200' : 'bg-emerald-50 rounded-tr-none text-right border-emerald-200'}`}>
                          <div className="text-lg md:text-xl font-serif text-slate-800 font-semibold flex items-center gap-2">
                             {chat.hanzi} <TTSBtn text={chat.hanzi} />
                          </div>
                          {chat.pinyin && <div className="text-sm md:text-base text-indigo-500 mt-1">{chat.pinyin}</div>}
                          {chat.thai && <div className="text-sm text-slate-500 mt-0.5">{chat.thai}</div>}
                        </div>
                        {!isA && <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-base md:text-lg shrink-0 shadow-sm">{chat.speaker}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {sec.questions && sec.questions.length > 0 && !sec.dialogues?.[0]?.questions && (
             <div className="mt-8 bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200 shadow-sm">
                <h4 className="font-bold text-amber-800 mb-6 text-lg flex items-center gap-2"><HelpCircle size={24}/> คำถามท้ายบทสนทนา (Q&A)</h4>
                <div className="space-y-4">
                   {sec.questions.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="bg-white p-5 md:p-6 rounded-2xl border border-amber-100 shadow-sm relative group/qna hover:border-amber-300 transition-colors">
                         <div className="text-xl md:text-2xl font-serif font-bold text-slate-800 pr-32 flex items-center gap-2">
                            {q.itemNumber}. {q.questionHanzi} <TTSBtn text={q.questionHanzi} />
                         </div>
                         {q.questionPinyin && <div className="text-base text-indigo-500 mt-2">{q.questionPinyin}</div>}
                         {q.questionThai && <div className="text-sm text-slate-500 mt-1">{q.questionThai}</div>}
                         {q.correctAnswer && (
                           <div className="mt-5 pt-4 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-xl">
                              <span className="text-sm font-bold text-emerald-700 block mb-1">💡 แนวคำตอบ: </span>
                              <span className="text-lg md:text-xl font-serif font-bold text-slate-800">{q.correctAnswer}</span>
                              {q.explanationThai && <span className="text-sm text-emerald-600 block mt-1">({q.explanationThai})</span>}
                           </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      )}

      {sec.type === 'pair_speaking' && (
        <div className="w-full bg-cyan-50 p-6 md:p-8 rounded-3xl border border-cyan-100 relative group">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Users className="text-cyan-500 w-6 h-6"/> {sec.sectionTitle}</h3>
          
          {sec.modelDialogue && (
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 mb-8 relative group/dialogue shadow-sm">
                <span className="font-bold text-cyan-700 text-base block mb-4 flex items-center gap-2"><MessageCircle size={18}/> บทสนทนาตัวอย่าง:</span>
                {sec.modelDialogue.map((chat:any, i:number) => (
                   <div key={i} className="mb-2 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm shrink-0">{chat.speaker}</div>
                      <div className="flex flex-col">
                         <span className="flex items-center gap-2 text-xl font-serif font-bold text-slate-800">{chat.hanzi} <TTSBtn text={chat.hanzi} /></span>
                         <span className="text-sm text-slate-500 mt-1">({chat.thai})</span>
                      </div>
                   </div>
                ))}
            </div>
          )}

          {sec.siblingCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sec.siblingCards.map((card:any, i:number) => (
                <div key={card.id || i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center group/card relative hover:border-cyan-300 transition-all hover:-translate-y-1">
                  {getImgUrl(card.image) ? (
                    <img src={getImgUrl(card.image)} alt="img" className="w-full h-40 md:h-48 object-contain rounded-2xl mb-5 border border-slate-100" />
                  ) : (
                    <div className="w-full h-40 md:h-48 bg-slate-50 rounded-2xl mb-5 flex items-center justify-center text-slate-300 text-sm border-2 border-dashed border-slate-200">ไม่มีรูปภาพประกอบ</div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl md:text-3xl font-bold font-serif text-slate-800">{card.labelHanzi}</span>
                    <TTSBtn text={card.labelHanzi} />
                  </div>
                  {card.labelPinyin && <div className="text-base text-indigo-500 mt-2 font-medium">{card.labelPinyin}</div>}
                  {card.labelThai && <div className="text-sm text-slate-500 mt-1">{card.labelThai}</div>}
                </div>
              ))}
            </div>
          )}

          {sec.routineCards && (
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
              {sec.routineCards.map((card:any, i:number) => (
                <React.Fragment key={i}>
                  <div className="bg-white p-5 w-40 md:w-48 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center shrink-0 hover:border-cyan-300 transition-colors">
                    {getImgUrl(card.image) && <img src={getImgUrl(card.image)} alt="img" className="w-24 h-24 object-cover rounded-2xl mb-4 shadow-sm" />}
                    <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-bold mb-3 shadow-inner">{card.timeSpan || card.time}</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xl font-bold font-serif text-slate-800">{card.actionHanzi || card.hanzi}</span>
                      <TTSBtn text={card.actionHanzi || card.hanzi} />
                    </div>
                    {(card.actionPinyin || card.pinyin) && <div className="text-sm text-indigo-500 mb-1">{card.actionPinyin || card.pinyin}</div>}
                    {card.actionThai && <div className="text-xs text-slate-500">{card.actionThai || card.thai}</div>}
                  </div>
                  {i < sec.routineCards.length - 1 && <div className="hidden lg:block text-cyan-300 font-black text-3xl mx-2">➔</div>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🎯 Pinyin Completion (แก้ไขให้การ์ดแสดงผลแนวนอน และขยายขนาดตัวอักษรจีน + ใส่ HanziWordWriter) */}
      {sec.type === 'pinyin_completion' && (
        <div className="w-full bg-slate-50 p-6 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-8 flex items-center gap-2"><Edit3 className="text-pink-500 w-6 h-6"/> {sec.sectionTitle}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {sec.items?.map((item:any) => (
              <div key={item.id} className="relative group bg-white p-4 md:p-6 rounded-3xl border-2 border-slate-100 flex flex-row items-center gap-4 shadow-sm hover:border-pink-300 transition-colors">
                
                {/* ฝั่งซ้าย: รูปภาพ หรือ คำแปลไทย และปุ่มลำโพงอยู่ด้านล่าง */}
                <div className="flex flex-col items-center justify-center w-24 md:w-28 shrink-0 gap-3">
                  <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-2 overflow-hidden">
                    {getImgUrl(item.image) ? (
                      <img src={getImgUrl(item.image)} alt="img" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl md:text-2xl font-bold text-orange-500 text-center px-2 leading-tight">{item.meaningThai}</span>
                    )}
                  </div>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(item.wordHanzi); }} className="inline-flex items-center justify-center p-2 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-full transition-colors active:scale-95 shrink-0" title="ฟังเสียงอ่าน">
                    <Volume2 size={16} />
                  </button>
                </div>
                
                {/* ฝั่งขวา: พินอินและตัวจีน (บรรทัดเดียวกัน ตัวบางและเล็กลง พร้อม HanziWordWriter) */}
                <div className="flex-1 flex flex-row flex-wrap items-baseline gap-2 border-l-2 border-slate-100 pl-4 md:pl-6 py-2">
                  <span className="text-xl md:text-2xl text-slate-700 font-mono font-bold tracking-[0.1em]">
                     {item.partialPinyin?.replace(/_+/g, '___')}
                  </span>
                  <div className="text-lg md:text-xl font-serif font-medium text-slate-400 cursor-pointer hover:scale-110 transition-transform">
                     <HanziWordWriter text={item.wordHanzi} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 หน้า 6: รองรับ ร้องเพลง (sing_along) */}
      {sec.type === 'sing_along' && (
        <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 rounded-3xl border-2 border-amber-200 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2"><Music className="text-amber-500"/> {sec.sectionTitle}</h3>
          {getAudUrl(sec.audio) && (
            <div className="w-full max-w-md mx-auto mb-6 bg-white p-3 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
              <Music className="text-amber-500"/>
              <audio controls className="w-full h-8"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sec.lyrics?.map((lyric: any, lIdx: number) => (
              <div key={lIdx} className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-amber-100 shadow-sm">
                <div className="text-lg md:text-xl font-serif font-bold text-slate-800 flex items-center justify-between">
                  <span>{lyric.lineHanzi}</span>
                  <TTSBtn text={lyric.lineHanzi}/>
                </div>
                <div className="text-sm text-indigo-600 mt-1">{lyric.linePinyin}</div>
                <div className="text-xs text-slate-500 mt-1">{lyric.lineThai}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 หน้า 7: รองรับ โยงเส้นจับคู่ (matching_exercise) */}
      {sec.type === 'matching_exercise' && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><List className="text-indigo-500"/> {sec.sectionTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sec.pairs?.map((pair: any) => (
              <div key={pair.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-serif font-bold text-slate-800 flex items-center gap-1">{pair.leftHanzi} <TTSBtn text={pair.leftHanzi}/></div>
                  <div className="text-xs text-indigo-500">{pair.leftPinyin}</div>
                  <div className="text-xs text-slate-400">{pair.leftThai}</div>
                </div>
                <span className="text-slate-300 font-bold text-xl">➔</span>
                <div className="text-right">
                  <div className="text-lg font-serif font-bold text-emerald-600 flex items-center justify-end gap-1"><TTSBtn text={pair.rightHanzi}/> {pair.rightHanzi}</div>
                  <div className="text-xs text-indigo-500">{pair.rightPinyin}</div>
                  <div className="text-xs text-slate-400">{pair.rightThai}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 หน้า 7: รองรับ ตารางสัมภาษณ์เพื่อน (interview_table) */}
      {sec.type === 'interview_table' && (
        <div className="w-full bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="text-lg font-bold text-indigo-900 mb-3">{sec.sectionTitle}</h3>
          {sec.dialoguePrompt && (
            <div className="bg-white p-3 rounded-xl border border-indigo-100 mb-4 text-sm text-slate-600 space-y-1">
              {sec.dialoguePrompt.map((d: any, idx: number) => (
                <div key={idx}><b className="text-indigo-600">{d.speaker}:</b> {d.hanzi} <span className="text-xs text-slate-400">({d.thai})</span></div>
              ))}
            </div>
          )}
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-center border-collapse">
              <thead className="bg-indigo-100 text-indigo-900 text-sm font-bold">
                <tr>
                  <th className="p-3 border-r border-indigo-200">#</th>
                  {sec.columns?.map((col: string, idx: number) => (
                    <th key={idx} className="p-3 border-r border-indigo-200 last:border-0">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: sec.rowCount || 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-t border-slate-100 text-sm">
                    <td className="p-3 font-bold text-slate-400 border-r border-slate-100">{rIdx + 1}</td>
                    {sec.columns?.map((_: any, cIdx: number) => (
                      <td key={cIdx} className="p-3 border-r border-slate-100 last:border-0 text-slate-300">......</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🎯 Reading Passage & True/False */}
      {sec.type === 'reading_passage_exercise' && (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800">{sec.sectionTitle}</h3>
          {getAudUrl(sec.audio) && (
            <div className="w-full max-w-md mx-auto bg-indigo-50 p-3 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-3">
              <Music className="text-indigo-600"/>
              <audio controls className="w-full h-8"><source src={getAudUrl(sec.audio)} type="audio/mpeg" /></audio>
            </div>
          )}
          {getImgUrl(sec.image) && <img src={getImgUrl(sec.image)} alt="passage" className="w-full max-w-md mx-auto rounded-xl object-cover shadow-sm" />}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200">
            <h4 className="font-bold text-amber-900 mb-2">{sec.passageTitle}</h4>
            <div className="text-lg md:text-xl font-serif text-slate-800 leading-relaxed mb-2 flex items-start gap-2">
              <span>{sec.passageText?.hanzi}</span> <TTSBtn text={sec.passageText?.hanzi}/>
            </div>
            <div className="text-sm text-indigo-600 mb-2 leading-relaxed">{sec.passageText?.pinyin}</div>
            <div className="text-xs text-slate-500 border-t border-amber-100 pt-2 leading-relaxed">{sec.passageText?.thai}</div>
          </div>
          {sec.trueFalseExercises && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700">พิจารณาประโยคถูกหรือผิด:</h4>
              {sec.trueFalseExercises.map((ex: any) => (
                <div key={ex.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-serif font-bold text-slate-800 text-base flex items-center gap-1">{ex.itemNumber}. {ex.statementHanzi} <TTSBtn text={ex.statementHanzi}/></div>
                    <div className="text-xs text-indigo-500">{ex.statementPinyin}</div>
                    <div className="text-xs text-slate-400">{ex.statementThai}</div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold ${ex.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    เฉลย: {ex.correctAnswer ? '✓ ถูก' : '✗ ผิด'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🎯 Writing Guided Fill */}
      {sec.type === 'writing_guided_fill' && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{sec.sectionTitle}</h3>
          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm space-y-3">
            <div className="text-lg font-serif text-slate-800 leading-relaxed">{sec.template?.hanzi}</div>
            <div className="text-sm text-indigo-500 leading-relaxed">{sec.template?.pinyin}</div>
            <div className="text-xs text-slate-400 border-t pt-2 leading-relaxed">{sec.template?.thai}</div>
          </div>
        </div>
      )}

      {/* 🎯 Hanzi Recognition & Radical (เรียนรู้อักษรจีน ใส่ HanziWordWriter) */}
      {sec.type === 'hanzi_recognition' && (
        <div className="w-full bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
          <h3 className="text-lg font-bold text-indigo-900">{sec.sectionTitle}</h3>
          {sec.radical && (
            <div className="bg-white p-4 rounded-xl border border-indigo-200 flex items-center gap-4">
              <div className="text-5xl md:text-6xl font-serif font-black text-indigo-600 bg-indigo-50 w-24 h-24 flex items-center justify-center rounded-2xl shrink-0 shadow-inner border border-indigo-100 hover:scale-105 transition-transform cursor-pointer">
                <HanziWordWriter text={sec.radical.radicalHanzi} />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base">{sec.radical.meaningThai} ({sec.radical.radicalPinyin})</div>
                <div className="text-xs text-slate-500 mt-1">{sec.radical.descriptionThai}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sec.hanziItems?.map((h: any) => (
              <div key={h.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                   <div className="text-4xl md:text-5xl font-serif font-bold text-slate-800 bg-slate-50 w-20 h-20 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 transition-transform cursor-pointer shrink-0">
                     <HanziWordWriter text={h.hanzi} />
                   </div>
                   <div className="flex flex-col flex-1">
                      <span className="text-xl font-bold text-indigo-600">{h.pinyin}</span>
                      <span className="text-sm md:text-base text-slate-500 mt-1">{h.thai}</span>
                   </div>
                   <TTSBtn text={h.hanzi}/>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">คำศัพท์ที่เกี่ยวข้อง:</span>
                  {h.words?.map((w: any, wIdx: number) => (
                    <div key={wIdx} className="text-base md:text-lg text-slate-700 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <b className="font-serif text-xl">{w.hanzi}</b> <span className="text-sm text-indigo-400">({w.pinyin})</span> <span className="text-sm text-slate-500 ml-auto">{w.thai}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Radical Examples (หมวดอักษร ใส่ HanziWordWriter) */}
      {sec.type === 'radical_examples' && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{sec.sectionTitle}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {sec.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-3 hover:scale-110 transition-transform cursor-pointer">
                  <HanziWordWriter text={item.hanzi} />
                </div>
                <div className="text-xs text-indigo-500">{item.pinyin}</div>
                <div className="mt-2 text-xs text-slate-500 flex flex-col gap-1">
                  {item.sampleWords?.map((w: string, wIdx: number) => <span key={wIdx} className="bg-slate-100 rounded px-1">{w}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Circle Target Character */}
      {sec.type === 'circle_target_character' && (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">{sec.sectionTitle}</h3>
          <div className="space-y-3">
            {sec.exercises?.map((ex: any) => (
              <div key={ex.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-sm inline-block mb-3">คำเป้าหมาย: {ex.targetHanzi} ({ex.targetPinyin})</span>
                <div className="space-y-2">
                  {ex.sentences?.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="text-base font-serif text-slate-800 flex items-center justify-between">
                      <span>{s.hanzi}</span>
                      <TTSBtn text={s.hanzi}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === 'component_selection' && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{sec.sectionTitle}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {sec.wordBank?.map((w: string, idx: number) => (
              <span key={idx} className="bg-white border border-indigo-200 px-3 py-1 rounded-lg font-bold text-indigo-700 shadow-sm">{w}</span>
            ))}
          </div>
          {sec.items?.map((it: any) => (
            <div key={it.id} className="text-sm text-slate-500 italic">{it.missingPartText}</div>
          ))}
        </div>
      )}

      {/* 🎯 Character Tracing (คัดอักษร ใส่ HanziWordWriter) */}
      {sec.type === 'character_tracing' && (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PenTool className="text-indigo-500"/> {sec.sectionTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sec.characters?.map((ch: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="text-5xl md:text-6xl font-serif font-black text-slate-800 bg-white w-24 h-24 flex items-center justify-center rounded-2xl shadow-sm border border-slate-200 group-hover:border-indigo-400 transition-colors cursor-pointer hover:scale-105 shrink-0">
                    <HanziWordWriter text={ch.hanzi} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{ch.pinyin} (จำนวน {ch.strokeCount} ขีด)</div>
                    <div className="text-xs text-slate-400">คำตัวอย่าง: {ch.sampleWords?.join(', ')}</div>
                  </div>
                </div>
                <TTSBtn text={ch.hanzi}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === 'sentence_tracing' && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PenTool className="text-indigo-500"/> {sec.sectionTitle}</h3>
          <div className="space-y-3">
            {sec.sentences?.map((s: any, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-serif font-bold text-slate-800">{s.hanzi}</div>
                  <div className="text-xs text-indigo-500">{s.pinyin}</div>
                  <div className="text-xs text-slate-400">{s.thai}</div>
                </div>
                <TTSBtn text={s.hanzi}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Culture Article */}
      {sec.type === 'culture_article' && (
        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <h3 className="text-2xl font-bold text-orange-800 mb-2">{sec.titleThai}</h3>
          <p className="text-slate-700 mb-6 leading-relaxed whitespace-pre-line">{sec.contentThai}</p>
          {(sec.timeSequenceTable || sec.explanationTable) && (
            <div className="bg-white rounded-xl overflow-hidden border border-orange-200 shadow-sm">
              <table className="w-full text-sm md:text-base text-left">
                <thead className="bg-orange-100 text-orange-800">
                  <tr><th className="p-3">คำศัพท์</th><th className="p-3">ความหมาย</th></tr>
                </thead>
                <tbody>
                  {(sec.timeSequenceTable || sec.explanationTable)?.map((item:any, i:number) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="p-3 font-bold text-orange-600 text-lg flex items-center gap-2">
                        {item.termHanzi} <TTSBtn text={item.termHanzi} />
                      </td>
                      <td className="p-3 text-slate-700">{item.explanationThai || item.meaningThai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {sec.type === 'writing_sample_and_practice' && (
        <div className="w-full bg-slate-800 text-white p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-300">{sec.sectionTitle}</h3>
          <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
            <div className="text-xl font-serif leading-relaxed mb-2 flex items-start gap-2">
              <span>{sec.sampleText?.hanzi}</span> <TTSBtn text={sec.sampleText?.hanzi} />
            </div>
            <div className="text-sm text-indigo-400 mb-1">{sec.sampleText?.pinyin}</div>
            <div className="text-xs text-slate-400">{sec.sampleText?.thai}</div>
          </div>
          {sec.template && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 text-slate-300 text-sm">
              <b>โครงร่างสำหรับฝึกแต่ง:</b>
              <div className="font-serif mt-1">{sec.template.hanzi}</div>
              <div className="text-xs text-slate-400 mt-1">{sec.template.thai}</div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 End of Lesson Quiz */}
      {sec.type === 'end_of_lesson_quiz' && (
        <div className="w-full space-y-6">
          <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2"><ClipboardList/> {sec.sectionTitle}</h3>
          {sec.wordBank && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="font-bold text-amber-800 text-sm block mb-2">กล่องตัวเลือกคำศัพท์ (Word Bank):</span>
              <div className="flex flex-wrap gap-2">
                {sec.wordBank.map((wb: any) => (
                  <span key={wb.id} className="bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm text-slate-700">
                    <b className="text-amber-600 mr-1">{wb.id}.</b> {wb.hanzi} <span className="text-xs text-slate-400">({wb.thai})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {sec.questions?.map((q: any, qIdx: number) => (
              <div key={q.id} className="relative group bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-amber-300 transition-colors shadow-sm">
                <div className="flex gap-3 mb-2 pr-32">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white bg-amber-400 shrink-0 shadow-sm">{q.itemNumber || qIdx + 1}</div>
                  <div>
                    <div className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">{q.questionHanzi} <TTSBtn text={q.questionHanzi}/></div>
                    <div className="text-xs text-indigo-500 mt-0.5">{q.questionPinyin}</div>
                    <div className="text-xs text-slate-400">{q.questionThai}</div>
                  </div>
                </div>
                {q.correctAnswer && <div className="mt-3 pl-11 text-sm font-bold text-emerald-600">เฉลย: {q.correctAnswer} <span className="text-xs font-normal text-slate-500">({q.explanationThai})</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Open Questions */}
      {sec.type === 'open_questions' && (
        <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-800">{sec.sectionTitle}</h3>
          <div className="space-y-4">
            {sec.questions?.map((q: any) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">{q.itemNumber}. {q.questionHanzi} <TTSBtn text={q.questionHanzi}/></div>
                <div className="text-sm text-indigo-500 mt-0.5">{q.questionPinyin}</div>
                <div className="text-xs text-slate-400">{q.questionThai}</div>
                {q.sampleAnswer && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-sm text-emerald-700 bg-emerald-50/50 p-2 rounded-lg">
                    <b>ตัวอย่างคำตอบ:</b> {q.sampleAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function SettingDynamicJson({ sec, lesson, selectedCard, updateSectionState }: any) {
  const [viewMode, setViewMode] = useState<'raw'|number>('raw');
  const [pageText, setPageText] = useState('');
  const [livePageObj, setLivePageObj] = useState<any>(null);
  const [jsonError, setJsonError] = useState('');

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

  useEffect(() => {
     if (isParsable && items.length > 0 && viewMode === 'raw' && !jsonError) { openPage(0); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParsable]);

  useEffect(() => {
      try {
          if (pageText.trim()) {
              const obj = JSON.parse(pageText);
              setLivePageObj(obj);
              setJsonError('');
          }
      } catch(e) { }
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

  const handleFieldChange = (path: (string|number)[], newValue: string) => {
      try {
          const newObj = JSON.parse(pageText);
          setValueByPath(newObj, path, newValue);
          setPageText(JSON.stringify(newObj, null, 2));
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
      } catch(e) { alert('❌ ไม่สามารถเพิ่มหน้าได้ เนื่องจากโครงสร้างหลักมีปัญหา กรุณาแก้ไขแบบรวม (Raw) ก่อน'); }
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

  const activeImageAssets = viewMode === 'raw' ? extractImageAssets(parsed) : extractImageAssets(livePageObj);

  return (
    <div className="mt-4 p-5 bg-slate-100 border border-slate-200 rounded-2xl shadow-inner flex flex-col gap-6">
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

       {viewMode === 'raw' ? (
          <div>
            <textarea value={sec.jsonData || ''} onChange={(e) => updateSectionState(selectedCard.id, lesson.id, sec.id, (s:any) => ({...s, jsonData: e.target.value}))} className="w-full h-[600px] p-5 rounded-xl border-4 border-slate-300 focus:border-indigo-500 font-mono text-sm leading-relaxed outline-none whitespace-pre overflow-wrap-normal shadow-inner" style={{ color: '#a5d6ff', backgroundColor: '#0d1117' }} spellCheck="false" />
          </div>
       ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
             <div className="bg-slate-800 p-2 md:p-6 rounded-3xl shadow-2xl flex flex-col items-center max-h-[800px] overflow-y-auto border-4 border-slate-900 relative">
                <div className="absolute top-4 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-md flex items-center gap-1"><Eye size={14}/> LIVE PREVIEW</div>
                <div className="w-full mt-10">
                   {/* เรียกใช้ Component Preview จากด้านบน */}
                   <div className="w-full bg-slate-100 min-h-[400px] rounded-3xl p-4 md:p-8 flex flex-col gap-6 relative pointer-events-none scale-100 origin-top">
                     <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 relative">
                        <div className="absolute top-4 right-6 text-xs font-bold text-slate-300">หน้า {livePageObj?.pageNumber || livePageObj?.sortOrder || '?'}</div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><BookOpen className="text-indigo-500 w-5 h-5"/> {livePageObj?.title || 'ไม่มีชื่อหน้า'}</h2>
                        {livePageObj?.instructionThai && <p className="text-slate-500 mb-4 bg-slate-50 inline-block px-3 py-1.5 rounded-lg text-xs md:text-sm">📌 {livePageObj?.instructionThai}</p>}
                        
                        {getImgUrl(livePageObj?.image) && <img src={getImgUrl(livePageObj?.image)} className="w-full max-w-sm mx-auto rounded-2xl shadow-sm mb-6 object-cover" alt="img" />}
                        
                        {getAudUrl(livePageObj?.audio) && (
                          <div className="bg-slate-200 w-full max-w-xs mx-auto rounded-xl p-3 mb-6 flex flex-col items-center gap-2 border border-slate-300">
                            <span className="text-slate-500 text-xs font-bold flex items-center gap-1"><Music size={14}/> ไฟล์เสียงประจำหน้า</span>
                            <audio controls className="w-full h-8 scale-90"><source src={getAudUrl(livePageObj?.audio)} type="audio/mpeg" /></audio>
                          </div>
                        )}

                        {livePageObj?.sections && livePageObj.sections.length > 0 && (
                           <div className="flex flex-col gap-6 w-full">
                              {livePageObj.sections.map((section: any, sIdx: number) => (
                                 <div key={sIdx} className="w-full">
                                    {/* 🎯 เรียกใช้ฟังก์ชัน Render แบบจำลองจากด้านบนตรงนี้! */}
                                    {renderPreviewSectionContent(section)}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2">
                <div className="bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 border-b border-indigo-200 pb-3"><Edit3 size={20}/> ฟอร์มแก้ไขข้อความ (อัปเดตสด)</h4>
                   <SmartForm data={livePageObj} onChange={handleFieldChange} />
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Music size={20} className="text-amber-500" /> ลิงก์ไฟล์เสียงประจำหน้า (Dropbox / URL)
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">แนบลิงก์ไฟล์เสียงสำหรับหน้านี้ 1 ไฟล์ (ถ้ามี) แนะนำให้ใช้ Dropbox เปลี่ยน dl=0 เป็น dl=1 หรือ raw=1</p>
                  <input type="text" placeholder="https://..." value={livePageObj?.audio?.url || livePageObj?.audio?.audioUrl || ''} onChange={(e) => {
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
                     }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400" />
                  {(livePageObj?.audio?.url || livePageObj?.audio?.audioUrl) && (
                     <div className="mt-3 bg-slate-100 p-2 rounded-lg">
                        <audio controls className="w-full h-8"><source src={livePageObj?.audio?.url || livePageObj?.audio?.audioUrl} type="audio/mpeg" /></audio>
                     </div>
                  )}
                </div>

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
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-100 text-indigo-600"><ImageIcon size={20} /></div>
                                <div className="flex flex-col"><span className="text-sm font-bold text-slate-800 line-clamp-1">{asset.label}</span></div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                                <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                                  {currentUrl ? <img src={currentUrl} alt="preview" className="w-full h-full object-cover" /> : <span className="text-[8px] text-slate-400 font-bold text-center leading-tight">ไม่มี<br/>ไฟล์</span>}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                  <input type="file" accept="image/*" id={`upload-${sec.id}-${viewMode}-${aIdx}`} className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if(!file) return;
                                      try {
                                        const bucketName = 'images'; 
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
                                  <button onClick={() => document.getElementById(`upload-${sec.id}-${viewMode}-${aIdx}`)?.click()} className="px-2 py-1 text-white rounded text-xs font-bold shadow-sm w-full bg-indigo-600 hover:bg-indigo-700">อัปโหลด</button>
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
                                      }} className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-bold w-full">ลบออก</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  )}
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800">
                   <details className="group mb-4">
                      <summary className="font-bold text-emerald-400 cursor-pointer outline-none flex items-center gap-2"><Code size={18}/> เปิดแก้โค้ด JSON ขั้นสูง (Raw)</summary>
                      <textarea value={pageText} onChange={(e) => setPageText(e.target.value)} className="w-full h-[400px] mt-4 p-4 rounded-xl border-2 border-emerald-900 focus:border-emerald-500 font-mono text-xs leading-relaxed outline-none whitespace-pre overflow-wrap-normal" style={{ color: '#a5d6ff', backgroundColor: '#0d1117' }} spellCheck="false" />
                   </details>
                   {jsonError && <p className="mb-4 text-xs text-red-400 font-bold bg-red-900/30 p-3 rounded-lg border border-red-800">{jsonError}</p>}
                   <div className="flex gap-4">
                      <button onClick={savePage} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"><Save size={18}/> บันทึกหน้านี้</button>
                      <button onClick={deleteCurrentPage} className="px-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-3 rounded-xl transition-colors border border-red-500/30"><Trash2 size={20} /></button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}