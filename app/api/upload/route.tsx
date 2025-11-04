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

    // ✅ Metadata cho Google Drive
    const metadata = {
      name: `IELTS_${Date.now()}.wav`,
      mimeType: "audio/wav",
      parents: [folderId],
    };

    // ✅ Tạo boundary thủ công
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    // ✅ Convert file Blob thành ArrayBuffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ Kết hợp metadata + file vào body
    const body = Buffer.concat([
      Buffer.from(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
          metadata
        )}`
      ),
      Buffer.from(
        `${delimiter}Content-Type: audio/wav\r\n\r\n`,
        "utf8"
      ),
      fileBuffer,
      Buffer.from(close_delim),
    ]);

    // ✅ Gọi Google Drive API
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

    if (!res.ok) {
      console.error("❌ Upload lỗi:", data);
      throw new Error(data.error?.message || "Upload thất bại");
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ Lỗi Upload:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
