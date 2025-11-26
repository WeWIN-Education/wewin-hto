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
            WeWIN Education & HT OCEAN GROUP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-lg md:text-xl mt-6 text-gray-600 max-w-2xl mx-auto"
          >
            Hệ sinh thái giáo dục – công nghệ – trải nghiệm được xây dựng bởi 
            WeWIN Education và HT OCEAN Group nhằm tạo ra hành trình học tập hiện đại, 
            thực tiễn và toàn diện cho thế hệ trẻ Việt Nam.
          </motion.p>

          <motion.a
            href="#ecosystem"
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
            Tầm nhìn & Sứ mệnh
          </h2>

          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mt-6 leading-relaxed">
            Với định hướng đổi mới giáo dục và ứng dụng công nghệ, 
            WeWIN Education kết hợp cùng HT OCEAN Group tạo ra các chương trình học, 
            hệ thống đánh giá, nền tảng số và dự án trải nghiệm mang tính thực tiễn cao.  
            Mục tiêu của chúng tôi: giúp học sinh phát triển kỹ năng thật, 
            tư duy sáng tạo, và xây dựng nền tảng vững chắc cho tương lai.
          </p>
        </div>
      </section>

      {/* =========================
          ECOSYSTEM CARDS
      ========================== */}
      <section id="ecosystem" className="py-24 bg-[#f5f8fc]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-[#0E4BA9]">
            Hệ sinh thái WeWIN – HT OCEAN GROUP
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
                Tổ chức giáo dục tiên phong trong giảng dạy kỹ năng, tiếng Anh, 
                tư duy công nghệ và các chương trình trải nghiệm.  
                WeWIN cung cấp hệ thống học liệu, bài giảng, kiểm tra, đánh giá, 
                và các dự án học tập dành cho trẻ em và học sinh.
              </p>

              <a
                href="https://wewin.edu.vn"
                className="inline-block mt-6 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#0E4BA9] to-[#00a6fb] font-medium shadow hover:scale-105 transition"
              >
                Xem chi tiết
              </a>
            </motion.div>

            {/* HT OCEAN Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-[#e8eef5]"
            >
              <h3 className="text-3xl font-bold text-[#2E6F95]">
                HT OCEAN GROUP
              </h3>
              <p className="text-gray-700 mt-4 leading-relaxed">
                HT OCEAN Group là đơn vị phát triển công nghệ – vận hành – đào tạo, 
                cung cấp giải pháp số hóa, hệ thống quản lý, 
                nền tảng học tập trực tuyến, và hỗ trợ triển khai chương trình giáo dục 
                trên quy mô lớn cho các đối tác và trường học.
              </p>

              <a
                href="https://htogroup.com.vn"
                className="inline-block mt-6 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#2E6F95] to-[#59A8D9] font-medium shadow hover:scale-105 transition"
              >
                Xem chi tiết
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
