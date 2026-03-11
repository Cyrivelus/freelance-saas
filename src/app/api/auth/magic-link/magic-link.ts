import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Configurer le transporteur Gmail via nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST, // smtp.gmail.com
  port: Number(process.env.EMAIL_SERVER_PORT), // 465
  secure: true, // true pour le port 465
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    // Stocker le token dans Supabase
    const { error: dbError } = await supabase.from("magic_links").upsert(
      {
        email,
        token,
        expires_at: expires.toISOString(),
        used: false,
      },
      { onConflict: "email" },
    );

    if (dbError) {
      console.error("Erreur DB:", dbError.message);
      return NextResponse.json(
        { error: "Erreur lors de la création du lien" },
        { status: 500 },
      );
    }

    // Construire le lien magique
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Envoyer l'email via nodemailer / Gmail
    await transporter.sendMail({
      from: `"Votre App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Votre lien de connexion",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Connexion à votre compte</h2>
          <p>Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable <strong>15 minutes</strong>.</p>
          <a href="${magicLink}" 
             style="display:inline-block; padding:12px 24px; background:#4F46E5; color:#fff;
                    text-decoration:none; border-radius:6px; font-weight:bold;">
            Se connecter
          </a>
          <p style="margin-top:16px; color:#666; font-size:13px;">
            Si vous n'avez pas demandé ce lien, ignorez simplement cet email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Lien envoyé à " + email });
  } catch (err: any) {
    console.error("Erreur magic-link:", err.message);
    return NextResponse.json(
      { error: "Erreur serveur", details: err.message },
      { status: 500 },
    );
  }
}
