import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';

export interface LivePulseBeaconProps {
  color?: string;
  size?: number;
  pulseRadius?: number;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LivePulseBeacon: React.FC<LivePulseBeaconProps> = ({
  color = '#258B3E',
  size = 10,
  pulseRadius = 26,
  active = true,
  style,
}) => {
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const opacityAnim1 = useRef(new Animated.Value(0.75)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const opacityAnim2 = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!active) {
      scaleAnim1.setValue(1);
      opacityAnim1.setValue(0);
      scaleAnim2.setValue(1);
      opacityAnim2.setValue(0);
      return;
    }

    const maxScale = pulseRadius / size;

    const wave1 = Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim1, {
          toValue: maxScale,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim1, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    const wave2 = Animated.loop(
      Animated.sequence([
        Animated.delay(650),
        Animated.parallel([
          Animated.timing(scaleAnim2, {
            toValue: maxScale,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim2, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    wave1.start();
    wave2.start();

    return () => {
      wave1.stop();
      wave2.stop();
    };
  }, [active, color, pulseRadius, size, scaleAnim1, opacityAnim1, scaleAnim2, opacityAnim2]);

  return (
    <View style={[styles.container, { width: pulseRadius * 2, height: pulseRadius * 2 }, style]}>
      {active && (
        <>
          <Animated.View
            style={[
              styles.wave,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale: scaleAnim1 }],
                opacity: opacityAnim1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale: scaleAnim2 }],
                opacity: opacityAnim2,
              },
            ]}
          />
        </>
      )}
      {/* Central Solid Core Dot */}
      <View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
  },
  core: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default LivePulseBeacon;

