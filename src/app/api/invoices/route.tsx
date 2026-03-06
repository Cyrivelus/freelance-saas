import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force le mode dynamique pour éviter la mise en cache des erreurs
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ✅ UTILISER UN EXPORT NOMMÉ "GET"
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        amount,
        status,
        client_id,
        clients ( name )
      `,
      )
      .order("id", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Erreur GET:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ UTILISER UN EXPORT NOMMÉ "POST"
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.client_id || !body.amount) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          client_id: body.client_id,
          amount: parseFloat(body.amount),
          status: "En attente",
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data ? data[0] : { success: true });
  } catch (err: any) {
    console.error("Erreur POST:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
