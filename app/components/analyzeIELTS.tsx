import {
  analyzeNumerology,
  evaluateSpeaking,
  evaluateWriting,
} from "../api/generate-ielts/route";

import { buildIELTSEmailHTML } from "./emailIELTS";

/**
 * MAIN ENTRY
 * ============================================
 * Phân tích toàn bộ bài thi IELTS:
 *  - Grammar + Reading
 *  - Writing AI
 *  - Speaking AI
 *  - Thần số học
 *  - Xuất Email HTML để gửi
 */
export async function analyzeIELTS(params: {
  grammarReading: any;              // điểm grammar+reading từ hệ thống
  writingEssay: string;             // bài writing
  speakingTranscript: string;       // transcript speaking
  name: string;                     // full name
  email: string;                    // email học viên
  dob: string;                      // dd/mm/yyyy
}) {
  const {
    grammarReading,
    writingEssay,
    speakingTranscript,
    name,
    email,
    dob,
  } = params;

  // ==========================
  // 1. CHẤM WRITING
  // ==========================
  const writingScore = await evaluateWriting(writingEssay);

  const writingBand = Number(writingScore.overall || 0);

  // ==========================
  // 2. CHẤM SPEAKING
  // ==========================
  let speakingScore = null;

  try {
    speakingScore = await evaluateSpeaking(speakingTranscript);
  } catch (err) {
    console.error("❌ Speaking evaluation error:", err);
    speakingScore = {
      fluency: "Không thể chấm Speaking",
      grammar: "",
      vocabulary: "",
      pronunciation: "",
      coherence: "",
      overall: 0,
    };
  }

  // ==========================
  // 3. THẦN SỐ HỌC (HTML)
  // ==========================
  const numerologyHTML = await analyzeNumerology(name, dob);

  // ==========================
  // 4. BAND: Grammar+Reading + Writing
  // ==========================
  const grammarReadingBand = Number(
    grammarReading?.grammarReadingBand || 0
  );

  const overallBand =
    (grammarReadingBand + writingBand + speakingScore.overall) /
    3;

  // ==========================
  // 5. Build email HTML cuối cùng
  // ==========================
  const emailHTML = buildIELTSEmailHTML({
    fullName: name,
    email,
    timestamp: new Date().toLocaleString("vi-VN"),
    gradingResult: grammarReading,

    writingScore: {
      overallBand: writingBand,
      taskAchievement: writingScore.task,
      coherenceCohesion: writingScore.coherence,
      lexicalResource: writingScore.lexical,
      grammaticalRange: writingScore.grammar,
      suggestions: writingScore.suggestion,
    },

    writingAnswer: writingEssay,
    grammarReadingBand,
    writingBand,
    overallBand,
    numerologyHTML,
    pdfUrl: null, // nếu bạn xuất PDF → truyền link vào đây sau
  });

  // ==========================
  // 6. RETURN FULL RESULT
  // ==========================
  return {
    writingScore,
    speakingScore,
    numerologyHTML,
    overallBand,
    emailHTML,
  };
}
