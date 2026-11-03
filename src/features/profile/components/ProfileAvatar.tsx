import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../../../lib/theme/ThemeContext';

interface ProfileAvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  className?: string;
}

export function getInitials(name?: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, uri, size = 40, className }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primary[100],
  };

  return (
    <View className={`overflow-hidden items-center justify-center ${className ?? ''}`} style={style}>
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Text style={{ color: colors.primary[700], fontSize: Math.round(size * 0.38), fontWeight: '700' }}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};
