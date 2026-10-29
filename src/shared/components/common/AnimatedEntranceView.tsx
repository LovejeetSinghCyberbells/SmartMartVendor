import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type EntranceDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

export interface AnimatedEntranceViewProps {
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: EntranceDirection;
  distance?: number;
  bouncy?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedEntranceView: React.FC<AnimatedEntranceViewProps> = ({
  children,
  delay = 0,
  duration = 420,
  direction = 'up',
  distance = 24,
  bouncy = false,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translation = useRef(
    new Animated.Value(
      direction === 'scale'
        ? 0.7
        : direction === 'up'
        ? distance
        : direction === 'down'
        ? -distance
        : direction === 'left'
        ? distance
        : direction === 'right'
        ? -distance
        : 0
    )
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bouncy || direction === 'scale') {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: Math.min(duration, 300),
            useNativeDriver: true,
          }),
          Animated.spring(translation, {
            toValue: direction === 'scale' ? 1 : 0,
            friction: 6,
            tension: 180,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translation, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, direction, distance, bouncy, opacity, translation]);

  const animatedTransform = (() => {
    switch (direction) {
      case 'up':
      case 'down':
        return [{ translateY: translation }];
      case 'left':
      case 'right':
        return [{ translateX: translation }];
      case 'scale':
        return [{ scale: translation }];
      case 'fade':
      default:
        return [];
    }
  })();

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: animatedTransform,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Helper to compute staggered delays for sequential items.
 * Example: `getDelay(index, 100, 60)` -> 100ms, 160ms, 220ms...
 */
export const getStaggerDelay = (
  index: number,
  baseDelay: number = 80,
  step: number = 50,
  maxDelay: number = 600
): number => {
  return Math.min(baseDelay + index * step, maxDelay);
};

export default AnimatedEntranceView;

