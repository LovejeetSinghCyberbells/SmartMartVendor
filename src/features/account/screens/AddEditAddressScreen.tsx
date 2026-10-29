import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Platform } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../shared/components/common';

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

const AddEditAddressScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const isEdit = route?.params?.mode === 'edit';
  const existing = route?.params?.address || null;

  const [type, setType] = useState(existing?.type || 'Home');
  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [addressLine, setAddressLine] = useState(existing?.address || '');
  const [landmark, setLandmark] = useState(existing?.landmark || '');
  const [isDefault, setIsDefault] = useState(existing?.isDefault || false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = () => {
    // Validate & save logic here
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content"/>

      {/* Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-16, 0],
              }),
            },
          ],
        }}
      >
        <ScreenHeader
          title={isEdit ? 'Edit Address' : 'Add New Address'}
          onBack={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            }}
          >
            {/* Address Type */}
            <LocalizedText style={styles.label}>Address Type</LocalizedText>
            <View style={styles.typeRow}>
              {ADDRESS_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={t === 'Home' ? 'home' : t === 'Work' ? 'briefcase' : 'map-pin'}
                    size={16}
                    color={type === t ? '#ffffff' : '#258B3E'}
                    style={{ marginRight: 6 }}
                  />
                  <LocalizedText style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {t}
                  </LocalizedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name */}
            <LocalizedText style={styles.label}>Full Name</LocalizedText>
            <View style={styles.inputWrapper}>
              <Icon name="user" size={18} color="#9e9e9e" style={styles.inputIcon} />
              <LocalizedTextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#9e9e9e"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Phone */}
            <LocalizedText style={styles.label}>Phone Number</LocalizedText>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={18} color="#9e9e9e" style={styles.inputIcon} />
              <LocalizedTextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#9e9e9e"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Address */}
            <LocalizedText style={styles.label}>Complete Address</LocalizedText>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Icon name="map-pin" size={18} color="#9e9e9e" style={[styles.inputIcon, { marginTop: 4 }]} />
              <LocalizedTextInput
                style={[styles.input, styles.textArea]}
                placeholder="House no., building, street, area"
                placeholderTextColor="#9e9e9e"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={addressLine}
                onChangeText={setAddressLine}
              />
            </View>

            {/* Landmark */}
            <LocalizedText style={styles.label}>Landmark (Optional)</LocalizedText>
            <View style={styles.inputWrapper}>
              <Icon name="flag" size={18} color="#9e9e9e" style={styles.inputIcon} />
              <LocalizedTextInput
                style={styles.input}
                placeholder="Nearby landmark"
                placeholderTextColor="#9e9e9e"
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>

            {/* Default Toggle */}
            <TouchableOpacity
              style={styles.defaultRow}
              activeOpacity={0.8}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Icon name="check" size={14} color="#ffffff" />}
              </View>
              <LocalizedText style={styles.defaultText}>Set as default address</LocalizedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Save Button */}
        <Animated.View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Platform.OS === 'ios' ? insets.bottom || 20 : 16,
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
            <LocalizedText style={styles.saveBtnText}>
              {isEdit ? 'Update Address' : 'Save Address'}
            </LocalizedText>
          </TouchableOpacity>
        </Animated.View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 10,
    marginTop: 18,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#d4f0dc',
  },
  typeChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  textArea: {
    height: 72,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c8c8c8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  defaultText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveBtn: {
    backgroundColor: '#258B3E',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default AddEditAddressScreen;