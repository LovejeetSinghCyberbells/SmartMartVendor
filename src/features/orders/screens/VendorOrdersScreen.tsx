import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScreenHeader,
  SearchBar,
  AnimatedEntranceView,
  getStaggerDelay,
} from '../../../shared/components/common';
import OrderCard from '../components/OrderCard';
import OrderFilterTabs from '../components/OrderFilterTabs';
import EmptyOrders from '../components/EmptyOrders';

const MOCK_ORDERS = [
  {
    id: '1',
    orderId: '#ORD-8821',
    customerName: 'Aditi Sharma',
    itemsCount: 5,
    amount: '₹480',
    time: '2 mins ago',
    status: 'NEW' as const,
    paymentMethod: 'ONLINE' as const,
  },
  {
    id: '2',
    orderId: '#ORD-8820',
    customerName: 'Rohan Mehra',
    itemsCount: 2,
    amount: '₹145',
    time: '12 mins ago',
    status: 'PACKING' as const,
    paymentMethod: 'COD' as const,
  },
  {
    id: '3',
    orderId: '#ORD-8819',
    customerName: 'Pooja Verma',
    itemsCount: 8,
    amount: '₹1,240',
    time: '25 mins ago',
    status: 'READY' as const,
    paymentMethod: 'ONLINE' as const,
  },
  {
    id: '4',
    orderId: '#ORD-8818',
    customerName: 'Vikram Mehta',
    itemsCount: 3,
    amount: '₹320',
    time: '40 mins ago',
    status: 'OUT_FOR_DELIVERY' as const,
    paymentMethod: 'ONLINE' as const,
  },
  {
    id: '5',
    orderId: '#ORD-8817',
    customerName: 'Sneha Rao',
    itemsCount: 4,
    amount: '₹560',
    time: '1 hr ago',
    status: 'DELIVERED' as const,
    paymentMethod: 'COD' as const,
  },
];

const VendorOrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      const matchesFilter =
        activeFilter === 'ALL' || order.status === activeFilter;
      const matchesSearch =
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: MOCK_ORDERS.length };
    MOCK_ORDERS.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Orders"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      {/* Search */}
      <AnimatedEntranceView delay={60} direction="down" distance={12}>
        <SearchBar
          placeholder="Search by order ID or customer"
          value={search}
          onChangeText={setSearch}
        />
      </AnimatedEntranceView>

      {/* Filters */}
      <AnimatedEntranceView delay={120} direction="down" distance={10}>
        <View style={{ height: 80 }}>
          <OrderFilterTabs
            active={activeFilter}
            onChange={setActiveFilter}
            counts={counts}
          />
        </View>
      </AnimatedEntranceView>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyOrders />}
        renderItem={({ item, index }) => (
          <AnimatedEntranceView
            delay={getStaggerDelay(index, 140, 45)}
            direction="up"
            distance={20}
          >
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: item.orderId })
              }
            />
          </AnimatedEntranceView>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },
});

export default VendorOrdersScreen;