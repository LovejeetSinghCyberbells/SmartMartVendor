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

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

export interface InfoBannerProps {
  message: string;
  title?: string;
  icon?: string;
  variant?: BannerVariant;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const VARIANT_THEMES: Record<
  BannerVariant,
  { bg: string; border: string; text: string; icon: string; defaultIcon: string }
> = {
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    icon: '#2563eb',
    defaultIcon: 'info',
  },
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#166534',
    icon: '#16a34a',
    defaultIcon: 'check-circle',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    icon: '#d97706',
    defaultIcon: 'alert-triangle',
  },
  danger: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    icon: '#dc2626',
    defaultIcon: 'alert-circle',
  },
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  message,
  title,
  icon,
  variant = 'success',
  actionLabel,
  onAction,
  style,
  textStyle,
}) => {
  const theme = VARIANT_THEMES[variant] || VARIANT_THEMES.info;
  const iconName = icon || theme.defaultIcon;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Icon
        name={iconName as any}
        size={17}
        color={theme.icon}
        style={styles.icon}
      />

      <View style={styles.textWrap}>
        {title ? (
          <LocalizedText
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {title}
          </LocalizedText>
        ) : null}
        <LocalizedText
          style={[styles.message, { color: theme.text }, textStyle]}
        >
          {message}
        </LocalizedText>
      </View>

      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          scaleTo={0.94}
          style={styles.actionBtn}
        >
          <LocalizedText style={[styles.actionText, { color: theme.icon }]}>
            {actionLabel}
          </LocalizedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  icon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    lineHeight: 18,
  },
  actionBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
});

export default InfoBanner;

