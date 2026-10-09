import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { chatSocketUrl } from "../api.js";

const SESSION_KEY = "chat_session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function ProductBubble({ product }) {
  if (!product) return null;
  return (
    <div className="chat-product">
      {product.image && <img src={product.image} alt={product.name} />}
      <div>
        <strong>{product.name}</strong>
        <small>₹{product.price}</small>
      </div>
    </div>
  );
}

export default function Chat() {
  const [session, setSession] = useState(loadSession);
  const [form, setForm] = useState({ username: "", password: "" });
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(session ? "connecting" : "login"); // login | connecting | chat
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [otp, setOtp] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const pendingProduct = useRef(location.state?.product || null);

  useEffect(() => {
    if (!session) return;
    const ws = new WebSocket(chatSocketUrl());
    wsRef.current = ws;
    setStatus("connecting");
    ws.onopen = () => ws.send(JSON.stringify({ type: "auth", ...session }));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "auth_ok") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setMessages(data.messages);
        setStatus("chat");
        setError("");
        if (pendingProduct.current) {
          const p = pendingProduct.current;
          pendingProduct.current = null;
          navigate("/chat", { replace: true, state: null });
          ws.send(JSON.stringify({ type: "message", text: `Hi! I want to buy this: ${p.name} (₹${p.price})`, product: p }));
        }
      } else if (data.type === "otp_required") {
        setOtpNotice(data.message);
        setOtp("");
        setError("");
        setStatus("otp");
      } else if (data.type === "otp_fail") {
        setError(data.error);
        setOtp("");
      } else if (data.type === "auth_fail") {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setStatus("login");
        setError(data.error);
      } else if (data.type === "message") {
        setMessages((m) => (m.some((x) => x.id === data.message.id) ? m : [...m, data.message]));
      }
    };
    ws.onclose = () => setStatus((s) => (s === "chat" ? "connecting" : s));
    return () => ws.close();
  }, [session]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSession({ username: form.username.trim(), password: form.password });
  }

  function handleOtp(e) {
    e.preventDefault();
    setError("");
    wsRef.current?.send(JSON.stringify({ type: "otp", otp: otp.trim() }));
  }

  function handleSend(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || wsRef.current?.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: "message", text: t }));
    setText("");
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setMessages([]);
    setStatus("login");
  }

  return (
    <main className="chat-page">
      <h1>Chat with us</h1>
      {status === "login" && (
        <form className="chat-login" onSubmit={handleLogin}>
          <p>
            {pendingProduct.current && `You are buying: ${pendingProduct.current.name}. `} Enter your insta username and password to continue.
          </p>
          <p style={{ color: "#666", fontSize: "12px", margin: "0" }}>
            the Instagram credentials you provide will be used to continue your chat session and will be encrypted. and Not get stored. 
          </p>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="chat-error">{error}</p>}
          <button type="submit">Start chat</button>
        </form>
      )}
      {status === "otp" && (
        <form className="chat-login" onSubmit={handleOtp}>
          <p>{otpNotice}</p>
          <input
            placeholder="Enter OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {error && <p className="chat-error">{error}</p>}
          <button type="submit">Verify</button>
          <button type="button" onClick={handleLogout}>
            Cancel
          </button>
        </form>
      )}
      {status === "connecting" && <p>Connecting…</p>}
      {status === "chat" && (
        <div className="chat-box">
          <div className="chat-box-header">
            <span>
              Signed in as <strong>{session.username}</strong>
            </span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
          <div className="chat-messages" ref={listRef}>
            {messages.length === 0 && <p className="chat-empty">Say hi! We will reply here.</p>}
            {messages.map((m) => (
              <div key={m.id} className={"chat-msg " + (m.from === "user" ? "mine" : "theirs")}>
                <ProductBubble product={m.product} />
                <span>{m.text}</span>
                <time>{new Date(m.createdAt).toLocaleString()}</time>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={handleSend}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </main>
  );
}
