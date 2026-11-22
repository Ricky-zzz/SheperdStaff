import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Livestock } from '../../features/livestock/types';

const CHIP_THRESHOLD = 8;
const MAX_RESULTS = 5;

interface LivestockPickerProps {
  livestock: Livestock[];
  value: string | null;
  onChange: (id: string | null) => void;
  noneLabel?: string;
  className?: string;
}

export const LivestockPicker: React.FC<LivestockPickerProps> = ({ livestock, value, onChange, noneLabel = 'None', className }) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const selected = livestock.find((l) => l.id === value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return livestock.filter((l) => l.name.toLowerCase().includes(q) || (l.code ?? '').toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [livestock, query]);

  if (livestock.length <= CHIP_THRESHOLD) {
    return (
      <View className={`flex-row flex-wrap gap-2 mb-1 ${className ?? ''}`}>
        <TouchableOpacity
          className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${!value ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
          onPress={() => onChange(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: !value }}
        >
          <Text className={`text-sm ${!value ? 'text-onPrimary' : 'text-neutral-600'}`}>{noneLabel}</Text>
        </TouchableOpacity>
        {livestock.map((l) => (
          <TouchableOpacity
            key={l.id}
            className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${value === l.id ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
            onPress={() => onChange(l.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === l.id }}
          >
            <Text className={`text-sm ${value === l.id ? 'text-onPrimary' : 'text-neutral-600'}`}>{l.name} · {l.quantity} head</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const showList = query.trim().length > 0;

  return (
    <View className={className}>
      {selected ? (
        <View className="flex-row items-center gap-2 mb-2">
          <View className="min-h-[44px] flex-row items-center gap-1.5 pl-3 pr-1 py-2 rounded-full bg-primary-600">
            <Text className="text-sm text-onPrimary font-medium">{selected.name} · {selected.quantity} head</Text>
            <TouchableOpacity
              onPress={() => onChange(null)}
              className="p-2 -mr-1"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${selected.name}`}
            >
              <Ionicons name="close-circle" size={16} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          {selected.code ? <Text className="text-xs text-neutral-500">{selected.code}</Text> : null}
        </View>
      ) : (
        <TouchableOpacity
          className="self-start min-h-[44px] items-center justify-center px-3 py-2 rounded-full border border-border bg-card mb-2"
          onPress={() => onChange(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
        >
          <Text className="text-sm text-neutral-600">{noneLabel}</Text>
        </TouchableOpacity>
      )}

      <View className="flex-row items-center bg-card border border-border rounded-lg px-3 py-2 mb-1">
        <Ionicons name="search-outline" size={16} color={colors.neutral[500]} />
        <TextInput
          className="flex-1 text-base text-neutral-800 ml-2 py-1"
          placeholder={`Search ${livestock.length} records by name or ID`}
          placeholderTextColor={colors.neutral[500]}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <TouchableOpacity
            onPress={() => setQuery('')}
            className="p-2 -mr-2"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle-outline" size={16} color={colors.neutral[500]} />
          </TouchableOpacity>
        ) : null}
      </View>
      {!showList ? <Text className="text-xs text-neutral-500 mb-1">Type to search</Text> : null}

      {showList && (
        <View className="bg-card border border-border rounded-lg overflow-hidden">
          {results.length > 0 ? (
            results.map((l, index) => (
              <TouchableOpacity
                key={l.id}
                className={`flex-row items-center px-3 py-3 ${index < results.length - 1 ? 'border-b border-neutral-100' : ''}`}
                onPress={() => {
                  onChange(l.id);
                  setQuery('');
                }}
              >
                <View className="flex-1">
                  <Text className="text-base text-neutral-800" numberOfLines={1}>{l.name}</Text>
                  <Text className="text-xs text-neutral-500 mt-0.5">
                    {l.code ? `${l.code} · ` : ''}{l.quantity} head
                  </Text>
                </View>
                {value === l.id ? <Ionicons name="checkmark-outline" size={18} color={colors.primary[600]} /> : null}
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-sm text-neutral-500 px-3 py-3">No matching livestock</Text>
          )}
          {results.length === MAX_RESULTS && livestock.length > MAX_RESULTS ? (
            <Text className="text-xs text-neutral-500 px-3 pb-2">Showing first {MAX_RESULTS} matches. Keep typing to narrow down</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};
