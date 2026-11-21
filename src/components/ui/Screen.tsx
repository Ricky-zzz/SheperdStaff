import React from 'react';
import { View, Text, ScrollView, StyleProp, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Inline non-blocking error (DB failure, restore failure). Replaces Alert walls. */
  error?: string | null;
  onRetry?: () => void;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  className,
  style,
  scrollable = true,
  padded = true,
  refreshing,
  onRefresh,
  error,
  onRetry,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content = (
    <View className={`flex-1 ${padded ? 'p-4' : ''} ${className ?? ''}`} style={style}>
      {error ? (
        <View
          className="flex-row items-center rounded-xl px-3 py-2.5 mb-3"
          style={{ backgroundColor: colors.error + '15' }}
          accessibilityRole="alert"
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text className="flex-1 text-sm ml-2" style={{ color: colors.error }} numberOfLines={2}>
            {error}
          </Text>
          {onRetry ? (
            <Text
              className="text-sm font-bold ml-2"
              style={{ color: colors.error }}
              onPress={onRetry}
              accessibilityRole="button"
            >
              Retry
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            refreshing !== undefined && onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} colors={[colors.primary[600]]} />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
};