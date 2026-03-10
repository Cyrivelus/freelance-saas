"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* --- OVERLAY (Fond sombre) --- */}
      <div
        className={`
          fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
          ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={() => setIsMenuOpen(false)} // Ferme le menu si on clique sur le fond
      />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* LOGO */}
          <div className="text-xl md:text-2xl font-black text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg shrink-0"></div>
            <span>FreelanceSaaS</span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition">
              Fonctionnalités
            </a>
            <a href="/api-doc" className="hover:text-blue-600 transition">
              API
            </a>
            <Link
              href="/login"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 transition-colors"
            >
              Connexion
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-2 text-gray-600 relative z-50 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU PANEL */}
        <div
          className={`
          absolute top-0 left-0 w-full bg-white shadow-2xl transition-all duration-300 ease-in-out md:hidden z-40
          ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
        >
          <div className="flex flex-col p-8 pt-24 space-y-6">
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-bold border-b pb-4 border-gray-50"
            >
              Fonctionnalités
            </a>
            <a
              href="/api-doc"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-bold border-b pb-4 border-gray-50"
            >
              API
            </a>
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-blue-600 text-white text-center py-4 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="pt-24">
        <header className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Gérez votre freelance{" "}
            <span className="text-blue-600">sans effort.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            La plateforme tout-en-un pour suivre vos clients et vos factures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Démarrer gratuitement <ArrowRight size={20} />
            </Link>
          </div>
        </header>

        {/* FEATURES GRID */}
        <section id="features" className="bg-gray-50 py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 />}
              title="Dashboard"
              desc="Suivi analytique en temps réel."
            />
            <FeatureCard
              icon={<Users />}
              title="Clients"
              desc="CRM intégré pour freelances."
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="Sécurité"
              desc="Données chiffrées et API sécurisée."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition hover:shadow-md">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
