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
  Target,
} from "lucide-react";

// --- IMPORTS DYNAMIQUES (Syntaxe unique et correcte) ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" size={18} />,
  },
);

const InvoicePDF = dynamic(
  () => import("@/components/InvoicePDF").then((mod) => mod.InvoicePDF),
  { ssr: false },
);

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
  const [periodFilter, setPeriodFilter] = useState("Mois");
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
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULS STATS & PROGRESSION ---
  const { stats, chartData, monthlyProgress, processedInvoices } =
    useMemo(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const lastMonthDate = new Date();
      lastMonthDate.setMonth(now.getMonth() - 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastYear = lastMonthDate.getFullYear();

      let currentMonthTotal = 0;
      let lastMonthTotal = 0;

      // 1. Filtrage et Tri
      const filtered = invoices
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
              invDate.getMonth() === currentMonth &&
              invDate.getFullYear() === currentYear;
          } else if (periodFilter === "DernierMois") {
            matchesPeriod =
              invDate.getMonth() === lastMonth &&
              invDate.getFullYear() === lastYear;
          } else if (periodFilter === "Annee") {
            matchesPeriod = invDate.getFullYear() === currentYear;
          }
          return matchesSearch && matchesStatus && matchesPeriod;
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      // 2. Calcul des totaux pour la progression
      invoices.forEach((inv) => {
        const d = new Date(inv.created_at);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
          currentMonthTotal += Number(inv.amount);
        if (d.getMonth() === lastMonth && d.getFullYear() === lastYear)
          lastMonthTotal += Number(inv.amount);
      });

      // 3. Graphique 6 mois
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.toLocaleString("fr-FR", { month: "short" }),
          total: 0,
          m: d.getMonth(),
          y: d.getFullYear(),
        };
      }).reverse();

      invoices.forEach((inv) => {
        const d = new Date(inv.created_at);
        const idx = last6.findIndex(
          (m) => m.m === d.getMonth() && m.y === d.getFullYear(),
        );
        if (idx !== -1) last6[idx].total += Number(inv.amount);
      });

      return {
        processedInvoices: filtered,
        stats: {
          totalPaid: invoices
            .filter((i) => i.status === "Payée")
            .reduce((a, b) => a + Number(b.amount), 0),
          totalPending: invoices
            .filter((i) => i.status === "En attente")
            .reduce((a, b) => a + Number(b.amount), 0),
          countPending: invoices.filter((i) => i.status === "En attente")
            .length,
        },
        chartData: last6,
        monthlyProgress: {
          current: currentMonthTotal,
          last: lastMonthTotal,
          percent:
            lastMonthTotal > 0
              ? Math.min((currentMonthTotal / lastMonthTotal) * 100, 100)
              : 100,
          growth:
            lastMonthTotal > 0
              ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
              : 0,
        },
      };
    }, [invoices, searchTerm, statusFilter, periodFilter]);

  const updateStatus = async (id: string, s: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) fetchData();
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Supprimer définitivement ?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
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
            Gestion et exportations PDF/CSV
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Widgets Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest text-blue-600">
                Objectif Mensuel
              </h3>
            </div>
            <span
              className={`text-sm font-black ${monthlyProgress.growth >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {monthlyProgress.growth >= 0 ? "+" : ""}
              {monthlyProgress.growth.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-gray-900">
                {monthlyProgress.current.toLocaleString()} €
              </span>
              <span className="text-sm font-bold text-gray-400">
                Précédent : {monthlyProgress.last.toLocaleString()} €
              </span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${monthlyProgress.percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatWidget
            label="Encaissé"
            val={stats.totalPaid}
            color="text-green-600"
            bg="bg-green-50"
            icon={TrendingUp}
          />
          <StatWidget
            label="En attente"
            val={stats.totalPending}
            color="text-amber-600"
            bg="bg-amber-50"
            icon={Clock}
          />
          <StatWidget
            label="Alertes"
            val={stats.countPending}
            color="text-red-600"
            bg="bg-red-50"
            icon={AlertCircle}
            suffix=" docs"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none"
          />
        </div>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-blue-600 outline-none"
        >
          <option value="Mois">Ce mois</option>
          <option value="DernierMois">Mois dernier</option>
          <option value="Annee">Cette année</option>
          <option value="Tous">Historique complet</option>
        </select>
        {isClient && processedInvoices.length > 0 && (
          <PDFDownloadLink
            document={
              <BulkInvoicePDF
                invoices={processedInvoices}
                title={`Export ${periodFilter}`}
              />
            }
            fileName={`export-${new Date().getTime()}.pdf`}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-50 text-blue-700 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all"
          >
            {({ loading }) =>
              loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Printer size={16} /> PDF GROUPÉ
                </>
              )
            }
          </PDFDownloadLink>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Client</th>
              <th className="px-8 py-5">Montant</th>
              <th className="px-8 py-5">Statut</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {processedInvoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-blue-50/20 transition-colors group"
              >
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {inv.clients?.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    #{inv.id.substring(0, 8).toUpperCase()}
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

      {/* Modal Création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
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
                const res = await fetch("/api/invoices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    client_id: selectedClientId,
                    amount,
                    status: "En attente",
                  }),
                });
                if (res.ok) {
                  setIsModalOpen(false);
                  setAmount("");
                  fetchData();
                }
              }}
              className="space-y-6"
            >
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none"
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
                placeholder="0.00 €"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl outline-none"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl"
              >
                Générer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---
function StatWidget({ label, val, color, bg, icon: Icon, suffix = " €" }: any) {
  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm hover:translate-x-1 transition-transform">
      <div className={`p-4 ${bg} ${color} rounded-2xl`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black text-gray-900">
          {val.toLocaleString()}
          {suffix}
        </p>
      </div>
    </div>
  );
}

function ActionButtons({ inv, updateStatus, deleteInvoice, isClient }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-2">
      {isClient && (
        <PDFDownloadLink
          document={<InvoicePDF invoice={inv} />}
          fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
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
          onClick={() => setOpen(!open)}
          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"
        >
          <MoreVertical size={16} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2">
            {inv.status !== "Payée" && (
              <button
                onClick={() => {
                  updateStatus(inv.id, "Payée");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-bold"
              >
                Marquer payée
              </button>
            )}
            <button
              onClick={() => {
                deleteInvoice(inv.id);
                setOpen(false);
              }}
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
