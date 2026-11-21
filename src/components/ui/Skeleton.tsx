import React, { useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** Shimmer placeholder that mirrors layout while data loads. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  rounded = 8,
  className,
  style,
}) => {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const base = { width: width as never, height, borderRadius: rounded } as ViewStyle;
  return (
    <Animated.View
      className={`bg-neutral-200 ${className ?? ''}`}
      style={[base, style, animated]}
    />
  );
};

interface SkeletonListProps {
  rows?: number;
}

/** Card-shaped placeholder list for initial loads. */
export const SkeletonList: React.FC<SkeletonListProps> = ({ rows = 4 }) => (
  <View>
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} className="bg-card rounded-xl p-4 mb-3">
        <View className="flex-row items-center mb-3">
          <Skeleton width={44} height={44} rounded={10} />
          <View className="flex-1 ml-3">
            <Skeleton width="60%" height={14} />
            <View className="mt-2">
              <Skeleton width="40%" height={12} />
            </View>
          </View>
        </View>
        <Skeleton width="90%" height={12} />
      </View>
    ))}
  </View>
);
