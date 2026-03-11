import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ─────────────────────────────────────────────────────────────
// PATCH : Modifier un client (nom, email, statut)
// Next.js 15+ : params est une Promise
// ─────────────────────────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Erreur PATCH Client:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour", details: err.message },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE : Supprimer un client
// ─────────────────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const { error } = await supabase.from("clients").delete().eq("id", id);
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
