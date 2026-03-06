import SalesChart from "@/components/SalesChart";
import { LayoutDashboard, Users, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Tableau de Bord Freelance
        </h1>

        {/* Grille de statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Clients Actifs"
            value="12"
            icon={<Users size={24} />}
            color="bg-blue-500"
          />
          <StatCard
            title="Factures en attente"
            value="4"
            icon={<FileText size={24} />}
            color="bg-orange-500"
          />
          <StatCard
            title="Revenus (30j)"
            value="4 250 €"
            icon={<LayoutDashboard size={24} />}
            color="bg-green-500"
          />
        </div>

        {/* Graphique de données */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <SalesChart />
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 uppercase font-semibold">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
