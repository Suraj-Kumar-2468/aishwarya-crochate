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

const CUSTOMER_TOKEN_KEY = "customer_token";

export const getCustomerToken = () => localStorage.getItem(CUSTOMER_TOKEN_KEY);
export const clearCustomerToken = () => localStorage.removeItem(CUSTOMER_TOKEN_KEY);

async function request(path, { method = "GET", body, auth = false, customer = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth ? getToken() : customer ? getCustomerToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || `Request failed: ${res.status}`), { data });
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

export async function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append("image", file);
  if (folder) formData.append("folder", folder);
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
  return res.json();
}

export async function deleteImage(publicId) {
  return request("/api/upload", { method: "DELETE", body: { publicId }, auth: true });
}

export async function fetchContent() {
  return request("/api/content");
}

export async function updateContent(content) {
  return request("/api/content", { method: "PUT", body: content, auth: true });
}

export async function submitReview(productId, review) {
  const product = await request(`/api/products/${productId}/reviews`, { method: "POST", body: review });
  return normalizeProduct(product);
}

export async function deleteReview(productId, reviewId) {
  const product = await request(`/api/products/${productId}/reviews/${reviewId}`, { method: "DELETE", auth: true });
  return normalizeProduct(product);
}


export const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];

export const registerCustomer = (body) => request("/api/customers/register", { method: "POST", body });
export const resendCustomerOtp = (email) => request("/api/customers/resend-otp", { method: "POST", body: { email } });

export async function verifyCustomerOtp(email, otp) {
  const data = await request("/api/customers/verify-otp", { method: "POST", body: { email, otp } });
  localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
  return data.customer;
}

export async function loginCustomer(email, password) {
  const data = await request("/api/customers/login", { method: "POST", body: { email, password } });
  localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
  return data.customer;
}

export async function fetchCustomer() {
  return (await request("/api/customers/me", { customer: true })).customer;
}

export const forgotPassword = (email) => request("/api/customers/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (body) => request("/api/customers/reset-password", { method: "POST", body });

export async function changePassword(currentPassword, newPassword) {
  const data = await request("/api/customers/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
    customer: true,
  });
  localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
}

export async function deleteAccount(password) {
  await request("/api/customers/me", { method: "DELETE", body: { password }, customer: true });
  clearCustomerToken();
}
