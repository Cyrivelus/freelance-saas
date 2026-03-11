"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Shield,
  Bell,
  Lock,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

function Pillar({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "rgba(147,197,253,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#93c5fd",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            color: "#f1f5f9",
            fontSize: "0.85rem",
            fontWeight: 600,
            margin: "0 0 3px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: "0.85rem",
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            animation: "slideIn .3s ease forwards",
            background:
              t.type === "success"
                ? "#ecfdf5"
                : t.type === "error"
                  ? "#fef2f2"
                  : "#eff6ff",
            color:
              t.type === "success"
                ? "#065f46"
                : t.type === "error"
                  ? "#b91c1c"
                  : "#1e40af",
            border: `1px solid ${t.type === "success" ? "#a7f3d0" : t.type === "error" ? "#fca5a5" : "#bfdbfe"}`,
          }}
        >
          {t.type === "success" && <CheckCircle size={16} />}
          {t.type === "error" && <XCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  function addToast(message: string, type: Toast["type"] = "info") {
    const id = ++counter;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      addToast("Erreur lors de la connexion Google.", "error");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;1,700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Plus Jakarta Sans', sans-serif; }

        @keyframes slideIn  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinLoop { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }

        .fade-up { animation: fadeUp .45s ease forwards; }

        .google-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #1e293b;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all .2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .google-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .google-btn:active:not(:disabled) { transform: scale(.98); }
        .google-btn:disabled { opacity: .55; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid #e2e8f0;
          border-top-color: #1e3a8a;
          border-radius: 50%;
          animation: spinLoop 0.8s linear infinite;
          flex-shrink: 0;
        }

        .dot-bg {
          background-color: #f0f4ff;
          background-image: radial-gradient(#c7d2fe 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .divider {
          display: flex; align-items: center; gap: 12; margin: 28px 0;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }

        @media (max-width: 680px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .left-panel { display: none !important; }
          .right-panel { padding: 40px 28px !important; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      <div
        className="dot-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          className="login-grid"
          style={{
            maxWidth: 900,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(15,23,42,.14)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* ══ PANNEAU GAUCHE ══ */}
          <div
            className="left-panel"
            style={{
              background: "linear-gradient(160deg,#1e3a8a 0%,#0f172a 100%)",
              padding: "56px 44px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "-60px",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)",
              }}
            />

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 56,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1e3a8a",
                  }}
                >
                  <Sparkles size={22} fill="currentColor" />
                </div>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-.02em",
                  }}
                >
                  FreelanceSaaS
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontSize: "2.1rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#fff",
                  marginBottom: 14,
                }}
              >
                Votre espace,
                <br />
                <em style={{ color: "#93c5fd", fontStyle: "italic" }}>
                  sécurisé.
                </em>
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  marginBottom: 36,
                }}
              >
                Connexion via Google. Aucun mot de passe à mémoriser, sécurité
                maximale.
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Pillar
                  icon={<Shield size={16} />}
                  title="OAuth Google sécurisé"
                  desc="Authentification déléguée à Google — zéro mot de passe stocké."
                />
                <Pillar
                  icon={<Bell size={16} />}
                  title="Accès instantané"
                  desc="Un clic suffit. Google gère la vérification d'identité."
                />
                <Pillar
                  icon={<Lock size={16} />}
                  title="Données strictement isolées"
                  desc="Chaque requête filtre par user_id — vous ne voyez que vos données."
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 8px #34d399",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "#a5f3fc",
                  fontWeight: 500,
                }}
              >
                Données isolées — accès personnel uniquement
              </span>
            </div>
          </div>

          {/* ══ PANNEAU DROIT ══ */}
          <div
            className="right-panel fade-up"
            style={{
              background: "#fff",
              padding: "56px 52px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 6,
                letterSpacing: "-.02em",
              }}
            >
              Bon retour 👋
            </h1>
            <p
              style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 38 }}
            >
              Connectez-vous avec votre compte Google en un seul clic.
            </p>

            {/* Bouton Google */}
            <button
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Connexion en cours…
                </>
              ) : (
                <>
                  {/* Logo Google SVG officiel */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  Se connecter avec Google
                </>
              )}
            </button>

            {/* Séparateur */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "28px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                connexion sécurisée
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* Badges de sécurité */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  color: "#10b981",
                  bg: "#ecfdf5",
                  border: "#a7f3d0",
                  text: "Aucun mot de passe stocké",
                },
                {
                  color: "#2563eb",
                  bg: "#eff6ff",
                  border: "#bfdbfe",
                  text: "Authentification via Google OAuth 2.0",
                },
                {
                  color: "#7c3aed",
                  bg: "#f5f3ff",
                  border: "#ddd6fe",
                  text: "Accès limité à vos données uniquement",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <CheckCircle
                    size={14}
                    color={item.color}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: "0.78rem",
                color: "#94a3b8",
                marginTop: 28,
              }}
            >
              En vous connectant, vous acceptez nos{" "}
              <a
                href="/terms"
                style={{
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                conditions d'utilisation
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
