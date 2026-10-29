import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  SearchBar,
  AnimatedEntranceView,
  getStaggerDelay,
} from '../../../shared/components/common';
import ProductCard from '../components/ProductCard';
import InventoryFilterTabs from '../components/InventoryFilterTabs';
import EmptyInventory from '../components/EmptyInventory';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Amul Taaza Homogenised Toned Milk',
    category: 'Dairy',
    price: '₹54',
    stock: 24,
    unit: '1L',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'Cooking Essentials',
    price: '₹145',
    stock: 8,
    unit: '1L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    name: 'Aashirvaad Superior MP Sharbati Atta',
    category: 'Flours & Grains',
    price: '₹280',
    stock: 0,
    unit: '5kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    name: 'Tata Salt Vacuum Evaporated Iodised',
    category: 'Cooking Essentials',
    price: '₹28',
    stock: 50,
    unit: '1kg',
    image: 'https://images.unsplash.com/photo-1518110903495-cd99c1294741?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '5',
    name: 'Maggi 2-Minute Instant Noodles',
    category: 'Snacks & Packaged Food',
    price: '₹14',
    stock: 3,
    unit: '70g',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '6',
    name: 'Coca-Cola Original Taste Soft Drink',
    category: 'Beverages',
    price: '₹40',
    stock: 15,
    unit: '750ml',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
  },
];

const InventoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      let matchesFilter = true;
      if (activeFilter === 'IN_STOCK') matchesFilter = p.stock > 10;
      else if (activeFilter === 'LOW') matchesFilter = p.stock > 0 && p.stock <= 10;
      else if (activeFilter === 'OUT') matchesFilter = p.stock === 0;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, search]);

  const counts = useMemo(() => {
    return {
      ALL: MOCK_PRODUCTS.length,
      IN_STOCK: MOCK_PRODUCTS.filter((p) => p.stock > 10).length,
      LOW: MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 10).length,
      OUT: MOCK_PRODUCTS.filter((p) => p.stock === 0).length,
    };
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Inventory"
        onBack={() => navigation.goBack()}
        showBorder={false}
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            scaleTo={0.88}
            onPress={() => navigation.navigate('ProductForm')}
          >
            <Icon name="plus" size={22} color="#258B3E" />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <AnimatedEntranceView delay={60} direction="down" distance={12}>
        <SearchBar
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
      </AnimatedEntranceView>

      {/* Filters */}
      <AnimatedEntranceView delay={120} direction="down" distance={10}>
        <View style={{ height: 80 }}>
          <InventoryFilterTabs
            active={activeFilter}
            onChange={setActiveFilter}
            counts={counts}
          />
        </View>
      </AnimatedEntranceView>

      {/* List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyInventory onAdd={() => navigation.navigate('ProductForm')} />
        }
        renderItem={({ item, index }) => (
          <AnimatedEntranceView
            delay={getStaggerDelay(index, 140, 45)}
            direction="up"
            distance={20}
          >
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductForm', { productId: item.id })
              }
              onEdit={() =>
                navigation.navigate('ProductForm', { productId: item.id })
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },
});

export default InventoryScreen;