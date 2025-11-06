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

  // 🧭 Theo dõi hướng scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Kéo xuống → ẩn navbar
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Kéo lên hoặc gần đầu trang → hiện navbar
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.nav
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-50 bg-linear-to-r from-[#0E4BA9] via-[#007BCE] to-[#00A6FB] text-white shadow-lg backdrop-blur-md"
          style={{
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.1), inset 0 -1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div className="flex items-center justify-between px-5 md:px-10 py-3">
            {/* 🔹 Left: Logos */}
            <div className="flex items-center gap-3">
              <Image
                src="/HT Group Transparent.png"
                alt="HT Group Logo"
                width={80}
                height={80}
                className="rounded-full bg-white p-2 shadow-sm"
              />
              <Image
                src="/logo.png"
                alt="WeWIN Logo"
                width={150}
                height={150}
                className="rounded-full bg-white p-2 shadow-sm"
              />
            </div>

            {/* 🔹 Center Section (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-6">
              <Link
                href="/"
                className="flex items-center justify-center px-6 py-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30 hover:bg-white/30 transition-all"
              >
                <span className="text-2xl font-bold text-white tracking-wide">
                  <span className="text-[#E4C28E]">WeWIN HTO</span>
                </span>
              </Link>

              {session && (
                <Link
                  href="/test/ielts"
                  className="flex items-center gap-2 px-5 py-2 bg-white text-[#0E4BA9] rounded-full shadow-md border border-[#d0e7ff] hover:scale-105 hover:shadow-lg hover:text-[#007ACC] transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-[#0E4BA9]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 1v10m0 0a3 3 0 01-3-3V5a3 3 0 016 0v3a3 3 0 01-3 3zm0 0v10m-6-4h12"
                    />
                  </svg>
                  <span className="font-semibold">IELTS Test</span>
                </Link>
              )}
            </div>

            {/* 🔹 Right: Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {!session ? (
                <button
                  onClick={() => signIn("google")}
                  className="bg-white text-[#0E4BA9] px-5 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-sm"
                >
                  🔐 Đăng nhập Google
                </button>
              ) : (
                <>
                  <span className="text-sm opacity-90 font-semibold">
                    Xin chào, {session.user?.name}
                  </span>
                  <button
                    onClick={() => handleLogout()}
                    className="bg-[#E4C28E] text-[#0E4BA9] px-4 py-2 rounded-lg font-medium hover:bg-[#cfa86d] transition-all shadow-sm"
                  >
                    <span className="font-bold">Đăng xuất</span>
                  </button>
                </>
              )}
            </div>

            {/* 🔹 Hamburger (Mobile only) */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-[#ffffff22] transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div
                className={`w-6 h-0.5 bg-white transition-all ${
                  menuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-white my-[5px] transition-all ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-white transition-all ${
                  menuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></div>
            </button>
          </div>

          {/* 🔹 Mobile Dropdown Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="md:hidden bg-linear-to-b from-[#0E4BA9] to-[#007BCE] text-white shadow-2xl px-6 py-7 space-y-6 text-center rounded-b-3xl border-t border-white/20"
              >
                <h3 className="text-xl font-bold uppercase tracking-widest text-[#E4C28E]">
                  
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="block text-lg font-bold hover:text-[#FFE08A] transition-all"
                  >
                    <span className="text-[#FFE08A]">☰ WeWIN HTO</span>
                  </Link>
                </h3>

                <div className="bg-white/10 rounded-2xl py-4 space-y-3 border border-white/20 shadow-inner">
                  {session && (
                    <Link
                      href="/test/ielts"
                      onClick={() => setMenuOpen(false)}
                      className="block text-base font-semibold hover:text-[#FFE08A] transition-all"
                    >
                      🎙 IELTS Test
                    </Link>
                  )}
                </div>

                <div>
                  {!session ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signIn("google");
                      }}
                      className="w-full bg-white text-[#0E4BA9] py-2.5 rounded-xl font-medium shadow-md hover:bg-blue-50 transition"
                    >
                      🔐 Đăng nhập Google
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full bg-[#E4C28E] text-[#0E4BA9] py-2.5 rounded-xl font-medium shadow-md hover:bg-[#cfa86d] transition"
                    >
                      <span className="font-bold">Đăng xuất</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
