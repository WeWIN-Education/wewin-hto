// app/lib/googleSheets.ts

// =====================
// TYPES
// =====================

interface AppendFinalListParams {
  accessToken: string;
  sheetId: string;
  id: string;
  name: string;
  email: string;
  score: number;
  pdfUrl?: string;
}

interface SkillStats {
  correct: number;
  totalPoint: number;
  max: number;
  q: number;
}

interface AppendGrammarListParams {
  accessToken: string;
  sheetId: string;
  id: string;
  fullName: string;
  birthDate: string;
  location: string;
  phone: string;
  email: string;
  consultant: string;
  ieltsNeed: string;
  selfScore: string;
  studyTime: string;
  startTime: string;
  finishTime: string;
  grammar: string[];
  reading: string[];
  writingAnswer: string;
  // ⭐ NEW: Detailed scoring fields
  totalScore?: number;
  maxScore?: number;
  correctCount?: number;
  totalQuestions?: number;
  grammarReadingBand?: number;
  writingBand?: number;
  overallBand?: number;
  skillStats?: Record<string, SkillStats>;
}

export interface AnswerRow {
  question: string;
  answer: string;
  skill: string;
  point: number;
}

// ⭐ NEW: Answer Key interface for grading
export interface AnswerKey {
  answers: string[];
  skills: string[];
  points: number[];
}

// =====================
// APPEND FINAL LIST
// =====================

export async function appendFinalList(params: AppendFinalListParams) {
  const { accessToken, sheetId, id, name, email, score, pdfUrl } = params;

  const range = `Final_list!A:E`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  // Include PDF URL if provided
  const row = pdfUrl
    ? [id, name, email, score, pdfUrl]
    : [id, name, email, score, ""];

  const body = {
    values: [row],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ appendFinalList error:", text);
    throw new Error("Failed to append Final_list");
  }

  console.log("✅ Final_list appended successfully");
}

// =====================
// APPEND GRAMMAR LIST (ENHANCED)
// =====================

export async function appendGrammarList(params: AppendGrammarListParams) {
  const {
    accessToken,
    sheetId,
    id,
    fullName,
    birthDate,
    location,
    phone,
    email,
    consultant,
    ieltsNeed,
    selfScore,
    studyTime,
    startTime,
    finishTime,
    grammar,
    reading,
    writingAnswer,
    // New scoring fields
    totalScore,
    maxScore,
    correctCount,
    totalQuestions,
    grammarReadingBand,
    writingBand,
    overallBand,
    skillStats,
  } = params;

  // Build row with detailed scores at the end
  const row = [
    id, // A: ID
    startTime, // B: Start Time
    finishTime, // C: Finish Time
    fullName, // D: Full Name
    birthDate, // E: Birth Date
    location, // F: Location
    phone ? `'${phone}` : "", // G: Phone
    email, // H: Email
    consultant, // I: Consultant
    ieltsNeed, // J: IELTS Need
    selfScore, // K: Self Score
    studyTime, // L: Study Time
    ...grammar, // M onwards: Grammar answers
    ...reading, // Reading answers
    writingAnswer, // Last writing column
    // ⭐ NEW: Additional columns for detailed scores
    totalScore || "",
    maxScore || "",
    correctCount || "",
    totalQuestions || "",
    grammarReadingBand || "",
    writingBand || "",
    overallBand || "",
    // Skill breakdown as JSON string (optional)
    skillStats ? JSON.stringify(skillStats) : "",
  ];

  const range = `Grammar_list!A:AZ`; // Extended to AZ to accommodate new fields
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const body = { values: [row] };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("❌ appendGrammarList error:", t);
    throw new Error("Failed to append Grammar_list");
  }

  console.log("✅ Grammar_list appended with detailed scores");
}

// =====================
// FETCH ANSWERS (ANSWER KEY)
// =====================

export async function fetchAnswersFromSheet(
  accessToken: string,
  sheetId: string,
  sheetName = "Answers"
): Promise<AnswerRow[]> {
  const range = `${sheetName}!A2:D`; // Question, Answer, Skill, Point
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ fetchAnswersFromSheet error:", text);
    throw new Error("Failed to read Answers sheet");
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows.map((r: any[]) => ({
    question: r[0] || "",
    answer: r[1]?.trim() || "",
    skill: r[2] || "Unknown",
    point: Number(r[3] || 1),
  }));
}

