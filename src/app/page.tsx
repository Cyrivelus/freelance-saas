import Link from "next/link";
import {
  CheckCircle,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* --- NAVIGATION --- */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          FreelanceSaaS
        </div>
        <div className="space-x-8 font-medium hidden md:flex">
          <a href="#features" className="hover:text-blue-600 transition">
            Fonctionnalités
          </a>
          <a href="/api-doc" className="hover:text-blue-600 transition">
            API
          </a>
        </div>
        <Link
          href="/login"
          className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition"
        >
          Connexion
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="px-8 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
          Gérez votre freelance{" "}
          <span className="text-blue-600">sans effort.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          La plateforme tout-en-un pour suivre vos clients, automatiser vos
          factures et visualiser votre croissance avec une précision
          chirurgicale.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Démarrer gratuitement <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-500 font-medium italic">
            Essai Pro gratuit de 14 jours
          </p>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<BarChart3 className="text-blue-600" />}
            title="Dashboard Temps Réel"
            desc="Visualisez vos revenus mensuels avec des graphiques interactifs haute performance."
          />
          <FeatureCard
            icon={<Users className="text-blue-600" />}
            title="Gestion Client"
            desc="Gardez un historique propre de tous vos échanges et de vos factures impayées."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-blue-600" />}
            title="API Sécurisée"
            desc="Exposez vos données via une API documentée sous Swagger pour vos propres outils."
          />
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="py-20 text-center border-t border-gray-100">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
          Propulsé par les meilleures technologies
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
          <span className="text-2xl font-bold italic">NEXT.JS</span>
          <span className="text-2xl font-bold italic">SUPABASE</span>
          <span className="text-2xl font-bold italic">STRIPE</span>
          <span className="text-2xl font-bold italic">TAILWIND</span>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
