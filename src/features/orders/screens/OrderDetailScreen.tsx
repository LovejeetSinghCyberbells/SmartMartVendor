import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, SummaryRow } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import OrderStatusBadge from '../components/OrderStatusBadge';

const OrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params || { orderId: 'TK-1024' };
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('NEW');
  const { showConfirm, showToast } = useFeedback();

  const handleAccept = () => {
    setStatus('ACCEPTED');
    showToast('Order accepted successfully', 'success');
  };

  const handleReject = () => {
    showConfirm({
      title: 'Reject Order',
      message: 'Are you sure you want to reject this order? This action cannot be undone.',
      type: 'destructive',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      onConfirm: () => {
        setStatus('REJECTED');
        navigation.goBack();
      },
    });
  };

  const handleMarkPacking = () => setStatus('PACKING');
  const handleMarkReady = () => setStatus('READY');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title={orderId}
        onBack={() => navigation.goBack()}
        showBorder={false}
        rightElement={<OrderStatusBadge status={status as any} />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <AnimatedEntranceView delay={60} direction="up" distance={18}>
          <View style={styles.card}>
            <LocalizedText style={styles.sectionTitle}>Customer</LocalizedText>
            <View style={styles.row}>
              <Icon name="user" size={18} color="#258B3E" />
              <LocalizedText style={styles.rowText}>Rahul Sharma</LocalizedText>
            </View>
            <View style={styles.row}>
              <Icon name="phone" size={18} color="#258B3E" />
              <LocalizedText style={styles.rowText}>+91 98765 43210</LocalizedText>
            </View>
            <View style={styles.row}>
              <Icon name="map-pin" size={18} color="#258B3E" />
              <LocalizedText style={styles.rowText}>
                12, Green Park, Near Metro Station
              </LocalizedText>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* Items */}
        <AnimatedEntranceView delay={140} direction="up" distance={18}>
          <View style={styles.card}>
            <LocalizedText style={styles.sectionTitle}>Items (8)</LocalizedText>
            {[
              { name: 'Amul Milk 1L', qty: 2, price: '₹56' },
              { name: 'Fresh Tomatoes', qty: 1, price: '₹40' },
              { name: 'Aashirvaad Atta 5kg', qty: 1, price: '₹280' },
              { name: 'Fortune Oil 1L', qty: 1, price: '₹140' },
            ].map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <LocalizedText style={styles.itemName}>{item.name}</LocalizedText>
                  <LocalizedText style={styles.itemQty}>Qty: {item.qty}</LocalizedText>
                </View>
                <LocalizedText style={styles.itemPrice}>{item.price}</LocalizedText>
              </View>
            ))}
          </View>
        </AnimatedEntranceView>

        {/* Payment Summary */}
        <AnimatedEntranceView delay={220} direction="up" distance={18}>
          <View style={styles.card}>
            <LocalizedText style={styles.sectionTitle}>Payment</LocalizedText>
            <SummaryRow label="Items Total" value="₹516" />
            <SummaryRow label="Delivery Fee" value="₹0" />
            <SummaryRow label="Total" value="₹516" isTotal />
            <View style={styles.paymentMethod}>
              <LocalizedText style={styles.paymentMethodText}>Payment: COD</LocalizedText>
            </View>
          </View>
        </AnimatedEntranceView>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {status === 'NEW' && (
        <AnimatedEntranceView delay={260} direction="up" distance={25} bouncy>
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={styles.rejectBtn} scaleTo={0.94} onPress={handleReject}>
              <LocalizedText style={styles.rejectText}>Reject</LocalizedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} scaleTo={0.94} onPress={handleAccept}>
              <LocalizedText style={styles.acceptText}>Accept Order</LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>
      )}

      {status === 'ACCEPTED' && (
        <AnimatedEntranceView delay={260} direction="up" distance={25} bouncy>
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={styles.primaryBtn} scaleTo={0.94} onPress={handleMarkPacking}>
              <LocalizedText style={styles.primaryBtnText}>Start Packing</LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>
      )}

      {status === 'PACKING' && (
        <AnimatedEntranceView delay={260} direction="up" distance={25} bouncy>
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={styles.primaryBtn} scaleTo={0.94} onPress={handleMarkReady}>
              <LocalizedText style={styles.primaryBtnText}>Mark as Ready</LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  itemQty: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  paymentMethod: {
    marginTop: 12,
    backgroundColor: '#EAF5ED',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#059669',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ef4444',
  },
  acceptBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default OrderDetailScreen;