import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';

interface Props {
  title: string;
  amount: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
}

const EarningsCard: React.FC<Props> = ({
  title,
  amount,
  subtitle,
  icon,
  color,
  bgColor,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '22' }]}>
        <Icon name={icon as any} size={20} color={color} />
      </View>
      <LocalizedText style={styles.title}>{title}</LocalizedText>
      <LocalizedText style={[styles.amount, { color }]}>{amount}</LocalizedText>
      {subtitle && <LocalizedText style={styles.subtitle}>{subtitle}</LocalizedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    minHeight: 135,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  amount: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
});

export default EarningsCard;