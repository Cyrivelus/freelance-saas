"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  Printer,
  Target,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// IMPORTS DYNAMIQUES
// PDFDownloadLink doit être importé via un wrapper pour éviter
// l'erreur "su is not a function" avec Turbopack / Next.js 15+
// ─────────────────────────────────────────────────────────────
const BulkPDFButton = dynamic(
  () => import("@/components/BulkPDFButton").then((mod) => mod.BulkPDFButton),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl text-xs font-black cursor-not-allowed"
      >
        <Loader2 size={16} className="animate-spin" />
      </button>
    ),
  },
);

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
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
  const [statusFilter] = useState("Tous");
  const [periodFilter, setPeriodFilter] = useState("Tous");

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/clients"),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // ── Logique métier ──────────────────────────────────────────
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

  // ── Export CSV (après processedInvoices) ────────────────────
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
    link.download = `export-${periodFilter}-${Date.now()}.csv`;
    link.click();
  };

  // ─────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Facturation</h1>
          <p className="text-sm text-gray-500 font-medium">
            Gestion et exportations PDF / CSV
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectif mensuel */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target size={18} className="text-blue-600" />
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">
                  Objectif Mensuel
                </h3>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Référence mois précédent :{" "}
                {monthlyProgress.last.toLocaleString()} €
              </p>
            </div>
            <span
              className={`text-sm font-black ${
                monthlyProgress.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
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
                / {monthlyProgress.last.toLocaleString()} €
              </span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-200"
                style={{ width: `${monthlyProgress.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Widgets */}
        <div className="space-y-4">
          <StatWidget
            label="Encaissé Total"
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
            label="Docs à traiter"
            val={stats.countPending}
            color="text-red-600"
            bg="bg-red-50"
            icon={AlertCircle}
            suffix=" alertes"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-blue-600 outline-none cursor-pointer"
          >
            <option value="Tous">Toutes les périodes</option>
            <option value="Mois">Mois en cours</option>
            <option value="DernierMois">Mois dernier</option>
            <option value="Annee">Cette année</option>
          </select>
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={exportToCSV}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-black text-xs hover:bg-green-100 transition-colors"
            >
              <FileSpreadsheet size={16} /> CSV
            </button>

            {/*
              BulkPDFButton est un wrapper client dédié.
              Il importe PDFDownloadLink + BulkInvoicePDF en lazy
              pour contourner l'erreur Turbopack "su is not a function".
            */}
            {isClient && processedInvoices.length > 0 && (
              <BulkPDFButton
                invoices={processedInvoices}
                periodFilter={periodFilter}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
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
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {inv.clients?.name || "Client"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                        ID: {inv.id.substring(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-xl font-black text-gray-900">
                      {Number(inv.amount).toLocaleString()} €
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                          inv.status === "Payée"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ActionButtons
                        inv={inv}
                        updateStatus={updateStatus}
                        deleteInvoice={deleteInvoice}
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
              Aucune facture trouvée pour cette sélection.
            </p>
          </div>
        )}
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form
              className="space-y-6"
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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                  Client
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Choisir un client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                  Montant de la prestation
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 €"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Générer la facture
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPOSANTS AUXILIAIRES
// ─────────────────────────────────────────────────────────────
function StatWidget({
  label,
  val,
  color,
  bg,
  icon: Icon,
  suffix = " €",
}: {
  label: string;
  val: number;
  color: string;
  bg: string;
  icon: any;
  suffix?: string;
}) {
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

function ActionButtons({ inv, updateStatus, deleteInvoice }: any) {
  const [open, setOpen] = useState(false);
  const [PDFLink, setPDFLink] = useState<any>(null);
  const [InvoicePDFComp, setInvoicePDFComp] = useState<any>(null);

  useEffect(() => {
    // Import direct au montage — contourne l'erreur Turbopack
    // "su is not a function" causée par dynamic() sur PDFDownloadLink
    Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/InvoicePDF"),
    ])
      .then(([pdfMod, invMod]) => {
        setPDFLink(() => pdfMod.PDFDownloadLink);
        setInvoicePDFComp(() => invMod.InvoicePDF ?? (invMod as any).default);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex items-center justify-end gap-2">
      {PDFLink && InvoicePDFComp ? (
        <PDFLink
          document={<InvoicePDFComp invoice={inv} />}
          fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          {({ loading: l }: { loading: boolean }) =>
            l ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )
          }
        </PDFLink>
      ) : (
        <button
          disabled
          className="p-3 bg-gray-50 text-gray-200 rounded-xl shadow-sm cursor-not-allowed"
        >
          <Download size={16} />
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
        >
          <MoreVertical size={16} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2 animate-in slide-in-from-top-2 duration-200">
            {inv.status !== "Payée" && (
              <button
                onClick={() => {
                  updateStatus(inv.id, "Payée");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-bold transition-colors"
              >
                Marquer comme payée
              </button>
            )}
            <button
              onClick={() => {
                deleteInvoice(inv.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
