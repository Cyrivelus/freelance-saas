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

  // 1. Fonction pour charger les clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Fonction pour créer le client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameToSubmit = newClientName.trim();
    if (!nameToSubmit) {
      alert("Veuillez entrer un nom valide");
      return;
    }

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nameToSubmit }),
      });

      const result = await res.json();

      if (res.ok) {
        setNewClientName("");
        setIsModalOpen(false);
        fetchClients(); // On rafraîchit la liste
      } else {
        // Affiche l'erreur précise de Supabase (ex: colonne manquante)
        alert(
          `Erreur technique : ${result.error || "Impossible de créer le client"}`,
        );
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Clients
          </h1>
          <p className="text-gray-500">
            Consultez et gérez vos partenaires commerciaux.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus size={18} />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
        />
      </div>

      {/* Table des clients */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Nom
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Statut
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                  Total Facturé
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Date d'ajout
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          client.status === "Actif"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {client.status || "Actif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-700">
                      {(client.total_invoiced || 0).toLocaleString("fr-FR")} €
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString(
                            "fr-FR",
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ajouter un client
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-5">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de l'entreprise / Client
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="ex: Google France"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                Créer le profil client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
