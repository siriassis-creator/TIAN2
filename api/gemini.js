// api/gemini.js

export default async function handler(req, res) {
  // 1. เช็ค Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Vercel แปลง body เป็น Object ให้แล้ว ไม่ต้องใช้ JSON.parse()
    const { messages, systemInstruction, provider = 'gemini' } = req.body;
    
    // ดึง API Keys จาก Vercel Environment Variables
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID; 
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;

    // ==========================================
    // 1. Google Gemini
    // ==========================================
    if (provider === 'gemini') {
      if (!geminiKey) return res.status(500).json({ error: 'ไม่พบ GEMINI_API_KEY' });

      const payload = {
        contents: messages,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.4, responseMimeType: "application/json" }
      };

      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + geminiKey;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    }

    // ==========================================
    // 2. ChatGPT หรือ Groq
    // ==========================================
    if (provider === 'chatgpt' || provider === 'groq') {
      const isGpt = provider === 'chatgpt';
      const apiKey = isGpt ? openaiKey : groqKey;
      
      if (!apiKey) return res.status(500).json({ error: `ไม่พบ API Key สำหรับ ${provider.toUpperCase()}` });

      const formattedMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text
      }));

      formattedMessages.unshift({ role: 'system', content: systemInstruction + "\nRespond strictly in valid JSON." });

      const urlOpenAI = "https://api.openai.com/v1/chat/completions";
      const urlGroq = "https://api.groq.com/openai/v1/chat/completions";
      const apiUrl = isGpt ? urlOpenAI : urlGroq;
      
      const modelName = isGpt ? "gpt-4o-mini" : "qwen/qwen3.8-27b";

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature: 0.2, // ลด temperature ลงเพื่อป้องกันอาการวนลูป
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    // ==========================================
    // 3. Cloudflare Workers AI
    // ==========================================
    if (provider === 'cloudflare') {
      if (!cfAccountId || !cfToken) {
        return res.status(500).json({ error: 'ไม่พบ CLOUDFLARE_ACCOUNT_ID หรือ CLOUDFLARE_API_TOKEN' });
      }

      const formattedMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text
      }));

      formattedMessages.unshift({ 
        role: 'system', 
        content: systemInstruction + "\n\nCRITICAL RULE: You MUST reply with ONLY a raw, valid JSON object. Do NOT wrap it in Markdown code blocks (like ```json). Do NOT add any introductory or concluding text." 
      });

      const model = "@cf/meta/llama-3.1-8b-instruct-fast";
      // ใช้การต่อ String แบบดั้งเดิมด้วยเครื่องหมายบวก (+) ชัวร์ที่สุดครับ
      const apiUrl = "[https://api.cloudflare.com/client/v4/accounts/](https://api.cloudflare.com/client/v4/accounts/)" + cfAccountId + "/ai/run/" + model;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          temperature: 0.2, // ลด temperature ลงเพื่อป้องกันอาการวนลูป
          max_tokens: 800   // ป้องกันการสร้างข้อความยาวเกินไป
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
         throw new Error(JSON.stringify(data.errors || data));
      }

      // ดึงข้อมูลและบังคับแปลงเป็น String ก่อนใช้ .replace
      let rawReply = data.result.response || data.result;
      let cleanReply = typeof rawReply === 'object' ? JSON.stringify(rawReply) : String(rawReply || "");

      cleanReply = cleanReply.replace(/```json/gi, '').replace(/```/g, '').trim();

      const startIndex = cleanReply.indexOf('{');
      const endIndex = cleanReply.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        cleanReply = cleanReply.substring(startIndex, endIndex + 1);
      }

      return res.status(200).json({ reply: cleanReply });
    }

    return res.status(400).json({ error: 'ไม่รู้จัก Provider ที่เลือก' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}