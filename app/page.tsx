"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="font-[Lexend] bg-[#f5f8fc] min-h-screen text-[#1a1a1a]">
      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold text-[#0E4BA9]"
          >
            Welcome to WeWIN Education & HTO
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-lg md:text-xl mt-6 text-gray-600 max-w-2xl mx-auto"
          >
            Nền tảng giáo dục đa hệ sinh thái – nơi học tập, công nghệ và trải
            nghiệm hội tụ để tạo ra hành trình phát triển toàn diện cho trẻ em,
            học sinh và người lớn.
          </motion.p>

          <motion.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="inline-block mt-10 px-10 py-4 rounded-xl text-white font-semibold 
              bg-gradient-to-r from-[#0E4BA9] to-[#00a6fb] shadow-lg hover:scale-105 transition"
          >
            Khám phá hệ sinh thái
          </motion.a>
        </div>
      </section>

      {/* =========================
          ABOUT SECTION
      ========================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#0E4BA9] text-center">
            Giới thiệu tổng quan
          </h2>

          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mt-6 leading-relaxed">
            WeWIN Education và HTO (Holistic Talent Orientation) cùng tạo nên
            một hệ sinh thái giáo dục toàn diện, bao gồm học tập, trải nghiệm,
            đánh giá năng lực, và định hướng nghề nghiệp dành cho mọi lứa tuổi.
            Chúng tôi giúp học viên phát triển kỹ năng thật – đáp ứng nhu cầu
            học tập hiện đại.
          </p>
        </div>
      </section>

      {/* =========================
          BRAND CARDS
      ========================== */}
      <section id="brands" className="py-24 bg-[#f5f8fc]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-[#0E4BA9]">
            Hệ sinh thái WeWIN – HTO
          </h2>

          <div className="grid md:grid-cols-2 gap-10 mt-14">
            {/* WeWIN Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-[#e8eef5]"
            >
              <h3 className="text-3xl font-bold text-[#0E4BA9]">
                WeWIN Education
              </h3>
              <p className="text-gray-700 mt-4 leading-relaxed">
                Nền tảng giáo dục sáng tạo dành cho trẻ em và học sinh với các
                chương trình học hiện đại: học tiếng Anh, học kỹ năng, dự án
                thực tế, tài nguyên học tập, hệ thống thi IELTS, và nhiều tiện
                ích khác.
              </p>

              <a
                href="/"
                className="inline-block mt-6 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#0E4BA9] to-[#00a6fb] font-medium shadow hover:scale-105 transition"
              >
                Xem chi tiết
              </a>
            </motion.div>

            {/* HTO Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-[#e8eef5]"
            >
              <h3 className="text-3xl font-bold text-[#E4A13E]">HTO</h3>
              <p className="text-gray-700 mt-4 leading-relaxed">
                HTO (Holistic Talent Orientation) là hệ thống định hướng tài
                năng toàn diện, giúp học viên phát hiện điểm mạnh, phát triển
                kỹ năng cốt lõi, lựa chọn nghề nghiệp phù hợp, và xây dựng lộ
                trình học tập hiệu quả.
              </p>

              <a
                href="/"
                className="inline-block mt-6 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#E4C28E] to-[#FFB94D] font-medium shadow hover:scale-105 transition"
              >
                Xem chi tiết
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} WeWIN Education & HTO – All rights reserved.
      </footer>
    </div>
  );
}
