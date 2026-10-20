export type ColorMode = 'colorful' | 'uniform';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  themeKey: string;
  darkMode: boolean;
  colorMode: ColorMode;
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
  colorMode: ColorMode;
}