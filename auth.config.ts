import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe Auth.js config used by middleware. Anything that needs Node
// APIs (bcryptjs, DB drivers) must NOT live here — keep that in `auth.ts`.
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const isOnAdmin =
        pathname.startsWith("/admin") && pathname !== "/admin/login";

      // Bounce signed-in users off the login page.
      if (auth && pathname === "/admin/login") {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      if (!isOnAdmin) return true;
      if (!auth) return false; // sends to signIn page

      // Role-gated admin sub-paths. Staff get bounced back to the dashboard.
      const role = auth.user?.role;
      const adminOnly = ["/admin/inventory", "/admin/users"];
      const needsAdmin = adminOnly.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
      if (needsAdmin && role !== "admin") {
        return Response.redirect(new URL("/admin?denied=1", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "admin" | "staff" }).role;
        token.id = (user as { id?: string }).id ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "staff" | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
