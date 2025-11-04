import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

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
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + account.expires_in * 1000;
      }

      if (Date.now() < (token.expiresAt as number)) return token;
      return refreshAccessToken(token);
    },

    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

/** 🔁 Hàm tự refresh access token khi hết hạn */
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

    console.log("🔄 Google Access Token refreshed!");
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
