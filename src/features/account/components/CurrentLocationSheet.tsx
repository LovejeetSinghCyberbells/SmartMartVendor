import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import BottomSheet from '../../../shared/components/common/BottomSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void;
}

const CurrentLocationSheet = ({ visible, onClose, onConfirm }: Props) => {
  const handleConfirm = () => {
    onConfirm('Current Location • Detected Address');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={styles.sheet}>
      <View style={styles.iconWrapper}>
        <Icon name="navigation" size={28} color="#258B3E" />
      </View>

      <LocalizedText style={styles.title}>Use Current Location?</LocalizedText>
      <LocalizedText style={styles.subtitle}>
        We will use your device’s GPS to detect the nearest delivery address.
      </LocalizedText>

      <View style={styles.locationPreview}>
        <Icon name="map-pin" size={18} color="#258B3E" style={{ marginRight: 10 }} />
        <LocalizedText style={styles.locationText} numberOfLines={2}>
          Detecting precise location...
        </LocalizedText>
      </View>

      <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={handleConfirm}>
        <LocalizedText style={styles.confirmBtnText}>Confirm & Continue</LocalizedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
        <LocalizedText style={styles.cancelBtnText}>Cancel</LocalizedText>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d4f0dc',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  confirmBtn: {
    backgroundColor: '#258B3E',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  cancelBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#7a7a7a',
  },
});

export default CurrentLocationSheet;
