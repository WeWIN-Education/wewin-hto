"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-linear-to-br from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] text-white relative overflow-hidden"
    >
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,224,138,0.08),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-2 py-8 lg:py-8">
        {/* --- Bố cục 3 phần (Desktop) / Compact (Mobile) --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-10 mb-5 text-center lg:text-left">
          {/* 🔹 Logo + WeWIN Info (Compact trên mobile) */}
          <div className="flex flex-col items-center lg:items-start justify-center gap-3 lg:gap-5 items-center justify-center w-full lg:w-1/3">
            {/* 🔥 Card chứa logo mới (1 logo duy nhất) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="
                relative flex items-center justify-center
                w-full max-w-[180px] lg:max-w-[200px]
                h-[80px] lg:h-[80px]            /* 🔥 tăng nhẹ chiều cao để cân đối */
                rounded-3xl 
                overflow-hidden backdrop-blur-sm
                shadow-[0_6px_20px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.15)]
                lg:ml-27
              "
            >
              {/* Gradient nền */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] opacity-90" />

              {/* LOGO CENTER VISUAL PERFECT */}
              <motion.img
                whileHover={{ scale: 1.05 }}
                src="/HTO-WeWIN.png"
                alt="WeWIN Logo"
                className="
                  relative z-10
                  h-[120px] lg:h-[185px]     /* 🔥 logo nhỏ hơn → nằm chính giữa hoàn hảo */
                  w-auto
                  object-contain
                  drop-shadow-[0_6px_14px_rgba(255,179,0,0.5)]
                "
              />
            </motion.div>

            {/* Text */}
            <div className="text-center lg:text-center w-full">
              <h2 className="text-lg lg:text-xl font-bold text-[#E4C28E] mb-1 tracking-wide">
                WeWIN Education
              </h2>
              <p className="text-xs lg:text-sm opacity-90">
                Nâng tầm tiếng Anh – Mở rộng tương lai 🌏
              </p>
            </div>
          </div>

          {/* 🔹 Giữa: Liên hệ (Compact trên mobile) */}
          <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-sm lg:text-base font-semibold text-[#E4C28E] mb-2 lg:mb-3 uppercase tracking-wider flex justify-center lg:justify-start items-center gap-2">
              📍 Liên hệ
            </h3>
            <ul className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm opacity-90">
              <li>292B Nơ Trang Long, P.12, Bình Thạnh, TP.HCM</li>
              <li>
                ☎️{" "}
                <a
                  href="tel:0345969388"
                  className="hover:text-[#E4C28E] transition-colors"
                >
                  0345 969 388
                </a>
              </li>
              <li>
                ✉️{" "}
                <a
                  href="mailto:officemanager@wewin.edu.vn"
                  className="hover:text-[#E4C28E] transition-colors break-all"
                >
                  officemanager@wewin.edu.vn
                </a>
              </li>
            </ul>
          </div>

          {/* 🔹 Phải: Kết nối (Compact trên mobile) */}
          <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-sm lg:text-base font-semibold text-[#E4C28E] mb-2 lg:mb-3 uppercase tracking-wider flex justify-center lg:justify-start items-center gap-2">
              🌐 Kết nối
            </h3>
            <div className="flex flex-wrap gap-2 lg:gap-4 justify-center lg:justify-start">
              <SocialButton
                href="https://wewin.edu.vn"
                icon="https://img.icons8.com/fluency/48/domain.png"
              />
              <SocialButton
                href="https://www.facebook.com/winwineducation"
                icon="https://img.icons8.com/color/48/facebook-new.png"
              />
              <SocialButton
                href="https://www.tiktok.com/@wewin.education.vn"
                icon="https://img.icons8.com/color/48/tiktok--v1.png"
              />
              <SocialButton
                href="https://www.youtube.com/@wewin.education"
                icon="https://img.icons8.com/color/48/youtube-play.png"
              />
              <SocialButton
                href="mailto:officemanager@wewin.edu.vn"
                icon="https://img.icons8.com/color/48/gmail--v1.png"
              />
            </div>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="relative mb-4 lg:mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-linear-to-br from-[#0E4BA9] to-[#00A6FB] px-3 text-[#FFE08A]">
              ⭐
            </span>
          </div>
        </div>

        {/* --- Copyright --- */}
        <p className="text-center text-xs lg:text-sm opacity-80">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-[#E4C28E]">WeWIN HTO</span>. All
          rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}

/* Component nhỏ: Nút mạng xã hội */
function SocialButton({ href, icon }: { href: string; icon: string }) {
  return (
    <motion.a
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-lg lg:rounded-xl flex items-center justify-center hover:bg-[#FFE08A] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
    >
      <img src={icon} alt="icon" className="w-6 h-6 lg:w-7 lg:h-7" />
    </motion.a>
  );
}
