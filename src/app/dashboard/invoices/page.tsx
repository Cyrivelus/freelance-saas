"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  X,
  Download,
  Loader2,
  MoreVertical,
  CheckCircle,
  Trash2,
  Clock,
  Search,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

// Imports dynamiques pour la performance
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false },
);
const InvoicePDF = dynamic(
  () => import("@/components/InvoicePDF").then((mod) => mod.InvoicePDF),
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE CSV ---
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
    link.setAttribute(
      "download",
      `export-factures-${new Date().getMonth() + 1}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- STATS & GRAPHIQUE ---
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

  const processedInvoices = useMemo(() => {
    const result = invoices.filter((inv) => {
      const matchesSearch = (inv.clients?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "Tous" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return result.sort((a, b) => {
      if (sortBy === "amount-desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [invoices, searchTerm, statusFilter, sortBy]);

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
    if (!confirm("Supprimer ?")) return;
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
            Suivi financier en temps réel
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Stats & Graphique Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">
              Évolution Revenus (6 mois)
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
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap">
                    {d.total.toLocaleString()} €
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
              className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>
                <s.icon size={20} />
              </div>
              <div className="text-left">
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

      {/* Barre d'outils avec Export CSV */}
      <div className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
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
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-green-50 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet size={18} /> Export CSV
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:flex-none px-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-gray-600 outline-none"
          >
            <option value="recent">Plus récentes</option>
            <option value="amount-desc">Montants ↑</option>
            <option value="amount-asc">Montants ↓</option>
          </select>
        </div>
      </div>

      {/* Liste de factures */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : processedInvoices.length > 0 ? (
          <>
            <div className="hidden md:block bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5 text-left">Client & Réf</th>
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
                      <td className="px-8 py-6 text-left">
                        <p className="font-bold text-gray-900">
                          {inv.clients?.name || "Client #" + inv.client_id}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          ID: {inv.id.substring(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-xl font-black text-gray-900">
                        {Number(inv.amount).toLocaleString()} €
                      </td>
                      <td className="px-8 py-6">
                        <Badge status={inv.status} />
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

            <div className="md:hidden space-y-4">
              {processedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm space-y-6 relative"
                >
                  <div
                    className={`absolute top-0 left-0 w-2 h-full ${inv.status === "Payée" ? "bg-green-500" : "bg-amber-500"}`}
                  />
                  <div className="flex justify-between items-start pl-2">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                        Client
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {inv.clients?.name || "Client"}
                      </p>
                    </div>
                    <Badge status={inv.status} />
                  </div>
                  <div className="flex justify-between items-center pl-2">
                    <p className="text-3xl font-black text-gray-900">
                      {Number(inv.amount).toLocaleString()} €
                    </p>
                    <ActionButtons
                      inv={inv}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      updateStatus={updateStatus}
                      deleteInvoice={deleteInvoice}
                      isClient={isClient}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-20 text-center text-gray-400 font-bold">
            Aucune facture trouvée
          </div>
        )}
      </div>

      {/* Modal Facture */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                Nouvelle Facture
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetch("/api/invoices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    client_id: selectedClientId,
                    amount,
                    status: "En attente",
                  }),
                }).then(() => {
                  setIsModalOpen(false);
                  setAmount("");
                  fetchData();
                });
              }}
              className="space-y-6"
            >
              <div className="text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">
                  Client
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">
                  Montant (€)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all"
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

function Badge({ status }: { status: string }) {
  const isPaid = status === "Payée";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
    >
      {status}
    </span>
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
    <div className="flex items-center gap-2 relative">
      {isClient && (
        <PDFDownloadLink
          document={<InvoicePDF invoice={inv} />}
          fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
          className="p-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          {({ loading }) =>
            loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )
          }
        </PDFDownloadLink>
      )}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(activeMenu === inv.id ? null : inv.id)}
          className="p-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all"
        >
          <MoreVertical size={18} />
        </button>
        {activeMenu === inv.id && (
          <div className="absolute right-0 bottom-full md:bottom-auto md:top-full mb-2 md:mt-2 w-56 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] py-3 overflow-hidden">
            {inv.status !== "Payée" && (
              <button
                onClick={() => updateStatus(inv.id, "Payée")}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm text-green-600 hover:bg-green-50 font-black"
              >
                Valider paiement
              </button>
            )}
            <button
              onClick={() => deleteInvoice(inv.id)}
              className="w-full flex items-center gap-3 px-6 py-4 text-sm text-red-600 hover:bg-red-50 font-black"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
