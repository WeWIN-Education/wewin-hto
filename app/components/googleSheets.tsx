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
}

export interface AnswerRow {
  question: string;
  answer: string;
  skill: string;
  point: number;
  result: string;   // ⭐ FIX: bổ sung field này cho tương thích AnswerKeyRow
}

// =====================
// APPEND FINAL LIST
// =====================

export async function appendFinalList(params: AppendFinalListParams) {
  const { accessToken, sheetId, id, name, email, score } = params;

  const range = `Final_list!A3:E`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const body = {
    values: [[id, name, email, score]],
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
}

// =====================
// APPEND GRAMMAR LIST
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
  } = params;

  const range = `Grammar_list!A:AF`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const row = [
    id,
    startTime,
    finishTime,
    fullName,
    birthDate,
    location,
    phone,
    email,
    consultant,
    ieltsNeed,
    selfScore,
    studyTime,
    ...grammar,
    ...reading,
    writingAnswer,
  ];

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
}

// =====================
// FETCH ANSWERS (ANSWER KEY)
// =====================

export async function fetchAnswersFromSheet(
  accessToken: string,
  sheetId: string,
  sheetName = "Answers"
): Promise<AnswerRow[]> {
  const range = `${sheetName}!A2:D`;
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
    result: "",             // ⭐ FIX: bổ sung
  }));
}
