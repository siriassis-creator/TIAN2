import React from 'react';

export interface StrokeExample {
  character: string;
  pinyin: string;
  english: string;
  strokeOrderImg: string;
}

export interface StrokeRule {
  ruleZh: string;
  ruleEn: string;
  examples: StrokeExample[];
}

export interface PatternStrokeOrderRules2Data {
  titleZh?: string;
  titleEn?: string;
  headers?: string[];
  rules?: StrokeRule[];
}

interface Props {
  data: PatternStrokeOrderRules2Data;
}

export default function PatternStrokeOrderRules2({ data }: Props) {
  // ดึงค่า headers จาก data ถ้าไม่มีให้ใช้ของเดิม
  const headers =
    data.headers && data.headers.length >= 3
      ? data.headers
      : ['笔顺 Rule', '例字 Example Characters', '书写顺序 Stroke Order'];

  return (
    <div className="my-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 font-sans w-full max-w-5xl mx-auto">
      {/* ส่วนหัวข้อ */}
      {(data.titleZh || data.titleEn) && (
        <div className="mb-6 text-slate-700">
          {data.titleZh && (
            <div className="text-2xl font-medium tracking-wide">
              {data.titleZh}
            </div>
          )}
          {data.titleEn && (
            <div className="text-base text-slate-500 mt-1">{data.titleEn}</div>
          )}
        </div>
      )}

      {/* ตาราง */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-medium text-slate-600 border-r border-slate-200 w-1/4">
                {headers[0]}
              </th>
              <th className="p-4 font-medium text-slate-600 border-r border-slate-200 w-[40%]">
                {headers[1]}
              </th>
              <th className="p-4 font-medium text-slate-600">{headers[2]}</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {data.rules?.map((rule, ruleIndex) => {
              // 1. นับว่าในกฎข้อนี้ มีการใส่ URL รูปภาพไว้ทั้งหมดกี่รูป
              const validImages = rule.examples.filter(
                (ex) => ex.strokeOrderImg
              );
              const hasSingleImage = validImages.length === 1;
              const singleImageSrc = hasSingleImage
                ? validImages[0].strokeOrderImg
                : '';

              return (
                <React.Fragment key={ruleIndex}>
                  {rule.examples.map((example, exampleIndex) => (
                    <tr
                      key={`${ruleIndex}-${exampleIndex}`}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* คอลัมน์ที่ 1: กฎ (ผสานเซลล์แนวตั้งตามจำนวนคำศัพท์) */}
                      {exampleIndex === 0 && (
                        <td
                          rowSpan={rule.examples.length}
                          className="p-4 border-r border-slate-200 align-top bg-white"
                        >
                          <div className="text-lg font-medium text-slate-800">
                            {rule.ruleZh}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {rule.ruleEn}
                          </div>
                        </td>
                      )}

                      {/* คอลัมน์ที่ 2: คำศัพท์ตัวอย่าง */}
                      <td className="p-4 border-r border-slate-200 align-middle">
                        <div className="flex items-center gap-6">
                          <span className="text-2xl font-medium text-slate-800 w-12 text-center">
                            {example.character}
                          </span>
                          <span className="text-lg text-slate-600 w-20">
                            {example.pinyin}
                          </span>
                          <span className="text-base text-slate-500">
                            {example.english}
                          </span>
                        </div>
                      </td>

                      {/* คอลัมน์ที่ 3: รูปภาพลำดับขีด */}
                      {hasSingleImage ? (
                        // กรณีที่ 1: มีรูปเดียวในกลุ่ม -> ให้ผสานเซลล์ (rowSpan) ยาวลงมาเท่ากับคอลัมน์ 2 และจัดกึ่งกลางแนวตั้งอัตโนมัติ
                        exampleIndex === 0 && (
                          <td
                            rowSpan={rule.examples.length}
                            className="p-4 align-middle text-center bg-white"
                          >
                            <img
                              src={singleImageSrc}
                              alt="Stroke order group"
                              className="max-h-16 object-contain mx-auto" // ปรับ max-h ให้ใหญ่ขึ้นเล็กน้อยเพื่อให้สมส่วนกับช่องที่ขยายครับ
                            />
                          </td>
                        )
                      ) : (
                        // กรณีที่ 2: มีหลายรูป หรือไม่มีรูปเลย -> แสดงแยกทีละแถวตามปกติแบบเดิม
                        <td className="p-4 align-middle text-center">
                          {example.strokeOrderImg && (
                            <img
                              src={example.strokeOrderImg}
                              alt={`Stroke order for ${example.character}`}
                              className="max-h-10 object-contain mx-auto"
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {(!data.rules || data.rules.length === 0) && (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center text-slate-400 italic"
                >
                  ยังไม่มีข้อมูล กรุณาเพิ่มเนื้อหาในหน้าตั้งค่า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
