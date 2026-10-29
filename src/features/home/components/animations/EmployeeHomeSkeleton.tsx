import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const EmployeeHomeSkeleton: React.FC = () => {
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
              <Animated.View
                style={[styles.shimmerLine, { width: 120, height: 14, marginBottom: 8, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerLine, { width: 150, height: 20, opacity: pulseAnim }]}
              />
            </View>
            <Animated.View style={[styles.profileCircle, { opacity: pulseAnim }]} />
          </View>

          <Animated.View style={[styles.shiftCard, { opacity: pulseAnim }]} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[1, 2, 3].map((i) => (
            <Animated.View key={i} style={[styles.statBox, { opacity: pulseAnim }]} />
          ))}
        </View>

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerDark, { width: 100, height: 16, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerDark, { width: 70, height: 13, opacity: pulseAnim }]} />
        </View>

        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.taskCard, { opacity: pulseAnim }]} />
        ))}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerDark, { width: 120, height: 16, opacity: pulseAnim }]} />
        </View>
        <View style={styles.actionsRow}>
          <Animated.View style={[styles.actionBtn, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.actionBtn, { opacity: pulseAnim }]} />
        </View>

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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shimmerLine: {
    borderRadius: 6,
    backgroundColor: '#d1e7d5',
  },
  shimmerDark: {
    borderRadius: 6,
    backgroundColor: '#e6e8eb',
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#d1e7d5',
  },
  shiftCard: {
    height: 64,
    backgroundColor: '#d1e7d5',
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    height: 86,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 14,
  },
  taskCard: {
    height: 72,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#e8f5eb',
    borderRadius: 14,
  },
});

export default EmployeeHomeSkeleton;