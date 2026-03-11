import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ─────────────────────────────────────────────────────────────
// PATCH : Modifier le statut d'une facture
// Next.js 15+ : params est une Promise, il faut l'await
// ─────────────────────────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // ✅ await obligatoire Next.js 15+

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "Le champ 'status' est requis" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("invoices")
      .update({ status: body.status })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Erreur PATCH Invoice:", err.message);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour", details: err.message },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE : Supprimer une facture
// ─────────────────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // ✅ await obligatoire Next.js 15+

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const { error } = await supabase.from("invoices").delete().eq("id", id);

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
