import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Récupérer le token (la session)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 2. Définir les types de routes
  const isAuthPage = pathname.startsWith("/login");
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicFile = pathname.startsWith("/_next") || pathname.includes("."); 
  const isLandingPage = pathname === "/"; // Si votre accueil est public

  // 3. LOGIQUE DE REDIRECTION

  // CAS A : L'utilisateur est connecté et essaie d'aller sur /login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // CAS B : L'utilisateur n'est PAS connecté et essaie d'accéder à une zone privée
  // On protège tout SAUF le login, l'API auth, les fichiers et la landing page
  if (!token && !isAuthPage && !isApiAuthRoute && !isPublicFile && !isLandingPage) {
    const loginUrl = new URL("/login", req.url);
    // Optionnel : On garde en mémoire où il voulait aller
    loginUrl.searchParams.set("callbackUrl", pathname); 
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configuration du Matcher (très important pour les performances)
export const config = {
  matcher: [
    /*
     * On applique le middleware sur tout sauf :
     * - api (certaines routes api peuvent être publiques)
     * - _next/static (fichiers compilés)
     * - _next/image (optimisation d'images)
     * - tous les fichiers avec extension (png, svg, etc.) dans public/
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};