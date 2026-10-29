import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/feather';

export interface AnimatedSuccessCheckmarkProps {
  size?: number;
  color?: string;
  iconColor?: string;
  onAnimationEnd?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedSuccessCheckmark: React.FC<AnimatedSuccessCheckmarkProps> = ({
  size = 64,
  color = '#258B3E',
  iconColor = '#ffffff',
  onAnimationEnd,
  style,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.8)).current;
  const haloOpacity = useRef(new Animated.Value(0.7)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset values
    scale.setValue(0);
    haloScale.setValue(0.8);
    haloOpacity.setValue(0.7);
    iconScale.setValue(0);

    // Sequence: Core circle pops with spring, halo ring expands, checkmark bounces in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(haloScale, {
          toValue: 1.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationEnd?.();
    });
  }, [scale, haloScale, haloOpacity, iconScale, onAnimationEnd]);

  const iconSize = Math.round(size * 0.52);

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }, style]}>
      {/* Expanding Ripple Halo */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ scale: haloScale }],
            opacity: haloOpacity,
          },
        ]}
      />

      {/* Main Core Bubble */}
      <Animated.View
        style={[
          styles.coreCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Icon name="check" size={iconSize} color={iconColor} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    borderWidth: 3,
  },
  coreCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default AnimatedSuccessCheckmark;

