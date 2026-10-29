import React from 'react';
import { View, StyleSheet } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import OrderStatusBadge from './OrderStatusBadge';
import Badge from '../../../shared/components/common/Badge';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  itemsCount: number;
  amount: string;
  time: string;
  status: any;
  paymentMethod?: 'COD' | 'ONLINE';
}

interface Props {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.topRow}>
        <View>
          <LocalizedText style={styles.orderId}>{order.orderId}</LocalizedText>
          <LocalizedText style={styles.customer}>{order.customerName}</LocalizedText>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.meta}>
          <Icon name="package" size={14} color="#6b7280" />
          <LocalizedText style={styles.metaText}>{order.itemsCount} items</LocalizedText>
          <LocalizedText style={styles.dot}>•</LocalizedText>
          <LocalizedText style={styles.metaText}>{order.time}</LocalizedText>
        </View>

        <View style={styles.amountRow}>
          <LocalizedText style={styles.amount}>{order.amount}</LocalizedText>
          {order.paymentMethod && (
            <Badge
              label={order.paymentMethod}
              backgroundColor={order.paymentMethod === 'COD' ? '#fef3c7' : '#dbeafe'}
              textColor={order.paymentMethod === 'COD' ? '#d97706' : '#2563eb'}
              size="sm"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  customer: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: '#9ca3af',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
});

export default OrderCard;
