import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const accessToken = formData.get("accessToken") as string;
    const folderId = formData.get("folderId") as string;

    if (!file || !accessToken) {
      return NextResponse.json(
        { error: "Thiếu file hoặc accessToken" },
        { status: 400 }
      );
    }

    // ⭐ Luôn là WAV từ Recorder.js
    const cleanMime = "audio/wav";
    const ext = "wav";

    const metadata = {
      name: `IELTS_${Date.now()}.${ext}`,
      mimeType: cleanMime,
      parents: [folderId],
    };

    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const body = Buffer.concat([
      Buffer.from(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
          metadata
        )}`
      ),
      Buffer.from(`${delimiter}Content-Type: ${cleanMime}\r\n\r\n`, "utf8"),
      fileBuffer,
      Buffer.from(close_delim),
    ]);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
