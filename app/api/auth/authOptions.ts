import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

/** ✅ Cấu hình NextAuth cho Google Login + Tự tạo tài khoản + Lưu userId */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    /** 🔹 JWT callback: lưu access token + refresh token + userId */
    async jwt({ token, account, profile }: any) {
      // Khi user login lần đầu
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + account.expires_in * 1000;

        try {
          // 🧠 Gọi API backend để tạo user mới nếu chưa tồn tại
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name,
                image: profile.picture,
              }),
            }
          );

          if (!res.ok) throw new Error("Failed to sync user with backend");
          const data = await res.json();

          // ✅ Lưu userId (hoặc email) từ backend vào token
          token.userId = data.id || profile.email;
        } catch (err) {
          console.error("❌ Failed to create/find user in backend:", err);
          token.userId = profile.email; // fallback nếu backend lỗi
        }
      }

      // Nếu token chưa hết hạn → giữ nguyên
      if (Date.now() < (token.expiresAt as number)) return token;

      // Hết hạn → gọi refreshAccessToken()
      return refreshAccessToken(token);
    },

    /** 🔹 Session callback: truyền userId xuống client */
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      // Gắn userId vào session.user
      if (session.user) {
        session.user.id = token.userId;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

/** 🔁 Refresh access token khi hết hạn */
async function refreshAccessToken(token: JWT) {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error("❌ Token refresh error:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
