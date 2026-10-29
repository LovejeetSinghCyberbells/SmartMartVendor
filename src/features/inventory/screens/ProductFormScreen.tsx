import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';

const ProductFormScreen = ({ route, navigation }: any) => {
  const product = route.params?.product;
  const isEditing = !!product;
  const insets = useSafeAreaInsets();
  const { showDialog, showToast } = useFeedback();

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [price, setPrice] = useState(product?.price?.replace('₹', '') || '');
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [unit, setUnit] = useState(product?.unit || '');

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      showDialog({
        title: 'Missing Fields',
        message: 'Please fill in all required fields (Product Name, Price, and Stock).',
        type: 'warning',
      });
      return;
    }
    showToast(
      isEditing ? 'Product updated successfully' : 'Product added successfully',
      'success'
    );
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title={isEditing ? 'Edit Product' : 'Add Product'}
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntranceView delay={60} direction="up" distance={20}>
          <View style={styles.formCard}>
            <LocalizedText style={styles.label}>Product Name *</LocalizedText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amul Milk 1L"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <LocalizedText style={styles.label}>Category</LocalizedText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dairy, Vegetables"
              placeholderTextColor="#9ca3af"
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <LocalizedText style={styles.label}>Price (₹) *</LocalizedText>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={styles.half}>
                <LocalizedText style={styles.label}>Unit</LocalizedText>
                <TextInput
                  style={styles.input}
                  placeholder="1kg / 1L"
                  placeholderTextColor="#9ca3af"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <LocalizedText style={styles.label}>Current Stock *</LocalizedText>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </AnimatedEntranceView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <AnimatedEntranceView delay={120} direction="up" distance={20} bouncy>
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.saveBtn} scaleTo={0.94} onPress={handleSave}>
            <LocalizedText style={styles.saveText}>
              {isEditing ? 'Update Product' : 'Add Product'}
            </LocalizedText>
          </TouchableOpacity>
        </View>
      </AnimatedEntranceView>
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
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default ProductFormScreen;