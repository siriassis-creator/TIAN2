// netlify/functions/gemini.js

export const handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages, systemInstruction, provider = 'gemini' } = JSON.parse(event.body);
    
    // ดึง API Keys จาก Netlify Environment Variables
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID; 
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;

    // ==========================================
    // 1. Google Gemini
    // ==========================================
    if (provider === 'gemini') {
      if (!geminiKey) return { statusCode: 500, body: JSON.stringify({ error: 'ไม่พบ GEMINI_API_KEY' }) };

      const payload = {
        contents: messages,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.4, responseMimeType: "application/json" }
      };

      const apiUrl = "https://" + "generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + geminiKey;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      return { statusCode: 200, body: JSON.stringify({ reply: data.candidates[0].content.parts[0].text }) };
    }

    // ==========================================
    // 2. ChatGPT หรือ Groq
    // ==========================================
    if (provider === 'chatgpt' || provider === 'groq') {
      const isGpt = provider === 'chatgpt';
      const apiKey = isGpt ? openaiKey : groqKey;
      
      if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: `ไม่พบ API Key สำหรับ ${provider.toUpperCase()}` }) };

      const formattedMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text
      }));

      formattedMessages.unshift({ role: 'system', content: systemInstruction + "\nRespond strictly in valid JSON." });

      const urlOpenAI = "https://" + "api.openai.com/v1/chat/completions";
      const urlGroq = "https://" + "api.groq.com/openai/v1/chat/completions";
      const apiUrl = isGpt ? urlOpenAI : urlGroq;
      
      const modelName = isGpt ? "gpt-4o-mini" : "llama-3.3-70b-versatile";

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      
      return { statusCode: 200, body: JSON.stringify({ reply: data.choices[0].message.content }) };
    }

    // ==========================================
    // 3. Cloudflare Workers AI
    // ==========================================
    if (provider === 'cloudflare') {
      if (!cfAccountId || !cfToken) {
        return { statusCode: 500, body: JSON.stringify({ error: 'ไม่พบ CLOUDFLARE_ACCOUNT_ID หรือ CLOUDFLARE_API_TOKEN' }) };
      }

      // Cloudflare (Llama) คุยผ่าน Message Array เหมือน OpenAI
      const formattedMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text
      }));

      // บังคับการตอบกลับเป็น JSON ด้วย System Prompt 
      // (Cloudflare บางตัวอาจจะไม่รองรับ response_format แบบตรงๆ)
      formattedMessages.unshift({ 
        role: 'system', 
        content: systemInstruction + "\n\nCRITICAL RULE: You MUST reply with ONLY a raw, valid JSON object. Do NOT wrap it in Markdown code blocks (like ```json). Do NOT add any introductory or concluding text." 
      });

      // 🎯 โมเดลล่าสุดและเร็วที่สุดของ Cloudflare ตามที่อาจารย์ต้องการ
      const model = "@cf/meta/llama-3.1-8b-instruct-fast";
      
      const apiUrl = "https://" + "[api.cloudflare.com/client/v4/accounts/](https://api.cloudflare.com/client/v4/accounts/)" + cfAccountId + "/ai/run/" + model;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
         throw new Error(JSON.stringify(data.errors || data));
      }

      // 🎯 Cloudflare อาจส่งกลับมาพร้อม Markdown ควบ JSON เราจึงต้องทำการ Clean ให้ปลอดภัยก่อนส่งต่อให้หน้าแชท
      let cleanReply = data.result.response;
      cleanReply = cleanReply.replace(/```json/gi, '').replace(/```/g, '').trim();

      const startIndex = cleanReply.indexOf('{');
      const endIndex = cleanReply.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        cleanReply = cleanReply.substring(startIndex, endIndex + 1);
      }

      return { statusCode: 200, body: JSON.stringify({ reply: cleanReply }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'ไม่รู้จัก Provider ที่เลือก' }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};