import React from 'react';
import { View, StyleSheet } from 'react-native';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { BottomSheet, ListItem } from '../../../shared/components/common';

export type PhotoPickerSheetProps = {
  visible: boolean;
  hasPhoto: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove: () => void;
};

const PhotoPickerSheet = ({
  visible,
  hasPhoto,
  onClose,
  onCamera,
  onGallery,
  onRemove,
}: PhotoPickerSheetProps) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle title="Profile Photo">
      <View style={styles.content}>
        <ListItem
          icon="camera"
          title="Take Photo"
          onPress={onCamera}
          showChevron={false}
          style={styles.optionItem}
        />
        <ListItem
          icon="image"
          title="Choose from Gallery"
          onPress={onGallery}
          showChevron={false}
          style={styles.optionItem}
        />
        {hasPhoto && (
          <ListItem
            icon="trash-2"
            title="Remove Photo"
            danger
            onPress={onRemove}
            showChevron={false}
            style={styles.optionItem}
          />
        )}

        <TouchableOpacity
          style={styles.cancelBtn}
          scaleTo={0.94}
          activeOpacity={0.8}
          onPress={onClose}
        >
          <LocalizedText style={styles.cancelText}>Cancel</LocalizedText>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  optionItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  cancelBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
});

export default PhotoPickerSheet;
