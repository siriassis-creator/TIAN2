// src/components/quiz/QuizEditor.tsx
import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { ImagePlus, Copy, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

// นำเข้าข้อมูล JSON ต้นฉบับมาเป็นตัวตั้งต้น
import mockQuizDataLesson1 from '../../data/quizDataLesson1.json';
import mockQuizDataLesson2 from '../../data/quizDataLesson2.json';
import mockQuizDataLesson3 from '../../data/quizDataLesson3.json';
import mockQuizDataLesson4 from '../../data/quizDataLesson4.json';
import mockQuizDataLesson5_6 from '../../data/quizData.json';
import mockQuizDataLesson6 from '../../data/quizDataLesson6.json';

const ALL_LESSONS = {
  'lesson1': { name: 'บทที่ 1', data: mockQuizDataLesson1 },
  'lesson2': { name: 'บทที่ 2', data: mockQuizDataLesson2 },
  'lesson3': { name: 'บทที่ 3', data: mockQuizDataLesson3 },
  'lesson4': { name: 'บทที่ 4', data: mockQuizDataLesson4 },
  'lesson5': { name: 'บทที่ 5', data: mockQuizDataLesson5_6 },
  'lesson6': { name: 'บทที่ 6', data: mockQuizDataLesson6 },
};

export default function QuizEditor() {
  const [selectedLesson, setSelectedLesson] = useState<keyof typeof ALL_LESSONS | null>(null);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // โหลด JSON ของบทที่เลือก
  const loadLesson = (key: keyof typeof ALL_LESSONS) => {
    setSelectedLesson(key);
    setQuizData(JSON.parse(JSON.stringify(ALL_LESSONS[key].data))); // Deep copy
    setCopied(false);
  };

  // ฟังก์ชันอัปโหลดรูปขึ้น Supabase
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(questionId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${questionId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      // อัปโหลดไฟล์ไปที่ Bucket 'quiz-images'
      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // ขอลิงก์ Public URL กลับมา
      const { data } = supabase.storage.from('quiz-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // อัปเดตข้อมูลใน State
      setQuizData(prev => prev.map(q => {
        if (q.question_id === questionId) {
          return {
            ...q,
            image: {
              ...q.image,
              enabled: true,
              url: publicUrl,
              image_url: publicUrl
            }
          };
        }
        return q;
      }));

      alert('✅ อัปโหลดรูปภาพสำเร็จ!');
    } catch (error: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  // ฟังก์ชันลบรูปภาพ
  const handleRemoveImage = (questionId: string) => {
    setQuizData(prev => prev.map(q => {
      if (q.question_id === questionId) {
        const newQ = { ...q };
        if (newQ.image) {
          newQ.image.enabled = false;
          newQ.image.url = "";
          newQ.image.image_url = "";
        }
        return newQ;
      }
      return q;
    }));
  };

  // อัปเดตข้อความคำถาม
  const handleQuestionChange = (questionId: string, newText: string) => {
    setQuizData(prev => prev.map(q => q.question_id === questionId ? { ...q, question: newText } : q));
  };

  // ก๊อปปี้ JSON กลับไปใส่ไฟล์
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(quizData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        📝 ระบบจัดการข้อสอบ (Quiz Editor)
      </h1>

      {/* เลือกบทเรียน */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(Object.keys(ALL_LESSONS) as Array<keyof typeof ALL_LESSONS>).map(key => (
          <button
            key={key}
            onClick={() => loadLesson(key)}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all ${selectedLesson === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50'}`}
          >
            {ALL_LESSONS[key].name}
          </button>
        ))}
      </div>

      {selectedLesson && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 sticky top-4 z-50">
            <div>
              <h2 className="text-xl font-bold text-indigo-700">กำลังแก้ไข: {ALL_LESSONS[selectedLesson].name}</h2>
              <p className="text-sm text-slate-500">จำนวนข้อสอบทั้งหมด: {quizData.length} ข้อ</p>
            </div>
            <button onClick={handleCopyJSON} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${copied ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'คัดลอก JSON สำเร็จ!' : 'คัดลอกโค้ด JSON'}
            </button>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm flex gap-3 items-start border border-blue-200">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>
              <b>วิธีใช้งาน:</b> อัปโหลดรูปภาพ หรือแก้ไขข้อความที่ต้องการ เมื่อเสร็จแล้วให้กดปุ่ม <b>"คัดลอกโค้ด JSON"</b> ด้านบน 
              แล้วนำไปวางทับในไฟล์ `src/data/quizDataLessonX.json` ของบทนั้นๆ ใน VS Code เพื่อเซฟขึ้น Vercel
            </p>
          </div>

          <div className="space-y-6">
            {quizData.map((q, index) => (
              <div key={q.question_id || index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold border border-slate-200">
                    {q.question_id}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{q.type}</span>
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(q.question_id, e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-medium text-slate-800 bg-slate-50"
                  rows={2}
                />

                {/* ส่วนจัดการรูปภาพ */}
                <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col md:flex-row items-center gap-4">
                  {q.image?.enabled && (q.image?.url || q.image?.image_url) ? (
                    <>
                      <img src={q.image.url || q.image.image_url} alt="preview" className="h-24 w-auto object-contain rounded-lg border border-slate-200 bg-white" />
                      <div className="flex-1 text-sm text-slate-500 truncate">{q.image.url || q.image.image_url}</div>
                      <button onClick={() => handleRemoveImage(q.question_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-between w-full">
                      <span className="text-sm text-slate-500">ไม่มีรูปภาพประกอบ</span>
                      <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${uploadingId === q.question_id ? 'bg-slate-200 text-slate-500' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        <ImagePlus size={18} />
                        {uploadingId === q.question_id ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingId === q.question_id} onChange={(e) => handleUploadImage(e, q.question_id)} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}