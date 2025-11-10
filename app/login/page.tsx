"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/test/ielts");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(90vh-80px)]  bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend]">
        <motion.img
          src="/logo.png"
          alt="WeWIN Logo"
          className="w-28 mb-6 drop-shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <p className="text-[#0E4BA9] text-lg font-medium animate-pulse">
          Đang kiểm tra đăng nhập...
        </p>
      </div>
    );
  }

  // 🧭 Giao diện login mặc định (đẹp hơn, to hơn, chuyên nghiệp hơn)
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(90vh-80px)]  bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend]">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white px-16 py-14 rounded-[40px] shadow-2xl text-center w-[460px] border-t-4 border-[#0E4BA9]"
      >
        <motion.img
          src="/logo.png"
          alt="WeWIN Logo"
          className="mx-auto mb-8 w-40 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        />
        <h1 className="text-3xl font-bold text-[#0E4BA9] mb-2">
          Welcome to <span className="text-[#00A6FB]">WeWIN IELTS</span>
        </h1>
        <p className="text-gray-600 mb-10 text-base leading-relaxed">
          Vui lòng đăng nhập bằng tài khoản Google để bắt đầu bài thi{" "}
          <span className="text-xl">🎙️</span>
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white py-4 rounded-full font-medium text-lg shadow-lg hover:brightness-110 transition-all"
        >
          <span className="text-2xl"></span> Đăng nhập bằng Google
        </motion.button>
      </motion.div>

      <p className="text-gray-400 text-sm mt-8">
        © {new Date().getFullYear()} <b>WeWIN Education</b> — All Rights
        Reserved.
      </p>
    </div>
  );
}
