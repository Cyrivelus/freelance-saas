"use client";
import { Check, Zap } from "lucide-react";

export default function PricingCard() {
  const handleSubscription = async () => {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // Redirige vers la page de paiement Stripe
    }
  };

  return (
    <div className="border-2 border-blue-500 rounded-3xl p-8 bg-blue-50 max-w-sm shadow-lg">
      <div className="flex items-center space-x-2 text-blue-600 font-bold mb-4">
        <Zap size={20} fill="currentColor" />
        <span>PLAN PRO</span>
      </div>
      <h3 className="text-3xl font-black text-gray-900 mb-2">
        19€<span className="text-sm font-normal text-gray-500">/mois</span>
      </h3>
      <ul className="space-y-3 mb-8">
        <li className="flex items-center space-x-2 text-gray-700">
          <Check size={18} className="text-green-500" />{" "}
          <span>Factures illimitées</span>
        </li>
        <li className="flex items-center space-x-2 text-gray-700">
          <Check size={18} className="text-green-500" />{" "}
          <span>Export PDF automatique</span>
        </li>
      </ul>
      <button
        onClick={handleSubscription}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
      >
        Passer au Plan Pro
      </button>
    </div>
  );
}
