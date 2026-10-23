import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Customer from "../models/Customer.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendOtpEmail, sendSecurityNoticeEmail } from "../mailer.js";

const router = Router();

// Bump when the Privacy Policy / Terms text changes; stored with each customer's consent.
export const CONSENT_VERSION = "2026-10-23";

const ALLOWED_DOMAINS = new Set(["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"]);
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;
const BCRYPT_COST = 12;
const GENERIC_LOGIN_ERROR = "Incorrect email or password";
// Valid-looking hash so unknown emails cost the same time as wrong passwords (no user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_COST);

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
router.use(globalLimiter);

const normalizeEmail = (v) => String(v || "").trim().toLowerCase();

function emailProblem(email) {
  if (!EMAIL_RE.test(email)) return "Enter a valid email address";
  if (!ALLOWED_DOMAINS.has(email.split("@")[1])) {
    return "Only Gmail, Outlook, Hotmail and Yahoo email addresses are accepted";
  }
  return null;
}

// bcrypt only reads the first 72 bytes, so cap there instead of silently truncating.
function passwordProblem(password, email) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (Buffer.byteLength(password) > 72) return "Password is too long (max 72 characters)";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password must contain at least one letter and one number";
  if (email && email.split("@")[0].length >= 4 && password.toLowerCase().includes(email.split("@")[0])) return "Password must not contain your email name";
  return null;
}

