const TOKEN_KEY = "token";
const USER_KEY = "user";

function isValidJwt(token) {
  if (!token || typeof token !== "string") return false;
  const t = token.trim();
  if (!t) return false;
  if (t === "null" || t === "undefined") return false;
  
  return t.split(".").length === 3;
}

export function saveSession(token, user) {
  if (isValidJwt(token)) {
    localStorage.setItem(TOKEN_KEY, token.trim());
  } else {
    
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  return isValidJwt(t) ? t.trim() : null;
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
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