import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // On récupère les clients depuis la vraie base de données
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
