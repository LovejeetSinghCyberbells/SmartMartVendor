import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Platform, Easing } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../shared/components/common';

const PAYMENT_TYPES = [
  { id: 'card', label: 'Card', icon: 'credit-card' },
  { id: 'upi', label: 'UPI', icon: 'smartphone' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
];

const AddPaymentMethodScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [type, setType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [walletProvider, setWalletProvider] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
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

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleSave = () => {
    // Validate & save logic here
    navigation.goBack();
  };

  const isFormValid = () => {
    if (type === 'card') {
      return (
        cardNumber.replace(/\s/g, '').length === 16 &&
        cardName.trim().length > 2 &&
        expiry.length === 5 &&
        cvv.length >= 3
      );
    }
    if (type === 'upi') {
      return upiId.includes('@') && upiId.length > 5;
    }
    if (type === 'wallet') {
      return walletProvider.trim().length > 2;
    }
    return false;
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
          title="Add Payment Method"
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
            {/* Payment Type Selector */}
            <LocalizedText style={styles.label}>Payment Type</LocalizedText>
            <View style={styles.typeRow}>
              {PAYMENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, type === t.id && styles.typeChipActive]}
                  onPress={() => setType(t.id)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={t.icon as any}
                    size={18}
                    color={type === t.id ? '#ffffff' : '#258B3E'}
                    style={{ marginRight: 8 }}
                  />
                  <LocalizedText
                    style={[
                      styles.typeChipText,
                      type === t.id && styles.typeChipTextActive,
                    ]}
                  >
                    {t.label}
                  </LocalizedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* ===== CARD FORM ===== */}
            {type === 'card' && (
              <>
                <LocalizedText style={styles.label}>Card Number</LocalizedText>
                <View style={styles.inputWrapper}>
                  <Icon name="credit-card" size={18} color="#9e9e9e" style={styles.inputIcon} />
                  <LocalizedTextInput
                    style={styles.input}
                    placeholder="ACCT-000003"
                    placeholderTextColor="#9e9e9e"
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={formatCardNumber}
                    maxLength={19}
                  />
                </View>

                <LocalizedText style={styles.label}>Cardholder Name</LocalizedText>
                <View style={styles.inputWrapper}>
                  <Icon name="user" size={18} color="#9e9e9e" style={styles.inputIcon} />
                  <LocalizedTextInput
                    style={styles.input}
                    placeholder="Name on card"
                    placeholderTextColor="#9e9e9e"
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <LocalizedText style={styles.label}>Expiry Date</LocalizedText>
                    <View style={styles.inputWrapper}>
                      <Icon name="calendar" size={18} color="#9e9e9e" style={styles.inputIcon} />
                      <LocalizedTextInput
                        style={styles.input}
                        placeholder="MM/YY"
                        placeholderTextColor="#9e9e9e"
                        keyboardType="number-pad"
                        value={expiry}
                        onChangeText={formatExpiry}
                        maxLength={5}
                      />
                    </View>
                  </View>

                  <View style={[styles.halfField, { marginLeft: 12 }]}>
                    <LocalizedText style={styles.label}>CVV</LocalizedText>
                    <View style={styles.inputWrapper}>
                      <Icon name="lock" size={18} color="#9e9e9e" style={styles.inputIcon} />
                      <LocalizedTextInput
                        style={styles.input}
                        placeholder="123"
                        placeholderTextColor="#9e9e9e"
                        keyboardType="number-pad"
                        value={cvv}
                        onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ===== UPI FORM ===== */}
            {type === 'upi' && (
              <>
                <LocalizedText style={styles.label}>UPI ID</LocalizedText>
                <View style={styles.inputWrapper}>
                  <Icon name="smartphone" size={18} color="#9e9e9e" style={styles.inputIcon} />
                  <LocalizedTextInput
                    style={styles.input}
                    placeholder="yourname@upi"
                    placeholderTextColor="#9e9e9e"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.hintBox}>
                  <Icon name="info" size={16} color="#258B3E" style={{ marginRight: 10 }} />
                  <LocalizedText style={styles.hintText}>
                    Enter your UPI ID linked with Google Pay, PhonePe, Paytm, etc.
                  </LocalizedText>
                </View>
              </>
            )}

            {/* ===== WALLET FORM ===== */}
            {type === 'wallet' && (
              <>
                <LocalizedText style={styles.label}>Wallet Provider</LocalizedText>
                <View style={styles.inputWrapper}>
                  <Icon name="briefcase" size={18} color="#9e9e9e" style={styles.inputIcon} />
                  <LocalizedTextInput
                    style={styles.input}
                    placeholder="e.g. Paytm, Amazon Pay, Mobikwik"
                    placeholderTextColor="#9e9e9e"
                    value={walletProvider}
                    onChangeText={setWalletProvider}
                  />
                </View>

                <View style={styles.hintBox}>
                  <Icon name="info" size={16} color="#258B3E" style={{ marginRight: 10 }} />
                  <LocalizedText style={styles.hintText}>
                    You’ll be redirected to link your wallet securely.
                  </LocalizedText>
                </View>
              </>
            )}

            {/* Default Toggle */}
            <TouchableOpacity
              style={styles.defaultRow}
              activeOpacity={0.8}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Icon name="check" size={14} color="#ffffff" />}
              </View>
              <LocalizedText style={styles.defaultText}>Set as default payment method</LocalizedText>
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
          <TouchableOpacity
            style={[styles.saveBtn, !isFormValid() && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            disabled={!isFormValid()}
            onPress={handleSave}
          >
            <LocalizedText style={styles.saveBtnText}>Save Payment Method</LocalizedText>
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EAF5ED',
    borderWidth: 1.5,
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
    height: 54,
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
  row: {
    flexDirection: 'row',
  },
  halfField: {
    flex: 1,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 139, 62, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    lineHeight: 20,
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
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: '#c8e6d0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default AddPaymentMethodScreen;