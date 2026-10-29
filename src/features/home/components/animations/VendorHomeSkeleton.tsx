import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const VendorHomeSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Skeleton */}
        <View style={styles.headerSkeleton}>
          <View style={styles.headerTop}>
            <View>
              <Animated.View style={[styles.shimmerLine, { width: 160, height: 18, marginBottom: 8, opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerLine, { width: 110, height: 12, opacity: pulseAnim }]} />
            </View>
            <Animated.View style={[styles.statusPill, { opacity: pulseAnim }]} />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[1, 2, 3, 4].map((i) => (
              <Animated.View key={i} style={[styles.statCard, { opacity: pulseAnim }]} />
            ))}
          </View>
        </View>

        {/* Pending Orders Section */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerLineDark, { width: 140, height: 16, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerLineDark, { width: 50, height: 12, opacity: pulseAnim }]} />
        </View>

        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.orderCard, { opacity: pulseAnim }]} />
        ))}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerLineDark, { width: 120, height: 16, opacity: pulseAnim }]} />
        </View>
        <View style={styles.actionsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.actionItem}>
              <Animated.View style={[styles.actionCircle, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerLineDark, { width: 50, height: 10, marginTop: 8, opacity: pulseAnim }]} />
            </View>
          ))}
        </View>

        {/* Low Stock */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerLineDark, { width: 130, height: 16, opacity: pulseAnim }]} />
        </View>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.stockRow, { opacity: pulseAnim }]} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  headerSkeleton: {
    backgroundColor: '#EAF5ED',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shimmerLine: {
    borderRadius: 6,
    backgroundColor: '#d1e7d5',
  },
  shimmerLineDark: {
    borderRadius: 6,
    backgroundColor: '#e6e8eb',
  },
  statusPill: {
    width: 80,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#d1e7d5',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    height: 96,
    backgroundColor: '#d1e7d5',
    borderRadius: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 14,
  },
  orderCard: {
    height: 74,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  actionItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#e8f5eb',
  },
  stockRow: {
    height: 52,
    backgroundColor: '#fef9ee',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});

export default VendorHomeSkeleton;