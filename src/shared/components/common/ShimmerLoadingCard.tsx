import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';

export interface ShimmerLoadingCardProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const ShimmerLoadingCard: React.FC<ShimmerLoadingCardProps> = ({
  width = '100%',
  height = 72,
  borderRadius = 12,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();
    return () => shimmer.stop();
  }, [opacity]);

  return (
    <View style={[styles.wrapper, { width: width as any, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmerFill,
          {
            borderRadius,
            opacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  shimmerFill: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
});

export default ShimmerLoadingCard;

