import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { HealthNote, HealthNoteType } from '../types';

interface HealthNoteItemProps {
  note: HealthNote;
}

const NOTE_ICONS: Record<HealthNoteType, keyof typeof Ionicons.glyphMap> = {
  illness: 'warning',
  treatment: 'medkit',
  vaccination: 'shield-checkmark',
  observation: 'eye',
};

export const HealthNoteItem: React.FC<HealthNoteItemProps> = ({ note }) => {
  const { colors } = useTheme();
  const meta = {
    icon: NOTE_ICONS[note.type],
    color:
      note.type === 'illness'
        ? colors.error
        : note.type === 'treatment'
        ? colors.primary[600]
        : note.type === 'vaccination'
        ? colors.success
        : colors.category.cattle,
  };
  return (
    <Card className="mb-2 p-3">
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name={meta.icon} size={16} color={meta.color} />
        <Text className="text-sm font-semibold" style={{ color: meta.color }}>
          {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
        </Text>
        <Text className="text-xs text-neutral-400 ml-auto">{note.date}</Text>
      </View>
      <Text className="text-base text-neutral-700 leading-5">{note.note}</Text>
    </Card>
  );
};
