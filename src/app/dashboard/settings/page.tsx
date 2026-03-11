"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  Camera,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Champs profil entreprise
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Notifications
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifNewClient, setNotifNewClient] = useState(false);
  const [notifMonthly, setNotifMonthly] = useState(true);

  // Charger les paramètres sauvegardés depuis Supabase
  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setCompanyName(d.company_name ?? "");
          setSiret(d.siret ?? "");
          setPhone(d.phone ?? "");
          setAddress(d.address ?? "");
          setNotifPayment(d.notif_payment ?? true);
          setNotifNewClient(d.notif_new_client ?? false);
          setNotifMonthly(d.notif_monthly ?? true);
        }
      })
      .catch(() => {});
  }, [user?.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          siret,
          phone,
          address,
          notif_payment: notifPayment,
          notif_new_client: notifNewClient,
          notif_monthly: notifMonthly,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const tabs = [
    { id: "profil", label: "Profil", icon: User },
    { id: "notif", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-3xl font-black text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Gérez votre compte et vos préférences
        </p>
      </div>

      {/* Toast succès */}
      {saved && (
        <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-semibold text-sm animate-in slide-in-from-top-2">
          <CheckCircle size={18} />
          Paramètres enregistrés avec succès
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation latérale */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="md:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          {/* ── ONGLET PROFIL ── */}
          {activeTab === "profil" && (
            <form onSubmit={handleSave} className="space-y-8">
              {/* Avatar Google (lecture seule) */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="avatar"
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl">
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-gray-100 rounded-lg border border-gray-200">
                    <Camera size={14} className="text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">
                    {user?.name ?? "—"}
                  </p>
                  <p className="text-sm text-gray-400">{user?.email ?? "—"}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                    Connecté via Google
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">
                  Informations entreprise
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Nom de l'entreprise"
                    placeholder="Mon Entreprise SAS"
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <Field
                    label="Numéro SIRET"
                    placeholder="123 456 789 00012"
                    value={siret}
                    onChange={setSiret}
                  />
                  <Field
                    label="Téléphone"
                    placeholder="+33 6 00 00 00 00"
                    value={phone}
                    onChange={setPhone}
                  />
                  <Field
                    label="Adresse"
                    placeholder="12 rue des Lilas, 75001 Paris"
                    value={address}
                    onChange={setAddress}
                  />
                </div>
              </div>

              <SaveButton loading={loading} />
            </form>
          )}

          {/* ── ONGLET NOTIFICATIONS ── */}
          {activeTab === "notif" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">
                Préférences de notifications
              </h2>
              <div className="space-y-3">
                <Toggle
                  label="Alertes de paiement"
                  desc="Recevoir un email quand une facture est marquée payée"
                  checked={notifPayment}
                  onChange={setNotifPayment}
                />
                <Toggle
                  label="Nouveau client ajouté"
                  desc="Notification à chaque ajout de client"
                  checked={notifNewClient}
                  onChange={setNotifNewClient}
                />
                <Toggle
                  label="Récapitulatif mensuel"
                  desc="Résumé de votre activité en début de mois"
                  checked={notifMonthly}
                  onChange={setNotifMonthly}
                />
              </div>
              <SaveButton loading={loading} />
            </form>
          )}

          {/* ── ONGLET SÉCURITÉ ── */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">
                Sécurité du compte
              </h2>

              {/* Info OAuth */}
              <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <Shield
                  size={20}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="font-bold text-blue-900 text-sm">
                    Authentification Google OAuth 2.0
                  </p>
                  <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                    Votre compte est sécurisé par Google. Aucun mot de passe
                    n'est stocké dans notre système. La gestion de la sécurité
                    (2FA, récupération) se fait directement depuis votre compte
                    Google.
                  </p>
                </div>
              </div>

              {/* Infos session */}
              <div className="space-y-3">
                <InfoRow label="Email connecté" value={user?.email ?? "—"} />
                <InfoRow label="Nom du compte" value={user?.name ?? "—"} />
                <InfoRow label="Fournisseur" value="Google" />
              </div>

              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition"
              >
                Gérer la sécurité sur Google →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Composants auxiliaires ──────────────────────────────────

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-sm"
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" /> Enregistrement…
        </>
      ) : (
        <>
          <Save size={18} /> Enregistrer
        </>
      )}
    </button>
  );
}
