import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
  getStaggerDelay,
} from '../../../shared/components/common';
import EarningsCard from '../components/EarningsCard';
import SettlementCard from '../components/SettlementCard';
import EmptyEarnings from '../components/EmptyEarnings';

const SETTLEMENTS = [
  {
    id: '1',
    period: '13 – 19 Oct 2026',
    amount: '₹18,420',
    status: 'Paid' as const,
    date: 'Paid on 21 Oct',
  },
  {
    id: '2',
    period: '6 – 12 Oct 2026',
    amount: '₹15,890',
    status: 'Paid' as const,
    date: 'Paid on 14 Oct',
  },
  {
    id: '3',
    period: '29 Sep – 5 Oct 2026',
    amount: '₹21,350',
    status: 'Paid' as const,
    date: 'Paid on 7 Oct',
  },
  {
    id: '4',
    period: '20 – 26 Oct 2026',
    amount: '₹12,480',
    status: 'Processing' as const,
    date: 'Processing',
  },
];

const EarningsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Earnings"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <AnimatedEntranceView delay={60} direction="scale" bouncy style={{ flex: 1, marginRight: 6 }}>
            <EarningsCard
              title="This Week"
              amount="₹12.4k"
              subtitle="Current period"
              icon="trending-up"
              color="#258B3E"
              bgColor="#EAF5ED"
            />
          </AnimatedEntranceView>
          <AnimatedEntranceView delay={120} direction="scale" bouncy style={{ flex: 1, marginLeft: 6 }}>
            <EarningsCard
              title="Pending"
              amount="₹12.4k"
              subtitle="To be settled"
              icon="clock"
              color="#f59e0b"
              bgColor="#fffbeb"
            />
          </AnimatedEntranceView>
        </View>

        <View style={styles.summaryRow}>
          <AnimatedEntranceView delay={180} direction="scale" bouncy style={{ flex: 1, marginRight: 6 }}>
            <EarningsCard
              title="Total Paid"
              amount="₹1.24L"
              subtitle="All time"
              icon="check-circle"
              color="#3b82f6"
              bgColor="#eff6ff"
            />
          </AnimatedEntranceView>
          <AnimatedEntranceView delay={240} direction="scale" bouncy style={{ flex: 1, marginLeft: 6 }}>
            <EarningsCard
              title="Commission"
              amount="12%"
              subtitle="Platform fee"
              icon="percent"
              color="#8b5cf6"
              bgColor="#f5f3ff"
            />
          </AnimatedEntranceView>
        </View>

        {/* Settlements List */}
        <AnimatedEntranceView delay={280} direction="up" distance={15}>
          <View style={styles.sectionHeader}>
            <LocalizedText style={styles.sectionTitle}>Settlement History</LocalizedText>
          </View>
        </AnimatedEntranceView>

        {SETTLEMENTS.length === 0 ? (
          <EmptyEarnings />
        ) : (
          SETTLEMENTS.map((item, idx) => (
            <AnimatedEntranceView
              key={item.id}
              delay={getStaggerDelay(idx, 320, 60)}
              direction="up"
              distance={18}
            >
              <SettlementCard
                settlement={item}
                onPress={() =>
                  navigation.navigate('SettlementDetail', { settlementId: item.id })
                }
              />
            </AnimatedEntranceView>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
});

export default EarningsScreen;