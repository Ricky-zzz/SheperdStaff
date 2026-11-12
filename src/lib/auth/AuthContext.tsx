import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile, ColorMode, Appearance } from '../../features/profile/types';
import {
  createProfile,
  getProfile,
  updatePassword,
  updateProfileNameEmail,
  updateTheme,
  updateAppearance,
  updateColorMode,
  updateAvatar as updateProfileAvatar,
  updateRecoveryCode as updateProfileRecoveryCode,
  clearRecoveryCode as clearProfileRecoveryCode,
} from '../../features/profile/services/profileService';
import { generateSalt, hashPassword, verifyPassword, verifyRecoveryCode, normalizeRecoveryCode } from '../utils/password';
import { initDb } from '../db/client';
import { restoreFromUri } from '../../features/backup/services/backupService';
import type { RestoreSummary } from '../../features/backup/types';

export type AuthState = 'loading' | 'onboarding' | 'locked' | 'unlocked';

export interface OnboardingDraft {
  name: string;
  email: string;
  password: string;
  themeKey: string;
  appearance: Appearance;
  colorMode: ColorMode;
}

const EMPTY_DRAFT: OnboardingDraft = {
  name: '',
  email: '',
  password: '',
  themeKey: 'earth',
  appearance: 'system',
  colorMode: 'colorful',
};

interface AuthContextValue {
  state: AuthState;
  profile: UserProfile | null;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  completeOnboarding: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  reload: () => Promise<void>;
  updateNameEmail: (name: string, email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<boolean>;
  setTheme: (themeKey: string) => Promise<void>;
  setAppearance: (appearance: Appearance) => Promise<void>;
  setColorMode: (colorMode: ColorMode) => Promise<void>;
  updateAvatar: (avatarUri: string | null) => Promise<void>;
  /** True once the user has stored a recovery code for a forgotten password. */
  recoveryConfigured: boolean;
  setRecoveryCode: (code: string) => Promise<void>;
  removeRecoveryCode: () => Promise<void>;
  resetPasswordWithRecovery: (code: string, nextPassword: string) => Promise<boolean>;
  /** Replace all app data with a backup file, then reload the session. */
  restoreFromBackup: (uri: string) => Promise<RestoreSummary>;
  /** Delete every farm record, the profile and settings. */
  eraseAllData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraftState] = useState<OnboardingDraft>({ ...EMPTY_DRAFT });

