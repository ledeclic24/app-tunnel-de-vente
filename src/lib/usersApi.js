import { apiPatch, apiDelete } from './apiClient';

export async function updateOwnProfile({ fullName, currency }) {
  const { user } = await apiPatch('/users/me', { fullName, currency });
  return user;
}

export async function deleteOwnAccount() {
  await apiDelete('/users/me');
}
