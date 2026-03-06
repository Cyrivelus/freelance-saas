"use client";

import { useEffect, useState } from "react";
import { Plus, X, Download, Loader2 } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        fetch("/api/invoices", { cache: "no-store" }),
        fetch("/api/clients", { cache: "no-store" }),
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(Array.isArray(invData) ? invData : []);
      }

      if (cliRes.ok) {
        const cliData = await cliRes.json();
        setClients(Array.isArray(cliData) ? cliData : []);
      }
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClientId,
          amount: amount,
        }),
      });

      // Gestion sécurisée de la réponse pour éviter "Unexpected end of JSON"
      const contentType = res.headers.get("content-type");
      if (res.ok) {
        setIsModalOpen(false);
        setAmount("");
        setSelectedClientId("");
        fetchData();
      } else if (contentType && contentType.includes("application/json")) {
        const err = await res.json();
        alert("Erreur API: " + (err.error || "Inconnue"));
      } else {
        alert(
          "Erreur serveur (Code " +
            res.status +
            "). Vérifiez le nom de votre fichier route.ts",
        );
      }
    } catch (err) {
      alert("Erreur de connexion réseau");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500">Gestion de la facturation</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={18} /> Créer une facture
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                Client
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                Montant
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                Statut
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="animate-spin inline text-blue-600" />
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {inv.clients?.name || "Client #" + inv.client_id}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-bold">
                    {Number(inv.amount).toLocaleString()} €
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === "Payée" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Download
                      size={18}
                      className="text-gray-400 cursor-pointer hover:text-blue-600"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Nouvelle facture
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Client bénéficiaire
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Montant total (€)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all mt-4"
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
