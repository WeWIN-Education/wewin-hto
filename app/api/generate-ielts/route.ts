import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

console.log(openai);

export async function GET() {
  try {
    const prompt = `
Generate a random IELTS Speaking test set (Level B1-B2).
Output strictly in valid JSON format only:
{
  "part1": [ "question1", "question2", "question3" ],
  "part2": {
    "topic": "string",
    "bullets": ["point1", "point2", "point3", "point4"],
    "followUp": "string"
  },
  "part3": {
    "reading": "short paragraph (2 sentences)",
    "questions": ["q1", "q2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.0,
    });

    const text = completion.choices[0].message?.content || "{}";
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ Error generating IELTS set:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
