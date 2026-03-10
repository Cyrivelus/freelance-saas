"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  X,
  Download,
  Loader2,
  MoreVertical,
  Clock,
  Search,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
  Printer,
} from "lucide-react";

// Imports dynamiques
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Loader2 className="animate-spin" size={18} /> },
);
const InvoicePDF = dynamic(
  () => import("@/components/InvoicePDF").then((mod) => mod.InvoicePDF),
  { ssr: false },
);
// Note: Créez ce composant pour gérer plusieurs pages de factures
const BulkInvoicePDF = dynamic(
  () => import("@/components/BulkInvoicePDF").then((mod) => mod.BulkInvoicePDF),
  { ssr: false },
);

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [periodFilter, setPeriodFilter] = useState("Mois"); // Par défaut sur le mois en cours
  const [sortBy, setSortBy] = useState("recent");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        fetch("/api/invoices", { cache: "no-store" }),
        fetch("/api/clients", { cache: "no-store" }),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE FILTRAGE AMÉLIORÉE ---
  const processedInvoices = useMemo(() => {
    const now = new Date();
    return invoices
      .filter((inv) => {
        const invDate = new Date(inv.created_at);
        const matchesSearch = (inv.clients?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "Tous" || inv.status === statusFilter;

        let matchesPeriod = true;
        if (periodFilter === "Mois") {
          matchesPeriod =
            invDate.getMonth() === now.getMonth() &&
            invDate.getFullYear() === now.getFullYear();
        } else if (periodFilter === "DernierMois") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          matchesPeriod =
            invDate.getMonth() === lastMonth.getMonth() &&
            invDate.getFullYear() === lastMonth.getFullYear();
        } else if (periodFilter === "Annee") {
          matchesPeriod = invDate.getFullYear() === now.getFullYear();
        }

        return matchesSearch && matchesStatus && matchesPeriod;
      })
      .sort((a, b) => {
        if (sortBy === "amount-desc")
          return Number(b.amount) - Number(a.amount);
        if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [invoices, searchTerm, statusFilter, periodFilter, sortBy]);

  // --- EXPORT CSV ---
  const exportToCSV = () => {
    const headers = ["Date", "Client", "Montant (€)", "Statut", "Reference"];
    const rows = processedInvoices.map((inv) => [
      new Date(inv.created_at).toLocaleDateString("fr-FR"),
      inv.clients?.name || "Client inconnu",
      inv.amount,
      inv.status,
      inv.id.substring(0, 8).toUpperCase(),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `compta-${periodFilter}-${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  // --- STATS ---
  const { stats, chartData } = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === "Payée");
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString("fr-FR", { month: "short" }),
        total: 0,
        mIndex: d.getMonth(),
        yIndex: d.getFullYear(),
      };
    }).reverse();

    invoices.forEach((inv) => {
      const d = new Date(inv.created_at);
      const mIdx = last6Months.findIndex(
        (m) => m.mIndex === d.getMonth() && m.yIndex === d.getFullYear(),
      );
      if (mIdx !== -1) last6Months[mIdx].total += Number(inv.amount);
    });

    return {
      stats: {
        totalPaid: paid.reduce((acc, curr) => acc + Number(curr.amount), 0),
        totalPending: invoices
          .filter((i) => i.status === "En attente")
          .reduce((acc, curr) => acc + Number(curr.amount), 0),
        countPending: invoices.filter((i) => i.status === "En attente").length,
      },
      chartData: last6Months,
    };
  }, [invoices]);

  const updateStatus = async (id: string, s: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) {
      setActiveMenu(null);
      fetchData();
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      setActiveMenu(null);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Dashboard Facturation
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Suivi financier et export groupé
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Graphique & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">
              Revenus 6 derniers mois
            </h3>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 px-2">
            {chartData.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-full bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-all duration-300 relative"
                  style={{
                    height: `${Math.max((d.total / (Math.max(...chartData.map((x) => x.total)) || 1)) * 100, 5)}%`,
                  }}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {d.total.toLocaleString()}€
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              label: "Encaissé",
              val: stats.totalPaid,
              color: "text-green-600",
              bg: "bg-green-50",
              icon: TrendingUp,
            },
            {
              label: "En attente",
              val: stats.totalPending,
              color: "text-amber-600",
              bg: "bg-amber-50",
              icon: Clock,
            },
            {
              label: "Alertes",
              val: stats.countPending,
              color: "text-red-600",
              bg: "bg-red-50",
              icon: AlertCircle,
              suffix: " docs",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm"
            >
              <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {s.label}
                </p>
                <p className="text-xl font-black text-gray-900">
                  {s.val.toLocaleString()}
                  {s.suffix || " €"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre d'outils avec FILTRES ET BOUTONS GROUPÉS */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Chercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-blue-600 outline-none"
          >
            <option value="Tous">Toutes les périodes</option>
            <option value="Mois">Mois en cours</option>
            <option value="DernierMois">Mois dernier</option>
            <option value="Annee">Cette année</option>
          </select>

          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={exportToCSV}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-black text-xs hover:bg-green-100 transition-colors"
            >
              <FileSpreadsheet size={16} /> CSV
            </button>

            {isClient && processedInvoices.length > 0 && (
              <PDFDownloadLink
                document={
                  <BulkInvoicePDF
                    invoices={processedInvoices}
                    title={`Factures ${periodFilter}`}
                  />
                }
                fileName={`export-pdf-${periodFilter}.pdf`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-colors"
              >
                {({ loading }) => (
                  <>
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Printer size={16} />
                    )}
                    PDF GROUPÉ ({processedInvoices.length})
                  </>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : processedInvoices.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Client & Réf</th>
                  <th className="px-8 py-5">Montant TTC</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {processedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">
                        {inv.clients?.name || "Client"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">
                        Réf: {inv.id.substring(0, 8)}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-xl font-black text-gray-900">
                      {Number(inv.amount).toLocaleString()} €
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${inv.status === "Payée" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ActionButtons
                        inv={inv}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        updateStatus={updateStatus}
                        deleteInvoice={deleteInvoice}
                        isClient={isClient}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">
              Aucune facture trouvée pour cette sélection
            </p>
          </div>
        )}
      </div>

      {/* Modal de création (simplicité conservée) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                Nouvelle Facture
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch("/api/invoices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    client_id: selectedClientId,
                    amount,
                    status: "En attente",
                  }),
                });
                setIsModalOpen(false);
                setAmount("");
                fetchData();
              }}
              className="space-y-6"
            >
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black"
              >
                Créer Document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButtons({
  inv,
  activeMenu,
  setActiveMenu,
  updateStatus,
  deleteInvoice,
  isClient,
}: any) {
  return (
    <div className="flex items-center justify-end gap-2">
      {isClient && (
        <PDFDownloadLink
          document={<InvoicePDF invoice={inv} />}
          fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
          className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          {({ loading }) =>
            loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )
          }
        </PDFDownloadLink>
      )}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(activeMenu === inv.id ? null : inv.id)}
          className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
        >
          <MoreVertical size={16} />
        </button>
        {activeMenu === inv.id && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] py-2">
            {inv.status !== "Payée" && (
              <button
                onClick={() => updateStatus(inv.id, "Payée")}
                className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-bold"
              >
                Valider paiement
              </button>
            )}
            <button
              onClick={() => deleteInvoice(inv.id)}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
