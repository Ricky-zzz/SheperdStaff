import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'neutral' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary-600',
  secondary: 'bg-primary-100',
  outline: 'bg-transparent border border-primary-600',
  neutral: 'bg-transparent border border-border',
  ghost: 'bg-transparent',
};

const TEXT_VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-onPrimary',
  secondary: 'text-primary-700',
  outline: 'text-primary-600',
  neutral: 'text-neutral-600',
  ghost: 'text-primary-600',
};

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-4 px-5',
};

const TEXT_SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className,
  style,
}) => {
  const { colors } = useTheme();
  const iconColor = disabled
    ? colors.neutral[400]
    : variant === 'primary'
    ? colors.onPrimary
    : variant === 'neutral'
    ? colors.neutral[600]
    : colors.primary[600];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      className={`min-h-11 flex-row items-center justify-center rounded-lg ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text className={`font-semibold ${TEXT_VARIANT_CLASS[variant]} ${TEXT_SIZE_CLASS[size]}`}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={{ marginLeft: 8 }} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
