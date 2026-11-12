export type ColorMode = 'colorful' | 'uniform';
export type Appearance = 'system' | 'light' | 'dark';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  themeKey: string;
  darkMode: boolean;
  appearance?: Appearance;
  colorMode: ColorMode;
  avatarUri?: string;
  /** Salted hash of the lock-recovery code. The code itself is never stored. */
  recoveryHash?: string;
  recoverySalt?: string;
  recoverySetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  themeKey: string;
  darkMode: boolean;
  appearance?: Appearance;
  colorMode: ColorMode;
}