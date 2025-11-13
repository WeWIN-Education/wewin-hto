import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

interface ReportData {
  name: string;
  email: string;
  writing: string;
  speaking?: string | null;
  transcript?: string;
}

export async function generateReportPDF({
  name,
  email,
  writing,
  speaking,
  transcript,
}: ReportData) {
  const pdfDoc = await PDFDocument.create();

  // 🔥 Load Roboto (Unicode OK)
  const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
  const fontBytes = fs.readFileSync(fontPath);

  // 🔥 IMPORTANT: Must subset font to support Unicode
  const roboto = await pdfDoc.embedFont(fontBytes, { subset: true });

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  let y = height - 50;

  const write = (text: string, size = 12) => {
    const lines = text.split("\n");
    lines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size,
        font: roboto,
      });
      y -= size + 4;
    });
  };

  write("📘 IELTS TEST REPORT", 20);
  y -= 10;

  write(`Họ tên: ${name}`, 14);
  write(`Email: ${email}`, 14);
  y -= 10;

  write("📄 WRITING FEEDBACK", 16);
  write(writing, 12);

  if (speaking) {
    y -= 20;
    write("🎤 SPEAKING FEEDBACK", 16);
    write(speaking, 12);
  }

  if (transcript) {
    y -= 20;
    write("📝 Transcript", 16);
    write(transcript, 11);
  }

  return await pdfDoc.save();
}