const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${email}:${otp}`).digest("hex");

const sign = (c) =>
  jwt.sign({ role: "customer", id: String(c._id), tv: c.tokenVersion }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicCustomer = (c) => ({ id: String(c._id), name: c.name, email: c.email });

async function issueOtp(customer, purpose) {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  customer.otpHash = hashOtp(customer.email, otp);
  customer.otpPurpose = purpose;
  customer.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  customer.otpAttempts = 0;
  customer.otpSentAt = new Date();
  await customer.save();
  await sendOtpEmail(customer.email, customer.name, otp, purpose);
}

const onCooldown = (c) => c.otpSentAt && Date.now() - c.otpSentAt.getTime() < RESEND_COOLDOWN_MS;

// Returns an error string, or null if the OTP is valid. Mutates attempt counters.
async function checkOtp(customer, otp, purpose) {
  if (!customer || !customer.otpHash || customer.otpPurpose !== purpose) return "Invalid or expired OTP";
  if (customer.otpExpires < new Date()) return "OTP expired. Request a new one.";
  if (customer.otpAttempts >= MAX_OTP_ATTEMPTS) return "Too many wrong attempts. Request a new OTP.";
  const expected = Buffer.from(customer.otpHash, "hex");
  const given = Buffer.from(hashOtp(customer.email, otp), "hex");
  if (!crypto.timingSafeEqual(expected, given)) {
    customer.otpAttempts += 1;
    await customer.save();
    return "Incorrect OTP";
  }
  customer.otpHash = null;
  customer.otpPurpose = null;
  customer.otpExpires = null;
  customer.otpAttempts = 0;
  return null;
}

async function requireCustomer(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "customer") throw new Error("wrong role");
    const customer = await Customer.findById(payload.id);
    if (!customer || !customer.verified || customer.tokenVersion !== payload.tv) throw new Error("stale");
    req.customer = customer;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

// ---------- Registration + email OTP ----------

router.post("/register", strictLimiter, asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name) return res.status(400).json({ error: "Enter your name" });
  if (req.body.consent !== true) {
    return res.status(400).json({ error: "You must accept the Privacy Policy and Terms to create an account" });
  }
  const eProblem = emailProblem(email);
  if (eProblem) return res.status(400).json({ error: eProblem });
  const pProblem = passwordProblem(password, email);
  if (pProblem) return res.status(400).json({ error: pProblem });

  let customer = await Customer.findOne({ email });
  if (customer?.verified) return res.status(409).json({ error: "An account with this email already exists. Please log in." });
  if (customer && onCooldown(customer)) {
    return res.status(429).json({ error: "Please wait a minute before requesting another OTP" });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  if (customer) {
    customer.name = name;
    customer.passwordHash = passwordHash;
  } else {
    customer = new Customer({ name, email, passwordHash });
  }
  customer.consentAt = new Date();
  customer.consentVersion = CONSENT_VERSION;
  await issueOtp(customer, "verify");
  res.status(201).json({ email, message: "OTP sent to your email" });
}));

router.post("/resend-otp", strictLimiter, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const customer = await Customer.findOne({ email });
  // Same response whether or not the account exists, to avoid leaking registered emails.
  const generic = { message: "If this email is pending verification, a new code was sent" };
  if (!customer || customer.verified) return res.json(generic);
  if (onCooldown(customer)) return res.status(429).json({ error: "Please wait a minute before requesting another OTP" });
  await issueOtp(customer, "verify");
  res.json(generic);
}));

router.post("/verify-otp", strictLimiter, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const customer = await Customer.findOne({ email });
  if (customer?.verified) return res.status(400).json({ error: "Invalid or expired OTP" });

  const problem = await checkOtp(customer, String(req.body.otp || "").trim(), "verify");
  if (problem) return res.status(400).json({ error: problem });

  customer.verified = true;
  await customer.save();
  res.json({ token: sign(customer), customer: publicCustomer(customer) });
}));

// ---------- Login ----------

router.post("/login", strictLimiter, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const customer = await Customer.findOne({ email });

  if (customer?.lockUntil && customer.lockUntil > new Date()) {
    return res.status(429).json({ error: "Too many failed attempts. Try again in 15 minutes or reset your password." });
  }

  const ok = await bcrypt.compare(password, customer ? customer.passwordHash : DUMMY_HASH);
  if (!customer || !ok) {
    if (customer) {
      customer.failedLogins += 1;
      if (customer.failedLogins >= MAX_FAILED_LOGINS) {
        customer.lockUntil = new Date(Date.now() + LOCK_MS);
        customer.failedLogins = 0;
      }
      await customer.save();
    }
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }
  if (!customer.verified) {
    return res.status(403).json({ error: "Email not verified", needsVerification: true, email });
  }

  customer.failedLogins = 0;
  customer.lockUntil = null;
  await customer.save();
  res.json({ token: sign(customer), customer: publicCustomer(customer) });
}));

router.get("/me", requireCustomer, (req, res) => res.json({ customer: publicCustomer(req.customer) }));

// ---------- Forgot / reset password (OTP) ----------

router.post("/forgot-password", strictLimiter, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const customer = await Customer.findOne({ email });
  const generic = { message: "If an account exists for this email, a reset code was sent" };
  if (!customer || !customer.verified) return res.json(generic);
  if (onCooldown(customer)) return res.status(429).json({ error: "Please wait a minute before requesting another code" });
  await issueOtp(customer, "reset");
  res.json(generic);
}));

router.post("/reset-password", strictLimiter, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const newPassword = String(req.body.newPassword || "");
  const pProblem = passwordProblem(newPassword, email);
  if (pProblem) return res.status(400).json({ error: pProblem });

  const customer = await Customer.findOne({ email });
  const problem = customer?.verified ? await checkOtp(customer, String(req.body.otp || "").trim(), "reset") : "Invalid or expired OTP";
  if (problem) return res.status(400).json({ error: problem });

  customer.passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  customer.tokenVersion += 1; // log out every other session
  customer.failedLogins = 0;
  customer.lockUntil = null;
  await customer.save();
  sendSecurityNoticeEmail(customer.email, customer.name, "Your password was reset.");
  res.json({ message: "Password updated. Please log in." });
}));

// ---------- Logged-in account actions ----------

router.post("/change-password", strictLimiter, requireCustomer, asyncHandler(async (req, res) => {
  const { customer } = req;
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!(await bcrypt.compare(currentPassword, customer.passwordHash))) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const pProblem = passwordProblem(newPassword, customer.email);
  if (pProblem) return res.status(400).json({ error: pProblem });
  if (currentPassword === newPassword) return res.status(400).json({ error: "New password must be different" });

  customer.passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  customer.tokenVersion += 1;
  await customer.save();
  sendSecurityNoticeEmail(customer.email, customer.name, "Your password was changed.");
  // Fresh token so this session stays signed in; all others are invalidated.
  res.json({ token: sign(customer), message: "Password updated" });
}));

// Right to erasure (DPDP Act 2023): permanently deletes the account after password confirmation.
router.delete("/me", strictLimiter, requireCustomer, asyncHandler(async (req, res) => {
  const { customer } = req;
  if (!(await bcrypt.compare(String(req.body.password || ""), customer.passwordHash))) {
    return res.status(401).json({ error: "Password is incorrect" });
  }
  await Customer.deleteOne({ _id: customer._id });
  sendSecurityNoticeEmail(customer.email, customer.name, "Your account and personal data were deleted.");
  res.status(204).end();
}));

export default router;
