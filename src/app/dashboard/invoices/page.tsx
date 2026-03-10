"use client";

import { useEffect, useState, useMemo } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/InvoicePDF";
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
  Filter,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // États pour le filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

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

  // --- CALCUL DES STATS ---
  const stats = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === "Payée");
    const pending = invoices.filter((inv) => inv.status === "En attente");

    return {
      totalPaid: paid.reduce((acc, curr) => acc + Number(curr.amount), 0),
      totalPending: pending.reduce((acc, curr) => acc + Number(curr.amount), 0),
      countPending: pending.length,
    };
  }, [invoices]);

  // --- FILTRAGE DES DONNÉES ---
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.clients?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Tous" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- ACTIONS ---
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActiveMenu(null);
        fetchData();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActiveMenu(null);
        fetchData();
      }
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        setSelectedClientId("");
        fetchData();
      }
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-gray-900">Facturation</h1>
          <p className="text-gray-500">Suivez vos revenus et vos clients</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold"
        >
          <Plus size={20} /> Nouvelle facture
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-500">Encaissé</p>
            <p className="text-2xl font-black text-gray-900">
              {stats.totalPaid.toLocaleString()} €
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-500">En attente</p>
            <p className="text-2xl font-black text-gray-900">
              {stats.totalPending.toLocaleString()} €
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-500">
              Factures à régler
            </p>
            <p className="text-2xl font-black text-gray-900">
              {stats.countPending}
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Payée">Payée</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">
                  Client
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">
                  Montant
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2
                      className="animate-spin inline text-blue-600"
                      size={32}
                    />
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <p className="text-gray-900 font-bold">
                        {inv.clients?.name || "Client #" + inv.client_id}
                      </p>
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">
                        ID: {inv.id.substring(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-black text-xl">
                      {Number(inv.amount).toLocaleString()} €
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          inv.status === "Payée"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inv.status === "Payée" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isClient && (
                          <PDFDownloadLink
                            document={<InvoicePDF invoice={inv} />}
                            fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
                            className="p-2.5 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                          >
                            {({ loading: pdfLoading }) =>
                              pdfLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Download size={18} />
                              )
                            }
                          </PDFDownloadLink>
                        )}

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === inv.id ? null : inv.id,
                              )
                            }
                            className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-xl transition"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenu === inv.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              {inv.status !== "Payée" && (
                                <button
                                  onClick={() => updateStatus(inv.id, "Payée")}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-bold"
                                >
                                  <CheckCircle size={18} /> Marquer comme payée
                                </button>
                              )}

                              {isClient && (
                                <PDFDownloadLink
                                  document={<InvoicePDF invoice={inv} />}
                                  fileName={`facture-${inv.id.substring(0, 5)}.pdf`}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {({ loading: pdfLoading }) => (
                                    <>
                                      <Download size={18} />
                                      {pdfLoading
                                        ? "Génération..."
                                        : "Télécharger PDF"}
                                    </>
                                  )}
                                </PDFDownloadLink>
                              )}

                              <div className="h-px bg-gray-100 my-1 mx-2"></div>

                              <button
                                onClick={() => deleteInvoice(inv.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold"
                              >
                                <Trash2 size={18} /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-400">
                    Aucune facture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de création (Idem à la version précédente mais avec design affiné) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Nouvelle facture</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-6">
              <div className="text-left">
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                  Client
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition font-bold"
                >
                  <option value="">Choisir un client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-left">
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                  Montant total (€)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition text-xl font-black"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mt-4"
              >
                Générer & Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
