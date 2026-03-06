"use client";

import { Bell, Search, ChevronDown, User } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Barre de recherche discrète */}
      <div className="relative w-96 hidden md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Rechercher une facture, un client..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition group">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition"></span>
        </button>

        {/* Séparateur */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Profil Utilisateur */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-100 uppercase">
            JD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-gray-900 leading-none">
              Jean Dupont
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
              Freelance Pro
            </p>
          </div>
          <ChevronDown
            size={16}
            className="text-gray-400 group-hover:text-gray-900 transition"
          />
        </div>
      </div>
    </header>
  );
}
