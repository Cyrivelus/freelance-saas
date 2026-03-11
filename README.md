# FreelanceSaaS — Plateforme de Gestion pour Freelances

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://votre-app.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-blue?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)](https://supabase.com/)
[![Auth](https://img.shields.io/badge/Auth-Google%20OAuth-red?style=flat&logo=google)](https://next-auth.js.org/)

Application Full-Stack moderne pour freelances : gestion clients, facturation PDF, suivi des revenus et isolation complète des données par utilisateur.

---

## ✨ Fonctionnalités

### 🆓 Plan Gratuit

- Tableau de bord avec statistiques mensuelles
- Gestion de **jusqu'à 3 clients**
- Création de **5 factures/mois**
- Export CSV basique
- Connexion sécurisée via **Google OAuth** (aucun mot de passe)
- Données strictement isolées par utilisateur

### 💎 Plan Pro — 19€/mois _(à venir)_

| Fonctionnalité                             | Gratuit |     Pro      |
| ------------------------------------------ | :-----: | :----------: |
| Clients                                    |    3    | **Illimité** |
| Factures/mois                              |    5    | **Illimité** |
| Export PDF individuel                      |   ✅    |      ✅      |
| Export PDF groupé                          |   ❌    |      ✅      |
| Export CSV avancé                          |   ❌    |      ✅      |
| Personnalisation factures (logo, couleurs) |   ❌    |      ✅      |
| Rappels automatiques clients en retard     |   ❌    |      ✅      |
| Tableau de bord analytique avancé          |   ❌    |      ✅      |
| Multi-devises (EUR, USD, GBP…)             |   ❌    |      ✅      |
| API publique documentée (Swagger)          |   ❌    |      ✅      |
| Support prioritaire                        |   ❌    |      ✅      |
| Sous-domaine personnalisé                  |   ❌    |      ✅      |

---

## 🛠 Stack Technique

| Couche               | Technologie                                         |
| -------------------- | --------------------------------------------------- |
| **Frontend**         | Next.js 16 (App Router), Tailwind CSS, Lucide React |
| **Backend**          | Next.js API Routes, NextAuth.js                     |
| **Base de données**  | Supabase (PostgreSQL)                               |
| **Authentification** | Google OAuth 2.0 via NextAuth                       |
| **PDF**              | @react-pdf/renderer                                 |
| **Graphiques**       | Recharts                                            |
| **Déploiement**      | Vercel (CI/CD automatique sur push `main`)          |

---

## ⚡ Installation locale

### Prérequis

- Node.js 18+
- Un projet Supabase
- Un projet Google Cloud (OAuth 2.0)

### 1. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_USER/freelance-saas.git
cd freelance-saas
npm install
```

### 2. Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Google OAuth
# → https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# NextAuth
NEXTAUTH_SECRET=votre_secret_32_chars
NEXTAUTH_URL=${NEXT_PUBLIC_URL}

# URL du site
NEXT_PUBLIC_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxx
```

### 3. Base de données Supabase

Exécutez dans **Supabase → SQL Editor** :

```sql
-- Table utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  status text DEFAULT 'Actif',
  total_invoiced numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'En attente',
  created_at timestamptz DEFAULT now()
);

-- Index performances
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
```

### 4. Lancer en local

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔐 Authentification Google OAuth

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
2. **Créer des identifiants → ID client OAuth 2.0 → Application Web**
3. Ajoutez ces URI de redirection :
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://votre-app.vercel.app/api/auth/callback/google` (prod)
4. Copiez `Client ID` et `Client Secret` dans `.env.local`

---

## 🚢 Déploiement Vercel

Le projet est configuré pour un **déploiement automatique** à chaque push sur `main`.

### Variables à configurer dans Vercel

Dans **Vercel → Project → Settings → Environment Variables**, ajoutez toutes les variables du `.env.local` **sauf** `NEXT_PUBLIC_URL` (remplacez par votre domaine Vercel) et `NEXTAUTH_URL`.

> ⚠️ `NEXTAUTH_URL` doit pointer vers votre domaine de production :
> `https://votre-app.vercel.app`

---

## 📖 Documentation API

Accédez à la documentation Swagger interactive sur `/api-doc` (Plan Pro).

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth Google OAuth
│   │   ├── clients/              # CRUD clients (isolé par user)
│   │   └── invoices/             # CRUD factures (isolé par user)
│   ├── dashboard/
│   │   ├── clients/
│   │   ├── invoices/
│   │   └── settings/
│   └── login/
├── components/
│   ├── Sidebar.tsx               # Navigation + profil Google
│   ├── DashboardHeader.tsx
│   └── InvoicePDF.tsx
└── lib/
    ├── auth.ts                   # Config NextAuth
    └── supabase.ts
```

---

## 🤝 Contribution

Les PRs sont les bienvenues. Pour les changements majeurs, ouvrez d'abord une issue.

---

_Fait avec ❤️ — déployé sur Vercel_
