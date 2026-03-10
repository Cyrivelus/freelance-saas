"use client";

import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

export default function DashboardHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="w-full flex items-center justify-between h-full bg-white">
      {/* Barre de recherche - Cachée sur mobile pour gagner de la place */}
      <div className="relative w-72 hidden lg:block">
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

      {/* Titre Mobile (visible uniquement quand la recherche est cachée) */}
      <h2 className="lg:hidden font-bold text-gray-900 ml-2">Dashboard</h2>

      {/* Actions à droite */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Profil avec Menu Déroulant */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-xl transition group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-inner uppercase">
              JD
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-xs font-bold text-gray-900 leading-none">
                Jean Dupont
              </p>
              <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-wider">
                Freelance Pro
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown Profil */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
