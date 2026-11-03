import React from 'react';
import { View, ScrollView, StyleProp, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  className,
  style,
  scrollable = true,
  padded = true,
  refreshing,
  onRefresh,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content = (
    <View className={`flex-1 ${padded ? 'p-4' : ''} ${className ?? ''}`} style={style}>
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