import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { activatePendingMembership } from '../lib/growthApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // effectiveOwnerId / effectiveProfile : pour un membre d'équipe (éditeur), c'est
  // le compte du propriétaire de l'organisation — c'est ce compte-là qui possède
  // les tunnels, le plan et les limites. Pour un propriétaire, c'est lui-même.
  const [effectiveOwnerId, setEffectiveOwnerId] = useState(null);
  const [effectiveProfile, setEffectiveProfile] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setEffectiveOwnerId(null);
      setEffectiveProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data || null);

    if (data?.email) {
      try { await activatePendingMembership(userId, data.email); } catch { /* aucune invitation en attente */ }
    }

    const { data: ownerId } = await supabase.rpc('effective_owner', { uid: userId });
    const resolvedOwnerId = ownerId || userId;
    setEffectiveOwnerId(resolvedOwnerId);

    if (resolvedOwnerId === userId) {
      setEffectiveProfile(data || null);
    } else {
      const { data: ownerProfile } = await supabase.from('profiles').select('*').eq('id', resolvedOwnerId).single();
      setEffectiveProfile(ownerProfile || data || null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) await loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error && data.user && fullName) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
    }
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = () => supabase.auth.signOut();

  const refreshProfile = () => user && loadProfile(user.id);

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    return { error };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, effectiveOwnerId, effectiveProfile,
      signUp, signIn, signOut, refreshProfile, resetPassword, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
