import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/theme/colors';
import { Activity } from '../types';
import { getActivityIcon, getActivityColor, getActivityLabel } from '../activityMeta';

interface ActivityItemProps {
  activity: Activity;
  onPress?: () => void;
  showBorder?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  onPress,
  showBorder = false,
}) => {
  const color = getActivityColor(activity.type);

  const content = (
    <>
      <View
        className="w-9 h-9 rounded-lg justify-center items-center mr-3"
        style={{ backgroundColor: color + '15' }}
      >
        <Ionicons name={getActivityIcon(activity.type)} size={16} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-neutral-700 font-medium" numberOfLines={1}>
          {activity.description}
        </Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          {getActivityLabel(activity.type)} • {activity.date}
        </Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.neutral[300]} />}
    </>
  );

  const containerClass = `flex-row items-center p-4 ${showBorder ? 'border-b border-neutral-100' : ''}`;

  if (onPress) {
    return (
      <TouchableOpacity className={containerClass} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View className={containerClass}>{content}</View>;
};
