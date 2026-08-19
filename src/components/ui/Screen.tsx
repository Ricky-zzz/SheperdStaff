import React from 'react';
import { View, ScrollView, StyleProp, ViewStyle } from 'react-native';


interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  padded?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  className,
  style,
  scrollable = true,
  padded = true,
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
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
};
