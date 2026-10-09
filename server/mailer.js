import nodemailer from "nodemailer";

let transport;

function getTransport() {
  if (transport !== undefined) return transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP_HOST/SMTP_USER/SMTP_PASS not set — offline chat alert emails are disabled.");
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

// Fire-and-forget: never throws, so a mail failure cannot break chat.
export async function sendOfflineAlert(message) {
  const t = getTransport();
  if (!t) return;
  const to = process.env.ALERT_TO || "aishua782@gmail.com";
  const cc = process.env.ALERT_CC || "suraj2468369@gmail.com";
  const adminUrl = process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/$/, "")}/admin` : "";
  const p = message.product;

  const text = [
    `New chat message from "${message.username}" while you were offline.`,
    "",
    message.text,
    p ? `\nProduct: ${p.name} (₹${p.price})` : "",
    adminUrl ? `\nReply in the admin Chat tab: ${adminUrl}` : "",
  ].join("\n");

  const html =
    `<p>New chat message from <strong>${esc(message.username)}</strong> while you were offline.</p>` +
    `<blockquote>${esc(message.text)}</blockquote>` +
    (p ? `<p>Product: <strong>${esc(p.name)}</strong> (₹${esc(p.price)})</p>${p.image ? `<img src="${esc(p.image)}" alt="" width="120">` : ""}` : "") +
    (adminUrl ? `<p><a href="${esc(adminUrl)}">Open admin Chat tab</a></p>` : "");

  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      cc,
      subject: `New chat message from ${message.username}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Failed to send offline alert email:", err.message);
  }
}
