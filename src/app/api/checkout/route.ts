import { NextResponse } from "next/server";

// On force le mode dynamique pour éviter les erreurs de build
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Au lieu d'aller vers Stripe, on renvoie vers le dashboard avec un message de succès simulé
    // Dans un vrai projet, c'est ici qu'on mettrait la logique Stripe
    return NextResponse.json({
      url: "/dashboard?success=pro_plan_activated",
      message: "Mode démo : Plan Pro activé (Simulation)",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur de simulation" },
      { status: 500 },
    );
  }
}
