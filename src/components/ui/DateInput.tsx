import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';

interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y || 2000, (m || 1) - 1, d || 1);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChange, error }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (event.type === 'set' && selected) {
      onChange(toISO(selected));
    }
  };

  return (
    <>
      <TouchableOpacity
        className={`flex-row items-center justify-between bg-white border rounded-lg px-4 py-3 mb-1 ${error ? 'border-error' : 'border-border'}`}
        onPress={() => setShow(true)}
      >
        <Text className={`text-base ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>{value || 'Select date'}</Text>
        <Ionicons name="calendar-outline" size={18} color={Colors.neutral[400]} />
      </TouchableOpacity>
      {error ? <Text className="text-xs text-error mb-3">{error}</Text> : <View className="mb-3" />}
      {show && (
        <DateTimePicker
          value={parseISO(value)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </>
  );
};