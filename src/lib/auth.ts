// src/lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

// ✅ Clé service_role → bypasse le RLS, uniquement côté serveur
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // jamais exposée côté client
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },

    async signIn({ user }) {
      if (!user.email) return false;

      const { error } = await supabaseAdmin.from("users").upsert(
        {
          email: user.email,
          name: user.name ?? "",
          avatar_url: user.image ?? "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

      if (error) {
        console.error("Erreur upsert user:", error.message);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const { data } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (data) token.userId = data.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export default NextAuth(authOptions);
