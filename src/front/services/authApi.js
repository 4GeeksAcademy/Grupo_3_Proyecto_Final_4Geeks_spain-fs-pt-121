import { apiPost } from "./api";
import { saveSession } from "./auth";

export async function login({ email, password }) {
  const data = await apiPost("/api/auth/login", { email, password });
  saveSession({ token: data.token, user: data.user });
  return data;
}

export async function register({ email, username, password }) {
  const data = await apiPost("/api/auth/register", { email, username, password });
  saveSession({ token: data.token, user: data.user });
  return data;
}