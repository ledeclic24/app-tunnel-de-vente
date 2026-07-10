import { apiGet, apiPost, ApiError, setAccessToken, refreshSession } from './apiClient';

export async function signUp(email, password, fullName) {
  const data = await apiPost('/auth/signup', { email, password, fullName: fullName || undefined });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function signIn(email, password) {
  const data = await apiPost('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function signOut() {
  try {
    await apiPost('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function getCurrentUser() {
  const { user } = await apiGet('/auth/me');
  return user;
}

// Tente de restaurer la session via le cookie de rafraîchissement httpOnly,
// puis récupère l'utilisateur courant. Ne lève jamais : retourne null si
// aucune session valide n'existe (utilisateur non connecté).
export async function restoreSession() {
  const ok = await refreshSession();
  if (!ok) return null;
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function forgotPassword(email) {
  await apiPost('/auth/forgot-password', { email });
}

export async function confirmPasswordReset(token, newPassword) {
  await apiPost('/auth/reset-password', { token, newPassword });
}

export async function updatePassword(newPassword) {
  await apiPost('/auth/update-password', { newPassword });
}

export { ApiError };
