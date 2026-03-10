"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* 1. SIDEBAR : Fixe sur Desktop, Tiroir coulissant sur Mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r shadow-2xl transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col relative">
          {/* Bouton fermeture interne pour mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>

          <Sidebar />
        </div>
      </aside>

      {/* 2. OVERLAY : Uniquement sur mobile quand le menu est ouvert */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[90] md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. CONTENU PRINCIPAL : Occupe tout l'espace disponible */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER : Toujours visible et compact */}
        <header className="h-16 bg-white border-b flex items-center px-4 md:px-6 shrink-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 mr-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg active:bg-gray-200"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 min-w-0">
            <DashboardHeader />
          </div>
        </header>

        {/* ZONE DE CONTENU : Scrollable indépendamment */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <div className="p-4 md:p-8 max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
