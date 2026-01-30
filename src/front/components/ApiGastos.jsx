const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001";

export function ObtenerGastos() {
  return fetch(`${BACKEND_URL}/api/gasto`)
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    });
}

export function CrearGasto(payload) {
  return fetch(`${BACKEND_URL}/api/gasto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  });
}

export function EditarGastos(payload, id) {
  return fetch(`${BACKEND_URL}/api/gasto/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  });
}

export function EliminarGastos(id) {
  return fetch(`${BACKEND_URL}/api/gasto/${id}`, {
    method: "DELETE",
  }).then((res) => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  });
}