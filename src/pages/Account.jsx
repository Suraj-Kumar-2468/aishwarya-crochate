import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ALLOWED_EMAIL_DOMAINS,
  registerCustomer,
  loginCustomer,
  verifyCustomerOtp,
  resendCustomerOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
} from "../api.js";
import { useCustomer } from "../context/CustomerContext.jsx";

function emailProblem(email) {
  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return "Enter a valid email address";
  if (!ALLOWED_EMAIL_DOMAINS.includes(e.split("@")[1])) {
    return "Only Gmail, Outlook, Hotmail and Yahoo email addresses are accepted";
  }
  return "";
}

function passwordProblem(p) {
  if (p.length < 8) return "Password must be at least 8 characters";
  if (p.length > 72) return "Password is too long (max 72 characters)";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Password must contain at least one letter and one number";
  return "";
}

const TITLES = {
  register: "Create account",
  login: "Log in",
  otp: "Verify your email",
  forgot: "Forgot password",
  reset: "Set a new password",
};

function SignedIn() {
  const { customer, logout } = useCustomer();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ current: "", next: "" });
  const [delPw, setDelPw] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function onChange(e) {
    e.preventDefault();
    const problem = passwordProblem(pw.next);
    if (problem) return setMsg({ type: "error", text: problem });
    setBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "" });
      setMsg({ type: "ok", text: "Password updated. Other devices were signed out." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await deleteAccount(delPw);
      logout();
      navigate("/");
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>My account</h1>
      <p>
        Signed in as <strong>{customer.name}</strong> ({customer.email})
      </p>

      <h2 className="auth-subtitle">Change password</h2>
      <form className="auth-form" onSubmit={onChange}>
        <input
          type="password"
          placeholder="Current password"
          autoComplete="current-password"
          value={pw.current}
          onChange={(e) => setPw({ ...pw, current: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="New password (min 8, letters and numbers)"
          autoComplete="new-password"
          value={pw.next}
          onChange={(e) => setPw({ ...pw, next: e.target.value })}
          required
        />
        {msg.text && <p className={msg.type === "ok" ? "auth-ok" : "auth-error"}>{msg.text}</p>}
        <button type="submit" disabled={busy}>Update password</button>
      </form>

      <div className="auth-actions">
        <button type="button" className="account-btn" onClick={() => { logout(); navigate("/"); }}>
          Log out
        </button>
      </div>

      <h2 className="auth-subtitle">Delete my account</h2>
      <p className="auth-note">
        This permanently erases your account and personal data. See our <Link to="/privacy">Privacy Policy</Link>.
      </p>
      {!confirmDelete ? (
        <button type="button" className="auth-danger" onClick={() => setConfirmDelete(true)}>
          Delete account
        </button>
      ) : (
        <form className="auth-form" onSubmit={onDelete}>
          <input
            type="password"
            placeholder="Enter your password to confirm"
            autoComplete="current-password"
            value={delPw}
            onChange={(e) => setDelPw(e.target.value)}
            required
          />
          <button type="submit" className="auth-danger" disabled={busy}>Permanently delete</button>
          <button type="button" className="account-link" onClick={() => setConfirmDelete(false)}>Cancel</button>
        </form>
      )}
    </main>
  );
}

export default function Account() {
  const { customer, setCustomer } = useCustomer();
  const navigate = useNavigate();
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (customer) return <SignedIn />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const email = form.email.trim();

  function go(next, message = "") {
    setMode(next);
    setError("");
    setInfo(message);
    setOtp("");
    if (next !== "otp" && next !== "reset") setForm((f) => ({ ...f, password: "" }));
  }

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      if (err.data?.needsVerification) {
        go("otp", "Your email isn't verified yet. Request a new code below.");
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  function handleRegister(e) {
    e.preventDefault();
    const problem = emailProblem(email) || passwordProblem(form.password);
    if (problem) return setError(problem);
    if (!consent) return setError("Please accept the Privacy Policy and Terms to continue");
    run(async () => {
      await registerCustomer({ name: form.name.trim(), email, password: form.password, consent: true });
      go("otp", `We sent a 6-digit code to ${email}.`);
      setCooldown(60);
    });
  }

  function handleLogin(e) {
    e.preventDefault();
    run(async () => {
      setCustomer(await loginCustomer(email, form.password));
      navigate("/");
    });
  }

  function handleVerify(e) {
    e.preventDefault();
    run(async () => {
      setCustomer(await verifyCustomerOtp(email, otp));
      navigate("/");
    });
  }

  function handleResend() {
    run(async () => {
      await resendCustomerOtp(email);
      setInfo("A new code was sent if this email is pending verification.");
      setCooldown(60);
    });
  }

  function handleForgot(e) {
    e.preventDefault();
    const problem = emailProblem(email);
    if (problem) return setError(problem);
    run(async () => {
      await forgotPassword(email);
      go("reset", `If an account exists for ${email}, we sent a 6-digit code.`);
      setCooldown(60);
    });
  }

  function handleReset(e) {
    e.preventDefault();
    const problem = passwordProblem(form.password);
    if (problem) return setError(problem);
    run(async () => {
      await resetPassword({ email, otp, newPassword: form.password });
      go("login", "Password updated. Please log in with your new password.");
    });
  }

  const otpInput = (
    <input
      placeholder="6-digit code"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
      required
    />
  );

  return (
    <main className="auth-page">
      <h1>{TITLES[mode]}</h1>
      {info && mode !== "otp" && mode !== "reset" && <p className="auth-ok">{info}</p>}

      {mode === "register" && (
        <form className="auth-form" onSubmit={handleRegister}>
          <input placeholder="Full name" value={form.name} onChange={set("name")} required maxLength={80} />
          <input
            placeholder="Email (Gmail, Outlook, Hotmail or Yahoo)"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <input
            placeholder="Password (min 8, letters and numbers)"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            required
          />
          <label className="auth-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I am 18 or older, I agree to the <Link to="/terms" target="_blank">Terms</Link> and I consent to the processing of my name and
              email as described in the <Link to="/privacy" target="_blank">Privacy Policy</Link>.
            </span>
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "Sending code…" : "Send verification code"}</button>
          <button type="button" className="account-link" onClick={() => go("login")}>
            Already have an account? Log in
          </button>
        </form>
      )}

      {mode === "login" && (
        <form className="auth-form" onSubmit={handleLogin}>
          <input placeholder="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
          <input
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={set("password")}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
          <button type="button" className="account-link" onClick={() => go("forgot")}>Forgot password?</button>
          <button type="button" className="account-link" onClick={() => go("register")}>
            New here? Create an account
          </button>
        </form>
      )}

      {mode === "otp" && (
        <form className="auth-form" onSubmit={handleVerify}>
          {info && <p>{info}</p>}
          {otpInput}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify"}</button>
          <button type="button" className="account-link" onClick={handleResend} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form className="auth-form" onSubmit={handleForgot}>
          <p>Enter your email and we will send a code to reset your password.</p>
          <input placeholder="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset code"}</button>
          <button type="button" className="account-link" onClick={() => go("login")}>Back to log in</button>
        </form>
      )}

      {mode === "reset" && (
        <form className="auth-form" onSubmit={handleReset}>
          {info && <p>{info}</p>}
          {otpInput}
          <input
            placeholder="New password (min 8, letters and numbers)"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Updating…" : "Update password"}</button>
          <button type="button" className="account-link" onClick={handleForgot} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}
    </main>
  );
}
