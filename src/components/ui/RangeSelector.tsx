import React from 'react';
import { View, Text } from 'react-native';
import { FilterChip } from './FilterChip';
import { DateInput } from './DateInput';
import { DATE_PRESETS, DatePreset } from '../../lib/utils/dateRange';

interface RangeSelectorProps {
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  preset,
  onPresetChange,
  from,
  to,
  onFromChange,
  onToChange,
}) => {
  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {DATE_PRESETS.map((p) => (
          <FilterChip key={p.key} label={p.label} selected={preset === p.key} onPress={() => onPresetChange(p.key)} />
        ))}
      </View>
      {preset === 'custom' && (
        <View className="mt-2">
          <Text className="text-sm font-medium text-neutral-600 mb-1">From</Text>
          <DateInput value={from} onChange={onFromChange} />
          <Text className="text-sm font-medium text-neutral-600 mb-1">To</Text>
          <DateInput value={to} onChange={onToChange} />
        </View>
      )}
    </View>
  );
};