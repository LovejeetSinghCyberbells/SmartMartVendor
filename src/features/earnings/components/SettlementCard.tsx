import React from 'react';
import { View, StyleSheet } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import Badge from '../../../shared/components/common/Badge';

interface Settlement {
  id: string;
  period: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Processing';
  date: string;
}

interface Props {
  settlement: Settlement;
  onPress: () => void;
}

const STATUS_CONFIG = {
  Paid: { bg: '#d1fae5', text: '#059669' },
  Pending: { bg: '#fef3c7', text: '#d97706' },
  Processing: { bg: '#dbeafe', text: '#2563eb' },
};

const SettlementCard: React.FC<Props> = ({ settlement, onPress }) => {
  const statusStyle = STATUS_CONFIG[settlement.status];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.left}>
        <LocalizedText style={styles.period}>{settlement.period}</LocalizedText>
        <LocalizedText style={styles.date}>{settlement.date}</LocalizedText>
      </View>

      <View style={styles.right}>
        <LocalizedText style={styles.amount}>{settlement.amount}</LocalizedText>
        <Badge
          label={settlement.status}
          backgroundColor={statusStyle.bg}
          textColor={statusStyle.text}
          style={styles.statusBadge}
        />
      </View>

      <Icon name="chevron-right" size={18} color="#9ca3af" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  left: {
    flex: 1,
  },
  period: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    marginTop: 6,
  },
});

export default SettlementCard;
