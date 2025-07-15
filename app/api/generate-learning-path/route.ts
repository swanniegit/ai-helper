import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { role, level } = await req.json();
  const prompt = `Create a short learning roadmap for a ${role} at ${level} level. Provide 3 concise bullet points.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message?.content ?? '';
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to generate learning path.' },
      { status: 500 }
    );
  }
}
