/* ============================================= */
/* EMAIL TEMPLATE - WIDE VERSION (900PX) */
/* ============================================= */

interface EmailTemplateParams {
  fullName: string;
  email: string;
  timestamp: string;
  gradingResult: {
    correctCount: number;
    totalQuestions: number;
    totalScore: number;
    maxScore: number;
    skillStats: Record<
      string,
      { correct: number; totalPoint: number; max: number; q: number }
    >;
    wrongAnswers: Array<{
      q: number;
      correct: string;
      user: string;
      skill: string;
    }>;
  };
  writingScore: {
    overallBand: number;
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    suggestions: string;
  };
  writingAnswer: string;
  grammarReadingBand: number;
  writingBand: number;
  overallBand: number;
  numerologyHTML: string;
  pdfUrl?: string | null;
}

export function buildIELTSEmailHTML(params: EmailTemplateParams): string {
  const {
    fullName,
    timestamp,
    gradingResult,
    writingScore,
    writingAnswer,
    numerologyHTML,
  } = params;

  const BORDER_COLOR = "#E5E7EB";

  const esc = (s: any) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  /* ================= SKILL ROWS =================== */
  const skillStatsRows = Object.entries(gradingResult.skillStats)
    .map(([skill, st], idx) => {
      const isEven = idx % 2 === 1; // hàng chẵn
      return `
        <tr style="
          border-bottom:1px solid ${BORDER_COLOR};
          background:${isEven ? "#f4f8ff" : "#ffffff"};
        ">
          <td style="padding:14px 16px;font-size:15px;">${skill}</td>
          <td style="padding:14px 16px;text-align:center;font-size:15px;">
            ${st.correct}/${st.q}
          </td>
          <td style="padding:14px 16px;text-align:center;font-size:15px;">
            ${st.totalPoint}/${st.max}
          </td>
        </tr>`;
    })
    .join("");

  /* ================= WRONG ANSWERS =================== */
  const wrongRows =
    gradingResult.wrongAnswers.length === 0
      ? `
      <tr>
        <td colspan="4" style="padding:20px;text-align:center;color:#059669;font-size:15px;font-weight:600;">
          🎉 Tuyệt vời! Bạn không sai câu nào.
        </td>
      </tr>`
      : gradingResult.wrongAnswers
          .map((w, idx) => {
            const isEven = (idx + 1) % 2 === 0;

            return `
      <tr style="
        border-bottom:1px solid ${BORDER_COLOR};
        background:${isEven ? "#ffecec" : "#ffffff"};
      ">
        <td style="padding:14px;text-align:center;font-size:15px;font-weight:600;color:#b91c1c;">
          ${w.q}
        </td>
        <td style="padding:14px;text-align:center;font-size:15px;">${esc(
          w.correct
        )}</td>
        <td style="padding:14px;text-align:center;font-size:15px;">${
          w.user || "-"
        }</td>
        <td style="padding:14px;text-align:center;font-size:15px;">${
          w.skill
        }</td>
      </tr>`;
          })
          .join("");

  /* ========================================================= */
  /* ================= RETURN HTML (WIDE FIX APPLIED) ========= */
  /* ========================================================= */

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IELTS Placement Result</title>
    </head>

    <body style="margin:0;padding:0;background:#f2f5fb;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <!-- MAIN WRAPPER (FULL WIDTH LIKE WEBSITE) -->
        <table cellpadding="0" cellspacing="0" style="
          width:100%;
          background:#f2f5fb;
          border-radius:12px;
          overflow:hidden;
          box-shadow:0 6px 20px rgba(0,0,0,0.12);
        ">

          <!-- HEADER BAR -->
          <tr>
            <td style="background:#0E4BA9;padding:24px 40px;color:#E4C28E;">
              <div style="font-size:24px;font-weight:700;">
                KẾT QUẢ KIỂM TRA NĂNG LỰC TIẾNG ANH
              </div>
              <div style="font-size:13px;color:#E4C28E;margin-top:4px;">
                Hệ thống HTO_IELTS Placement Test
              </div>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding:35px;">

              <!-- 2 COLUMN LAYOUT LIKE WEBSITE -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr valign="top">

                  <!-- LEFT PANEL -->
                  <td width="500" style="padding-right:25px;">
                    
                    <!-- INFO CARD -->
                    <div style="
                      border:1px solid #d9e3f0;
                      background:#fafdff;
                      border-radius:10px;
                      padding:20px;
                      margin-bottom:22px;
                    ">
                      <h3 style="margin:0 0 18px 0;color:#0E4BA9;font-size:18px;">
                        🔵 Thông tin bài làm
                      </h3>

                      <div style="font-size:15px;margin-bottom:10px;">
                        <b>Họ và tên:</b><br>${esc(fullName)}
                      </div>

                      <div style="font-size:15px;margin-bottom:10px;">
                        <b>Thời gian nộp bài:</b><br>${timestamp}
                      </div>

                    <!-- SCORE BOXES – WIDE BEAUTIFUL VERSION -->
                   <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <!-- ĐÚNG -->
                        <td style="
                          background:#e7f9ef;
                          border-radius:12px;
                          text-align:center;
                          padding:18px 12px;
                          border:1px solid #b7f2cf;
                        ">
                          <div style="font-size:13px;font-weight:600;color:#0f9d58;margin-bottom:4px;">
                            Đúng
                          </div>
                          <div style="font-size:32px;font-weight:700;color:#0f9d58;line-height:1;">
                            ${gradingResult.correctCount}
                          </div>
                        </td>

                        <td style="width:12px;"></td>

                        <!-- SAI -->
                        <td style="
                          background:#ffecec;
                          border-radius:12px;
                          text-align:center;
                          padding:18px 12px;
                          border:1px solid #f6cccc;
                        ">
                          <div style="font-size:13px;font-weight:600;color:#d93025;margin-bottom:4px;">
                            Sai
                          </div>
                          <div style="font-size:32px;font-weight:700;color:#d93025;line-height:1;">
                            ${
                              gradingResult.totalQuestions -
                              gradingResult.correctCount
                            }
                          </div>
                        </td>

                        <td style="width:12px;"></td>

                        <!-- TỔNG -->
                        <td style="
                          background:#eef4ff;
                          border-radius:12px;
                          text-align:center;
                          padding:18px 12px;
                          border:1px solid #d4e2ff;
                        ">
                          <div style="font-size:13px;font-weight:600;color:#0E4BA9;margin-bottom:4px;">
                            Tổng
                          </div>
                          <div style="font-size:32px;font-weight:700;color:#0E4BA9;line-height:1;">
                            ${gradingResult.totalQuestions}
                          </div>
                        </td>
                      </tr>
                    </table>

                      <!-- TOTAL SCORE -->
                      <div style="
                        margin-top:20px;
                        background:#f3f7ff;
                        padding:16px;text-align:center;
                        border-radius:12px;
                        border:1px solid #d8e2ff;
                        box-shadow:0 2px 5px rgba(0,0,0,0.05);
                      ">
                        <div style="font-size:14px;color:#0E4BA9;font-weight:600;">
                          🌟 Điểm tổng kết
                        </div>

                        <div style="font-size:28px;font-weight:800;color:#0E4BA9;margin-top:6px;">
                          ${gradingResult.totalScore}/${gradingResult.maxScore}
                        </div>
                      </div>
                    </div>

                  </td>

                  <!-- RIGHT PANEL (FULL WIDTH LIKE WEB) -->
                  <td style="padding-left:10px;">

                    <!-- SKILL TABLE -->
                    <h3 style="margin:0 0 10px;color:#0E4BA9;font-size:18px;">
                      📌 Kết quả theo từng kỹ năng
                    </h3>

                    <table width="100%" cellpadding="0" cellspacing="0" style="
                      border:1px solid #d0d7e2;
                      border-radius:10px;
                      overflow:hidden;
                      margin-bottom:25px;
                      font-family:Arial;
                    ">
                      <thead>
                        <tr style="background:#eaf1ff;">
                          <th style="
                            padding:12px;
                            color:#0E4BA9;
                            font-weight:700;
                            font-size:15px;
                            border-right:1px solid #d0d7e2;
                          ">
                            Kỹ năng
                          </th>

                          <th style="
                            padding:12px;
                            color:#0E4BA9;
                            font-weight:700;
                            font-size:15px;
                            border-right:1px solid #d0d7e2;
                            text-align:center;
                          ">
                            Đúng / Tổng
                          </th>

                          <th style="
                            padding:12px;
                            color:#0E4BA9;
                            font-weight:700;
                            font-size:15px;
                            text-align:center;
                          ">
                            Điểm
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        ${skillStatsRows}
                      </tbody>
                    </table>

                    <!-- WRONG ANSWERS TABLE -->
                    <h3 style="margin:0 0 10px;color:#d93025;font-size:18px;">
                      ❌ Danh sách câu sai
                    </h3>

                    <table width="100%" cellpadding="0" cellspacing="0" style="
                      border:1px solid #ffd6d6;
                      border-radius:10px;overflow:hidden;
                      margin-bottom:25px;
                    ">
                      <thead>
                        <tr style="background:#ffeaea;color:#b91c1c;">
                          <th style="padding:12px;">Câu</th>
                          <th style="padding:12px;">Đáp án đúng</th>
                          <th style="padding:12px;">Người trả lời</th>
                          <th style="padding:12px;">Kỹ năng</th>
                        </tr>
                      </thead>
                      <tbody>${wrongRows}</tbody>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- WRITING SECTION – 2 COLUMN LIKE WEBSITE -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;">
                <tr valign="top">

                  <!-- Student writing -->
                  <td width="50%" style="
                    background:#fff;border:1px solid #e0e6f3;
                    border-radius:10px;padding:22px;
                  ">
                    <h3 style="margin-top:0;color:#0E4BA9;font-size:18px;">
                      📝 Bài viết của học viên
                    </h3>

                    <pre style="
                      font-size:15px;
                      white-space:pre-wrap;
                      margin:0;line-height:1.6;
                    ">${esc(writingAnswer)}</pre>
                  </td>

                  <!-- Writing evaluation -->
                  <td width="50%" style="padding-left:20px;">
                    <div style="
                      background:#fff;border:1px solid #e0e6f3;
                      border-radius:10px;padding:22px;
                    ">
                      <h3 style="margin-top:0;color:#0E4BA9;font-size:18px;">
                        ✏️ Đánh giá bài viết (Writing assessment): ${writingScore.overallBand.toFixed(1)} / 9.0
                      </h3>

                      <p><b>Hoàn thành nhiệm vụ (Task Achievement):</b><br>${esc(
                          writingScore.taskAchievement
                        )}</p>

                      <p><b>Tính mạch lạc & liên kết (Coherence & Cohesion):</b><br>${esc(
                          writingScore.coherenceCohesion
                        )}</p>

                      <p><b>Vốn từ vựng (Lexical Resource):</b><br>${esc(
                          writingScore.lexicalResource
                        )}</p>

                      <p><b>Ngữ pháp & độ chính xác (Grammatical Range & Accuracy):</b><br>${esc(
                          writingScore.grammaticalRange
                        )}</p>

                      <div style="
                        background:#ecfdf5;
                        border-left:4px solid #10b981;
                        padding:12px 16px;border-radius:10px;
                      ">
                        <b>Gợi ý cải thiện (Suggestions for Improvement):</b><br>${esc(
                          writingScore.suggestions
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- NUMEROLOGY -->
              <div style="margin-top:35px;">

                <div style="
                  background:#f0fdf4;border:1px solid #bbf7d0;
                  border-radius:10px;padding:22px;font-size:15px;
                ">
                  ${numerologyHTML}
                </div>
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
    </table>

    </body>
    </html>
    `;
}
