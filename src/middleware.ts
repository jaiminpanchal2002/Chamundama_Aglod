import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware uses the DB-free config to guard the /admin area.
export default NextAuth(authConfig).auth;

export const config = {
  // Protect /admin (except the login page, handled by the authorized callback).
  // Exclude Next internals, API auth routes, and static assets.
  matcher: ["/admin/:path*"],
};
