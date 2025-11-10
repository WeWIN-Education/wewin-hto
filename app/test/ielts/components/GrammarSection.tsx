"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { grammarQuestions } from "@/app/constants/grammar";

// 🔔 Notification Component (nhúng trực tiếp, không cần file riêng)
function Notification({
  message,
  type = "info",
  visible,
  onClose,
}: {
  message: string;
  type?: "info" | "success" | "error";
  visible: boolean;
  onClose: () => void;
}) {
  const bgColors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  // Tự tắt sau 2.5s
  if (visible) setTimeout(onClose, 2500);

  return (
    <div className="fixed top-5 right-5 z-9999">
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-3 text-white ${bgColors[type]} shadow-lg rounded-xl px-5 py-4 w-72`}
        >
          <div className="flex-1 text-sm leading-relaxed">{message}</div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg font-semibold"
          >
            ×
          </button>
        </motion.div>
      )}
    </div>
  );
}

// 🔹 Grammar Section
interface GrammarSectionProps {
  onNext: () => void;
}

export default function GrammarSection({ onNext }: GrammarSectionProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "info" | "success" | "error";
  }>({ visible: false, message: "", type: "info" });

  const question = grammarQuestions[current];

  const showNotification = (message: string, type: "info" | "success" | "error") => {
    setNotification({ visible: true, message, type });
  };

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (!answers[question.id]) {
      showNotification("Vui lòng chọn đáp án trước khi tiếp tục!", "error");
      return;
    }

    if (current < grammarQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem("grammarAnswers", JSON.stringify(answers));
      showNotification("✅ Hoàn thành phần Grammar! Chuyển sang phần Reading...", "success");
      setTimeout(onNext, 2500);
    }
  };

  return (
    <>
      {/* Notification góc phải */}
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
            <h1 className="text-3xl font-bold text-[#0E4BA9] mb-4 text-center">
              🧠 Grammar Section — WeWIN HTO
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Câu {current + 1} / {grammarQuestions.length}
            </p>

            <div className="text-left space-y-4">
              <p className="font-semibold text-[#0E4BA9] leading-relaxed">
                {question.question}
              </p>

              <div className="flex flex-col gap-3 mt-2">
                {question.options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 border rounded-xl px-4 py-2 cursor-pointer transition-all ${
                      answers[question.id] === opt
                        ? "border-[#0E4BA9] bg-[#EAF4FF]"
                        : "border-[#B8D7F9]/50 bg-[#F7FAFF] hover:border-[#0E4BA9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opt}
                      checked={answers[question.id] === opt}
                      onChange={() => handleSelect(opt)}
                      className="accent-[#0E4BA9]"
                    />
                    <span className="text-[#0E4BA9] font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className={`px-6 py-3 rounded-2xl font-semibold text-white shadow-md ${
                current === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-[#B8D7F9] to-[#7FB2F0]"
              }`}
            >
              ◀ Trở lại
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-8 py-3 rounded-2xl bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-bold shadow-md"
            >
              {current === grammarQuestions.length - 1 ? "Hoàn thành" : "Tiếp theo ▶"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
