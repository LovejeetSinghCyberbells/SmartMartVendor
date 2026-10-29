import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';

export type FloatingItemLayer = 'back' | 'front';

type FeatherIconName = React.ComponentProps<typeof Icon>['name'];

interface FloatingItemConfig {
  id: string;
  name: string;
  icon: FeatherIconName;
  color: string;
  layer: FloatingItemLayer;
  left: `${number}%`;
  duration: number;
  delay: number;
  rotation: `${number}deg`;
  size: number;
}

export const FLOATING_ITEMS: FloatingItemConfig[] = [
  {
    id: 'inventory',
    name: 'Inventory',
    icon: 'package',
    color: '#1A632C',
    layer: 'front',
    left: '8%',
    duration: 5200,
    delay: 0,
    rotation: '-10deg',
    size: 52,
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: 'clipboard',
    color: '#f59e0b',
    layer: 'back',
    left: '30%',
    duration: 4600,
    delay: 1200,
    rotation: '8deg',
    size: 46,
  },
  {
    id: 'sales',
    name: 'Sales growth',
    icon: 'trending-up',
    color: '#16a34a',
    layer: 'front',
    left: '72%',
    duration: 5600,
    delay: 600,
    rotation: '12deg',
    size: 54,
  },
  {
    id: 'delivery',
    name: 'Delivery',
    icon: 'truck',
    color: '#3b82f6',
    layer: 'back',
    left: '52%',
    duration: 4900,
    delay: 2400,
    rotation: '-8deg',
    size: 48,
  },
  {
    id: 'team',
    name: 'Team',
    icon: 'users',
    color: '#8b5cf6',
    layer: 'front',
    left: '44%',
    duration: 6000,
    delay: 1800,
    rotation: '6deg',
    size: 50,
  },
  {
    id: 'pricing',
    name: 'Pricing',
    icon: 'tag',
    color: '#ec4899',
    layer: 'back',
    left: '86%',
    duration: 5000,
    delay: 3000,
    rotation: '-14deg',
    size: 42,
  },
  {
    id: 'cart',
    name: 'Shopping cart',
    icon: 'shopping-cart',
    color: '#0ea5a4',
    layer: 'back',
    left: '16%',
    duration: 5400,
    delay: 3600,
    rotation: '10deg',
    size: 44,
  },
  {
    id: 'payments',
    name: 'Payments',
    icon: 'credit-card',
    color: '#ef4444',
    layer: 'back',
    left: '64%',
    duration: 4800,
    delay: 4400,
    rotation: '-6deg',
    size: 42,
  },
];

interface FloatingItemsProps {
  layer: FloatingItemLayer;
  travelHeight: number;
}

interface FloatingItemProps {
  item: FloatingItemConfig;
  travelHeight: number;
}

const { width } = Dimensions.get('window');

const FloatingItem = ({ item, travelHeight }: FloatingItemProps) => {
  const size = item.size * (item.layer === 'back' ? 0.9 : 1.08);
  const translateY = useRef(new Animated.Value(-size)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const visibleEnd = Math.max(0, travelHeight - size);
  const opacity = translateY.interpolate({
    inputRange: [-size, 0, visibleEnd, travelHeight],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(item.delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: travelHeight,
            duration: item.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1,
              duration: 420,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: item.duration - 420,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: width * 0.035,
              duration: item.duration * 0.32,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -width * 0.025,
              duration: item.duration * 0.36,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: item.duration * 0.32,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -size,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [item, scale, size, translateX, translateY, travelHeight]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLabel={item.name}
      style={[
        styles.item,
        {
          left: item.left,
          width: size,
          height: size,
          borderRadius: size * 0.32,
        },
        item.layer === 'back' ? styles.backItem : styles.frontItem,
        {
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: item.rotation },
            { scale },
          ],
        },
      ]}
    >
      <Icon name={item.icon} size={size * 0.5} color={item.color} />
    </Animated.View>
  );
};

const FloatingItems = ({ layer, travelHeight }: FloatingItemsProps) => (
  <View
    pointerEvents="none"
    style={[
      StyleSheet.absoluteFill,
      layer === 'back' ? styles.backLayer : styles.frontLayer,
    ]}
  >
    {FLOATING_ITEMS.filter((item) => item.layer === layer).map((item) => (
      <FloatingItem
        key={item.id}
        item={item}
        travelHeight={travelHeight}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  backLayer: {
    zIndex: 0,
    elevation: 0,
  },
  frontLayer: {
    zIndex: 2,
    elevation: 2,
  },
  item: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  frontItem: {
    backgroundColor: '#ffffff',
    shadowColor: '#163b24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default FloatingItems;