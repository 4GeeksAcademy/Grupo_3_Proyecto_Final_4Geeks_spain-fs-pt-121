import { apiPost, apiGet } from "./api";
import { saveSession } from "./auth";

export async function register(payload) {
  const data = await apiPost("/api/auth/register", payload);
  if (data?.token) saveSession(data.token, data.user);
  return data;
}

export async function login(payload) {
  const data = await apiPost("/api/auth/login", payload);
  if (data?.token) saveSession(data.token, data.user);
  return data;
}

export async function me() {
  return apiGet("/api/auth/me");
}