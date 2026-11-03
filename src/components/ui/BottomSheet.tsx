import React, { useRef } from 'react';
import { Animated, Modal, PanResponder, Platform, KeyboardAvoidingView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Bottom sheet with a grabber, scrim tap-out, drag-to-dismiss,
 * keyboard avoidance, and home-indicator-aware bottom padding.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;

  const settle = () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110) onClose();
        else settle();
      },
      onPanResponderTerminate: settle,
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableOpacity
            className="absolute top-0 left-0 right-0 bottom-0"
            activeOpacity={1}
            onPress={onClose}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Animated.View
            {...panResponder.panHandlers}
            className="bg-card rounded-t-2xl p-4"
            style={{ paddingBottom: 16 + insets.bottom, transform: [{ translateY }] }}
          >
            <View className="w-9 h-1 rounded-full bg-neutral-300 self-center mb-3" accessibilityElementsHidden />
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
