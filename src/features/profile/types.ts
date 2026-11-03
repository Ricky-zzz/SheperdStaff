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