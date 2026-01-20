import { apiGet } from "./api";


export async function getRates(base = "USD") {
  return apiGet(`/api/fx/rates?base=${encodeURIComponent(base)}`);
}


export async function convertFx(from, to, amount) {
  return apiGet(`/api/fx/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`);
}