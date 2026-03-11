import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // Récupérer le token en base
  const { data, error } = await supabase
    .from("magic_links")
    .select("*")
    .eq("token", token)
    .eq("email", email)
    .eq("used", false)
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // Vérifier l'expiration
  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  // Marquer le token comme utilisé
  await supabase.from("magic_links").update({ used: true }).eq("token", token);

  // ➜ Ici, créez votre session (ex: cookie JWT, NextAuth, etc.)
  // Exemple simple : redirection vers le dashboard avec l'email en param
  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("user_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  });

  return response;
}
