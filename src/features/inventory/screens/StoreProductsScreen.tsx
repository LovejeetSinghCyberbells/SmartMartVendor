import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import {
  ScreenHeader,
  SearchBar,
  Badge,
  FilterTabs,
  AnimatedEntranceView,
} from '../../../shared/components/common';
import { useStaffRole } from '../../team';
import { colors } from '../../../shared/theme/colors';

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  isAvailable: boolean;
  aisle: string;
  barcode: string;
}

const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: '1',
    name: 'Amul Taaza Homogenised Toned Milk',
    category: 'Dairy',
    price: 54,
    stock: 24,
    unit: '1L',
    isAvailable: true,
    aisle: 'Aisle 2 • Dairy Chiller',
    barcode: '890126201015',
  },
  {
    id: '2',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'Pantry',
    price: 145,
    stock: 8,
    unit: '1L',
    isAvailable: true,
    aisle: 'Aisle 4 • Cooking Oils',
    barcode: '890600728101',
  },
  {
    id: '3',
    name: 'Aashirvaad Superior MP Sharbati Atta',
    category: 'Flours',
    price: 280,
    stock: 0,
    unit: '5kg',
    isAvailable: false,
    aisle: 'Aisle 5 • Staples & Grains',
    barcode: '890103038291',
  },
  {
    id: '4',
    name: 'Tata Salt Vacuum Evaporated Iodised',
    category: 'Pantry',
    price: 28,
    stock: 50,
    unit: '1kg',
    isAvailable: true,
    aisle: 'Aisle 3 • Spices & Salt',
    barcode: '890400440021',
  },
  {
    id: '5',
    name: 'Maggi 2-Minute Instant Masala Noodles',
    category: 'Snacks',
    price: 14,
    stock: 3,
    unit: '70g',
    isAvailable: true,
    aisle: 'Aisle 1 • Instant Foods',
    barcode: '890105885220',
  },
  {
    id: '6',
    name: 'Coca-Cola Original Taste Soft Drink',
    category: 'Beverages',
    price: 40,
    stock: 18,
    unit: '750ml',
    isAvailable: true,
    aisle: 'Aisle 6 • Beverage Bay',
    barcode: '890176401221',
  },
  {
    id: '7',
    name: 'Britannia Good Day Butter Biscuits',
    category: 'Bakery',
    price: 30,
    stock: 32,
    unit: '120g',
    isAvailable: true,
    aisle: 'Aisle 1 • Cookies & Biscuits',
    barcode: '890106301112',
  },
  {
    id: '8',
    name: 'Fresh Farm Tomatoes (Local Red)',
    category: 'Veggies',
    price: 35,
    stock: 15,
    unit: '1kg',
    isAvailable: true,
    aisle: 'Aisle 1 • Fresh Crates',
    barcode: '890100010001',
  },
];

type FilterType = 'ALL' | 'IN_STOCK' | 'LOW' | 'OUT';

