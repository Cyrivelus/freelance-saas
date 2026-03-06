"use client";

import { useEffect, useState } from "react";
import SalesChart from "@/components/SalesChart";
import PricingCard from "@/components/PricingCard";
import { Loader2, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // On récupère les factures réelles depuis votre API
        const res = await fetch("/api/invoices");
        if (!res.ok) throw new Error("Erreur lors du chargement");

        const invoices = await res.json();

        // Calcul du revenu total
        const total = invoices.reduce(
          (acc: number, inv: any) => acc + (Number(inv.amount) || 0),
          0,
        );

        // Préparation des données pour le graphique (Jan, Feb, Mar, etc.)
        // Ici, on groupe par mois si vous avez une colonne created_at,
        // sinon on envoie simplement le total pour l'exemple
        setStats({
          totalRevenue: total,
          monthlyData: invoices, // Vous pouvez passer les invoices brutes au SalesChart pour traitement
        });
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Mon Tableau de Bord
        </h1>
        <p className="text-gray-500">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Widget Revenu Total */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Revenus Totaux
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalRevenue.toLocaleString("fr-FR")} €
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Revenus Mensuels</h2>
          {/* On passe les données réelles au composant SalesChart */}
          <SalesChart data={stats.monthlyData} />
        </div>
        <PricingCard />
      </div>
    </div>
  );
}
