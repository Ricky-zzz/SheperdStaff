import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { formatTime } from '../../lib/utils/format';

interface TimeInputProps {
  value?: string;
  onChange: (time: string | undefined) => void;
  error?: string;
}

function parseTime(time?: string): Date {
  const [h, m] = (time ?? '').split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isNaN(h) ? 7 : h, Number.isNaN(m) ? 0 : m, 0, 0);
  return date;
}

function toHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const { colors } = useTheme();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (event.type === 'set' && selected) {
      onChange(toHHmm(selected));
    }
  };

  return (
    <>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-between bg-card border rounded-lg px-4 py-3 ${error ? 'border-error' : 'border-border'}`}
          onPress={() => setShow(true)}
        >
          <Text className={`text-base ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>
            {value ? formatTime(value) : 'All day (optional)'}
          </Text>
          <Ionicons name="time-outline" size={18} color={colors.neutral[400]} />
        </TouchableOpacity>
        {value ? (
          <TouchableOpacity className="p-2" onPress={() => onChange(undefined)} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="text-xs text-error mt-1">{error}</Text> : null}
      {show && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleChange}
        />
      )}
    </>
  );
};
