export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||  "http://127.0.0.1:3001";

export async function apiGet(path) { 
    const res = await fetch (`${BACKEND_URL}${path}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error || data?.message || `Error ${res.status}`;
        throw new Error (msg);
    }
    return data;
}