"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// ⭐ IMPORT Notification + Hook
import Notification from "@/app/components/notification";
import { useNotification } from "@/app/utils/useNotification";

interface ReadingSectionProps {
  onNext?: () => void;
}

export default function ReadingSection({ onNext }: ReadingSectionProps) {
  // ⭐ Hook notification
  const { notify, visible, message, type, close } = useNotification();

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleChange = (id: number, value: string) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    const empty = Object.keys(answers).length < 4;

    if (empty)
      return notify("⚠️ Vui lòng điền tất cả các câu trả lời!", "error");

    localStorage.setItem("ielts_reading", JSON.stringify(answers));
    notify("✅ Bài Reading đã được lưu!", "success");

    setTimeout(() => {
      if (onNext) onNext(); // chuyển sang Writing
    }, 600);
  };

  return (
    <>
      {/* ⭐ GLOBAL Notification */}
      <Notification
        visible={visible}
        message={message}
        type={type}
        onClose={close}
      />

      <div className="min-h-screen bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] px-4 py-10">
        <h1 className="text-4xl font-bold text-[#0E4BA9] mb-6 text-center">
          📖 IELTS Reading Test
        </h1>

        {/* Passage */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-8 text-justify leading-relaxed text-gray-800">
          <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-3">
            The History of Rockets
          </h2>
          <p>
            The invention of rockets is linked inextricably with the invention
            of 'black powder'. Most historians of technology credit the Chinese
            with its discovery. ...
          </p>

          <p className="mt-4 italic text-gray-600">
            *Read the passage carefully and answer the questions below.*
          </p>
        </div>

        {/* Questions */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Câu 15 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-[#B8D7F9]/60"
          >
            <label className="block text-lg font-medium text-[#0E4BA9] mb-3">
              15. First invented or used by{" "}
              <span className="text-red-500">*</span>
            </label>

            {[
              { value: "a", label: "the Chinese" },
              { value: "b", label: "the Indians" },
              { value: "c", label: "the British" },
              { value: "d", label: "the Arabs" },
              { value: "e", label: "the Americans" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 mb-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="q15"
                  value={opt.value}
                  checked={answers[15] === opt.value}
                  onChange={(e) => handleChange(15, e.target.value)}
                  className="w-5 h-5 text-[#0E4BA9] focus:ring-[#0E4BA9]"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </motion.div>

          {/* Câu 16–19 */}
          {[
            { id: 16, question: "black powder" },
            { id: 17, question: "rocket-propelled arrows for fighting" },
            { id: 18, question: "rockets as war weapons" },
            { id: 19, question: "the rocket launcher" },
          ].map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-[#B8D7F9]/60"
            >
              <label className="block text-lg font-medium text-[#0E4BA9] mb-2">
                {q.id}. {q.question} <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#0E4BA9] outline-none text-gray-700"
                required
              />
            </motion.div>
          ))}
        </div>

        {/* Submit button */}
        <div className="text-center mt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="px-10 py-4 bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            ✅ Nộp bài Reading
          </motion.button>

          <p className="text-gray-500 text-sm mt-3">
            *Hãy chắc chắn rằng bạn đã trả lời tất cả trước khi nộp.*
          </p>
        </div>
      </div>
    </>
  );
}
