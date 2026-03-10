"use client";

import { useEffect, useState } from "react";
import { UserPlus, MoreVertical, Search, X } from "lucide-react";

interface Client {
  id: number;
  name: string;
  status: string;
  total_invoiced: number | null;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      if (res.ok) {
        setNewClientName("");
        setIsModalOpen(false);
        fetchClients();
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header : Stack vertical sur mobile, horizontal sur desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestion des Clients
          </h1>
          <p className="text-sm text-gray-500">
            Gérez vos partenaires commerciaux.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={18} />
          <span className="font-semibold text-sm">Nouveau Client</span>
        </button>
      </div>

      {/* Barre de recherche responsive */}
      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
        />
      </div>

      {/* Conteneur de table avec scroll horizontal maîtrisé */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nom
                </th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Statut
                </th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  Total
                </th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 md:px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Aucun client.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900 truncate max-w-[150px]">
                      {client.name}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          client.status === "Actif"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {client.status || "Actif"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right font-semibold">
                      {client.total_invoiced || 0} €
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-500 text-xs">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString(
                            "fr-FR",
                          )
                        : "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Ajouter un client</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Nom de l'entreprise
              </label>
              <input
                autoFocus
                required
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="ex: Acme Corp"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700"
              >
                Créer le profil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
