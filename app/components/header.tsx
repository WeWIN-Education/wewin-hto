"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { handleLogout } from "../api/log-to-sheet/route";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Thay đổi style khi scroll
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <AnimatePresence>
        {showNavbar && (
          <motion.nav
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] transition-all duration-300"
          >
            <div className="max-w-full mx-auto flex items-center justify-between px-6 md:px-10 py-4">
              {/* 🎨 Left: Logos */}
              <motion.div
                className="flex items-center gap-4 shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-cyan-400 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <Image
                    src="/HT Group Transparent.png"
                    alt="HT Group Logo"
                    width={65}
                    height={65}
                    className="relative rounded-full p-2 shadow-lg bg-white transition-all duration-300"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-amber-300 to-yellow-400 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <Image
                    src="/logo.png"
                    alt="WeWIN Logo"
                    width={140}
                    height={140}
                    className="relative rounded-full p-2 shadow-lg bg-white transition-all duration-300"
                  />
                </div>
              </motion.div>

              {/* 🎯 Center Section (Desktop) - Menu đẹp hơn */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-3">
                <Link href="/" className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-10 py-3.5 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg bg-white/25 backdrop-blur-lg border-2 border-white/40"
                    style={{
                      boxShadow:
                        "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    {/* Hiệu ứng gradient động khi hover */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>

                    {/* Border sáng */}
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <span
                      className="relative text-2xl font-bold tracking-wide drop-shadow-lg text-[#E4C28E]"
                      style={{
                        textShadow:
                          "0 2px 10px rgba(0,0,0,0.2), 0 0 20px rgba(228, 194, 142, 0.3)",
                      }}
                    >
                      WeWIN HTO
                    </span>
                  </motion.div>
                </Link>

                {session && (
                  <Link href="/test/ielts" className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 px-7 py-3 rounded-full overflow-hidden transition-all duration-300 bg-white text-[#0E4BA9] shadow-md border-2 border-blue-100"
                      style={{
                        boxShadow:
                          "0 4px 16px rgba(14, 75, 169, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      {/* Hiệu ứng pulse khi hover */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-linear-to-r from-white/30 to-transparent"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Icon với animation */}
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 relative z-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </motion.svg>

                      <span className="font-bold relative z-10 drop-shadow-sm">
                        IELTS Test
                      </span>

                      {/* Shine effect khi hover */}
                      <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                    </motion.div>
                  </Link>
                )}
              </div>

              {/* 👤 Right: User Section (Desktop) */}
              <div className="hidden md:flex items-center gap-4 shrink-0">
                {!session ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signIn("google")}
                    className="group relative px-6 py-2.5 rounded-xl font-semibold overflow-hidden transition-all duration-300 bg-white text-[#0E4BA9] shadow-md"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Đăng nhập Google
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 bg-white/20 backdrop-blur-md text-white border border-white/30">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm">
                        {session.user?.name}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLogout()}
                      className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg bg-[#E4C28E] text-[#0E4BA9] hover:bg-[#cfa86d]"
                    >
                      Đăng xuất
                    </motion.button>
                  </div>
                )}
              </div>

              {/* 🍔 Hamburger Menu (Mobile) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-xl transition-all duration-300 bg-white/20 backdrop-blur-md"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <motion.div
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-0.5 rounded-full bg-white"
                />
                <motion.div
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-0.5 rounded-full my-1.5 bg-white"
                />
                <motion.div
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-0.5 rounded-full bg-white"
                />
              </motion.button>
            </div>

            {/* 📱 Mobile Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="bg-linear-to-b from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] px-6 py-8 space-y-6 border-t border-white/20">
                    {/* Tiêu đề chính */}
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="block text-center"
                      >
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 hover:bg-white/20 transition-all duration-300">
                          <span className="text-2xl font-bold text-[#E4C28E] tracking-wide">
                            WeWIN HTO
                          </span>
                        </div>
                      </Link>
                    </motion.div>

                    {/* Menu con - các trang con */}
                    {session && (
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-3"
                      >
                        <Link
                          href="/test/ielts"
                          onClick={() => setMenuOpen(false)}
                          className="block"
                        >
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-3.5 border border-white/20 hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                              />
                            </svg>
                            <span className="text-base font-semibold text-white">
                              IELTS Test
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    )}

                    {/* Phần user */}
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4 pt-4 border-t border-white/20"
                    >
                      {!session ? (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signIn("google");
                          }}
                          className="w-full bg-white text-[#0E4BA9] py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Đăng nhập Google
                        </button>
                      ) : (
                        <>
                          <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">
                              {session.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-semibold">
                              {session.user?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full bg-linear-to-r bg-[#E4C28E] text-[#0E4BA9] py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            Đăng xuất
                          </button>
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Spacer để tránh content bị che bởi fixed navbar */}
      <div className="h-[88px]"></div>
    </>
  );
}
