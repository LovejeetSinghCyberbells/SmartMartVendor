import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface RadioOptionProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  title,
  subtitle,
  selected,
  onSelect,
  icon,
  badge,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
        style,
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.85}
      scaleTo={0.97}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.radioCircle,
            selected && styles.radioCircleSelected,
          ]}
        >
          {selected && <View style={styles.radioInnerDot} />}
        </View>

        {icon && (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: selected ? '#EAF5ED' : '#f3f4f6' },
            ]}
          >
            <Icon
              name={icon as any}
              size={18}
              color={selected ? '#258B3E' : '#6b7280'}
            />
          </View>
        )}

        <View style={styles.textWrap}>
          <LocalizedText
            style={[
              styles.title,
              selected && styles.titleSelected,
              titleStyle,
            ]}
          >
            {title}
          </LocalizedText>
          {subtitle ? (
            <LocalizedText
              style={[styles.subtitle, subtitleStyle]}
              numberOfLines={2}
            >
              {subtitle}
            </LocalizedText>
          ) : null}
        </View>
      </View>

      {badge && (
        <View style={styles.badge}>
          <LocalizedText style={styles.badgeText}>{badge}</LocalizedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#258B3E',
    backgroundColor: '#fbfdfb',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#258B3E',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#258B3E',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  titleSelected: {
    color: '#258B3E',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
});

export default RadioOption;

