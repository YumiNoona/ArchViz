import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOtp } from "@/lib/supabase";

// ── Clients (all optional — whichever env vars are set will be used) ──────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ── SMS via Twilio ────────────────────────────────────────────────────────────
async function sendViaTwilio(to: string, code: string, projectTitle: string): Promise<boolean> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return false;

  // Normalize to E.164 — handle Indian 10-digit numbers automatically
  let phone = to.replace(/\s+/g, "").replace(/-/g, "");
  if (!phone.startsWith("+")) {
    // 10-digit Indian number → add +91
    if (phone.length === 10) phone = `+91${phone}`;
    else phone = `+${phone}`;
  }

  const body = `Your IPDS access code for ${projectTitle}: ${code}\nValid 10 mins. Do not share.`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, From: from, Body: body }).toString(),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("Twilio error:", data);
    return false;
  }
  console.log("OTP sent via Twilio SMS to", phone);
  return true;
}

// ── SMS via Vonage ────────────────────────────────────────────────────────────
async function sendViaVonage(to: string, code: string, projectTitle: string): Promise<boolean> {
  const apiKey    = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  if (!apiKey || !apiSecret) return false;

  // Vonage wants number without + prefix e.g. 919876543210
  let phone = to.replace(/\s+/g, "").replace(/-/g, "");
  if (phone.startsWith("+")) phone = phone.slice(1);
  else if (phone.length === 10) phone = `91${phone}`; // bare Indian number

  const text = `Your IPDS access code for ${projectTitle}: ${code}. Valid 10 mins.`;

  const res = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      api_secret: apiSecret,
      to: phone,
      from: process.env.VONAGE_SENDER_ID ?? "IPDS",
      text,
    }),
  });
  const data = await res.json();
  const msg  = data?.messages?.[0];
  if (!msg || msg.status !== "0") {
    console.error("Vonage error:", msg);
    return false;
  }
  console.log("OTP sent via Vonage SMS to", phone);
  return true;
}

// ── Email via Resend ──────────────────────────────────────────────────────────
async function sendViaResend(
  to: string, code: string, projectTitle: string, clientName: string
): Promise<boolean> {
  if (!resend) return false;
  const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your access code for ${projectTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#000000;color:#ffffff;border-radius:24px;border:1px solid #222222;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:24px;font-weight:500;letter-spacing:-0.5px;margin-bottom:6px;color:#ffffff;">${projectTitle}</div>
            <p style="font-size:11px;color:#666666;margin:0;text-transform:uppercase;font-weight:700;letter-spacing:0.2em;">IPDS | Interactive ArchViz</p>
          </div>
          <p style="font-size:14px;color:#999999;margin-bottom:24px;text-align:center;">Hi ${clientName ?? "there"}, here's your one-time access code:</p>
          <div style="background:#111111;border:1px solid #333333;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;font-weight:300;letter-spacing:12px;color:#e2ffaf;">${code}</div>
            <p style="font-size:10px;color:#555555;margin-top:16px;margin-bottom:0;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Valid for 10 minutes · One-time use</p>
          </div>
          <p style="font-size:11px;color:#444444;text-align:center;margin:0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log("OTP sent via Resend email to", to);
    return true;
  } catch (e) {
    console.error("Resend error:", e);
    return false;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { linkToken, phone, email, projectTitle, clientName } = await req.json();

    // Need either phone or email
    if (!linkToken || (!phone && !email)) {
      return NextResponse.json({ error: "Provide phone or email" }, { status: 400 });
    }

    // Create OTP code in DB (keyed to linkToken)
    const contact = phone || email;
    const { code, error: dbErr } = await createOtp(linkToken, contact);
    if (dbErr) return NextResponse.json({ error: dbErr }, { status: 500 });

    const title = projectTitle ?? "IPDS ArchViz";
    let sent = false;
    let channel = "";

    // ── Try SMS first (if phone provided) ──
    if (phone) {
      sent = await sendViaTwilio(phone, code, title);
      if (sent) channel = "sms-twilio";

      if (!sent) {
        sent = await sendViaVonage(phone, code, title);
        if (sent) channel = "sms-vonage";
      }
    }

    // ── Fallback to email ──
    if (!sent && email) {
      sent = await sendViaResend(email, code, title, clientName ?? "");
      if (sent) channel = "email-resend";
    }

    if (!sent) {
      return NextResponse.json(
        { error: "Could not send OTP — no working delivery channel configured." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, channel });
  } catch (e: unknown) {
    console.error("send-otp error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
