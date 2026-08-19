import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
}

const VARIANT_CLASS: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'shadow-sm',
  elevated: 'shadow-md',
  outlined: 'border border-border shadow-none',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  style,
  variant = 'default',
}) => {
  return (
    <View className={`bg-card rounded-xl p-4 ${VARIANT_CLASS[variant]} ${className ?? ''}`} style={style}>
      {children}
    </View>
  );
};
