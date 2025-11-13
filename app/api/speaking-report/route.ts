// app/api/speaking-report/route.ts
import { toPureArrayBuffer } from "@/app/utils/format";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FINAL_SHEET_NAME = "Final_list";

interface SpeakingReportRequest {
  accessToken: string;
  sheetId: string;
  folderId: string;
  uuid: string;

  student: { name: string; email: string };
  questions: { part1: string; part2: string; part3: string };
  audios: { part: 1 | 2 | 3; link: string }[];
}

/* ---------------------------------------------- */
function extractFileId(link: string): string | null {
  if (!link) return null;
  if (link.includes("id=")) return link.split("id=")[1].split("&")[0];
  if (link.includes("/d/")) return link.split("/d/")[1].split("/")[0];
  return null;
}

async function downloadAudioFromDrive(accessToken: string, fileId: string) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Drive download error ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/* ---------------------------------------------- */
async function transcribeWithWhisper(audio: Uint8Array): Promise<string> {
  const pure = toPureArrayBuffer(audio);
  const blob = new Blob([pure], { type: "audio/m4a" });

  const form = new FormData();
  form.append("file", blob, "audio.m4a");
  form.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Whisper error ${res.status}`);
  return (await res.json()).text || "";
}

/* ---------------------------------------------- */
async function analyzeWithGPT({
  name,
  email,
  transcript,
  questionsText,
}: {
  name: string;
  email: string;
  transcript: string;
  questionsText: string;
}): Promise<string> {
  const prompt = `
Bạn là giám khảo IELTS Speaking của IDP.
Viết feedback chi tiết bằng tiếng Việt.

Học viên: ${name} (${email})
Đề bài:
${questionsText}

Transcript:
${transcript}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`GPT error ${res.status}`);
  return res.json().then((j) => j.choices[0].message.content || "");
}

/* ---------------------------------------------- */
async function createPdfBuffer({
  uuid,
  name,
  email,
  transcriptsByPart,
  analysis,
}: {
  uuid: string;
  name: string;
  email: string;
  transcriptsByPart: Record<string, string>;
  analysis: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const { height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;

  const write = (text: string, size = 12, isBold = false) => {
    text.split("\n").forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size,
        font: isBold ? bold : font,
      });
      y -= size + 4;
    });
  };

  write("IELTS Speaking Report – WeWIN", 16, true);
  y -= 10;
  write(`ID: ${uuid}`, 10);
  write(`Name: ${name}`, 11);
  write(`Email: ${email}`, 11);

  y -= 20;
  write("=== TRANSCRIPT ===", 14, true);

  ["part1", "part2", "part3"].forEach((p) => {
    if (transcriptsByPart[p]) {
      y -= 10;
      write(p.toUpperCase(), 12, true);
      write(transcriptsByPart[p], 10);
    }
  });

  y -= 20;
  write("=== FEEDBACK ===", 14, true);
  write(analysis, 10);

  return pdf.save();
}

/* ---------------------------------------------- */
async function uploadPdfToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  pdfBytes: Uint8Array
) {
  const metadata = {
    name: fileName,
    mimeType: "application/pdf",
    parents: [folderId],
  };

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close = "\r\n--" + boundary + "--";

  const metaDataPart =
    "Content-Type: application/json\r\n\r\n" + JSON.stringify(metadata);

  const pdfBuffer = Buffer.from(pdfBytes);

  const filePart = `Content-Type: application/pdf\r\n\r\n`;

  const multipartBody = Buffer.concat([
    Buffer.from(delimiter + metaDataPart + delimiter + filePart),
    pdfBuffer,
    Buffer.from(close),
  ]);

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Drive upload error: ${res.status} - ${t}`);
  }

  const json = await res.json();
  return `https://drive.google.com/file/d/${json.id}/view`;
}

/* ---------------------------------------------- */
async function updateFinalList({
  accessToken,
  sheetId,
  uuid,
  name,
  email,
  pdfLink,
}: {
  accessToken: string;
  sheetId: string;
  uuid: string;
  name: string;
  email: string;
  pdfLink: string;
}) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${FINAL_SHEET_NAME}!A2:E`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const rows = (await res.json()).values || [];
  let rowIndex = rows.findIndex((r: string[]) => r[2] === email);

  if (rowIndex === -1)
    rowIndex = rows.findIndex((r: string[]) => r[0] === uuid);

  if (rowIndex !== -1) {
    const sheetRow = rowIndex + 2;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${FINAL_SHEET_NAME}!E${sheetRow}:E${sheetRow}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [[pdfLink]] }),
      }
    );
  } else {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${FINAL_SHEET_NAME}!A:E:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[uuid, name, email, 0, pdfLink]],
        }),
      }
    );
  }
}

const DRIVE_FOLDER_ID = "1uof17QRbGl1VyZXnIuALL5OIm409ewuS";

/* ---------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SpeakingReportRequest;
    const { accessToken, sheetId, uuid, student, questions, audios } = body;

    const folderId = DRIVE_FOLDER_ID;

    /* 1 — Transcribe */
    const transcripts: Record<string, string> = {};

    for (const { part, link } of audios) {
      const id = extractFileId(link);
      if (!id) continue;

      const bytes = await downloadAudioFromDrive(accessToken, id);
      transcripts[`part${part}`] = await transcribeWithWhisper(bytes);
    }

    const fullTranscript = Object.values(transcripts).join("\n\n");
    if (!fullTranscript.trim())
      return NextResponse.json(
        { error: "No transcript detected" },
        { status: 400 }
      );

    /* 2 — GPT */
    const analysis = await analyzeWithGPT({
      name: student.name,
      email: student.email,
      transcript: fullTranscript,
      questionsText: `
Part 1: ${questions.part1}
Part 2: ${questions.part2}
Part 3: ${questions.part3}
`.trim(),
    });

    /* 3 — PDF */
    const pdfBytes = await createPdfBuffer({
      uuid,
      name: student.name,
      email: student.email,
      transcriptsByPart: transcripts,
      analysis,
    });

    /* 4 — Upload */
    const fileName = `IELTS_Speaking_${student.name}_${uuid}.pdf`;
    const pdfLink = await uploadPdfToDrive(
      accessToken,
      folderId,
      fileName,
      pdfBytes
    );

    /* 5 — Update FINAL_LIST only */
    await updateFinalList({
      accessToken,
      sheetId,
      uuid,
      name: student.name,
      email: student.email,
      pdfLink,
    });

    return NextResponse.json({ success: true, pdfLink });
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
