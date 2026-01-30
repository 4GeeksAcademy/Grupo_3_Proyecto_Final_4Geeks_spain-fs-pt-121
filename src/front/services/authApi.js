import { apiPost } from "./api";
import { saveSession, logout } from "./auth";

export async function login({ email, password }) {
  
  logout();

  const data = await apiPost("/api/auth/login", { email, password });

  if (!data?.token || !data?.user) {
    throw new Error("Respuesta inválida del servidor (falta token o user).");
  }

  saveSession(data.token, data.user);
  return data;
}

export async function register({ email, username, password }) {
  
  logout();

  const data = await apiPost("/api/auth/register", { email, username, password });

  if (!data?.token || !data?.user) {
    throw new Error("Respuesta inválida del servidor (falta token o user).");
  }

  saveSession(data.token, data.user);
  return data;
}