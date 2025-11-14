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
        content: `You are an IELTS Writing examiner.

You MUST respond ONLY with valid JSON.
Do NOT include any text before or after the JSON.
Do NOT use markdown code blocks.
Do NOT output explanations outside the JSON.
Do NOT add Vietnamese outside the JSON.

✔ You MUST respond in BILINGUAL FORMAT:
Each field must contain **English first**, then Vietnamese translation.

STRICT JSON format:
{
  "task": "[EN] ...\\n[VI] ...",
  "coherence": "[EN] ...\\n[VI] ...",
  "lexical": "[EN] ...\\n[VI] ...",
  "grammar": "[EN] ...\\n[VI] ...",
  "overall": 7.0,
  "suggestion": "[EN] ...\\n[VI] ..."
}

Rules:
- English explanation: 2–3 sentences, academic IELTS tone.
- Vietnamese explanation: natural, dễ hiểu, ngắn gọn.
- No markdown, no extra text.
- Use \\n for new lines.
`,
      },
      {
        role: "user",
        content: `Evaluate this IELTS Writing Task 2 essay and return ONLY the JSON object:

Essay:
${essay}

Remember: Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.4, // ổn định hơn
  });

  const content = res.choices[0].message.content ?? "{}";

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("❌ Failed to parse GPT Writing response:", content);

    const jsonMatch = content.match(/({[\s\S]*})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (_) {}
    }

    return {
      task: "Error",
      coherence: "Error",
      lexical: "Error",
      grammar: "Error",
      overall: 0,
      suggestion: "Error",
      error: "Invalid JSON response",
    };
  }
}


export async function analyzeNumerology(name: string, dob: string) {
  const prompt = `
Bạn là chuyên gia thần số học.

Hãy phân tích thần số học dựa trên:
- Họ tên: ${name}
- Ngày sinh: ${dob}

❗ TRẢ VỀ DUY NHẤT HTML, KHÔNG ĐƯỢC TRẢ JSON ❗
HTML phải có format:

<div>
  <h3>🔮 Phân tích thần số học</h3>

  <p><b>1. Chỉ số đường đời:</b> ...</p>
  <p><b>2. Tính cách nổi bật:</b> ...</p>
  <p><b>3. Điểm mạnh:</b> ...</p>
  <p><b>4. Khuyến nghị học tập:</b> ...</p>
</div>

Không thêm text ngoài HTML.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return res.choices[0].message.content || "";
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
        content: `
You are an IELTS Speaking Examiner. 
You MUST respond ONLY with valid JSON.
Do NOT include any text before or after the JSON.
Do NOT use markdown code blocks.
Do NOT add Vietnamese outside the JSON.

✔ MUST RETURN BILINGUAL FORMAT (English first, Vietnamese below):

{
  "fluency": "[EN] ...\\n[VI] ...",
  "grammar": "[EN] ...\\n[VI] ...",
  "vocabulary": "[EN] ...\\n[VI] ...",
  "pronunciation": "[EN] ...\\n[VI] ...",
  "coherence": "[EN] ...\\n[VI] ...",
  "overall": 6.5
}

Rules:
- English feedback: 2–3 sentences, examiner tone, academic, concise.
- Vietnamese feedback: natural, dễ hiểu, không quá dài.
- Use \\n for line breaks.
- No markdown formatting.
- No extra text outside JSON.
`,
      },
      {
        role: "user",
        content: `Evaluate this IELTS Speaking transcript and return ONLY JSON:

Transcript:
${transcript}
`,
      },
    ],
    temperature: 0.4,
  });

  const content = res.choices[0].message.content ?? "{}";

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("❌ Failed to parse GPT Speaking response:", content);

    const jsonMatch = content.match(/({[\s\S]*})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (_) {}
    }

    return {
      fluency: "Error",
      grammar: "Error",
      vocabulary: "Error",
      pronunciation: "Error",
      coherence: "Error",
      overall: 0,
      error: "Invalid JSON response",
    };
  }
}

