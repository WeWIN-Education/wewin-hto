import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

// ============================================
// GPT chấm Writing - FIXED VERSION
// ============================================
export async function evaluateWriting(essay: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an IELTS Writing examiner. You MUST respond ONLY with valid JSON.
Do NOT include any text before or after the JSON.
Do NOT use markdown code blocks.
Do NOT write explanations in Vietnamese or English outside the JSON.

Required JSON format:
{
  "task": "feedback text here",
  "coherence": "feedback text here",
  "lexical": "feedback text here",
  "grammar": "feedback text here",
  "overall": 7.0,
  "suggestion": "feedback text here"
}`,
      },
      {
        role: "user",
        content: `Evaluate this IELTS Writing Task 2 essay and return ONLY JSON:

Essay:
${essay}

Remember: Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent output
  });

  const content = res.choices[0].message.content ?? "{}";

  try {
    // Try to parse directly
    return JSON.parse(content);
  } catch (parseError) {
    console.error("❌ Failed to parse GPT Writing response:", content.substring(0, 200));

    // Try to extract JSON from markdown if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("❌ Failed to parse extracted JSON");
      }
    }

    // Return fallback
    return {
      task: "Error: Unable to evaluate",
      coherence: "Error: Unable to evaluate",
      lexical: "Error: Unable to evaluate",
      grammar: "Error: Unable to evaluate",
      overall: 0,
      suggestion: `GPT returned invalid format. Raw: ${content.substring(0, 150)}...`,
      error: "Invalid JSON response",
    };
  }
}

// ============================================
// Whisper → transcript
// ============================================
export async function transcribeAudio(file: File) {
  return await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
}

// ============================================
// GPT chấm Speaking - FIXED VERSION
// ============================================
export async function evaluateSpeaking(transcript: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an IELTS Speaking examiner. You MUST respond ONLY with valid JSON.
Do NOT include any text before or after the JSON.
Do NOT use markdown code blocks.
Do NOT write explanations in Vietnamese or English outside the JSON.

Required JSON format:
{
  "fluency": "feedback text here",
  "grammar": "feedback text here",
  "vocabulary": "feedback text here",
  "pronunciation": "feedback text here",
  "coherence": "feedback text here",
  "overall": 6.5
}`,
      },
      {
        role: "user",
        content: `Evaluate this IELTS Speaking transcript and return ONLY JSON:

Transcript:
${transcript}

Remember: Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.3,
  });

  const content = res.choices[0].message.content ?? "{}";

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("❌ Failed to parse GPT Speaking response:", content.substring(0, 200));

    // Try to extract JSON from markdown
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("❌ Failed to parse extracted JSON");
      }
    }

    // Return fallback
    return {
      fluency: "Error: Unable to evaluate",
      grammar: "Error: Unable to evaluate",
      vocabulary: "Error: Unable to evaluate",
      pronunciation: "Error: Unable to evaluate",
      coherence: "Error: Unable to evaluate",
      overall: 0,
      error: "Invalid JSON response",
    };
  }
}