export const StoreProductsScreen: React.FC<{ navigation?: any; isTab?: boolean }> = ({
  navigation,
  isTab = false,
}) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { permissions } = currentEmployee;

  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_STORE_PRODUCTS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit Price Modal state
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [newPrice, setNewPrice] = useState('');

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Dairy');
  const [addPrice, setAddPrice] = useState('');
  const [addUnit, setAddUnit] = useState('1L');
  const [addStock, setAddStock] = useState('20');
  const [addAisle, setAddAisle] = useState('Aisle 2 • Dairy Chiller');
  const [addBarcode, setAddBarcode] = useState('');

  const categories = ['All', 'Dairy', 'Pantry', 'Flours', 'Snacks', 'Beverages', 'Veggies', 'Bakery'];

  // Update Stock
  const handleAdjustStock = (productId: string, delta: number) => {
    if (!permissions.products.update) {
      Alert.alert('Permission Restricted', 'You do not have permission to update product stock.');
      return;
    }
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const updatedStock = Math.max(0, item.stock + delta);
          return {
            ...item,
            stock: updatedStock,
            isAvailable: updatedStock > 0,
          };
        }
        return item;
      })
    );
  };

  // Toggle Availability
  const handleToggleAvailability = (productId: string) => {
    if (!permissions.products.update) {
      Alert.alert('Permission Restricted', 'You do not have permission to change product status.');
      return;
    }
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const nextState = !item.isAvailable;
          return {
            ...item,
            isAvailable: nextState,
          };
        }
        return item;
      })
    );
  };

  // Save Price
  const handleSavePrice = () => {
    if (!editingProduct) return;
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid product price');
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id ? { ...item, price: priceNum } : item
      )
    );
    setEditingProduct(null);
    setNewPrice('');
  };

  // Add New Product SKU
  const handleSaveNewProduct = () => {
    if (!addName.trim() || !addPrice.trim()) {
      Alert.alert('Missing Fields', 'Please enter product name and price.');
      return;
    }
    const priceNum = parseFloat(addPrice);
    const stockNum = parseInt(addStock, 10) || 0;
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid product price.');
      return;
    }

    const newSKU: StoreProduct = {
      id: `p-${Date.now()}`,
      name: addName.trim(),
      category: addCategory,
      price: priceNum,
      stock: stockNum,
      unit: addUnit.trim() || '1 pc',
      isAvailable: stockNum > 0,
      aisle: addAisle.trim() || 'Aisle 1',
      barcode: addBarcode.trim() || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    };

    setProducts((prev) => [newSKU, ...prev]);
    setShowAddModal(false);
    setAddName('');
    setAddPrice('');
    setAddBarcode('');
    Alert.alert('Product Added', `"${newSKU.name}" has been added to store inventory.`);
  };

  // Delete Product SKU
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!permissions.products.delete) {
      Alert.alert('Permission Restricted', 'You do not have permission to delete products.');
      return;
    }
    Alert.alert(
      'Delete Product SKU',
      `Are you sure you want to delete "${productName}" from the store catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts((prev) => prev.filter((p) => p.id !== productId));
          },
        },
      ]
    );
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.aisle.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search);

      const matchCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      let matchFilter = true;
      if (activeFilter === 'IN_STOCK') matchFilter = p.stock > 10;
      else if (activeFilter === 'LOW') matchFilter = p.stock > 0 && p.stock <= 10;
      else if (activeFilter === 'OUT') matchFilter = p.stock === 0 || !p.isAvailable;

      return matchSearch && matchCategory && matchFilter;
    });
  }, [products, search, selectedCategory, activeFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      ALL: products.length,
      IN_STOCK: products.filter((p) => p.stock > 10 && p.isAvailable).length,
      LOW: products.filter((p) => p.stock > 0 && p.stock <= 10 && p.isAvailable).length,
      OUT: products.filter((p) => p.stock === 0 || !p.isAvailable).length,
    };
  }, [products]);

  // If user has no permission to view products
  if (!permissions.products.view) {
    return (
      <View style={[styles.root, styles.restrictedContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.restrictedCard}>
          <View style={styles.restrictedIconWrap}>
            <Icon name="lock" size={32} color="#9ca3af" />
          </View>
          <LocalizedText style={styles.restrictedTitle}>Products Access Restricted</LocalizedText>
          <LocalizedText style={styles.restrictedSub}>
            Your staff account ({currentEmployee.roleTitle}) does not have permission to view store products. Contact the store owner to request access.
          </LocalizedText>
          {!isTab && navigation?.canGoBack() && (
            <TouchableOpacity
              style={styles.restrictedBackBtn}
              scaleTo={0.92}
              onPress={() => navigation.goBack()}
            >
              <LocalizedText style={styles.restrictedBackBtnText}>Go Back</LocalizedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        {!isTab && navigation?.canGoBack() ? (
          <TouchableOpacity
            style={styles.backBtn}
            scaleTo={0.88}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#1a1a1a" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIconWrap}>
            <Icon name="grid" size={19} color={colors.primary} />
          </View>
        )}

        <View style={styles.headerTitleWrap}>
          <LocalizedText style={styles.headerTitle}>In-Store Products</LocalizedText>
          <LocalizedText style={styles.headerSubtitle}>
            Stock &amp; Price Floor Management
          </LocalizedText>
        </View>

        {permissions.products.create && (
          <TouchableOpacity
            style={styles.addProductBtn}
            scaleTo={0.92}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="plus" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <LocalizedText style={styles.addProductBtnText}>Add</LocalizedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Search & Barcode Scan */}
        <AnimatedEntranceView delay={40} direction="up" distance={12}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search name, barcode, aisle..."
                onClear={() => setSearch('')}
              />
            </View>
            <TouchableOpacity
              style={styles.scanBtn}
              scaleTo={0.92}
              onPress={() =>
                navigation?.navigate('ScanBarcode', {
                  mode: 'INVENTORY',
                  onScanned: (item: any) => setSearch(item.name),
                })
              }
            >
              <Icon name="maximize" size={19} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* Categories Chips */}
        <AnimatedEntranceView delay={80} direction="up" distance={12}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  scaleTo={0.94}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <LocalizedText
                    style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                  >
                    {cat}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AnimatedEntranceView>

        {/* Filter Tabs */}
        <AnimatedEntranceView delay={120} direction="up" distance={12}>
          <FilterTabs<FilterType>
            filters={[
              { key: 'ALL', label: 'All' },
              { key: 'IN_STOCK', label: 'In Stock' },
              { key: 'LOW', label: 'Low Stock' },
              { key: 'OUT', label: 'Out of Stock' },
            ]}
            active={activeFilter}
            onChange={setActiveFilter}
            counts={counts}
          />
        </AnimatedEntranceView>

        {/* Product Cards List */}
        <View style={styles.productsList}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="package" size={40} color="#d1d5db" />
              <LocalizedText style={styles.emptyTitle}>No products found</LocalizedText>
              <LocalizedText style={styles.emptySubtitle}>
                Try adjusting your search or category filters
              </LocalizedText>
            </View>
          ) : (
            filteredProducts.map((p, idx) => {
              const isLow = p.stock > 0 && p.stock <= 10;
              const isOut = p.stock === 0 || !p.isAvailable;

              return (
                <AnimatedEntranceView
                  key={p.id}
                  delay={140 + idx * 45}
                  direction="up"
                  distance={14}
                >
                  <View style={[styles.productCard, isOut && styles.productCardOut]}>
                    <View style={styles.productCardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.badgeRow}>
                          <LocalizedText style={styles.categoryTag}>
                            {p.category}
                          </LocalizedText>
                          <View
                            style={[
                              styles.stockStatusBadge,
                              isOut
                                ? styles.stockBadgeOut
                                : isLow
                                ? styles.stockBadgeLow
                                : styles.stockBadgeOk,
                            ]}
                          >
                            <LocalizedText
                              style={[
                                styles.stockStatusText,
                                isOut
                                ? styles.stockTextOut
                                : isLow
                                ? styles.stockTextLow
                                : styles.stockTextOk,
                              ]}
                            >
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </LocalizedText>
                          </View>
                        </View>

                        <LocalizedText style={styles.productName} numberOfLines={2}>
                          {p.name}
                        </LocalizedText>
                        <LocalizedText style={styles.productAisle}>
                          📍 {p.aisle} • SKU: {p.barcode.slice(-6)}
                        </LocalizedText>
                      </View>

                      {/* Price Tag with Edit Button (Update CRUD) */}
                      <TouchableOpacity
                        style={styles.priceTagWrap}
                        disabled={!permissions.products.update}
                        scaleTo={permissions.products.update ? 0.92 : 1}
                        onPress={() => {
                          if (permissions.products.update) {
                            setEditingProduct(p);
                            setNewPrice(p.price.toString());
                          }
                        }}
                      >
                        <LocalizedText style={styles.priceVal}>₹{p.price}</LocalizedText>
                        <LocalizedText style={styles.unitVal}>/{p.unit}</LocalizedText>
                        {permissions.products.update && (
                          <Icon name="edit-2" size={11} color={colors.primary} style={{ marginLeft: 4 }} />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Quick Floor Controls Bar */}
                    <View style={styles.controlsRow}>
                      {/* Shelf Stock Adjuster (Update CRUD) */}
                      <View style={styles.stockAdjuster}>
                        <LocalizedText style={styles.adjusterLabel}>Shelf Stock:</LocalizedText>
                        {permissions.products.update ? (
                          <View style={styles.stepperWrap}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              scaleTo={0.88}
                              onPress={() => handleAdjustStock(p.id, -1)}
                            >
                              <Icon name="minus" size={13} color="#374151" />
                            </TouchableOpacity>
                            <LocalizedText style={styles.stockNumber}>{p.stock}</LocalizedText>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              scaleTo={0.88}
                              onPress={() => handleAdjustStock(p.id, 1)}
                            >
                              <Icon name="plus" size={13} color="#374151" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.readOnlyStockWrap}>
                            <LocalizedText style={styles.readOnlyStockText}>{p.stock} units</LocalizedText>
                          </View>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {/* Store Available Toggle */}
                        <TouchableOpacity
                          style={[
                            styles.availabilityBtn,
                            p.isAvailable ? styles.availabilityBtnOn : styles.availabilityBtnOff,
                            !permissions.products.update && { opacity: 0.8 },
                          ]}
                          disabled={!permissions.products.update}
                          scaleTo={permissions.products.update ? 0.92 : 1}
                          onPress={() => permissions.products.update && handleToggleAvailability(p.id)}
                        >
                          <Icon
                            name={p.isAvailable ? 'check' : 'slash'}
                            size={12}
                            color={p.isAvailable ? colors.primaryDark : colors.danger}
                            style={{ marginRight: 4 }}
                          />
                          <LocalizedText
                            style={[
                              styles.availabilityText,
                              p.isAvailable ? styles.availabilityTextOn : styles.availabilityTextOff,
                            ]}
                          >
                            {p.isAvailable ? 'Active' : 'Disabled'}
                          </LocalizedText>
                        </TouchableOpacity>

                        {/* Delete SKU Button (Delete CRUD) */}
                        {permissions.products.delete && (
                          <TouchableOpacity
                            style={styles.deleteSkuBtn}
                            scaleTo={0.88}
                            onPress={() => handleDeleteProduct(p.id, p.name)}
                          >
                            <Icon name="trash-2" size={13} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </AnimatedEntranceView>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Edit Price Modal */}
      <Modal
        visible={!!editingProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingProduct(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editPriceDialog}>
            <View style={styles.modalHeader}>
              <LocalizedText style={styles.modalTitle}>Update Floor Price</LocalizedText>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                scaleTo={0.88}
                onPress={() => setEditingProduct(null)}
              >
                <Icon name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {editingProduct && (
              <LocalizedText style={styles.modalProductName}>
                {editingProduct.name} ({editingProduct.unit})
              </LocalizedText>
            )}

            <View style={styles.priceInputWrap}>
              <LocalizedText style={styles.rupeePrefix}>₹</LocalizedText>
              <LocalizedTextInput
                style={styles.priceInputField}
                placeholder="0"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                scaleTo={0.92}
                onPress={() => setEditingProduct(null)}
              >
                <LocalizedText style={styles.cancelBtnText}>Cancel</LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savePriceBtn}
                scaleTo={0.92}
                onPress={handleSavePrice}
              >
                <LocalizedText style={styles.savePriceBtnText}>Update Price</LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal (Create CRUD) */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.addProductDialog}>
              <View style={styles.modalHeader}>
                <LocalizedText style={styles.modalTitle}>Add Product SKU</LocalizedText>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.88}
                  onPress={() => setShowAddModal(false)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 420 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
              <View style={styles.modalInputGroup}>
                <LocalizedText style={styles.modalInputLabel}>Product Name *</LocalizedText>
                <LocalizedTextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Haldiram Bhujia Sev"
                  value={addName}
                  onChangeText={setAddName}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <LocalizedText style={styles.modalInputLabel}>Category</LocalizedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 4 }}>
                  {categories.filter(c => c !== 'All').map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.modalCatChip, addCategory === cat && styles.modalCatChipActive]}
                      onPress={() => setAddCategory(cat)}
                    >
                      <LocalizedText style={[styles.modalCatChipText, addCategory === cat && styles.modalCatChipTextActive]}>
                        {cat}
                      </LocalizedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <LocalizedText style={styles.modalInputLabel}>Store Price (₹) *</LocalizedText>
                  <LocalizedTextInput
                    style={styles.modalTextInput}
                    placeholder="99"
                    keyboardType="numeric"
                    value={addPrice}
                    onChangeText={setAddPrice}
                  />
                </View>

                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <LocalizedText style={styles.modalInputLabel}>Unit (e.g. 500g, 1L)</LocalizedText>
                  <LocalizedTextInput
                    style={styles.modalTextInput}
                    placeholder="1 pc"
                    value={addUnit}
                    onChangeText={setAddUnit}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <LocalizedText style={styles.modalInputLabel}>Initial Shelf Stock</LocalizedText>
                  <LocalizedTextInput
                    style={styles.modalTextInput}
                    placeholder="20"
                    keyboardType="numeric"
                    value={addStock}
                    onChangeText={setAddStock}
                  />
                </View>

                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <LocalizedText style={styles.modalInputLabel}>Aisle / Location</LocalizedText>
                  <LocalizedTextInput
                    style={styles.modalTextInput}
                    placeholder="Aisle 3 • Snacks"
                    value={addAisle}
                    onChangeText={setAddAisle}
                  />
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <LocalizedText style={styles.modalInputLabel}>Barcode (Optional)</LocalizedText>
                <LocalizedTextInput
                  style={styles.modalTextInput}
                  placeholder="Auto-generated if empty"
                  keyboardType="numeric"
                  value={addBarcode}
                  onChangeText={setAddBarcode}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalActions, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                scaleTo={0.92}
                onPress={() => setShowAddModal(false)}
              >
                <LocalizedText style={styles.cancelBtnText}>Cancel</LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savePriceBtn}
                scaleTo={0.92}
                onPress={handleSaveNewProduct}
              >
                <LocalizedText style={styles.savePriceBtnText}>Add to Shelf</LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  addProductBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  scanBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  productsList: {
    marginTop: 12,
    gap: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
  },
  productCardOut: {
    backgroundColor: '#fafafa',
    borderColor: '#f0f0f0',
    opacity: 0.88,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockBadgeOk: {
    backgroundColor: '#ecfdf5',
  },
  stockBadgeLow: {
    backgroundColor: '#fffbeb',
  },
  stockBadgeOut: {
    backgroundColor: '#fef2f2',
  },
  stockStatusText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  stockTextOk: {
    color: '#059669',
  },
  stockTextLow: {
    color: '#d97706',
  },
  stockTextOut: {
    color: '#dc2626',
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginTop: 2,
  },
  productAisle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 3,
  },
  priceTagWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
  },
  priceVal: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  unitVal: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  stockAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjusterLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    marginRight: 8,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 4,
    height: 30,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockNumber: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    paddingHorizontal: 8,
  },
  availabilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  availabilityBtnOn: {
    backgroundColor: colors.primaryLight,
  },
  availabilityBtnOff: {
    backgroundColor: '#fee2e2',
  },
  availabilityText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  availabilityTextOn: {
    color: colors.primaryDark,
  },
  availabilityTextOff: {
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editPriceDialog: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalProductName: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginBottom: 16,
  },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  rupeePrefix: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
    marginRight: 6,
  },
  priceInputField: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
  },
  savePriceBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  savePriceBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Read-only Stock Badge & Delete SKU button
  readOnlyStockWrap: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readOnlyStockText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  deleteSkuBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Restricted Access View
  restrictedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restrictedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  restrictedSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  restrictedBackBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  restrictedBackBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },

  // Add Product Dialog
  addProductDialog: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalInputLabel: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  modalTextInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    backgroundColor: '#f9fafb',
  },
  modalCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
  },
  modalCatChipActive: {
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#258B3E',
  },
  modalCatChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  modalCatChipTextActive: {
    color: '#258B3E',
    fontFamily: 'Poppins-Bold',
  },
});

export default StoreProductsScreen;

