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
} from '../../features/profile/services/profileService';
import { generateSalt, hashPassword, verifyPassword } from '../utils/password';
import { initDb } from '../db/client';

export type AuthState = 'loading' | 'onboarding' | 'locked' | 'unlocked';

export interface OnboardingDraft {
  name: string;
  email: string;
  password: string;
  themeKey: string;
  appearance: Appearance;
  colorMode: ColorMode;
}

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
  resetDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraftState] = useState<OnboardingDraft>({
    name: '',
    email: '',
    password: '',
    themeKey: 'earth',
    appearance: 'system',
    colorMode: 'colorful',
  });

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

  const resetDemo = useCallback(async () => {
    const { getDb } = await import('../db/client');
    const db = await getDb();
    await db.execAsync(
      'DELETE FROM inventory_transactions; DELETE FROM inventory_items; DELETE FROM activities; DELETE FROM expenses; DELETE FROM tasks; DELETE FROM livestock; DELETE FROM pens; DELETE FROM animal_types; DELETE FROM locations; DELETE FROM income; DELETE FROM user_profile;'
    );
    setProfile(null);
    setDraftState({ name: '', email: '', password: '', themeKey: 'earth', appearance: 'system', colorMode: 'colorful' });
    setState('onboarding');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, profile, draft, setDraft, completeOnboarding, unlock, lock, reload, updateNameEmail, changePassword, setTheme, setAppearance, setColorMode, updateAvatar, resetDemo }),
    [state, profile, draft, setDraft, completeOnboarding, unlock, lock, reload, updateNameEmail, changePassword, setTheme, setAppearance, setColorMode, updateAvatar, resetDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}