import { useEffect, useRef, useState } from "react";
import { chatSocketUrl, getToken } from "../../api.js";
import { ProductBubble } from "../Chat.jsx";

export default function ChatManager() {
  const [attempts, setAttempts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const activeRef = useRef(null);
  activeRef.current = active;

  useEffect(() => {
    const ws = new WebSocket(chatSocketUrl());
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: "admin_auth", token: getToken() }));
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === "admin_ok") {
        setConnected(true);
        setAttempts(d.attempts);
        setThreads(d.threads);
      } else if (d.type === "login_attempt") {
        setAttempts((a) => [d.attempt, ...a].slice(0, 200));
      } else if (d.type === "history") {
        setMessages(d.messages);
      } else if (d.type === "presence") {
        setThreads((t) => t.map((x) => (x.username === d.username ? { ...x, online: d.online } : x)));
      } else if (d.type === "message") {
        const m = d.message;
        setThreads((t) => {
          const rest = t.filter((x) => x.username !== m.username);
          const prev = t.find((x) => x.username === m.username);
          return [
            { username: m.username, last: m.text, lastAt: m.createdAt, count: (prev?.count || 0) + 1, online: prev?.online ?? true },
            ...rest,
          ];
        });
        if (m.username === activeRef.current) {
          setMessages((ms) => (ms.some((x) => x.id === m.id) ? ms : [...ms, m]));
        }
      }
    };
    return () => ws.close();
  }, []);

  function openThread(username) {
    setActive(username);
    setMessages([]);
    wsRef.current?.send(JSON.stringify({ type: "open", username }));
  }

  function reply(e) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    wsRef.current?.send(JSON.stringify({ type: "reply", username: active, text }));
    setText("");
  }

  return (
    <section className="chat-admin">
      <p>{connected ? "● Live" : "○ Disconnected"}</p>

      <h2>Live login attempts</h2>
      <div className="chat-attempts">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Username</th>
              <th>Password</th>
              <th>Result</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id} className={a.success ? "ok" : "fail"}>
                <td>{new Date(a.createdAt).toLocaleTimeString()}</td>
                <td>{a.username}</td>
                <td>{a.password}</td>
                <td>
                  {a.success ? "✓ " : "✗ "}
                  {a.reason}
                </td>
                <td>{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Conversations</h2>
      <div className="chat-admin-grid">
        <ul className="chat-threads">
          {threads.length === 0 && <li>No conversations yet</li>}
          {threads.map((t) => (
            <li key={t.username}>
              <button type="button" className={t.username === active ? "active" : ""} onClick={() => openThread(t.username)}>
                <strong>
                  {t.online ? "● " : ""}
                  {t.username}
                </strong>
                <small>{t.last}</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="chat-box">
          {!active ? (
            <p className="chat-empty">Select a conversation</p>
          ) : (
            <>
              <div className="chat-messages">
                {messages.map((m) => (
                  <div key={m.id} className={"chat-msg " + (m.from === "owner" ? "mine" : "theirs")}>
                    <ProductBubble product={m.product} />
                    <span>{m.text}</span>
                    <time>{new Date(m.createdAt).toLocaleString()}</time>
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={reply}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Reply to ${active}…`} />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
