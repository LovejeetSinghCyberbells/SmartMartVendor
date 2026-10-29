import React from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { ScreenHeader, InfoBanner } from '../../../shared/components/common';
import ProductCard from '../components/ProductCard';

const LOW_STOCK_PRODUCTS = [
  {
    id: '2',
    name: 'Fortune Sunlite Oil',
    category: 'Oils',
    price: '₹140',
    stock: 8,
    unit: '1L',
    image: 'https://cdn-icons-png.flaticon.com/512/2553/2553609.png',
  },
  {
    id: '3',
    name: 'Aashirvaad Atta',
    category: 'Staples',
    price: '₹280',
    stock: 3,
    unit: '5kg',
    image: 'https://cdn-icons-png.flaticon.com/512/3014/3014436.png',
  },
  {
    id: '6',
    name: 'Surf Excel Detergent',
    category: 'Household',
    price: '₹220',
    stock: 6,
    unit: '1kg',
    image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png',
  },
];

const LowStockScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Low Stock"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <InfoBanner
        variant="warning"
        icon="alert-triangle"
        message={`${LOW_STOCK_PRODUCTS.length} products need restocking`}
        style={{ marginHorizontal: 16, marginBottom: 12 }}
      />

      <FlatList
        data={LOW_STOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductForm', { product: item })}
            onEdit={() => navigation.navigate('ProductForm', { product: item })}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#d97706',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
});

export default LowStockScreen;