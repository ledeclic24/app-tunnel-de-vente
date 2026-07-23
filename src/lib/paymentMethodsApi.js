import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

export async function fetchPaymentMethods() {
  return apiGet('/payment-methods');
}

export async function createPaymentMethod(payload) {
  return apiPost('/payment-methods', payload);
}

export async function updatePaymentMethod(id, patch) {
  return apiPatch(`/payment-methods/${id}`, patch);
}

export async function deletePaymentMethod(id) {
  await apiDelete(`/payment-methods/${id}`);
}
