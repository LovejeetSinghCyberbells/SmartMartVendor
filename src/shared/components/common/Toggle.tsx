import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onChange,
  activeColor = '#258B3E',
  inactiveColor = '#e5e7eb',
  disabled = false,
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [value, anim]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => !disabled && onChange(!value)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={disabled}
    >
      <View style={[styles.toggleTrack, { backgroundColor: inactiveColor }]}>
        <Animated.View
          style={[
            styles.toggleTrackOn,
            {
              backgroundColor: activeColor,
              opacity: anim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleTrackOn: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Toggle;
