import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import PasswordInput from '../../components/auth/PasswordInput';

const DELETE_CONFIRM_WORD = 'SUPPRIMER';

export default function AccountPage() {
  const { user, profile, effectiveProfile, signOut, updateProfile, updatePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const plan = getPlan(effectiveProfile?.plan);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    const { error } = await updateProfile(fullName);
    setSaving(false);
    if (error) {
      setProfileError("Impossible d'enregistrer. Réessaie.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordSaving(true);
    const { error } = await updatePassword(newPassword);
    setPasswordSaving(false);
    if (error) {
      setPasswordError('Impossible de mettre à jour le mot de passe. Réessaie.');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError("Impossible de supprimer ton compte pour le moment. Réessaie ou contacte-nous.");
      setDeleting(false);
      return;
    }
    navigate('/');
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-sans font-bold text-surface mb-6">Mon compte</h1>

      <form onSubmit={handleSave} className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 space-y-4 mb-6">
        <div>
          <label htmlFor="account-email" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Email</label>
          <input id="account-email" value={user?.email || ''} disabled className="w-full bg-surface/5 border border-surface/10 rounded-xl px-4 py-3 text-sm text-surface/50" />
        </div>
        <div>
          <label htmlFor="account-fullname" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Prénom</label>
          <input
            id="account-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
          />
        </div>
        <div>
          <label htmlFor="account-plan" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Plan</label>
          <p id="account-plan" className="text-sm text-surface px-4 py-3 bg-surface/5 rounded-xl">{plan.name}</p>
        </div>
        {profileError && <p className="text-sm text-red-500">{profileError}</p>}
        <button type="submit" disabled={saving} className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
          {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 space-y-4 mb-6">
        <h2 className="text-sm font-sans font-semibold text-surface mb-1">Mot de passe</h2>
        <div>
          <label htmlFor="account-new-password" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Nouveau mot de passe</label>
          <PasswordInput
            id="account-new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required={false}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="account-confirm-password" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Confirme le mot de passe</label>
          <PasswordInput
            id="account-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required={false}
            autoComplete="new-password"
          />
        </div>
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
        <button type="submit" disabled={passwordSaving || !newPassword} className="magnetic-btn bg-primary text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
          {passwordSaving ? 'Mise à jour...' : passwordSaved ? 'Mot de passe changé ✓' : 'Changer le mot de passe'}
        </button>
      </form>

      <button onClick={handleSignOut} className="hover-lift flex items-center gap-2 text-sm text-surface/60 hover:text-red-500 transition-colors mb-10">
        <LogOut className="w-4 h-4" /> Se déconnecter
      </button>

      <div className="border border-red-500/20 bg-red-500/5 rounded-[2rem] p-6 md:p-8 space-y-3">
        <h2 className="text-sm font-sans font-semibold text-red-500 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Zone de danger
        </h2>
        <p className="text-sm text-surface/60">
          Supprime définitivement ton compte, tes tunnels, tes blocs et tes leads. Cette action est irréversible.
        </p>
        <div>
          <label htmlFor="account-delete-confirm" className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">
            Tape {DELETE_CONFIRM_WORD} pour confirmer
          </label>
          <input
            id="account-delete-confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full bg-background border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors text-surface"
          />
        </div>
        {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
        <button
          onClick={handleDeleteAccount}
          disabled={deleteConfirm !== DELETE_CONFIRM_WORD || deleting}
          className="magnetic-btn bg-red-500 text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {deleting ? 'Suppression...' : 'Supprimer définitivement mon compte'}
        </button>
      </div>
    </div>
  );
}
