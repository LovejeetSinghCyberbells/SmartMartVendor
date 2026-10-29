import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface EmptyStateProps {
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  iconSize?: number;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor = '#258B3E',
  iconBgColor = '#EAF5ED',
  iconSize = 40,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon = 'plus',
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <Icon name={icon as any} size={iconSize} color={iconColor} />
      </View>
      <LocalizedText style={styles.title}>{title}</LocalizedText>
      {subtitle && <LocalizedText style={styles.subtitle}>{subtitle}</LocalizedText>}
      {onAction && actionLabel && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          {actionIcon && <Icon name={actionIcon as any} size={18} color="#ffffff" />}
          <LocalizedText style={styles.actionText}>{actionLabel}</LocalizedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#258B3E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default EmptyState;

