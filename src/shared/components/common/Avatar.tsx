import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  /** Name or full name to extract initials from */
  name?: string;
  /** Explicit initials to display (when preferInitials is set) */
  initials?: string;
  /** Image source uri or ImageSourcePropType */
  source?: string | ImageSourcePropType | null;
  /** Feather icon name to display instead of text/image */
  icon?: string;
  /** Staff role or position title to determine icon according to position */
  role?: string;
  /** Staff permissions object to determine icon according to permission access */
  permissions?: any;
  /** Avatar size preset or numeric diameter */
  size?: AvatarSize | number;
  /** Background color for avatar */
  backgroundColor?: string;
  /** Text/Icon color */
  textColor?: string;
  /** Shows online/status indicator dot */
  showStatus?: boolean;
  /** Status indicator type */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Custom status indicator color */
  statusColor?: string;
  /** Custom badge to display at bottom-right corner */
  badge?: React.ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Image style */
  imageStyle?: StyleProp<ImageStyle>;
  /** Text style */
  textStyle?: StyleProp<TextStyle>;
  /** Disabled state for onPress */
  disabled?: boolean;
  /** Prefer initials text when no picture is present */
  preferInitials?: boolean;
}

/**
 * Returns the Feather icon name representing a position or permission access.
 */
export function getRoleIcon(role?: string, permissions?: any): string {
  const r = (role || '').toUpperCase();
  if (r.includes('INVENT') || r.includes('STOCK') || (!role && permissions?.products?.update)) {
    return 'grid';
  }
  if (
    r.includes('ORDER') ||
    r.includes('DELIVERY') ||
    r.includes('DISPATCH') ||
    r.includes('PICK') ||
    r.includes('PACK') ||
    (!role && permissions?.orders?.view)
  ) {
    return 'package';
  }
  if (r.includes('BILL') || r.includes('CASHIER') || (!role && permissions?.billing?.create)) {
    return 'file-text';
  }
  if (r.includes('MANAGER') || r.includes('ADMIN') || permissions?.staff?.manage) {
    return 'shield';
  }
  if (r.includes('VENDOR') || r.includes('OWNER') || r.includes('STORE')) {
    return 'shopping-bag';
  }
  if (r.includes('SUPERVISOR') || r.includes('LEAD') || r.includes('CUSTOM')) {
    return 'user-check';
  }
  return 'user';
}

/**
 * Returns distinct background and foreground colors based on position.
 * Foreground profile icons are crisp white (#ffffff) for maximum legibility on rich role badges.
 */
export function getRoleColors(role?: string, permissions?: any): { bg: string; fg: string } {
  const r = (role || '').toUpperCase();
  if (r.includes('INVENT') || r.includes('STOCK') || (!role && permissions?.products?.update)) {
    return { bg: '#7c3aed', fg: '#ffffff' };
  }
  if (
    r.includes('ORDER') ||
    r.includes('DELIVERY') ||
    r.includes('DISPATCH') ||
    r.includes('PICK') ||
    r.includes('PACK') ||
    (!role && permissions?.orders?.view)
  ) {
    return { bg: '#d97706', fg: '#ffffff' };
  }
  if (r.includes('BILL') || r.includes('CASHIER') || (!role && permissions?.billing?.create)) {
    return { bg: '#16a34a', fg: '#ffffff' };
  }
  if (r.includes('MANAGER') || r.includes('ADMIN') || permissions?.staff?.manage) {
    return { bg: '#2563eb', fg: '#ffffff' };
  }
  if (r.includes('VENDOR') || r.includes('OWNER') || r.includes('STORE')) {
    return { bg: '#258B3E', fg: '#ffffff' };
  }
  if (r.includes('SUPERVISOR') || r.includes('LEAD') || r.includes('CUSTOM')) {
    return { bg: '#059669', fg: '#ffffff' };
  }
  return { bg: '#258B3E', fg: '#ffffff' };
}

const SIZE_PRESETS: Record<AvatarSize, { size: number; fontSize: number; iconSize: number; dotSize: number }> = {
  xs: { size: 28, fontSize: 11, iconSize: 14, dotSize: 7 },
  sm: { size: 36, fontSize: 13, iconSize: 18, dotSize: 9 },
  md: { size: 44, fontSize: 15, iconSize: 22, dotSize: 11 },
  lg: { size: 54, fontSize: 18, iconSize: 26, dotSize: 13 },
  xl: { size: 72, fontSize: 24, iconSize: 34, dotSize: 16 },
  '2xl': { size: 96, fontSize: 32, iconSize: 44, dotSize: 20 },
};

const STATUS_COLORS: Record<string, string> = {
  online: '#16a34a',
  offline: '#9ca3af',
  busy: '#dc2626',
  away: '#f59e0b',
};

function getInitials(name?: string, fallback: string = 'ST'): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  initials,
  source,
  icon,
  role,
  permissions,
  size = 'md',
  backgroundColor,
  textColor,
  showStatus = false,
  status = 'online',
  statusColor,
  badge,
  onPress,
  style,
  imageStyle,
  textStyle,
  disabled = false,
  preferInitials = false,
}) => {
  const config = typeof size === 'number'
    ? {
        size,
        fontSize: Math.round(size * 0.38),
        iconSize: Math.round(size * 0.45),
        dotSize: Math.max(6, Math.round(size * 0.22)),
      }
    : SIZE_PRESETS[size] || SIZE_PRESETS.md;

  const displayInitials = initials || getInitials(name, 'ST');
  const roleColors = (role || permissions) ? getRoleColors(role, permissions) : null;
  const bg = backgroundColor || (roleColors ? roleColors.bg : '#258B3E');
  const fg = textColor || (roleColors ? roleColors.fg : '#ffffff');
  const resolvedStatusColor = statusColor || STATUS_COLORS[status] || STATUS_COLORS.online;

  // Has valid profile pic?
  const hasPicture = typeof source === 'string' ? Boolean(source.trim()) : Boolean(source);
  const imageSource = hasPicture ? (typeof source === 'string' ? { uri: source } : source) : null;

  // If no profile pic, determine icon according to position / permission access or default profile icon
  const resolvedIcon = icon || (
    role || permissions
      ? getRoleIcon(role, permissions)
      : (!preferInitials && !imageSource ? 'user' : undefined)
  );

  const avatarContent = (
    <View
      style={[
        styles.avatar,
        style,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
            },
            imageStyle,
          ]}
          resizeMode="cover"
        />
      ) : resolvedIcon ? (
        <Icon name={resolvedIcon as any} size={config.iconSize} color={fg} />
      ) : (
        <LocalizedText
          style={[
            styles.text,
            {
              fontSize: config.fontSize,
              color: fg,
            },
            textStyle,
          ]}
        >
          {displayInitials}
        </LocalizedText>
      )}

      {showStatus && !badge && (
        <View
          style={[
            styles.statusDot,
            {
              width: config.dotSize,
              height: config.dotSize,
              borderRadius: config.dotSize / 2,
              backgroundColor: resolvedStatusColor,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}

      {badge && <View style={styles.badgeWrapper}>{badge}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        scaleTo={0.94}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  text: {
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 10,
    elevation: 4,
  },
});

export default Avatar;

