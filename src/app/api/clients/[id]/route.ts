// src/app/api/clients/[id]/route.ts
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

// ─── PATCH : Modifier un client ────────────────────────────────
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
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.status !== undefined) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 },
      );
    }

    // ✅ filtre par user_id pour éviter qu'un user modifie le client d'un autre
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0)
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Erreur PATCH Client:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour", details: err.message },
      { status: 500 },
    );
  }
}

// ─── DELETE : Supprimer un client ──────────────────────────────
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

    // ✅ filtre par user_id pour éviter qu'un user supprime le client d'un autre
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ message: "Client supprimé avec succès" });
  } catch (err: any) {
    console.error("Erreur DELETE Client:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la suppression", details: err.message },
      { status: 500 },
    );
  }
}