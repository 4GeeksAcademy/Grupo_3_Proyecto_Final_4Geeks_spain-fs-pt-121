import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export function listGroups() {
  return apiGet("/api/groups");
}

export function createGroup(payload) {
  return apiPost("/api/groups", payload);
}

export function getGroupDetail(groupId) {
  return apiGet(`/api/groups/${groupId}`);
}

export function addGroupMember(groupId, payload) {
  return apiPost(`/api/groups/${groupId}/members`, payload);
}

export function createSharedExpense(groupId, payload) {
  return apiPost(`/api/groups/${groupId}/shared-expenses`, payload);
}

export function getGroupBalances(groupId) {
  return apiGet(`/api/groups/${groupId}/balances`);
}

export function updateSharedExpense(groupId, expenseId, payload) {
  return apiPut(`/api/groups/${groupId}/shared-expenses/${expenseId}`, payload);
}

export function deleteSharedExpense(groupId, expenseId) {
  return apiDelete(`/api/groups/${groupId}/shared-expenses/${expenseId}`);
}