import React from 'react';
import { Text, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ThemeColors } from '../../lib/theme/themes';
import { AnimalType } from '../../features/animalTypes/types';
import { ColorMode } from '../../features/profile/types';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  textColor,
  size = 'sm',
  className,
  style,
}) => {
  const { colors } = useTheme();
  const bg = color ?? colors.primary[100];
  const fg = textColor ?? colors.primary[800];
  const sizeClass = size === 'md' ? 'text-sm px-3 py-2' : 'text-xs px-2 py-1';
  return (
    <Text
      className={`font-semibold rounded-full overflow-hidden self-start ${sizeClass} ${className ?? ''}`}
      style={[{ backgroundColor: bg, color: fg }, style]}
    >
      {label}
    </Text>
  );
};

export const getStatusBadgeColor = (status: string, colors?: ThemeColors, mode: ColorMode = 'colorful', dark = false): { bg: string; text: string } => {
  if (mode === 'uniform') return { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
  const light: Record<string, { bg: string; text: string }> = {
    growing: { bg: '#C6F6D5', text: '#22543D' },
    breeding: { bg: '#E9D5FF', text: '#5B21B6' },
    for_sale: { bg: '#FEF3C7', text: '#92400E' },
    sold: { bg: '#DBEAFE', text: '#1E40AF' },
    deceased: { bg: '#FEE2E2', text: '#991B1B' },
    active: { bg: '#D1FAE5', text: '#065F46' },
  };
  const darkPairs: Record<string, { bg: string; text: string }> = {
    growing: { bg: '#14432A', text: '#86EFAC' },
    breeding: { bg: '#2E1065', text: '#D8B4FE' },
    for_sale: { bg: '#451A03', text: '#FCD34D' },
    sold: { bg: '#1E3A8A', text: '#93C5FD' },
    deceased: { bg: '#450A0A', text: '#FCA5A5' },
    active: { bg: '#052E16', text: '#6EE7B7' },
  };
  if (dark) return darkPairs[status] ?? { bg: colors?.neutral[200] ?? '#33302C', text: colors?.neutral[700] ?? '#C9C3B8' };
  return light[status] ?? { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
};

export const getCategoryBadgeColor = (category: string, colors?: ThemeColors, types: AnimalType[] = [], mode: ColorMode = 'colorful', dark = false): { bg: string; text: string } => {
  if (mode === 'uniform') return { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
  const resolved = types.find((t) => t.id === category)?.color;
  if (resolved) return { bg: resolved + (dark ? '2E' : '1F'), text: resolved };
  const light: Record<string, { bg: string; text: string }> = {
    cattle: { bg: '#EDE9FE', text: '#5B21B6' },
    pig: { bg: '#FCE7F3', text: '#9D174D' },
    chicken: { bg: '#FEF3C7', text: '#92400E' },
    goat: { bg: '#D1FAE5', text: '#065F46' },
    sheep: { bg: '#E0E7FF', text: '#3730A3' },
    duck: { bg: '#CFFAFE', text: '#155E75' },
  };
  const darkPairs: Record<string, { bg: string; text: string }> = {
    cattle: { bg: '#2E1065', text: '#C4B5FD' },
    pig: { bg: '#500724', text: '#F9A8D4' },
    chicken: { bg: '#451A03', text: '#FCD34D' },
    goat: { bg: '#022C22', text: '#6EE7B7' },
    sheep: { bg: '#1E1B4B', text: '#A5B4FC' },
    duck: { bg: '#083344', text: '#67E8F9' },
  };
  if (dark) return darkPairs[category] ?? { bg: colors?.neutral[200] ?? '#33302C', text: colors?.neutral[700] ?? '#C9C3B8' };
  return light[category] ?? { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
};