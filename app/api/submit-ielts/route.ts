import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { gradeIelts } from "@/app/components/gradeIELTS";
import { evaluateWriting } from "../generate-ielts/route";

import {
  appendFinalList,
  appendGrammarList,
  fetchAnswersFromSheet,
} from "@/app/components/googleSheets";

import { uploadPDFToDrive } from "@/app/components/googleDrive";
import { sendEmailWithPDF } from "@/app/components/sendMail";
import { formatTimestamp } from "@/app/utils/format";
import { generateReportPDF } from "@/app/components/pdf";

export const runtime = "nodejs";

// Folder report PDF

export async function POST(req: Request) {
  try {
    // ---------------------------------------------------
    // 0. ĐỌC BODY AN TOÀN
    // ---------------------------------------------------
    const bodyText = await req.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (err) {
      console.error("❌ JSON PARSE ERROR:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON from client" },
        { status: 400 }
      );
    }

    const { accessToken, sheetId, uuid, data } = body;

    // Validate required fields
    if (!accessToken || !sheetId || !data) {
      return NextResponse.json(
        { error: "Missing required fields: accessToken, sheetId, or data" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 1. TÁCH BIẾN
    // ---------------------------------------------------
    const {
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
      grammar,
      reading,
      writingAnswer,
    } = data;

    // ---------------------------------------------------
    // 2. FIX READING ARRAY
    // ---------------------------------------------------
    const readingArr = Array.isArray(reading)
      ? reading
      : Object.values(reading || {});

    // ---------------------------------------------------
    // 3. APPEND GRAMMAR LIST
    // ---------------------------------------------------
    const id = uuid || randomUUID();
    const finishTime = formatTimestamp();

    console.log("📝 Appending grammar list...");
    await appendGrammarList({
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
      reading: readingArr,
      writingAnswer,
    });

    // ---------------------------------------------------
    // 4. CHẤM GRAMMAR + READING
    // ---------------------------------------------------
    console.log("📊 Fetching answer key...");
    const answerKey = await fetchAnswersFromSheet(accessToken, sheetId);
    const score = gradeIelts([...grammar, ...readingArr], answerKey).totalScore;
    console.log("✅ Score calculated:", score);

    // ---------------------------------------------------
    // 5. CHẤM WRITING (GPT) - FIX JSON PARSING
    // ---------------------------------------------------
    console.log("✍️ Evaluating writing...");
    let writingFeedback;
    try {
      const writingResult = await evaluateWriting(writingAnswer);
      
      // Check if result is already an object or needs parsing
      if (typeof writingResult === 'string') {
        // Try to parse if it's a JSON string
        try {
          writingFeedback = JSON.parse(writingResult);
        } catch (parseErr) {
          console.error("⚠️ Writing evaluation returned non-JSON text:", writingResult.substring(0, 100));
          // Use the text as-is if it can't be parsed
          writingFeedback = {
            score: 0,
            feedback: writingResult,
            error: "Writing evaluation returned plain text instead of JSON"
          };
        }
      } else {
        writingFeedback = writingResult;
      }
      console.log("✅ Writing feedback received");
    } catch (writingError: any) {
      console.error("❌ Writing evaluation error:", writingError);
      writingFeedback = {
        score: 0,
        feedback: "Error evaluating writing",
        error: writingError.message
      };
    }

    // ---------------------------------------------------
    // 6-8. PDF GENERATION (COMMENTED OUT FOR NOW)
    // ---------------------------------------------------
    // Uncomment when PDF generation is fixed
    // const pdfUint8 = await generateReportPDF({
    //   name: fullName,
    //   email,
    //   writing: writingFeedback,
    //   speaking: null,
    //   transcript: "",
    // });
    // const pdfBuffer = Buffer.from(pdfUint8);
    // const pdfUrl = await uploadPDFToDrive(
    //   accessToken,
    //   pdfBuffer,
    //   `${fullName}.pdf`,
    //   DRIVE_FOLDER_ID
    // );

    // ---------------------------------------------------
    // 9. GỬI EMAIL
    // ---------------------------------------------------
    console.log("📧 Sending email...");
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendEmailWithPDF({
        accessToken,
        to: "vipkenly1@gmail.com",
        subject: "IELTS Test Report – WeWIN HTO",
        html: `
          <h2>Chào ${fullName},</h2>
          <p>Bạn đã hoàn thành bài thi IELTS.</p>
          <p><b>Điểm Grammar + Reading:</b> ${score}</p>
          <p>Phần Writing sẽ được chấm chi tiết và gửi đến bạn sau.</p>
          <p>Phần Speaking sẽ được chấm sau khi bạn hoàn thành Speaking.</p>
        `,
      });
      console.log("✅ Email sent successfully");
      emailSent = true;
    } catch (err: any) {
      console.error("⚠️ Email sending failed:", err);
      console.error("⚠️ Error details:", JSON.stringify(err, null, 2));
      emailError = err.message || "Unknown email error";
      // Check if this is the OAuth error
      if (err.message?.includes("API keys are not supported")) {
        console.error("🔴 OAuth Token Issue: You're passing an API key instead of OAuth2 access token");
      }
    }

    // ---------------------------------------------------
    // 10. LƯU FINAL LIST
    // ---------------------------------------------------
    console.log("💾 Appending final list...");
    try {
      await appendFinalList({
        accessToken,
        sheetId,
        id,
        name: fullName,
        email,
        score,
        // pdfUrl: pdfUrl || "",
      });
      console.log("✅ Final list updated");
    } catch (finalListError: any) {
      console.error("⚠️ Final list update failed:", finalListError.message);
      // Don't fail the entire request
    }

    // ---------------------------------------------------
    // 11. DONE - ALWAYS RETURN JSON
    // ---------------------------------------------------
    return NextResponse.json({
      success: true,
      score,
      writingFeedback,
      id,
      emailSent,
      emailError,
      // pdfUrl: pdfUrl || null,
    });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    
    // CRITICAL: Always return JSON, never plain text
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Unknown server error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}