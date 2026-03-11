// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  return data?.id ?? null;
}

// ─── GET : récupère les paramètres de l'utilisateur ────────────
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return NextResponse.json(data ?? {});
}

// ─── POST : sauvegarde / met à jour les paramètres ─────────────
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json(null, { status: 401 });

  const body = await req.json();

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, ...body, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
