import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { Colors } from '../../../lib/theme/colors';
import { HealthNote, HealthNoteType } from '../types';

const NOTE_META: Record<HealthNoteType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  illness: { icon: 'warning', color: Colors.error },
  treatment: { icon: 'medkit', color: Colors.primary[600] },
  vaccination: { icon: 'shield-checkmark', color: Colors.success },
  observation: { icon: 'eye', color: Colors.category.cattle },
};

interface HealthNoteItemProps {
  note: HealthNote;
}

export const HealthNoteItem: React.FC<HealthNoteItemProps> = ({ note }) => {
  const meta = NOTE_META[note.type];
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
