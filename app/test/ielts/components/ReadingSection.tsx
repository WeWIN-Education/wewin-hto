"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ReadingSectionProps {
  onNext?: () => void;
}

export default function ReadingSection({ onNext }: ReadingSectionProps) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const handleChange = (id: number, value: string) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    const empty = Object.keys(answers).length < 4;
    if (empty) return alert("⚠️ Vui lòng điền tất cả các câu trả lời!");
    alert("✅ Bài Reading đã được lưu!");
    if (onNext) onNext(); // ✅ Gọi sang Writing
  };

  return (
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
          The invention of rockets is linked inextricably with the invention of
          'black powder'. Most historians of technology credit the Chinese with
          its discovery. They base their belief on studies of Chinese writings
          or on the notebooks of early Europeans who visited China. It is
          probable that sometime in the tenth century, black powder was first
          compounded from its basic ingredients of saltpetre, charcoal, and
          sulphur. This does not mean that it was immediately used to propel
          rockets. By the thirteenth century, powder-propelled fire arrows had
          become rather common. The Chinese relied on this technological
          development to produce incendiary projectiles of many sorts, explosive
          grenades, and possibly cannons to repel their enemies. One such weapon
          was the 'basket of fire' or, directly translated, the 'arrows like
          flying leopards'. The 0.7-metre-long arrows, each with a long tube of
          gunpowder attached near the point, could be fired from a large
          octagonal-shaped basket. Another weapon was the 'arrow as a flying
          sabre', fired from crossbows. The rocket, placed in a similar position
          to other rocket-propelled arrows, was designed to increase the range.
          It was not until the eighteenth century that Europe became seriously
          interested in using rockets as weapons of war and not just in
          pyrotechnics. The Indian rockets used against the British were
          described as 'an iron envelope about 200 millimetres long and 40
          millimetres in diameter with sharp points at the top and a 3m-long
          bamboo guiding stick'. The British later developed their own version,
          while the Americans in the nineteenth century used rockets in battle
          against Mexico.
        </p>

        <p className="mt-4 italic text-gray-600">
          *Read the passage carefully and answer the questions below.*
        </p>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
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
              placeholder="Nhập câu trả lời của bạn..."
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
          *Hãy chắc chắn rằng bạn đã trả lời tất cả các câu hỏi trước khi nộp.
        </p>
      </div>
    </div>
  );
}
