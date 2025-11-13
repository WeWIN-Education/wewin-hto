// app/lib/googleDrive.ts

export async function uploadPDFToDrive(
  accessToken: string,
  fileBuffer: Buffer,
  fileName: string,
  folderId: string
) {
  const metadata = {
    name: fileName,
    mimeType: "application/pdf",
    parents: [folderId],
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/pdf\r\n\r\n" +
    fileBuffer +
    closeDelim;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ uploadPDFToDrive error:", text);
    throw new Error("Upload PDF failed");
  }

  const json = await res.json();

  // 🔥 Set file public-read
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${json.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    }
  );

  return `https://drive.google.com/file/d/${json.id}/view`;
}
