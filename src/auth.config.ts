import type { NextAuthConfig } from "next-auth";
import type { AdminRole } from "@prisma/client";

/**
 * Edge-safe Auth.js config (no Node APIs, no DB, no bcrypt). Shared with the
 * middleware. The Credentials provider + DB lookups live in `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminArea =
        nextUrl.pathname.startsWith("/admin") &&
        nextUrl.pathname !== "/admin/login";
      if (isAdminArea) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: AdminRole }).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
