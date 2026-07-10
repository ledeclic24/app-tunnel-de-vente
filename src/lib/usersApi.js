import { apiPatch, apiDelete } from './apiClient';

export async function updateOwnProfile(fullName) {
  const { user } = await apiPatch('/users/me', { fullName });
  return user;
}

export async function deleteOwnAccount() {
  await apiDelete('/users/me');
}
