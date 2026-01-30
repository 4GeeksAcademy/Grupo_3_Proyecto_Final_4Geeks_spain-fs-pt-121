import { apiGet, apiPost } from "./api";

export function getFinScore() {
  return apiGet("/api/finscore");
}

export function getRewardsHistory() {
  return apiGet("/api/rewards/history");
}

export function getRewardsBalance() {
  return apiGet("/api/rewards/balance");
}

export function createSaving(amount) {
  return apiPost("/api/savings", { amount, currency: "USD" });
}