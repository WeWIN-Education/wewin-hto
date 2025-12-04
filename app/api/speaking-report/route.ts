// app/api/speaking-report/route.ts
import { toPureArrayBuffer } from "@/app/utils/format";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";
import { sendEmailWithPDF } from "@/app/components/sendMail";
import { buildIELTSEmailHTML } from "@/app/components/emailIELTS";
import { analyzeNumerologyHTML } from "../numberlogy/helpers";
import { adminEmails } from "@/app/constants/email";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const FINAL_SHEET_NAME = "Final_list";
const DRIVE_FOLDER_ID = "1uof17QRbGl1VyZXnIuALL5OIm409ewuS";

/* ----------------------------------------------------- */
interface SpeakingReportRequest {
  accessToken: string;
  sheetId: string;
  uuid: string;
  student: { name: string; email: string; birthDate: string };
  questions: { part1: string; part2: string; part3: string };
  audios: { part: 1 | 2 | 3; link: string }[];
  report: {
    gradingResult: any;
    wrongAnswers: any;
    writingScore: any;
    writingAnswer: string;
    grammarReadingBand: number;
    writingBand: number;
    overallBand: number;
    numerologyHTML: string;
    timestamp: string;
  };
}

type PartKey = "part1" | "part2" | "part3";
type Stats = { totalWords: number } & Record<PartKey, number>;

/* ----------------------------------------------------- */
/* Utility: Extract File ID */
function extractFileId(link: string): string | null {
  if (!link) return null;
  if (link.includes("id=")) return link.split("id=")[1].split("&")[0];
  if (link.includes("/d/")) return link.split("/d/")[1].split("/")[0];
  return null;
}

/* ----------------------------------------------------- */
/* Drive Download */
async function downloadAudioFromDrive(accessToken: string, fileId: string) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Drive download error ${res.status}`);
  return {
    buffer: new Uint8Array(await res.arrayBuffer()),
    contentType: res.headers.get("content-type") || "audio/wav",
  };
}

/* ----------------------------------------------------- */
/* Whisper */
async function transcribeWithWhisper({
  buffer,
  contentType,
}: {
  buffer: Uint8Array;
  contentType: string;
}): Promise<string> {
  const pure = toPureArrayBuffer(buffer);
  const blob = new Blob([pure], { type: contentType });
  const form = new FormData();
  form.append("file", blob, "audio" + mimeToExt(contentType));
  form.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Whisper error ${res.status}`);
  return (await res.json()).text || "";
}

/* ----------------------------------------------------- */
/* GPT FEEDBACK */
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
Bạn là giám khảo IELTS Speaking của IDP, chuyên phân tích và đánh giá bài nói học viên.

Thông tin học viên:
- Họ tên: ${name}
- Email: ${email}

Đề bài:
${questionsText}

Transcript:
${transcript}

Yêu cầu phản hồi:
1. Phân tích ngắn gọn, chỉ gồm 2 dòng:
   - Dòng 1: Nhận xét tổng quan bằng tiếng Anh (1-2 câu)
   - Dòng 2: Nhận xét tổng quan bằng tiếng Việt (1-2 câu)

2. Không dùng Markdown, không dùng dấu *, không dùng __, không emoji, không icon.

3. Giữ giọng văn ngắn gọn nhưng vẫn mang tính đánh giá chuyên môn của giám khảo.

4. Xuống dòng 1 lần giữa phần tiếng Anh và tiếng Việt.

Ví dụ format:
The candidate demonstrates good fluency with occasional hesitations. Vocabulary range is adequate but could be more varied for higher band scores.

Thí sinh thể hiện khả năng nói truyền đạt tốt với một vài ngắt quãng nhẹ. Vốn từ vựng đầy đủ nhưng cần đa dạng hơn để đạt band điểm cao hơn.

