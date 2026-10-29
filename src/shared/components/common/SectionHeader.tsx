import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<TextStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
  containerStyle,
  titleStyle,
  actionStyle,
}) => {
  return (
    <View style={[styles.sectionHeader, containerStyle]}>
      <LocalizedText style={[styles.sectionTitle, titleStyle]}>
        {title}
      </LocalizedText>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <LocalizedText style={[styles.actionText, actionStyle]}>
            {actionText}
          </LocalizedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
});

export default SectionHeader;

