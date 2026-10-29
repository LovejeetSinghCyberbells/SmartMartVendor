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

export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  iconSize?: number;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  chevronColor?: string;
  danger?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  badge?: string | number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconBgColor,
  iconSize = 18,
  rightElement,
  showChevron,
  chevronColor = '#9ca3af',
  danger = false,
  onPress,
  disabled = false,
  badge,
  style,
  titleStyle,
  subtitleStyle,
  activeOpacity = 0.85,
}) => {
  const resolvedIconColor =
    iconColor || (danger ? '#dc2626' : '#258B3E');
  const resolvedIconBg =
    iconBgColor || (danger ? '#fee2e2' : '#EAF5ED');

  const shouldShowChevron =
    showChevron !== undefined ? showChevron : Boolean(onPress && !rightElement);

  const content = (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: resolvedIconBg }]}>
          <Icon name={icon as any} size={iconSize} color={resolvedIconColor} />
        </View>
      )}

      <View style={styles.textContainer}>
        <LocalizedText
          style={[
            styles.title,
            titleStyle,
            danger && styles.dangerTitle,
          ]}
          numberOfLines={1}
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

      {badge !== undefined && (
        <View style={styles.badgeWrap}>
          <LocalizedText style={styles.badgeText}>{String(badge)}</LocalizedText>
        </View>
      )}

      {rightElement}

      {shouldShowChevron && (
        <Icon
          name="chevron-right"
          size={18}
          color={chevronColor}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        scaleTo={0.97}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  dangerTitle: {
    color: '#dc2626',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 17,
  },
  badgeWrap: {
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default ListItem;

