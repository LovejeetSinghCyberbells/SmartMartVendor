import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useLocalization } from '../i18n/LocalizationProvider';

const NativeAnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export interface AnimatedTouchableOpacityProps extends TouchableOpacityProps {
  /**
   * Scale depth when pressed down. Default is 0.92 for a punchy, tactile feel.
   * Use 0.86-0.88 for small icons or 0.95-0.97 for larger cards.
   */
  scaleTo?: number;
  /**
   * Spring bounciness upon releasing the touch. Default is 12 for an elastic bounce.
   */
  bounciness?: number;
  /**
   * Spring speed. Default is 22 for snappy feedback.
   */
  speed?: number;
}

const AnimatedTouchableOpacity: React.FC<AnimatedTouchableOpacityProps> = (props) => {
  const {
    accessibilityLabel,
    onPressIn,
    onPressOut,
    style,
    scaleTo = 0.92,
    bounciness = 12,
    speed = 22,
    activeOpacity = 0.82,
    ...rest
  } = props;
  const { t } = useLocalization();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      onPressIn?.(event);
      Animated.spring(scale, {
        toValue: scaleTo,
        speed: 26,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    },
    [onPressIn, scale, scaleTo]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      onPressOut?.(event);
      Animated.spring(scale, {
        toValue: 1,
        speed,
        bounciness,
        useNativeDriver: true,
      }).start();
    },
    [onPressOut, scale, speed, bounciness]
  );

  const animatedStyle = useMemo(() => {
    const flattened = StyleSheet.flatten(style);
    const existingTransforms = flattened?.transform;
    return [
      style,
      {
        transform: [
          ...(Array.isArray(existingTransforms) ? existingTransforms : []),
          { scale },
        ],
      },
    ];
  }, [scale, style]);

  return (
    <NativeAnimatedTouchableOpacity
      {...rest}
      activeOpacity={activeOpacity}
      accessibilityLabel={
        accessibilityLabel ? t(accessibilityLabel) : accessibilityLabel
      }
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    />
  );
};

export default AnimatedTouchableOpacity;
