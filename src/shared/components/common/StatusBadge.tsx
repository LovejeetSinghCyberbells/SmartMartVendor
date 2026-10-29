import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Badge from './Badge';

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'purple'
  | 'teal'
  | 'neutral'
  | 'orange';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  backgroundColor?: string;
  textColor?: string;
  dotColor?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const VARIANT_COLORS: Record<StatusBadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: '#d1fae5', text: '#059669', dot: '#10b981' },
  warning: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  danger: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
  error: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
  info: { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6' },
  purple: { bg: '#ede9fe', text: '#7c3aed', dot: '#8b5cf6' },
  teal: { bg: '#cffafe', text: '#0891b2', dot: '#06b6d4' },
  orange: { bg: '#ffedd5', text: '#ea580c', dot: '#f97316' },
  neutral: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  backgroundColor,
  textColor,
  dotColor,
  showDot = false,
  size = 'md',
  style,
  textStyle,
}) => {
  const palette = VARIANT_COLORS[variant] || VARIANT_COLORS.neutral;
  const bg = backgroundColor || palette.bg;
  const fg = textColor || palette.text;
  const dot = dotColor || palette.dot;

  return (
    <Badge
      label={label}
      backgroundColor={bg}
      textColor={fg}
      size={size}
      showPulse={showDot}
      pulseColor={dot}
      style={style}
      textStyle={textStyle}
    />
  );
};

export default StatusBadge;

