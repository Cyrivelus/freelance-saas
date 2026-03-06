import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  // Simulation pure pour éviter tout import de bibliothèque externe
  return NextResponse.json({
    url: "/dashboard?success=true",
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "API Simulation Active" });
}