// ⭐ NEW: Transform AnswerRow[] to AnswerKey format
export function transformToAnswerKey(answerRows: AnswerRow[]): AnswerKey {
  return {
    answers: answerRows.map((row) => row.answer),
    skills: answerRows.map((row) => row.skill),
    points: answerRows.map((row) => row.point),
  };
}

// ⭐ NEW: Fetch and transform in one call
export async function fetchAnswerKey(
  accessToken: string,
  sheetId: string,
  sheetName = "Answers"
): Promise<AnswerKey> {
  const answerRows = await fetchAnswersFromSheet(
    accessToken,
    sheetId,
    sheetName
  );
  return transformToAnswerKey(answerRows);
}

// =====================
// UPDATE EXISTING ROW (OPTIONAL)
// =====================

export async function updateGrammarListRow(params: {
  accessToken: string;
  sheetId: string;
  rowNumber: number; // Row number in sheet (1-based)
  values: any[];
}) {
  const { accessToken, sheetId, rowNumber, values } = params;

  const range = `Grammar_list!A${rowNumber}:AZ${rowNumber}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const body = { values: [values] };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ updateGrammarListRow error:", text);
    throw new Error("Failed to update Grammar_list row");
  }

  console.log(`✅ Grammar_list row ${rowNumber} updated`);
}

// =====================
// FIND ROW BY EMAIL OR UUID
// =====================

export async function findRowByIdentifier(params: {
  accessToken: string;
  sheetId: string;
  sheetName: string;
  identifier: string; // Email or UUID
  searchColumn: "A" | "H"; // A for UUID, H for Email
}): Promise<number | null> {
  const { accessToken, sheetId, sheetName, identifier, searchColumn } = params;

  const range = `${sheetName}!${searchColumn}:${searchColumn}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const values = data.values || [];

  const rowIndex = values.findIndex((row: any[]) => row[0] === identifier);

  // Return 1-based row number (add 1 because arrays are 0-based)
  return rowIndex >= 0 ? rowIndex + 1 : null;
}

// =====================
// BATCH UPDATE MULTIPLE CELLS
// =====================

export async function batchUpdateSheet(params: {
  accessToken: string;
  sheetId: string;
  updates: Array<{
    range: string;
    values: any[][];
  }>;
}) {
  const { accessToken, sheetId, updates } = params;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`;

  const body = {
    valueInputOption: "USER_ENTERED",
    data: updates.map((update) => ({
      range: update.range,
      values: update.values,
    })),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ batchUpdateSheet error:", text);
    throw new Error("Failed to batch update sheet");
  }

  console.log("✅ Batch update completed");
}

// =====================
// GET SKILL STATISTICS SUMMARY
// =====================

export function getSkillsSummary(
  skillStats: Record<string, SkillStats>
): string {
  const lines: string[] = [];

  for (const [skill, stats] of Object.entries(skillStats)) {
    const percentage = Math.round((stats.correct / stats.q) * 100);
    lines.push(`${skill}: ${stats.correct}/${stats.q} (${percentage}%)`);
  }

  return lines.join(" | ");
}

// =====================
// CONVERT BAND SCORE HELPERS
// =====================

export function scoreToIELTSBand(score: number, maxScore: number): number {
  // Convert raw score to IELTS band (0-9 scale)
  // Round to nearest 0.5
  const ratio = score / maxScore;
  const band = ratio * 9;
  return Math.round(band * 2) / 2;
}

export function averageBands(...bands: number[]): number {
  const validBands = bands.filter((b) => b > 0);
  if (validBands.length === 0) return 0;

  const average = validBands.reduce((sum, b) => sum + b, 0) / validBands.length;
  return Math.round(average * 2) / 2;
}

// =====================
// EXPORT ALL
// =====================

export type { AppendFinalListParams, AppendGrammarListParams, SkillStats };
