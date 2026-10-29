import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import StockBadge from './StockBadge';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  unit: string;
  image?: string;
}

interface Props {
  product: Product;
  onPress: () => void;
  onEdit?: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onPress, onEdit }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <Icon name="package" size={28} color="#9ca3af" />
        )}
      </View>

      <View style={styles.content}>
        <LocalizedText style={styles.name} numberOfLines={2}>
          {product.name}
        </LocalizedText>
        <LocalizedText style={styles.category}>{product.category}</LocalizedText>

        <View style={styles.bottomRow}>
          <LocalizedText style={styles.price}>
            {product.price}
            <LocalizedText style={styles.unit}> / {product.unit}</LocalizedText>
          </LocalizedText>
          <StockBadge stock={product.stock} />
        </View>
      </View>

      {onEdit && (
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Icon name="edit-2" size={16} color="#258B3E" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f8faf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  image: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  category: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  unit: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ProductCard;