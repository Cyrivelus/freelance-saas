import { NextResponse } from "next/server";

// On force le mode dynamique pour éviter que Vercel n'analyse le contenu
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // On simule une redirection vers une page de succès
    // Cela permet de tester votre UI sans aucun SDK externe
    return NextResponse.json({
      url: "/dashboard?success=true",
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur simulation" }, { status: 500 });
  }
}

// On ajoute un GET vide au cas où pour éviter le 405
export async function GET() {
  return NextResponse.json({ message: "Checkout API Ready" });
}
