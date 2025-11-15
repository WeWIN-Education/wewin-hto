"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { grammarQuestions } from "@/app/constants/grammar";
import Notification from "@/app/components/notification";

/* ========================================================= */
/* 🔹 Grammar Section — 3 câu mỗi trang                      */
/* ========================================================= */
interface GrammarSectionProps {
  onNext: () => void;
}

export default function GrammarSection({ onNext }: GrammarSectionProps) {
  const QUESTIONS_PER_PAGE = 3;

  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "info" | "success" | "error";
  }>({ visible: false, message: "", type: "info" });

  const startIndex = page * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = grammarQuestions.slice(startIndex, endIndex);

  const totalPages = Math.ceil(grammarQuestions.length / QUESTIONS_PER_PAGE);

  const showNotification = (
    message: string,
    type: "info" | "success" | "error"
  ) => {
    setNotification({ visible: true, message, type });
  };

  const handleNext = () => {
    const isLastPage = page === totalPages - 1;

    if (isLastPage) {
      localStorage.setItem("ielts_grammar", JSON.stringify(answers));
      showNotification(
        "✅ Hoàn thành phần Grammar! Chuyển sang phần Reading...",
        "success"
      );
      setTimeout(onNext, 2000);
    } else {
      setPage(page + 1);
    }
  };

  return (
    <>
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onClose={() => setNotification((p) => ({ ...p, visible: false }))}
      />

      <div className="min-h-[calc(80vh-60px)] flex flex-col justify-center items-center bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl w-full bg-white border border-[#B8D7F9]/60 rounded-3xl p-10 shadow-[0_8px_30px_rgba(14,75,169,0.1)] flex flex-col justify-between"
        >
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#0E4BA9] mb-4 text-center">
              🧠 Grammar Section — WeWIN HTO
            </h1>

            <p className="text-gray-600 text-center mb-6">
              Trang {page + 1} / {totalPages}
            </p>

            {/* ===================== */}
            {/* 🔥 HIỂN THỊ 3 CÂU     */}
            {/* ===================== */}
            <div className="flex flex-col gap-8">
              {currentQuestions.map((q) => (
                <div key={q.id} className="space-y-3 border-b pb-5">
                  <p className="font-semibold text-[#0E4BA9] leading-relaxed">
                    {q.id}. {q.question}
                  </p>

                  <div className="flex flex-col gap-3 mt-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 border rounded-xl px-4 py-2 cursor-pointer transition-all ${
                          answers[q.id] === opt
                            ? "border-[#0E4BA9] bg-[#EAF4FF]"
                            : "border-[#B8D7F9]/50 bg-[#F7FAFF] hover:border-[#0E4BA9]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className="accent-[#0E4BA9]"
                        />
                        <span className="text-[#0E4BA9] font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===================== */}
          {/* 🔘 NAVIGATION BUTTONS */}
          {/* ===================== */}
          <div className="flex justify-between items-center mt-10 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-md whitespace-nowrap ${
                page === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-[#0185b9] to-[#0E4BA9]"
              }`}
            >
              ◀ Trở lại
            </motion.button>

            <div className="flex-1" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-semibold text-sm shadow-md whitespace-nowrap"
            >
              {page === totalPages - 1 ? "Hoàn thành" : "Tiếp theo ▶"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
