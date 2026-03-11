"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = session?.user;

  // Génération propre des initiales
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="w-full flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100">
      {/* 1. Barre de recherche (Cachée sur petit mobile) */}
      <div className="relative w-64 hidden md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* Titre Mobile */}
      <h2 className="md:hidden font-bold text-gray-900">Dashboard</h2>

      {/* 2. Actions à droite */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* 3. Profil avec Menu Déroulant */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-xl transition group"
          >
            {/* Avatar : Image Google ou Initiales */}
            {user?.image ? (
              <img
                src={user.image}
                alt="avatar"
                className="w-9 h-9 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {initials}
              </div>
            )}

            <div className="hidden sm:block text-left mr-1">
              <p className="text-xs font-bold text-gray-900 leading-none">
                {user?.name || "Utilisateur"}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-1 tracking-wider truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown */}
          {showProfileMenu && (
            <>
              {/* Overlay pour fermer le menu en cliquant n'importe où */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-widest">
                    Mon Compte
                  </p>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User size={16} className="text-gray-400" />
                  Mon Profil
                </button>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