Bắt đầu phản hồi:
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
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error(`GPT error ${res.status}`);
  const raw = (await res.json()).choices[0].message.content || "";

  // Làm sạch Markdown nếu GPT lỡ dùng
  return raw.replace(/\*\*/g, "").replace(/__+/g, "").replace(/[`~]/g, "");
}

/* ----------------------------------------------------- */
/* PDF GENERATION - IELTS PROFESSIONAL DESIGN V2 */
async function createPdfBuffer({
  uuid,
  name,
  email,
  transcriptsByPart,
  analysis,
  stats,
}: {
  uuid: string;
  name: string;
  email: string;
  transcriptsByPart: Record<string, string>;
  analysis: string;
  stats: Stats;
}) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  let page = pdf.addPage([595, 842]); // A4 size
  let { width, height } = page.getSize();

  const fontPath = new URL(
    "../../../public/fonts/Roboto-Regular.ttf",
    import.meta.url
  );
  const roboto = await pdf.embedFont(fs.readFileSync(fontPath), {
    subset: true,
  });

  // Professional Brand Colors
  const PRIMARY_BLUE = rgb(0.055, 0.294, 0.663); // #0E4BA9
  const ACCENT_GOLD = rgb(0.894, 0.761, 0.557); // #E4C28E
  const DARK_BLUE = rgb(0.09, 0.16, 0.29);
  const LIGHT_BLUE = rgb(0.95, 0.97, 0.99);
  const TEXT_DARK = rgb(0.2, 0.2, 0.2);
  const TEXT_GRAY = rgb(0.4, 0.4, 0.4);
  const BORDER_LIGHT = rgb(0.9, 0.9, 0.9);

  let y = height - 50;
  const LEFT_MARGIN = 45;
  const RIGHT_MARGIN = width - 45;
  const CONTENT_WIDTH = RIGHT_MARGIN - LEFT_MARGIN;

  function ensureSpace(size = 40) {
    if (y < 70 + size) {
      page = pdf.addPage([595, 842]);
      const s = page.getSize();
      width = s.width;
      height = s.height;
      y = height - 70;
    }
  }

  const write = (
    text: string,
    size = 10,
    color = TEXT_DARK,
    maxWidth = CONTENT_WIDTH,
    lineHeight = 1.5
  ) => {
    text = text || ""; // 🛠 FIX QUAN TRỌNG
    if (!text.trim()) return;
    const paragraphs = text.split(/\n{2,}/);

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/);
      let line = "";

      for (const w of words) {
        const testLine = line ? line + " " + w : w;
        const testWidth = roboto.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          ensureSpace(size * lineHeight + 2);
          page.drawText(line, { x: LEFT_MARGIN, y, size, font: roboto, color });
          y -= size * lineHeight;
          line = w;
        } else {
          line = testLine;
        }
      }

      if (line) {
        ensureSpace(size * lineHeight + 2);
        page.drawText(line, { x: LEFT_MARGIN, y, size, font: roboto, color });
        y -= size * lineHeight;
      }

      y -= 6;
    }
  };

  const sectionHeader = (title: string) => {
    ensureSpace(50);

    page.drawText(title.toUpperCase(), {
      x: LEFT_MARGIN,
      y: y,
      size: 11,
      font: roboto,
      color: PRIMARY_BLUE,
    });

    y -= 8;

    page.drawLine({
      start: { x: LEFT_MARGIN, y },
      end: { x: RIGHT_MARGIN, y },
      thickness: 1.5,
      color: PRIMARY_BLUE,
    });

    y -= 20;
  };

  /* ============================================= */
  /* COVER HEADER */
  /* ============================================= */

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: PRIMARY_BLUE,
  });

  page.drawText("IELTS SPEAKING", {
    x: LEFT_MARGIN,
    y: height - 50,
    size: 24,
    font: roboto,
    color: rgb(1, 1, 1),
  });

  page.drawText("Assessment Report", {
    x: LEFT_MARGIN,
    y: height - 75,
    size: 14,
    font: roboto,
    color: rgb(1, 1, 1),
  });

  y = height - 140;

  /* ============================================= */
  /* CANDIDATE INFORMATION - IMPROVED LAYOUT */
  /* ============================================= */

  sectionHeader("Candidate Information");

  // Info grid layout
  const labelX = LEFT_MARGIN;
  const valueX = LEFT_MARGIN + 90;

  const infoRow = (label: string, value: string, size = 10) => {
    ensureSpace(20);
    page.drawText(label + ":", {
      x: labelX,
      y,
      size: 9,
      font: roboto,
      color: TEXT_GRAY,
    });
    page.drawText(value, {
      x: valueX,
      y,
      size,
      font: roboto,
      color: TEXT_DARK,
    });
    y -= 18;
  };

  infoRow("Full Name", name, 11);
  infoRow("Email Address", email, 10);
  infoRow(
    "Test Date",
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    10
  );

  y -= 10;

  /* ============================================= */
  /* PERFORMANCE SUMMARY - IMPROVED BOXES */
  /* ============================================= */

  sectionHeader("Performance Summary");

  const boxHeight = 65;
  const boxGap = 12;
  const boxWidth = (CONTENT_WIDTH - boxGap * 3) / 4;

  // Total words - featured box with gradient effect
  page.drawRectangle({
    x: LEFT_MARGIN,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: PRIMARY_BLUE,
  });

  // Gold accent line on top
  page.drawRectangle({
    x: LEFT_MARGIN,
    y: y - 3,
    width: boxWidth,
    height: 3,
    color: ACCENT_GOLD,
  });

  page.drawText("TOTAL", {
    x: LEFT_MARGIN + (boxWidth - roboto.widthOfTextAtSize("TOTAL", 9)) / 2,
    y: y - 22,
    size: 9,
    font: roboto,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText("WORDS", {
    x: LEFT_MARGIN + (boxWidth - roboto.widthOfTextAtSize("WORDS", 9)) / 2,
    y: y - 34,
    size: 9,
    font: roboto,
    color: rgb(0.8, 0.8, 0.8),
  });

  const totalStr = stats.totalWords.toString();
  page.drawText(totalStr, {
    x: LEFT_MARGIN + (boxWidth - roboto.widthOfTextAtSize(totalStr, 20)) / 2,
    y: y - 57,
    size: 20,
    font: roboto,
    color: rgb(1, 1, 1),
  });

  // Part boxes
  const parts = [
    { label: "PART 1", value: stats.part1, x: LEFT_MARGIN + boxWidth + boxGap },
    {
      label: "PART 2",
      value: stats.part2,
      x: LEFT_MARGIN + (boxWidth + boxGap) * 2,
    },
    {
      label: "PART 3",
      value: stats.part3,
      x: LEFT_MARGIN + (boxWidth + boxGap) * 3,
    },
  ];

  for (const part of parts) {
    page.drawRectangle({
      x: part.x,
      y: y - boxHeight,
      width: boxWidth,
      height: boxHeight,
      color: rgb(1, 1, 1),
      borderColor: BORDER_LIGHT,
      borderWidth: 1,
    });

    page.drawText(part.label, {
      x: part.x + (boxWidth - roboto.widthOfTextAtSize(part.label, 9)) / 2,
      y: y - 22,
      size: 9,
      font: roboto,
      color: TEXT_GRAY,
    });

    page.drawText("words", {
      x: part.x + (boxWidth - roboto.widthOfTextAtSize("words", 8)) / 2,
      y: y - 34,
      size: 8,
      font: roboto,
      color: TEXT_GRAY,
    });

    const valStr = part.value.toString();
    page.drawText(valStr, {
      x: part.x + (boxWidth - roboto.widthOfTextAtSize(valStr, 18)) / 2,
      y: y - 56,
      size: 18,
      font: roboto,
      color: PRIMARY_BLUE,
    });
  }

  y -= boxHeight + 25;

  /* ============================================= */
  /* TRANSCRIPTS - CLEANER FORMAT */
  /* ============================================= */

  sectionHeader("Full Transcript");

  const transcriptPart = (partNum: string, title: string, text: string) => {
    ensureSpace(60);

    // Part header with background
    page.drawRectangle({
      x: LEFT_MARGIN - 5,
      y: y - 18,
      width: CONTENT_WIDTH + 10,
      height: 22,
      color: LIGHT_BLUE,
    });

    page.drawText(`Part ${partNum}:`, {
      x: LEFT_MARGIN,
      y: y - 13,
      size: 10,
      font: roboto,
      color: PRIMARY_BLUE,
    });

    page.drawText(title, {
      x: LEFT_MARGIN + 45,
      y: y - 13,
      size: 10,
      font: roboto,
      color: PRIMARY_BLUE,
    });

    y -= 28;
    write(
      text || "No transcript available.",
      9.5,
      TEXT_DARK,
      CONTENT_WIDTH,
      1.6
    );
    y -= 8;
  };

  transcriptPart("1", "Introduction and Interview", transcriptsByPart.part1);
  transcriptPart("2", "Individual Long Turn", transcriptsByPart.part2);
  transcriptPart("3", "Two-way Discussion", transcriptsByPart.part3);

  y -= 5;

  /* ============================================= */
  /* EXAMINER FEEDBACK - STRUCTURED */
  /* ============================================= */

  ensureSpace(100);
  sectionHeader("Examiner Feedback & Assessment");

  // Parse and structure the feedback
  const feedbackSections = parseFeedbackToSections(analysis);

  for (const section of feedbackSections) {
    if (section.isNumbered) {
      // Numbered section with highlight
      page.drawRectangle({
        x: LEFT_MARGIN - 5,
        y: y - 16,
        width: 20,
        height: 20,
        color: PRIMARY_BLUE,
      });
      page.drawText(section.number, {
        x: LEFT_MARGIN + 2,
        y: y - 11,
        size: 11,
        font: roboto,
        color: rgb(1, 1, 1),
      });

      page.drawText(section.title, {
        x: LEFT_MARGIN + 22,
        y: y - 11,
        size: 10,
        font: roboto,
        color: DARK_BLUE,
      });

      y -= 26;
    }

    ensureSpace(5);

    write(section.content || "", 9.5, TEXT_DARK, CONTENT_WIDTH, 1.65);
    y -= 10;
  }

  /* ============================================= */
  /* FOOTER */
  /* ============================================= */

  ensureSpace(80);

  page.drawLine({
    start: { x: LEFT_MARGIN, y: 55 },
    end: { x: RIGHT_MARGIN, y: 55 },
    thickness: 0.5,
    color: BORDER_LIGHT,
  });

  page.drawText("WeWIN HTO IELTS Analyzer", {
    x: LEFT_MARGIN,
    y: 38,
    size: 8,
    font: roboto,
    color: TEXT_GRAY,
  });

  page.drawText(
    `Report generated: ${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    {
      x: RIGHT_MARGIN - 130,
      y: 38,
      size: 8,
      font: roboto,
      color: TEXT_GRAY,
    }
  );

  page.drawText("For educational and practice purposes only", {
    x: LEFT_MARGIN,
    y: 25,
    size: 7,
    font: roboto,
    color: rgb(0.6, 0.6, 0.6),
  });

  return pdf.save();
}

/* ----------------------------------------------------- */
/* HELPER: Parse GPT feedback into structured sections */
function parseFeedbackToSections(analysis: string): Array<{
  number: string;
  title: string;
  content: string;
  isNumbered: boolean;
}> {
  const sections: Array<{
    number: string;
    title: string;
    content: string;
    isNumbered: boolean;
  }> = [];

  // Split by numbered sections (1., 2., 3., etc.)
  const parts = analysis.split(/(?=\d+\.\s+)/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if it starts with a number
    const match = trimmed.match(/^(\d+)\.\s*([^:：\n]+)[:：]?\s*([\s\S]*)/);

    if (match) {
      const [, num, title, content] = match;
      sections.push({
        number: num,
        title: title.trim(),
        content: content.trim(),
        isNumbered: true,
      });
    } else {
      // General content without numbering
      sections.push({
        number: "",
        title: "",
        content: trimmed,
        isNumbered: false,
      });
    }
  }

  return sections;
}
/* ----------------------------------------------------- */
/* Upload to Drive */
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
  const delimiter = `\r\n--${boundary}\r\n`;
  const close = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(delimiter + "Content-Type: application/json\r\n\r\n"),
    Buffer.from(JSON.stringify(metadata)),
    Buffer.from(delimiter + "Content-Type: application/pdf\r\n\r\n"),
    Buffer.from(pdfBytes),
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
      body,
    }
  );

  if (!res.ok) throw new Error(await res.text());

  const json = await res.json();
  return `https://drive.google.com/file/d/${json.id}/view`;
}

