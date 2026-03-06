"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Simulation : On ajoute le cookie de session
    document.cookie = "auth-token=true; path=/";

    // 2. Redirection vers le Dashboard (et non plus la racine)
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Entête de la carte */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue sur FreelanceSaaS
          </h1>
          <p className="text-gray-500 mt-2">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95"
          >
            <span>Se connecter</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer de la carte */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Pas encore de compte ?{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Créer un compte
          </span>
        </p>
      </div>
    </div>
  );
}
