import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
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

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    const { error: dbError } = await supabase
      .from("magic_links")
      .upsert(
        { email, token, expires_at: expires.toISOString(), used: false },
        { onConflict: "email" },
      );

    if (dbError) {
      console.error("Erreur DB:", dbError.message);
      return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"FreelanceSaaS" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Votre lien de connexion",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
          <h2>Connexion à votre compte</h2>
          <p>Ce lien est valable <strong>15 minutes</strong>.</p>
          <a href="${magicLink}"
             style="display:inline-block;padding:12px 24px;background:#4F46E5;
                    color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Se connecter
          </a>
          <p style="color:#666;font-size:13px;margin-top:16px;">
            Si vous n'avez pas demandé ce lien, ignorez cet email.
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
