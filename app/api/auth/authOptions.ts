import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

/** ---- TYPES FIX ---- */
interface GoogleAccount {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface GoogleProfile {
  email?: string;
  name?: string;
  picture?: string;
}

/** NEXTAUTH FULL GOOGLE DRIVE + SHEETS + GMAIL */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    /** JWT CALLBACK */
    async jwt({ token, account, profile }) {
      const acc = account as any;
      const pf = profile as any;

      // FIRST LOGIN
      if (acc) {
        token.accessToken = acc.access_token;
        token.refreshToken = acc.refresh_token ?? token.refreshToken; // KEY FIX
        token.expiresAt = Date.now() + acc.expires_in * 1000;
      }

      // Sync user
      if (acc && pf) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: pf.email,
                name: pf.name,
                image: pf.picture,
              }),
            }
          );

          const data = await res.json();
          token.userId = data.id || pf.email;
        } catch (err) {
          console.error("User sync error:", err);
          token.userId = pf.email;
        }
      }

      // ACCESS TOKEN STILL VALID
      if (Date.now() < (token.expiresAt as number)) return token;

      // EXPIRED → REFRESH
      return refreshAccessToken(token);
    },

    /** SESSION CALLBACK */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;

      // FIX: đảm bảo session.error là string | undefined
      session.error = (token.error as string) ?? undefined;

      // FIX: đảm bảo session.user.id là string | undefined
      if (session.user) {
        session.user.id = (token.userId as string) ?? undefined;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

/** ---- REFRESH TOKEN ---- */
async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken) {
      console.error("No refresh token available.");
      return { ...token, error: "NoRefreshToken" };
    }

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
    console.error("Token refresh error:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

