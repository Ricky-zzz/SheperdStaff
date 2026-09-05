import React from 'react';
import { View, ScrollView, StyleProp, ViewStyle, RefreshControl } from 'react-native';
import { Colors } from '../../lib/theme/colors';

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
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            refreshing !== undefined && onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[600]} colors={[Colors.primary[600]]} />
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