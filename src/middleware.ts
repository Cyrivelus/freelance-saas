import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Routes protégées qui demandent une connexion
  const protectedRoutes = ["/dashboard", "/profile"];

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// UNE SEULE FOIS : La configuration du matcher
export const config = {
  // On exclut l'API, les fichiers statiques et les images de la vérification
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
