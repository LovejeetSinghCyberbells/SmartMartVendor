import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import LocalizedText from '../../i18n/LocalizedText';

export interface BadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  backgroundColor = '#f3f4f6',
  textColor = '#6b7280',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === 'sm' && styles.badgeSm,
        style,
      ]}
    >
      <LocalizedText
        style={[
          styles.text,
          { color: textColor },
          size === 'sm' && styles.textSm,
          textStyle,
        ]}
      >
        {label}
      </LocalizedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  textSm: {
    fontSize: 10,
  },
});

export default Badge;

