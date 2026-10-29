import React, { ReactNode, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import TouchableOpacity from '../AnimatedTouchableOpacity';
import { useSharedTransition } from './SharedTransitionContext';

interface ProductDetailPressableProps {
  item: {
    id?: string | number;
    name: string;
    size?: string;
    price?: string | number;
    originalPrice?: string | number;
    image?: string;
    images?: string[];
    quantity?: number;
    qty?: number;
  };
  children: ReactNode;
  style?: ViewStyle;
  onOpen?: (openProduct: () => void) => void;
  accessibilityLabel?: string;
}

const ProductDetailPressable = ({
  item,
  children,
  style,
  onOpen,
  accessibilityLabel,
}: ProductDetailPressableProps) => {
  const cardRef = useRef<React.ElementRef<typeof View>>(null);
  const { openProduct } = useSharedTransition();

  const handlePress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      const openSelectedProduct = () => {
        
      };

      if (onOpen) {
        onOpen(openSelectedProduct);
      } else {
        openSelectedProduct();
      }
    });
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `View ${item.name} details`}
    >
      <View ref={cardRef} collapsable={false} style={styles.content}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProductDetailPressable;
