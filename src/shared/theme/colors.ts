export const colors = {
  // Primary Green Brand (30% darker: #258B3E)
  primary: '#258B3E',
  primaryDark: '#1A632C',
  primaryLight: '#EAF5ED',
  primaryMuted: '#C2E2CB',
  primaryGlow: 'rgba(37, 139, 62, 0.25)',

  // Secondary & Accents
  secondary: '#1E7E34',
  accent: '#28A745',

  // Neutrals / Typography
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textLight: '#d1d5db',
  textWhite: '#ffffff',

  // Backgrounds & Cards
  background: '#ffffff',
  backgroundSecondary: '#ffffff',
  backgroundMuted: '#f3f4f6',
  card: '#ffffff',

  // Borders
  border: '#f0f0f0',
  borderMuted: '#e5e7eb',
  borderLight: '#f3f4f6',

  // Status & Feedback
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#2563eb',
  infoLight: '#dbeafe',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  cyan: '#0891b2',
  cyanLight: '#cffafe',
} as const;

export type Colors = typeof colors;
export default colors;
