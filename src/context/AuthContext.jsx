import React, { createContext, useContext, useEffect, useState } from 'react';
import { isApiConfigured, ApiError } from '../lib/apiClient';
import * as authApi from '../lib/authApi';
import { updateOwnProfile, deleteOwnAccount } from '../lib/usersApi';

const AuthContext = createContext(null);

// Le nouveau backend fusionne auth.users + profiles Supabase en une seule
// entité User (camelCase, cf. TypeORM). On la traduit ici vers les noms de
// champs snake_case qu'utilisaient déjà les ~40 pages/composants de l'app,
// pour n'avoir à toucher qu'à cette couche pendant la migration.
function normalizeUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    email: apiUser.email,
    full_name: apiUser.fullName,
    plan: apiUser.plan,
    is_admin: apiUser.isAdmin,
    plan_expires_at: apiUser.planExpiresAt,
    created_at: apiUser.createdAt,
  };
}

// Traduit les erreurs de l'API en une forme proche de celle de Supabase, que
// les pages d'auth existantes savent déjà interpréter (error.message,
// error.status).
function mapAuthError(err) {
  if (err instanceof ApiError) {
    if (err.status === 409) return { message: 'User already registered', status: err.status };
    return { message: err.message, status: err.status };
  }
  return { message: err?.message || 'Une erreur est survenue.', status: undefined };
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Avec la fusion user/profile, les deux notions pointent maintenant sur le
  // même enregistrement.
  const user = profile;

  // Pas encore de comptes équipe/organisation côté nouveau backend (prévu en
  // phase 3 de la migration) : chaque compte est propriétaire de ses propres
  // tunnels pour l'instant, donc effectiveOwnerId === son propre id.
  const effectiveOwnerId = profile?.id || null;
  const effectiveProfile = profile;

  useEffect(() => {
    if (!isApiConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authApi.restoreSession()
      .then((apiUser) => {
        if (!cancelled) setProfile(normalizeUser(apiUser));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const apiUser = await authApi.signUp(email, password, fullName);
      setProfile(normalizeUser(apiUser));
      // session toujours présente immédiatement (pas de confirmation email
      // côté nouveau backend) — data.session sert juste de flag de succès
      // pour les pages qui le testent.
      return { data: { user: apiUser, session: true }, error: null };
    } catch (err) {
      return { data: null, error: mapAuthError(err) };
    }
  };

  const signIn = async (email, password) => {
    try {
      const apiUser = await authApi.signIn(email, password);
      setProfile(normalizeUser(apiUser));
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  const signOut = async () => {
    await authApi.signOut().catch(() => {});
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!profile) return;
    try {
      const apiUser = await authApi.getCurrentUser();
      setProfile(normalizeUser(apiUser));
    } catch {
      // erreur transitoire : on garde le profil précédent affiché
    }
  };

  const resetPassword = async (email) => {
    try {
      await authApi.forgotPassword(email);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  // Confirmation du mot de passe oublié via le token reçu par email
  // (remplace le flux de session de récupération Supabase).
  const confirmPasswordReset = async (token, newPassword) => {
    try {
      await authApi.confirmPasswordReset(token, newPassword);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  // Changement de mot de passe depuis le compte connecté.
  const updatePassword = async (newPassword) => {
    try {
      await authApi.updatePassword(newPassword);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  const updateProfile = async (fullName) => {
    try {
      const apiUser = await updateOwnProfile(fullName);
      setProfile(normalizeUser(apiUser));
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteOwnAccount();
      await authApi.signOut().catch(() => {});
      setProfile(null);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, effectiveOwnerId, effectiveProfile,
      signUp, signIn, signOut, refreshProfile, resetPassword, updatePassword,
      confirmPasswordReset, updateProfile, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
