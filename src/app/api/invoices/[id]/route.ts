// src/app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// ✅ service_role → bypasse le RLS, jamais exposé côté client
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

// ─── PATCH : Modifier le statut d'une facture ──────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const body = await request.json();
    if (!body.status) {
      return NextResponse.json(
        { error: "Le champ 'status' est requis" },
        { status: 400 },
      );
    }

    // ✅ filtre par user_id → un user ne peut modifier que ses propres factures
    const { data, error } = await supabase
      .from("invoices")
      .update({ status: body.status })
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0)
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Erreur PATCH Invoice:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour", details: err.message },
      { status: 500 },
    );
  }
}

// ─── DELETE : Supprimer une facture ────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    // ✅ filtre par user_id → un user ne peut supprimer que ses propres factures
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ message: "Facture supprimée avec succès" });
  } catch (err: any) {
    console.error("Erreur DELETE Invoice:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la suppression", details: err.message },
      { status: 500 },
    );
  }
}