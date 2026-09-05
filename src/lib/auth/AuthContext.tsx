import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../../features/profile/types';
import {
  createProfile,
  getProfile,
  updatePassword,
  updateProfileNameEmail,
  updateTheme,
} from '../../features/profile/services/profileService';
import { generateSalt, hashPassword, verifyPassword } from '../utils/password';
import { initDb } from '../db/client';

export type AuthState = 'loading' | 'onboarding' | 'locked' | 'unlocked';

export interface OnboardingDraft {
  name: string;
  email: string;
  password: string;
  themeKey: string;
  darkMode: boolean;
}

interface AuthContextValue {
  state: AuthState;
  profile: UserProfile | null;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  completeOnboarding: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  reload: () => Promise<void>;
  updateNameEmail: (name: string, email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<boolean>;
  setTheme: (themeKey: string, darkMode: boolean) => Promise<void>;
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
    darkMode: false,
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
      darkMode: draft.darkMode,
    });
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
    async (themeKey: string, darkMode: boolean) => {
      if (!profile) return;
      await updateTheme(profile.id, themeKey, darkMode);
      setProfile({ ...profile, themeKey, darkMode });
    },
    [profile]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ state, profile, draft, setDraft, completeOnboarding, unlock, reload, updateNameEmail, changePassword, setTheme }),
    [state, profile, draft, setDraft, completeOnboarding, unlock, reload, updateNameEmail, changePassword, setTheme]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}