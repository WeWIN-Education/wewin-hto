"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Khi session sẵn sàng thì redirect
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/test/ielts");
    }
  }, [status, router]);

  // ⏳ Loading UI khi session đang check
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-[#0E4BA9]">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  // ✅ Nếu đã login (và đang ở trang login)
  if (session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB]">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center w-[360px]">
          <h1 className="text-xl text-[#0E4BA9] mb-6">
            Xin chào, {session.user?.name}
          </h1>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all w-full"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // 🧭 Giao diện login mặc định
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB]">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center w-[360px]">
        <h1 className="text-2xl font-semibold text-[#0E4BA9] mb-6">
          Đăng nhập bằng Google
        </h1>
        <button
          onClick={() => signIn("google")}
          className="bg-[#0E4BA9] text-white px-6 py-3 rounded-xl hover:bg-[#00A6FB] transition-all w-full"
        >
          🔐 Sign in with Google
        </button>
      </div>
    </div>
  );
}
