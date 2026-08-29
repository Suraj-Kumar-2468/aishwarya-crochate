const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TOKEN_KEY = "admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function normalizeProduct(p) {
  return { ...p, id: p._id };
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function login(password) {
  const data = await request("/api/auth/login", { method: "POST", body: { password } });
  setToken(data.token);
  return data.token;
}

export async function fetchProducts() {
  const products = await request("/api/products");
  return products.map(normalizeProduct);
}

export async function createProduct(product) {
  const created = await request("/api/products", { method: "POST", body: product, auth: true });
  return normalizeProduct(created);
}

export async function updateProduct(id, product) {
  const updated = await request(`/api/products/${id}`, { method: "PUT", body: product, auth: true });
  return normalizeProduct(updated);
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: "DELETE", auth: true });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed: ${res.status}`);
  }
  const data = await res.json();
  return data.url;
}

export async function fetchContent() {
  return request("/api/content");
}

export async function updateContent(content) {
  return request("/api/content", { method: "PUT", body: content, auth: true });
}
