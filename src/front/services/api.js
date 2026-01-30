import { getToken, logout } from "./auth";

function normalizeBase(url) {
 console.log (url)
  if (!url) return "http://127.0.0.1:3001";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const BACKEND_URL = normalizeBase(import.meta.env.VITE_BACKEND_URL);

function isValidToken(token) {
  if (!token) return false;
  if (token === "null" || token === "undefined") return false;
  if (token.trim().length < 10) return false;
  
  return token.split(".").length === 3;
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...extraHeaders };

  
  if (isValidToken(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function safeReadJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function forceLogoutAndRedirect(msg = "") {
  console.warn("Auth inválida:", msg);
  logout();
 
  window.location.href = "/login";
}

async function handleResponse(res) {
  const data = await safeReadJson(res);

  if (!res.ok) {
    const backendMsg = data?.msg || data?.error || data?.message || "";
    const msg = backendMsg || `Error ${res.status}`;

    
    if (
      res.status === 401 &&
      typeof backendMsg === "string" &&
      (backendMsg.toLowerCase().includes("expired") ||
        backendMsg.toLowerCase().includes("missing authorization") ||
        backendMsg.toLowerCase().includes("invalid") ||
        backendMsg.toLowerCase().includes("token"))
    ) {
      forceLogoutAndRedirect(backendMsg);
      // cortamos aquí
      throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    }

    
    if (
      res.status === 422 &&
      typeof backendMsg === "string" &&
      backendMsg.toLowerCase().includes("bad authorization header")
    ) {
      forceLogoutAndRedirect(backendMsg);
      throw new Error("Token inválido. Inicia sesión de nuevo.");
    }

    console.error(`[${res.status}]`, data);
    throw new Error(msg);
  }

  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPut(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse(res);
}