  const bootstrap = useCallback(async () => {
    try {
      await initDb();
      const p = await getProfile();
      if (!p) {
        setState('onboarding');
      } else {
        setProfile(p);
        setState('locked');
      }
    } catch {
      setState('onboarding');
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reload = useCallback(async () => {
    setProfile(await getProfile());
  }, []);

  const completeOnboarding = useCallback(async () => {
    const salt = await generateSalt();
    const passwordHash = await hashPassword(draft.password, salt);
    await createProfile({
      name: draft.name.trim(),
      email: draft.email.trim(),
      passwordHash,
      salt,
      themeKey: draft.themeKey,
      darkMode: draft.appearance === 'dark',
      appearance: draft.appearance,
      colorMode: draft.colorMode,
    });
    try {
      const { seedIfNeeded } = await import('../db/seed');
      const { getDb } = await import('../db/client');
      await seedIfNeeded(await getDb());
    } catch {
      // Sample data is optional — never block entry to the app.
    }
    setProfile(await getProfile());
    setState('unlocked');
  }, [draft]);

  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      if (!profile) return false;
      const ok = await verifyPassword(password, profile.passwordHash, profile.salt);
      if (ok) setState('unlocked');
      return ok;
    },
    [profile]
  );

  const lock = useCallback(() => {
    setState('locked');
  }, []);

  const updateNameEmail = useCallback(
    async (name: string, email: string) => {
      if (!profile) return;
      await updateProfileNameEmail(profile.id, name.trim(), email.trim());
      await reload();
    },
    [profile, reload]
  );

  const changePassword = useCallback(
    async (current: string, next: string): Promise<boolean> => {
      if (!profile) return false;
      const ok = await verifyPassword(current, profile.passwordHash, profile.salt);
      if (!ok) return false;
      const salt = await generateSalt();
      const passwordHash = await hashPassword(next, salt);
      await updatePassword(profile.id, passwordHash, salt);
      setProfile({ ...profile, passwordHash, salt });
      return true;
    },
    [profile]
  );

  const setTheme = useCallback(
    async (themeKey: string) => {
      if (!profile) return;
      await updateTheme(profile.id, themeKey);
      setProfile({ ...profile, themeKey });
    },
    [profile]
  );

  const setAppearance = useCallback(
    async (appearance: Appearance) => {
      if (!profile) return;
      await updateAppearance(profile.id, appearance);
      setProfile({ ...profile, appearance, darkMode: appearance === 'dark' });
    },
    [profile]
  );

  const setColorMode = useCallback(
    async (colorMode: ColorMode) => {
      if (!profile) return;
      await updateColorMode(profile.id, colorMode);
      setProfile({ ...profile, colorMode });
    },
    [profile]
  );

  const updateAvatar = useCallback(
    async (avatarUri: string | null) => {
      if (!profile) return;
      await updateProfileAvatar(profile.id, avatarUri);
      setProfile({ ...profile, avatarUri: avatarUri ?? undefined });
    },
    [profile]
  );

  const setRecoveryCode = useCallback(
    async (code: string) => {
      if (!profile) return;
      const salt = await generateSalt();
      const recoveryHash = await hashPassword(normalizeRecoveryCode(code), salt);
      await updateProfileRecoveryCode(profile.id, recoveryHash, salt);
      setProfile({
        ...profile,
        recoveryHash,
        recoverySalt: salt,
        recoverySetAt: new Date().toISOString(),
      });
    },
    [profile]
  );

  const removeRecoveryCode = useCallback(async () => {
    if (!profile) return;
    await clearProfileRecoveryCode(profile.id);
    setProfile({ ...profile, recoveryHash: undefined, recoverySalt: undefined, recoverySetAt: undefined });
  }, [profile]);

  const resetPasswordWithRecovery = useCallback(
    async (code: string, nextPassword: string): Promise<boolean> => {
      if (!profile || !profile.recoveryHash || !profile.recoverySalt) return false;
      const ok = await verifyRecoveryCode(code, profile.recoveryHash, profile.recoverySalt);
      if (!ok) return false;
      const salt = await generateSalt();
      const passwordHash = await hashPassword(nextPassword, salt);
      await updatePassword(profile.id, passwordHash, salt);
      setProfile({ ...profile, passwordHash, salt });
      setState('unlocked');
      return true;
    },
    [profile]
  );

  const restoreFromBackup = useCallback(async (uri: string): Promise<RestoreSummary> => {
    const summary = await restoreFromUri(uri);
    const p = await getProfile();
    setProfile(p);
    setDraftState({ ...EMPTY_DRAFT });
    // The restored data carries its own profile, password and recovery code,
    // so the session must close and be reopened with those credentials.
    setState(p ? 'locked' : 'onboarding');
    return summary;
  }, []);

  const eraseAllData = useCallback(async () => {
    const { getDb } = await import('../db/client');
    const db = await getDb();
    await db.execAsync(
      'DELETE FROM inventory_transactions; DELETE FROM inventory_items; DELETE FROM activities; DELETE FROM expenses; DELETE FROM tasks; DELETE FROM livestock; DELETE FROM pens; DELETE FROM animal_types; DELETE FROM locations; DELETE FROM income; DELETE FROM user_profile;'
    );
    const avatarUri = profile?.avatarUri;
    if (avatarUri?.startsWith('file')) {
      try {
        const { deleteAsync } = await import('expo-file-system/legacy');
        await deleteAsync(avatarUri, { idempotent: true });
      } catch {
        // A leftover photo must not block the reset.
      }
    }
    setProfile(null);
    setDraftState({ ...EMPTY_DRAFT });
    setState('onboarding');
  }, [profile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      profile,
      draft,
      setDraft,
      completeOnboarding,
      unlock,
      lock,
      reload,
      updateNameEmail,
      changePassword,
      setTheme,
      setAppearance,
      setColorMode,
      updateAvatar,
      recoveryConfigured: !!profile?.recoveryHash,
      setRecoveryCode,
      removeRecoveryCode,
      resetPasswordWithRecovery,
      restoreFromBackup,
      eraseAllData,
    }),
    [
      state,
      profile,
      draft,
      setDraft,
      completeOnboarding,
      unlock,
      lock,
      reload,
      updateNameEmail,
      changePassword,
      setTheme,
      setAppearance,
      setColorMode,
      updateAvatar,
      setRecoveryCode,
      removeRecoveryCode,
      resetPasswordWithRecovery,
      restoreFromBackup,
      eraseAllData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}