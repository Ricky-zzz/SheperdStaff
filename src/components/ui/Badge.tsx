import React from 'react';
import { Text, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ThemeColors } from '../../lib/theme/themes';

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

export const getStatusBadgeColor = (status: string, colors?: ThemeColors): { bg: string; text: string } => {
  switch (status) {
    case 'growing':
      return { bg: '#C6F6D5', text: '#22543D' };
    case 'breeding':
      return { bg: '#E9D5FF', text: '#5B21B6' };
    case 'for_sale':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'sold':
      return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'deceased':
      return { bg: '#FEE2E2', text: '#991B1B' };
    case 'active':
      return { bg: '#D1FAE5', text: '#065F46' };
    default:
      return { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
  }
};

export const getCategoryBadgeColor = (category: string, colors?: ThemeColors): { bg: string; text: string } => {
  switch (category) {
    case 'cattle':
      return { bg: '#EDE9FE', text: '#5B21B6' };
    case 'pig':
      return { bg: '#FCE7F3', text: '#9D174D' };
    case 'chicken':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'goat':
      return { bg: '#D1FAE5', text: '#065F46' };
    case 'sheep':
      return { bg: '#E0E7FF', text: '#3730A3' };
    case 'duck':
      return { bg: '#CFFAFE', text: '#155E75' };
    default:
      return { bg: colors?.neutral[100] ?? '#F5F5F4', text: colors?.neutral[700] ?? '#44403C' };
  }
};