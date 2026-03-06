import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader"; // <-- Importation ici

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barre latérale fixe */}
      <Sidebar />

      {/* Contenu principal qui défile */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