/* ----------------------------------------------------- */
/* UPDATE FINAL_LIST */
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

  const json = await res.json();
  const rows: string[][] = json.values || [];

  console.log("📄 Existing rows:", rows.length);

  // ---- 1. Find by EMAIL first ----
  let rowIndex = rows.findIndex((r) => r[2] === email);

  // ---- 2. If email not found → find by UUID ----
  if (rowIndex === -1) {
    rowIndex = rows.findIndex((r) => r[0] === uuid);
  }

  // ==================================================
  // UPDATE EXISTING ROW
  // ==================================================
  if (rowIndex !== -1) {
    const sheetRow = rowIndex + 2; // offset because data starts at row 2

    console.log(`✏️ Updating row ${sheetRow}`);

    const updateRes = await fetch(
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

    if (!updateRes.ok) {
      console.error("❌ Failed to update, trying append instead...");
    } else {
      console.log("✅ Final_list updated successfully!");
      return;
    }
  }

  // ==================================================
  // APPEND NEW ROW
  // ==================================================
  console.log("➕ Appending new row...");

  const appendRes = await fetch(
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

  if (!appendRes.ok) {
    console.error("❌ Append error:", await appendRes.text());
    throw new Error("Cannot append row");
  }

  console.log("✅ Row appended with PDF link!");
}

/* ----------------------------------------------------- */
/* MAIN HANDLER */
export async function POST(req: Request) {
  try {
    // 🔐 EMAIL LẤY TỪ GOOGLE LOGIN
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // const userEmail = session.user.email;

    const body = (await req.json()) as SpeakingReportRequest;
    const { accessToken, sheetId, uuid, student, questions, audios } = body;

    const finalEmail = student.email; // override email học viên bằng email đăng nhập
    const { report } = body;

    /* TRANSCRIBE */
    const transcripts: Record<string, string> = {};
    for (const { part, link } of audios) {
      const id = extractFileId(link);
      if (!id) continue;
      const audio = await downloadAudioFromDrive(accessToken, id);
      transcripts[`part${part}` as PartKey] =
        (await transcribeWithWhisper(audio)) || "";
    }

    const fullTranscript = Object.values(transcripts).join("\n\n");
    if (!fullTranscript.trim()) {
      transcripts["part1"] = transcripts["part1"] || "(No answer)";
      transcripts["part2"] = transcripts["part2"] || "(No answer)";
      transcripts["part3"] = transcripts["part3"] || "(No answer)";
    }

    /* GPT FEEDBACK */
    const analysis = await analyzeWithGPT({
      name: student.name,
      email: finalEmail,
      transcript: fullTranscript,
      questionsText: `
        Part 1: ${questions.part1}
        Part 2: ${questions.part2}
        Part 3: ${questions.part3}
      `.trim(),
    });

    /* WORD COUNT */
    const stats: Stats = { totalWords: 0, part1: 0, part2: 0, part3: 0 };
    for (const p of [1, 2, 3] as const) {
      const key: PartKey = `part${p}`;
      const text = transcripts[key] || "";
      const count = text
        ? text.split(/\s+/).filter((w) => /\w+/.test(w)).length
        : 0;
      stats[key] = count;
      stats.totalWords += count;
    }

    /* GENERATE PDF */
    const pdfBytes = await createPdfBuffer({
      uuid,
      name: student.name,
      email: finalEmail,
      transcriptsByPart: transcripts,
      analysis,
      stats,
    });

    /* UPLOAD & UPDATE SHEET */
    const fileName = `IELTS_Speaking_Report_${student.name}.pdf`;
    const pdfLink = await uploadPdfToDrive(
      accessToken,
      DRIVE_FOLDER_ID,
      fileName,
      pdfBytes
    );

    await updateFinalList({
      accessToken,
      sheetId,
      uuid,
      name: student.name,
      email: finalEmail,
      pdfLink,
    });

    const numerologyHTML = await analyzeNumerologyHTML(
      student.name,
      student.birthDate
    );

    const emailHTML = buildIELTSEmailHTML({
      fullName: student.name,
      email: student.email,
      timestamp: report.timestamp,
      gradingResult: report.gradingResult, // 🟦 wrongAnswers nẳm trong này
      writingScore: report.writingScore,
      writingAnswer: report.writingAnswer,
      grammarReadingBand: report.grammarReadingBand,
      writingBand: report.writingBand,
      overallBand: report.overallBand,
      numerologyHTML,
      pdfUrl: pdfLink,
    });

    for (const email of adminEmails) {
      await sendEmailWithPDF({
        accessToken,
        to: email,
        subject: `IELTS Full Assessment Report - ${student.name}`,
        html: emailHTML,
        pdfBuffer: Buffer.from(pdfBytes),
        pdfName: `IELTS_Speaking_Report_${student.name}.pdf`,
      });
    }

    // await sendEmailWithPDF({
    //   accessToken,
    //   to: "vipkenly1@gmail.com",
    //   subject: `IELTS Full Assessment Report - ${student.name}`,
    //   html: emailHTML,
    //   pdfBuffer: Buffer.from(pdfBytes), // ⭐ PDF gửi theo dạng Buffer
    //   pdfName: `IELTS_Speaking_Report_${student.name}.pdf`, // ⭐ Tên file PDF
    // });

    return NextResponse.json({ success: true, pdfLink });
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ----------------------------------------------------- */
function mimeToExt(mime: string): string {
  if (mime.includes("wav")) return ".wav";
  if (mime.includes("mpeg")) return ".mp3";
  if (mime.includes("mp4")) return ".m4a";
  if (mime.includes("webm")) return ".webm";
  if (mime.includes("ogg")) return ".ogg";
  return ".wav";
}
