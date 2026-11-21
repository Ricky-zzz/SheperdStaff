import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
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
  const [loaded, setLoaded] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    fade.setValue(0);
  }, [uri, fade]);

  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primary[100],
  };

  return (
    <View className={`overflow-hidden items-center justify-center ${className ?? ''}`} style={style}>
      {uri && !failed ? (
        <>
          {/* Progressive placeholder: initials stay visible until the photo fades in. */}
          {!loaded && (
            <Text style={{ color: colors.primary[700], fontSize: Math.round(size * 0.38), fontWeight: '700' }}>
              {getInitials(name)}
            </Text>
          )}
          <Animated.Image
            source={{ uri }}
            style={{ width: size, height: size, position: loaded ? 'relative' : 'absolute', opacity: fade }}
            resizeMode="cover"
            onError={() => setFailed(true)}
            onLoad={() => {
              setLoaded(true);
              Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
            }}
          />
        </>
      ) : (
        <Text style={{ color: colors.primary[700], fontSize: Math.round(size * 0.38), fontWeight: '700' }}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};
