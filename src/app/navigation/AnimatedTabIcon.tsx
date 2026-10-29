import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Icon from '@react-native-vector-icons/feather';

type AnimatedTabIconProps = {
  name: React.ComponentProps<typeof Icon>['name'];
  color: string;
  size: number;
  focused: boolean;
};

const AnimatedTabIcon = ({ name, color, size, focused }: AnimatedTabIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!focused) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }).start();
      return;
    }

    const bounce = Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.18,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]);
    bounce.start();

    return () => bounce.stop();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedTabIcon;
