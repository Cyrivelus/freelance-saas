import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Empêcher toute mise en cache qui pourrait garder une erreur 405 en mémoire
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Gestionnaire GET
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`id, amount, status, client_id, clients ( name )`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Gestionnaire POST
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.client_id || !body.amount) {
      return NextResponse.json(
        { error: "Données incomplètes" },
        { status: 400 },
      );
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
    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Erreur API POST:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Optionnel : Débloquer les requêtes de pré-vérification (CORS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
