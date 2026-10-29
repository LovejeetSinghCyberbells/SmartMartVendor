import React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface ChipProps {
  label: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'filter' | 'outline' | 'filled';
  badge?: string | number;
  activeColor?: string;
  activeBackgroundColor?: string;
  inactiveColor?: string;
  inactiveBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedStyle?: StyleProp<ViewStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  iconPosition = 'left',
  selected = false,
  onPress,
  disabled = false,
  size = 'md',
  variant = 'default',
  badge,
  activeColor = '#258B3E',
  activeBackgroundColor = '#EAF5ED',
  inactiveColor = '#4b5563',
  inactiveBackgroundColor = '#f3f4f6',
  style,
  textStyle,
  selectedStyle,
  selectedTextStyle,
}) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  const resolvedColor = selected ? activeColor : inactiveColor;

  const content = (
    <View
      style={[
        styles.chip,
        isSm && styles.chipSm,
        variant === 'outline' && styles.chipOutline,
        {
          backgroundColor: selected
            ? activeBackgroundColor
            : variant === 'outline'
            ? 'transparent'
            : inactiveBackgroundColor,
          borderColor: selected ? activeColor : '#e5e7eb',
        },
        selected && styles.chipSelected,
        selected && selectedStyle,
        style,
      ]}
    >
      {icon && iconPosition === 'left' && (
        <Icon
          name={icon as any}
          size={iconSize}
          color={resolvedColor}
          style={styles.iconLeft}
        />
      )}

      <LocalizedText
        style={[
          styles.text,
          isSm && styles.textSm,
          { color: resolvedColor },
          selected && styles.textSelected,
          selected && selectedTextStyle,
          textStyle,
        ]}
      >
        {label}
      </LocalizedText>

      {icon && iconPosition === 'right' && (
        <Icon
          name={icon as any}
          size={iconSize}
          color={resolvedColor}
          style={styles.iconRight}
        />
      )}

      {badge !== undefined && (
        <View
          style={[
            styles.badge,
            { backgroundColor: selected ? activeColor : '#d1d5db' },
          ]}
        >
          <LocalizedText
            style={[
              styles.badgeText,
              { color: selected ? '#ffffff' : '#374151' },
            ]}
          >
            {String(badge)}
          </LocalizedText>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        scaleTo={0.96}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipOutline: {
    backgroundColor: 'transparent',
  },
  chipSelected: {
    borderWidth: 1.5,
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    includeFontPadding: false,
  },
  textSm: {
    fontSize: 11,
  },
  textSelected: {
    fontFamily: 'Poppins-SemiBold',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
});

export default Chip;

