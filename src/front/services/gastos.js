import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export function listGastos() {
  return apiGet("/api/gasto");
}

export function createGasto(payload) {
  return apiPost("/api/gasto", payload);
}

export function updateGasto(id, payload) {
  return apiPut(`/api/gasto/${id}`, payload);
}

export function deleteGasto(id) {
  return apiDelete(`/api/gasto/${id}`);
}