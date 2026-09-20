// api/tts.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
      const { text, lang = 'th' } = req.body;
  
      // 🎯 ใช้ Endpoint ลับของ Google Translate (ฟรี 100% ไม่ต้องมี Key)
      // รองรับ lang 'th' (ไทย) และ 'zh-CN' (จีน)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' } // ป้องกัน Google บล็อก
      });
  
      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อระบบเสียงของ Google ได้');
      }
  
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      // ส่งไฟล์เสียง MP3 กลับไปให้หน้าเว็บเล่น
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(buffer);
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }