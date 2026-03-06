// Exemple simplifié pour SalesChart
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function SalesChart({ data }: { data: any[] }) {
  // Transformation des données pour le graphique
  // On regroupe par exemple par mois
  const chartData = [
    { name: "Jan", total: 0 },
    { name: "Fév", total: 0 },
    { name: "Mar", total: 0 },
  ];

  data.forEach((inv) => {
    // Logique de tri par date ici (simplifiée)
    chartData[2].total += Number(inv.amount);
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#F3F4F6" }} />
          <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
