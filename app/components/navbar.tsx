"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="relative flex items-center justify-between px-10 py-3 bg-gradient-to-r from-[#0E4BA9] to-[#0185b9] text-white shadow-md">
      {/* 🔹 Bên trái: Hai logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/HT Group Transparent.png"
          alt="HT Group Logo"
          width={80}
          height={60}
          className="rounded-full bg-white p-2 shadow-sm"
        />
        <Image
          src="/logo.png"
          alt="WeWIN Logo"
          width={180}
          height={180}
          className="rounded-full bg-white p-2 shadow-sm"
        />
      </div>

      {/* 🔹 Giữa: Tiêu đề và link IELTS (nếu đã đăng nhập) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center flex items-center gap-6">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-wide hover:opacity-90"
        >
          WeWIN HTO
        </Link>

        {/* Chỉ hiển thị khi đã đăng nhập */}
        {session && (
          <Link
            href="/test/ielts"
            className="text-lg font-medium bg-white text-[#0E4BA9] px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all"
          >
            🎙️ IELTS Test
          </Link>
        )}
      </div>

      {/* 🔹 Phải: Nút đăng nhập / đăng xuất */}
      <div className="flex items-center gap-3">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-white text-[#0E4BA9] px-5 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-sm"
          >
            🔐 Đăng nhập Google
          </button>
        ) : (
          <>
            <span className="text-sm opacity-90 font-bold">
              Xin chào, {session.user?.name}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-[#E4C28E] text-[#0E4BA9] px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
            >
              <span className="font-bold">Đăng xuất</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
