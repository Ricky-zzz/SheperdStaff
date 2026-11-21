import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (message: string, action?: ToastAction) => void;
  showUndo: (message: string, onUndo: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, action?: ToastAction) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, action }]);
      setTimeout(() => dismiss(id), action ? 5000 : 2800);
    },
    [dismiss]
  );

  const showUndo = useCallback(
    (message: string, onUndo: () => void) => {
      show(message, {
        label: 'Undo',
        onPress: () => {
          try {
            onUndo();
          } catch {
            // best effort
          }
        },
      });
    },
    [show]
  );

  const value = useMemo(() => ({ show, showUndo }), [show, showUndo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        className="absolute left-4 right-4 items-center"
        style={{ bottom: 24 + insets.bottom }}
      >
        {toasts.map((t) => (
          <View
            key={t.id}
            className="flex-row items-center bg-neutral-800 rounded-xl px-4 py-3 mb-2 shadow-lg"
            style={{ backgroundColor: colors.neutral[800], maxWidth: '100%' }}
          >
            <Text className="flex-1 text-sm text-white" numberOfLines={2}>
              {t.message}
            </Text>
            {t.action && (
              <TouchableOpacity
                className="ml-3 px-2 py-1"
                onPress={() => {
                  t.action?.onPress();
                  dismiss(t.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={t.action.label}
              >
                <Text className="text-sm font-bold" style={{ color: colors.primary[300] }}>
                  {t.action.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};
