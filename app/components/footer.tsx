"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function Footer() {
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bottom = document.body.scrollHeight;
      if (scrollPosition >= bottom - 100) {
        controls.start({ opacity: 1, y: 0 });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-linear-to-br from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] text-white relative mt-20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,224,138,0.08),transparent_50%)]"></div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center w-[420px] h-[140px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex">
              <div className="w-1/2 bg-linear-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9]" />
              <div className="w-1/2 bg-linear-to-br from-[#1E5FBF] via-[#0E4BA9] to-[#0A3A7F]" />
            </div>

            <div className="absolute left-1/2 top-0 w-[3px] h-full bg-linear-to-b from-transparent via-[#FFE08A] to-transparent blur-sm" />

            <div className="relative flex w-full h-full z-10">
              <div className="w-1/2 flex items-center justify-center">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  src="/HT Group Transparent.png"
                  alt="HT Group"
                  className="h-[85px] w-[85px] object-contain"
                />
              </div>
              <div className="w-1/2 flex items-center justify-center">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  src="/logo.png"
                  alt="WeWIN Logo"
                  className="h-[95px] w-[95px] object-contain drop-shadow-[0_12px_24px_rgba(255,179,0,0.4)]"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Brand Info */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#FFE08A] mb-1 tracking-wide">
            WeWIN Education
          </h2>
          <p className="text-sm opacity-90">Nâng tầm tiếng Anh – Mở rộng tương lai 🌏</p>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto mb-8 justify-center">
          {/* Liên hệ */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 lg:flex-1">
            <h3 className="text-base font-semibold text-[#FFE08A] mb-3 uppercase tracking-wider flex items-center gap-2">
              📍 Liên hệ
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>292B Nơ Trang Long, phường, Bình Thạnh, TP.HCM</li>
              <li>☎️ <a href="tel:0345969388">0345 969 388</a></li>
              <li>✉️ <a href="mailto:officemanager@wewin.edu.vn">officemanager@wewin.edu.vn</a></li>
            </ul>
          </div>

          {/* Kết nối */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 lg:flex-1">
            <h3 className="text-base font-semibold text-[#FFE08A] mb-3 uppercase tracking-wider flex items-center gap-2">
              🌐 Kết nối với chúng tôi
            </h3>

            <div className="flex flex-wrap gap-4 justify-start">
              <SocialButton href="https://wewin.edu.vn" icon="https://img.icons8.com/fluency/48/domain.png" />
              <SocialButton href="https://www.facebook.com/winwineducation" icon="https://img.icons8.com/color/48/facebook-new.png" />
              <SocialButton href="https://www.tiktok.com/@wewin.education.vn" icon="https://img.icons8.com/color/48/tiktok--v1.png" />
              <SocialButton href="https://www.youtube.com/@wewin.education" icon="https://img.icons8.com/color/48/youtube-play.png" />
              <SocialButton href="mailto:officemanager@wewin.edu.vn" icon="https://img.icons8.com/color/48/gmail--v1.png" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-linear-to-br from-[#0E4BA9] to-[#00A6FB] px-3 text-[#FFE08A]">⭐</span>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm opacity-80">
          © {new Date().getFullYear()} <span className="font-semibold text-[#FFE08A]">WeWIN HTO</span>. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}

/* Component nhỏ */
function SocialButton({ href, icon }: { href: string; icon: string }) {
  return (
    <motion.a
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#FFE08A] transition-all duration-300 backdrop-blur-sm border border-white/20"
    >
      <img src={icon} alt="icon" className="w-7 h-7" />
    </motion.a>
  );
}
