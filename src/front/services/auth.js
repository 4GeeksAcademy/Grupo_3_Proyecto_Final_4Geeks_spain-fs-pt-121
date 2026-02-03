const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveSession(token, user) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

export function getToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}