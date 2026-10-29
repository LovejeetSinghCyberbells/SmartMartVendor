import React, { useState, useRef, useEffect, useCallback } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Image,
  Alert,
  Linking,
} from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { Asset, ImagePickerResponse } from 'react-native-image-picker';
import PhotoPickerSheet from '../components/PhotoPickerSheet';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { ScreenHeader } from '../../../shared/components/common';

const MAX_PHOTO_MB = 5;
const PICKER_BASE = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
} as const;

const EditProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showDialog, showConfirm, showToast } = useFeedback();

  // TODO: load these from your user store / API
  const [name, setName] = useState('John Doe');
  const [phone, setPhone] = useState('+1 202 555 0147');
  const [email, setEmail] = useState('john.doe@email.com');
  const [gender, setGender] = useState('Male');

  const [photo, setPhoto] = useState<Asset | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(1)).current; // avatar "pop" on change

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(avatarAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
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

  // ---------------------------------------------------------- photo

  const popAvatar = () => {
    Animated.sequence([
      Animated.timing(popAnim, {
        toValue: 0.9,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const handlePickerResult = (res: ImagePickerResponse) => {
    if (res.didCancel) return;

    if (res.errorCode) {
      if (res.errorCode === 'permission') {
        showConfirm({
          title: 'Permission needed',
          message: 'Please allow camera and photo access in Settings to change your photo.',
          confirmText: 'Open Settings',
          cancelText: 'Cancel',
          onConfirm: () => Linking.openSettings(),
        });
      } else if (res.errorCode === 'camera_unavailable') {
        showDialog('Camera unavailable', 'No camera is available on this device.');
      } else {
        showDialog('Something went wrong', res.errorMessage ?? 'Please try again.');
      }
      return;
    }

    const asset = res.assets?.[0];
    if (!asset?.uri) return;

    if (asset.fileSize && asset.fileSize > MAX_PHOTO_MB * 1024 * 1024) {
      showDialog('Photo too large', `Please choose a photo under ${MAX_PHOTO_MB} MB.`);
      return;
    }

    setPhoto(asset);
    popAvatar();
  };

  const openCamera = () => {
    setSheetOpen(false);
    launchCamera(
      { ...PICKER_BASE, cameraType: 'front', saveToPhotos: false },
      handlePickerResult,
    );
  };

  const openGallery = () => {
    setSheetOpen(false);
    launchImageLibrary({ ...PICKER_BASE, selectionLimit: 1 }, handlePickerResult);
  };

  const removePhoto = () => {
    setSheetOpen(false);
    setPhoto(null);
    popAvatar();
  };

  // ----------------------------------------------------------- save

  const handleSave = async () => {
    if (saving) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      showDialog('Name required', 'Please enter your full name.');
      return;
    }
    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      showDialog('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append('name', trimmedName);
      form.append('phone', phone.trim());
      form.append('email', trimmedEmail);
      form.append('gender', gender);
      if (photo?.uri) {
        form.append('avatar', {
          uri: photo.uri,
          name: photo.fileName ?? 'avatar.jpg',
          type: photo.type ?? 'image/jpeg',
        } as any);
      }

      showToast('Profile updated successfully', 'success');
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      showDialog('Could not save', 'Please check your connection and try again.');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

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
          title="Edit Profile"
          onBack={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
          {/* Avatar Section */}
          <Animated.View
            style={[
              styles.avatarSection,
              {
                opacity: avatarAnim,
                transform: [
                  {
                    scale: avatarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Animated.View
                style={[styles.avatarWrapper, { transform: [{ scale: popAnim }] }]}
              >
                <View style={styles.avatar}>
                  {photo?.uri ? (
                    <Image source={{ uri: photo.uri }} style={styles.avatarImage} />
                  ) : (
                    <Icon name="user" size={42} color="#ffffff" />
                  )}
                </View>
                <View style={styles.cameraBtn}>
                  <Icon name="camera" size={16} color="#ffffff" />
                </View>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSheetOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <LocalizedText style={styles.changePhotoText}>
                {photo ? 'Change Profile Photo' : 'Add Profile Photo'}
              </LocalizedText>
            </TouchableOpacity>
          </Animated.View>

          {/* Form */}
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

            {/* Email */}
            <LocalizedText style={styles.label}>Email Address</LocalizedText>
            <View style={styles.inputWrapper}>
              <Icon name="mail" size={18} color="#9e9e9e" style={styles.inputIcon} />
              <LocalizedTextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#9e9e9e"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Gender */}
            <LocalizedText style={styles.label}>Gender</LocalizedText>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderChip, gender === g && styles.genderChipActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <LocalizedText
                    style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextActive,
                    ]}
                  >
                    {g}
                  </LocalizedText>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Save Button: a normal child now, so it lifts with the keyboard */}
        <Animated.View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Math.max(insets.bottom, 16),
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
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
          >
            <LocalizedText style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </LocalizedText>
          </TouchableOpacity>
        </Animated.View>

      {/* Photo options sheet (last child, so it sits on top of everything) */}
      <PhotoPickerSheet
        visible={sheetOpen}
        hasPhoto={!!photo}
        onClose={closeSheet}
        onCamera={openCamera}
        onGallery={openGallery}
        onRemove={removePhoto}
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
    paddingTop: 28,
    paddingBottom: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 110,
    height: 110,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },

  // Form
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 10,
    marginTop: 18,
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
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f5f6f8',
  },
  genderChipActive: {
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    borderColor: '#258B3E',
  },
  genderChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#7a7a7a',
  },
  genderChipTextActive: {
    color: '#258B3E',
    fontFamily: 'Poppins-SemiBold',
  },

  // Bottom
  bottomBar: {
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
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default EditProfileScreen;