"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Clients", href: "/dashboard/clients", icon: <Users size={20} /> },
    {
      name: "Factures",
      href: "/dashboard/invoices",
      icon: <FileText size={20} />,
    },
    {
      name: "Paramètres",
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
    },
  ];

  const handleLogout = () => {
    // Supprime le cookie et redirige vers la landing page
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 text-xl font-black text-blue-600 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
        F-SaaS
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
