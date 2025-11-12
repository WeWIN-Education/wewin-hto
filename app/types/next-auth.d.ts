import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 🧩 giờ bạn có thể dùng session.user.id
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    error?: string;
  }

  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
