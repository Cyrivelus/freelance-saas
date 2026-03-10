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
  Printer,
  Target,
} from "lucide-react";

// --- IMPORTS DYNAMIQUES CORRIGÉS ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Loader2 className="animate-spin" size={18} /> },
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
  const [isClient, setIsClient] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [periodFilter, setPeriodFilter] = useState("Mois");

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/clients"),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, s: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) fetchData();
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Supprimer définitivement cette facture ?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // --- LOGIQUE MÉTIER ---
  const { stats, monthlyProgress, processedInvoices } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);

    let currentMonthTotal = 0;
    let lastMonthTotal = 0;

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
            invDate.getMonth() === lastMonthDate.getMonth() &&
            invDate.getFullYear() === lastMonthDate.getFullYear();
        } else if (periodFilter === "Annee") {
          matchesPeriod = invDate.getFullYear() === currentYear;
        }
        return matchesSearch && matchesStatus && matchesPeriod;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    invoices.forEach((inv) => {
      const d = new Date(inv.created_at);
      const val = Number(inv.amount);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
        currentMonthTotal += val;
      if (
        d.getMonth() === lastMonthDate.getMonth() &&
        d.getFullYear() === lastMonthDate.getFullYear()
      )
        lastMonthTotal += val;
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
        countPending: invoices.filter((i) => i.status === "En attente").length,
      },
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <h1 className="text-3xl font-black text-gray-900">Invoices</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">
              Objectif Mensuel
            </h3>
            <span
              className={
                monthlyProgress.growth >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              {monthlyProgress.growth >= 0 ? "+" : ""}
              {monthlyProgress.growth.toFixed(1)}%
            </span>
          </div>
          <div className="text-3xl font-black mb-4">
            {monthlyProgress.current.toLocaleString()} €
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${monthlyProgress.percent}%` }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <StatWidget
            label="Payées"
            val={stats.totalPaid}
            color="text-green-600"
            bg="bg-green-50"
            icon={TrendingUp}
          />
          <StatWidget
            label="Attente"
            val={stats.totalPending}
            color="text-amber-600"
            bg="bg-amber-50"
            icon={Clock}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-gray-50 px-4 py-3 rounded-xl font-bold text-blue-600 outline-none"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="Mois">Ce mois</option>
            <option value="DernierMois">Mois dernier</option>
            <option value="Annee">Cette année</option>
            <option value="Tous">Tout</option>
          </select>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-4">Client</th>
              <th className="px-8 py-4">Montant TTC</th>
              <th className="px-8 py-4">Statut</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {processedInvoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-blue-50/20 transition-colors"
              >
                <td className="px-8 py-5">
                  <div className="font-bold text-gray-900">
                    {inv.clients?.name || "Client"}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    ID: {inv.id.substring(0, 8)}
                  </div>
                </td>
                <td className="px-8 py-5 font-black">
                  {Number(inv.amount).toLocaleString()} €
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${inv.status === "Payée" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
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

      {/* Modal simplifié */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Nouvelle Facture</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>
            <form
              className="space-y-4"
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
            >
              <select
                required
                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
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
                className="w-full p-4 bg-gray-50 rounded-xl font-black text-xl outline-none"
                placeholder="0.00 €"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black"
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

function StatWidget({ label, val, color, bg, icon: Icon }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
      <div className={`p-3 ${bg} ${color} rounded-xl`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] font-black text-gray-400 uppercase">
          {label}
        </div>
        <div className="text-xl font-black">{val.toLocaleString()} €</div>
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
          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
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
          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 transition-all"
        >
          <MoreVertical size={16} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
            <button
              onClick={() => {
                updateStatus(inv.id, "Payée");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-green-600 font-bold hover:bg-green-50 transition-colors"
            >
              Marquer payée
            </button>
            <button
              onClick={() => {
                deleteInvoice(inv.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
