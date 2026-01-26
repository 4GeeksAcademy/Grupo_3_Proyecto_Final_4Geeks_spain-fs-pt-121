import { getToken } from "./auth";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001";

function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiPut(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}