import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import LocalizedText from '../../i18n/LocalizedText';

export interface CartBounceBadgeProps {
  count: number;
  backgroundColor?: string;
  textColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CartBounceBadge: React.FC<CartBounceBadgeProps> = ({
  count,
  backgroundColor = '#dc2626',
  textColor = '#ffffff',
  size = 20,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current && count > 0) {
      prevCount.current = count;
      // Punchy spring bounce on item count change
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.45,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, scale]);

  if (count <= 0) return null;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <LocalizedText style={[styles.text, { color: textColor, fontSize: Math.max(9, size * 0.55) }, textStyle]}>
        {count > 99 ? '99+' : count}
      </LocalizedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default CartBounceBadge;

