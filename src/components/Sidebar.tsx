"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

export default function Sidebar({
  closeMobileMenu,
}: {
  closeMobileMenu?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Si vous utilisez un système de cookies simple, on les efface ici
    // Pour l'instant, on simule une déconnexion propre
    localStorage.clear();
    sessionStorage.clear();

    // Redirection forcée vers la page de login ou d'accueil
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col p-6 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white fill-white" />
        </div>
        <span className="font-black text-xl text-gray-900 tracking-tight">
          FreelanceSaaS
        </span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Carte Plan Pro (Mobile friendly) */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white">
        <p className="text-xs font-bold uppercase opacity-80 mb-1">Plan Pro</p>
        <p className="text-lg font-black mb-3">
          19€<span className="text-xs font-normal">/mois</span>
        </p>
        <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition">
          Passer au Pro
        </button>
      </div>

      {/* Bouton Déconnexion */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold group"
        >
          <LogOut
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
