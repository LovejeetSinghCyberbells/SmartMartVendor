import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backIcon?: 'arrow-left' | 'chevron-left';
  backIconSize?: number;
  backIconColor?: string;
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showBorder?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  backIcon = 'arrow-left',
  backIconSize = 20,
  backIconColor = '#1a1a1a',
  rightElement,
  containerStyle,
  titleStyle,
  showBorder = true,
}) => {
  return (
    <View
      style={[
        styles.header,
        showBorder && styles.headerBorder,
        containerStyle,
      ]}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          scaleTo={0.88}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name={backIcon} size={backIconSize} color={backIconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <LocalizedText style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
        {title}
      </LocalizedText>

      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  rightContainer: {
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default ScreenHeader;

