import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async chat(message: string, history: any[]) {
    if (!process.env.GROQ_API_KEY) return { reply: '⚠️ مفتاح API غير معد.' };
    const systemPrompt = `أنت "إحداثي"، مساعد ذكي GIS. أجب بالعربية بدقة.`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h: any) => ({ role: h.role === 'bot' ? 'assistant' : 'user', content: h.text })),
      { role: 'user', content: message },
    ];
    try {
      const res = await this.client.chat.completions.create({ model: 'openai/gpt-oss-120b', messages: messages as any, temperature: 0.7 });
      return { reply: res.choices[0]?.message?.content || 'لا يوجد رد.' };
    } catch (e: any) {
      return { reply: `⚠️ خطأ: ${e.message}` };
    }
  }
}
