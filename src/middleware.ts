import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Liste des routes qui demandent une connexion
const protectedRoutes = ["/dashboard", "/api/clients", "/profile"];

export function middleware(request: NextRequest) {
  // Simulation de vérification de token (à remplacer par Supabase Auth plus tard)
  const token = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Si l'utilisateur essaie d'accéder à une route protégée sans token
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    // On le redirige vers la page de connexion
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configuration pour ne pas ralentir les fichiers statiques (images, css)
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
