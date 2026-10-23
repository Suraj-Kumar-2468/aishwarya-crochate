import nodemailer from "nodemailer";

let transport;

function getTransport() {
  if (transport !== undefined) return transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP_HOST/SMTP_USER/SMTP_PASS not set — emails are disabled, so OTP emails will not be delivered.");
    transport = null;
    return transport;
  }
  const port = Number(SMTP_PORT) || 465;
  transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transport;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SHOP = () => process.env.SHOP_NAME || "Aishwarya Crochets";

async function deliver({ to, subject, text, html }) {
  const t = getTransport();
  if (!t) return; // Never log email contents or recipients: they carry OTPs and personal data.
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
  } catch (err) {
    console.error("Email delivery failed:", err.code || err.name);
  }
}

export function sendOtpEmail(to, name, otp, purpose = "verify") {
  const what = purpose === "reset" ? "reset your password" : "verify your email";
  const ignore = purpose === "reset"
    ? "If you did not request this, you can ignore this email. Your password has not changed."
    : "If you did not sign up, you can ignore this email.";
  return deliver({
    to,
    subject: `${otp} is your ${SHOP()} code`,
    text: `Hi ${name},

Your code to ${what} is ${otp}. It expires in 10 minutes. Never share it with anyone.

${ignore}`,
    html: `<p>Hi ${esc(name)},</p><p>Your code to ${what}:</p><p><strong style="font-size:24px;letter-spacing:6px">${esc(otp)}</strong></p><p>It expires in 10 minutes. Never share it with anyone.</p><p>${ignore}</p>`,
  });
}

export function sendSecurityNoticeEmail(to, name, message) {
  return deliver({
    to,
    subject: `Security notice from ${SHOP()}`,
    text: `Hi ${name},

${message}

If this was not you, contact us immediately.`,
    html: `<p>Hi ${esc(name)},</p><p>${esc(message)}</p><p>If this was not you, contact us immediately.</p>`,
  });
}
