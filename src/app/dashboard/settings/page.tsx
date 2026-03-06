"use client";

import { useState } from "react";
import { User, Bell, Lock, CreditCard, Save, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Paramètres enregistrés !");
    }, 1000);
  };

  return (
    <div
      className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} p-8 min-h-screen transition-colors duration-300 text-left`}
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            Gérez votre compte et vos préférences
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white shadow-sm"}`}
        >
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-gray-600" />
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {[
            { id: "profil", label: "Profil", icon: User },
            { id: "notif", label: "Notifications", icon: Bell },
            { id: "security", label: "Sécurité", icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu Dynamique */}
        <div className="md:col-span-3">
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-8 rounded-3xl border shadow-sm`}
          >
            {activeTab === "profil" && (
              <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-xl font-bold mb-4">
                  Informations entreprise
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      placeholder="Mon Entreprise SAS"
                      className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Numéro de SIRET
                    </label>
                    <input
                      type="text"
                      placeholder="123 456 789 00012"
                      className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={18} />{" "}
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </form>
            )}

            {activeTab === "notif" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">
                  Préférences de notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                    <p className="font-medium">
                      Alertes de paiement par e-mail
                    </p>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Sécurité du compte</h2>
                <button className="w-full p-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                  Changer le mot de passe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
