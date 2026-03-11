// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Service role pour bypasser le RLS côté serveur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Helper : récupère le user_id Supabase depuis la session ───
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

// ─── GET : factures de l'utilisateur connecté uniquement ───────
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("invoices")
      .select(`id, amount, status, client_id, created_at, clients ( name )`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Impossible de charger les factures", details: err.message },
      { status: 500 },
    );
  }
}

// ─── POST : crée une facture liée à l'utilisateur connecté ─────
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.client_id || !body.amount) {
      return NextResponse.json(
        { error: "Données incomplètes (client_id et amount requis)" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([{
        client_id: body.client_id,
        amount: parseFloat(body.amount),
        status: body.status || "En attente",
        user_id: userId, // ← isolation par utilisateur
      }])
      .select(`id, amount, status, client_id, created_at, clients ( name )`);

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la création", details: err.message },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}