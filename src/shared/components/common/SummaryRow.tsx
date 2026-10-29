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

export interface SummaryRowProps {
  label: string;
  value?: string | number | React.ReactNode;
  isTotal?: boolean;
  bold?: boolean;
  color?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  isTotal = false,
  bold = false,
  color,
  icon,
  style,
  labelStyle,
  valueStyle,
  children,
}) => {
  const isHighlighted = isTotal || bold;

  return (
    <View
      style={[
        styles.row,
        isTotal && styles.totalRow,
        style,
      ]}
    >
      <View style={styles.labelCol}>
        {icon && (
          <Icon
            name={icon as any}
            size={14}
            color={color || '#6b7280'}
            style={styles.icon}
          />
        )}
        <LocalizedText
          style={[
            styles.label,
            isHighlighted && styles.labelBold,
            color && { color },
            labelStyle,
          ]}
        >
          {label}
        </LocalizedText>
      </View>

      {children ? (
        children
      ) : typeof value === 'string' || typeof value === 'number' ? (
        <LocalizedText
          style={[
            styles.value,
            isHighlighted && styles.valueBold,
            color && { color },
            valueStyle,
          ]}
        >
          {String(value)}
        </LocalizedText>
      ) : (
        value
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 10,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  labelBold: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  value: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    textAlign: 'right',
  },
  valueBold: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
});

export default SummaryRow;

