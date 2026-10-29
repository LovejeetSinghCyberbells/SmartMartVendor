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

export interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  color = '#258B3E',
  backgroundColor = '#f0fdf4',
  subtitle,
  onPress,
  style,
  valueStyle,
  labelStyle,
  compact = false,
}) => {
  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor },
        compact && styles.containerCompact,
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconWrap}>
          <Icon name={icon as any} size={compact ? 16 : 20} color={color} />
        </View>
      )}

      <LocalizedText
        style={[
          styles.value,
          { color },
          compact && styles.valueCompact,
          valueStyle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {String(value)}
      </LocalizedText>

      <LocalizedText
        style={[
          styles.label,
          compact && styles.labelCompact,
          labelStyle,
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {label}
      </LocalizedText>

      {subtitle ? (
        <LocalizedText style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </LocalizedText>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        scaleTo={0.94}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  container: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  containerCompact: {
    padding: 10,
    minHeight: 72,
    borderRadius: 12,
  },
  iconWrap: {
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  valueCompact: {
    fontSize: 16,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 2,
    includeFontPadding: false,
  },
  labelCompact: {
    fontSize: 10,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default StatCard;

