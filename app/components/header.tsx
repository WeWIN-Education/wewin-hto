"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { handleLogout } from "../api/log-to-sheet/route";
import { Routes } from "../constants/routes";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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
            className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-[#0E4BA9] via-[#007BCE] to-[#00A6FB]"
            style={{
              boxShadow: "0 4px 20px rgba(14, 75, 169, 0.3)",
            }}
          >
            <div className="max-w-8xl mx-auto flex items-center justify-between px-6 md:px-10 py-3">
              {/* 🎨 Left: Logos */}
              <motion.div
                className="flex items-center gap-3 shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-300 to-cyan-300 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <Image
                    src="/HT Group Transparent.png"
                    alt="HT Group Logo"
                    width={50}
                    height={50}
                    className="relative rounded-full p-1.5 shadow-md bg-white transition-all duration-300"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-amber-300 to-yellow-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <Image
                    src="/logo.png"
                    alt="WeWIN Logo"
                    width={110}
                    height={110}
                    className="relative rounded-full p-1.5 shadow-md bg-white transition-all duration-300"
                  />
                </div>

                <Link href={Routes.HOME} className="ml-2">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="text-xl font-bold tracking-wide text-[#FFE08A] drop-shadow-lg transition-all hidden sm:block"
                    style={{
                      textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    WeWIN HTO
                  </motion.span>
                </Link>
              </motion.div>

              {/* 🎯 Center: Menu (Desktop) */}
              <div className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
                {session && (
                  <>
                    {/* Tests Dropdown */}
                    {/* Tests Dropdown with toggle click */}
                    <div className="relative group">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/95 text-[#0E4BA9] font-bold shadow-lg border border-white/50 transition-all duration-300"
                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Tests</span>
                        <svg
                          className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.button>

                      {/* Dropdown Menu on Hover with smooth animation */}
                      <motion.div
                        initial={{ opacity: 0, y: -15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1], // ease-out cubic-bezier mượt
                        }}
                        className="absolute left-0 mt-1 w-56 bg-white/95 rounded-xl shadow-xl border border-blue-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden z-50 backdrop-blur-md"
                        style={{
                          boxShadow:
                            "0 8px 24px rgba(14,75,169,0.15), 0 0 12px rgba(0,166,251,0.15)",
                        }}
                      >
                        {[
                          { href: Routes.TEST_IELTS, label: "🎙 IELTS Test" },
                        ].map((item) => (
                          <motion.div
                            key={item.href}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "rgba(0, 166, 251, 0.06)",
                              x: 6,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 15,
                            }}
                          >
                            <Link
                              href={item.href}
                              className="block px-5 py-3 text-[#0E4BA9] font-semibold border-b border-blue-50 last:border-0"
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                  </>
                )}
              </div>

              {/* 👤 Right: User Section (Desktop) */}
              <div className="hidden md:flex items-center gap-3 shrink-0">
                {!session ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signIn("google")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-[#0E4BA9] shadow-lg hover:shadow-xl transition-all duration-300"
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
                    Đăng nhập
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-md">
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
                      className="px-5 py-2.5 rounded-xl font-bold shadow-lg bg-[#E4C28E] text-[#0E4BA9] hover:bg-[#ffd666] transition-all duration-300"
                    >
                      Đăng xuất
                    </motion.button>
                  </div>
                )}
              </div>

              {/* 🍔 Hamburger (Mobile) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md transition-all duration-300"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <motion.div
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 rounded-full bg-white"
                />
                <motion.div
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 rounded-full my-1.5 bg-white"
                />
                <motion.div
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 rounded-full bg-white"
                />
              </motion.button>
            </div>

            {/* 📱 Mobile Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden bg-linear-to-b from-[#007BCE] to-[#00A6FB] border-t border-white/20"
                >
                  <div className="px-6 py-6 space-y-4">
                    {/* WeWIN HTO Title */}
                    <Link href="/" onClick={() => setMenuOpen(false)}>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30 text-center">
                        <span className="text-xl font-bold text-[#E4C28E]">
                          WeWIN HTO
                        </span>
                      </div>
                    </Link>

                    {session && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-white/70 px-2 uppercase tracking-wider">
                          Tests
                        </div>
                        <Link
                          href="/test/ielts"
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="bg-white/5 rounded-lg px-4 py-3 text-white font-medium hover:bg-white/10 transition-all">
                            🎙 IELTS Test
                          </div>
                        </Link>
                        <Link
                          href="/test/toeic"
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="bg-white/5 rounded-lg px-4 py-3 text-white font-medium hover:bg-white/10 transition-all">
                            📝 TOEIC Test
                          </div>
                        </Link>
                        <Link
                          href="/test/placement"
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="bg-white/5 rounded-lg px-4 py-3 text-white font-medium hover:bg-white/10 transition-all">
                            📋 Placement Test
                          </div>
                        </Link>

                      </div>
                    )}

                    {/* User Section */}
                    <div className="pt-4 border-t border-white/20">
                      {!session ? (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signIn("google");
                          }}
                          className="w-full bg-white text-[#0E4BA9] py-3 rounded-xl font-bold shadow-lg"
                        >
                          🔐 Đăng nhập Google
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-white/10 rounded-lg px-4 py-3 flex items-center gap-3 border border-white/20">
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
                            className="w-full bg-linear-to-r bg-[#E4C28E] text-[#0E4BA9] py-3 rounded-xl font-bold shadow-lg"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-[76px]"></div>
    </>
  );
}
