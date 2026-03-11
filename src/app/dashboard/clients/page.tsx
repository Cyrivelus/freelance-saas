"use client";

import { useEffect, useState, useMemo } from "react";
import {
  UserPlus,
  MoreVertical,
  Search,
  X,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Edit2,
  Trash2,
  Mail,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  status: string;
  total_invoiced: number | null;
  created_at: string;
}

type SortKey = "name" | "total_invoiced" | "created_at";
type SortDir = "asc" | "desc";

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Formulaire
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState("Actif");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".action-menu")) setActiveMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── Ouvrir modal création ────────────────────────────────────
  const openCreate = () => {
    setEditClient(null);
    setFormName("");
    setFormEmail("");
    setFormStatus("Actif");
    setFormError("");
    setIsModalOpen(true);
  };

  // ── Ouvrir modal édition ─────────────────────────────────────
  const openEdit = (c: Client) => {
    setEditClient(c);
    setFormName(c.name);
    setFormEmail(c.email || "");
    setFormStatus(c.status);
    setFormError("");
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  // ── Soumettre formulaire ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Le nom est requis.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const url = editClient ? `/api/clients/${editClient.id}` : "/api/clients";
      const method = editClient ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          status: formStatus,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Supprimer ────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    setActiveMenu(null);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) fetchClients();
      else alert("Erreur lors de la suppression.");
    } catch {
      alert("Erreur réseau.");
    }
  };

  // ── Changer statut rapide ────────────────────────────────────
  const toggleStatus = async (c: Client) => {
    const newStatus = c.status === "Actif" ? "Inactif" : "Actif";
    setActiveMenu(null);
    try {
      await fetch(`/api/clients/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchClients();
    } catch {
      alert("Erreur réseau.");
    }
  };

  // ── Tri ──────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Filtrage + tri ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const matchSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
          statusFilter === "Tous" || c.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let va: any = a[sortKey] ?? "";
        let vb: any = b[sortKey] ?? "";
        if (sortKey === "total_invoiced") {
          va = Number(va);
          vb = Number(vb);
        }
        if (sortKey === "created_at") {
          va = new Date(va).getTime();
          vb = new Date(vb).getTime();
        }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [clients, searchTerm, statusFilter, sortKey, sortDir]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: clients.length,
      actifs: clients.filter((c) => c.status === "Actif").length,
      inactifs: clients.filter((c) => c.status !== "Actif").length,
      ca: clients.reduce((s, c) => s + Number(c.total_invoiced || 0), 0),
    }),
    [clients],
  );

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? null : sortDir === "asc" ? (
      <ChevronUp size={12} className="inline ml-1" />
    ) : (
      <ChevronDown size={12} className="inline ml-1" />
    );

  // ─────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 font-medium">
            {stats.total} client{stats.total > 1 ? "s" : ""} enregistré
            {stats.total > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Nouveau client
        </button>
      </div>

      {/* Stats widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total clients",
            val: stats.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Actifs",
            val: stats.actifs,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Inactifs",
            val: stats.inactifs,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "CA Total (€)",
            val: stats.ca.toLocaleString(),
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50",
            suffix: "",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 ${s.bg} ${s.color} rounded-2xl`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-xl font-black text-gray-900">
                {s.val}
                {s.suffix !== "" ? " €" : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-600 outline-none cursor-pointer"
        >
          <option value="Tous">Tous les statuts</option>
          <option value="Actif">Actifs</option>
          <option value="Inactif">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th
                  className="px-8 py-5 cursor-pointer hover:text-gray-600"
                  onClick={() => handleSort("name")}
                >
                  Nom <SortIcon k="name" />
                </th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Statut</th>
                <th
                  className="px-8 py-5 cursor-pointer hover:text-gray-600 text-right"
                  onClick={() => handleSort("total_invoiced")}
                >
                  CA facturé <SortIcon k="total_invoiced" />
                </th>
                <th
                  className="px-8 py-5 cursor-pointer hover:text-gray-600"
                  onClick={() => handleSort("created_at")}
                >
                  Date création <SortIcon k="created_at" />
                </th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-16 text-center text-gray-400 font-bold"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <p className="text-gray-400 font-bold">
                      Aucun client trouvé.
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-blue-600 text-sm font-bold hover:underline"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Mail size={13} />
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-gray-300 italic text-xs">
                          Non renseigné
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                          client.status === "Actif"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {client.status || "Actif"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-gray-900">
                      {Number(client.total_invoiced || 0).toLocaleString()} €
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString(
                            "fr-FR",
                          )
                        : "—"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="relative action-menu inline-block">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === client.id ? null : client.id,
                            )
                          }
                          className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenu === client.id && (
                          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2 animate-in slide-in-from-top-2 duration-150">
                            <button
                              onClick={() => openEdit(client)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold flex items-center gap-3 transition-colors"
                            >
                              <Edit2 size={14} className="text-blue-500" />{" "}
                              Modifier
                            </button>
                            <button
                              onClick={() => toggleStatus(client)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold flex items-center gap-3 transition-colors"
                            >
                              <Eye size={14} className="text-amber-500" />
                              {client.status === "Actif"
                                ? "Désactiver"
                                : "Réactiver"}
                            </button>
                            <div className="my-1 border-t border-gray-50" />
                            <button
                              onClick={() =>
                                handleDelete(client.id, client.name)
                              }
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 transition-colors"
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer table */}
        {filtered.length > 0 && (
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-bold">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              {searchTerm || statusFilter !== "Tous"
                ? ` sur ${clients.length}`
                : ""}
            </p>
            <p className="text-xs text-gray-400">
              CA total sélection :{" "}
              <span className="font-black text-gray-700">
                {filtered
                  .reduce((s, c) => s + Number(c.total_invoiced || 0), 0)
                  .toLocaleString()}{" "}
                €
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL CRÉATION / ÉDITION ────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                {editClient ? "Modifier le client" : "Nouveau client"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                  Nom de l'entreprise *
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex : Acme Corp"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@entreprise.com"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                  Statut
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              {/* Erreur */}
              {formError && (
                <p className="text-red-600 text-sm font-bold bg-red-50 px-4 py-3 rounded-2xl">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Enregistrement..."
                  : editClient
                    ? "Enregistrer les modifications"
                    : "Créer le client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
