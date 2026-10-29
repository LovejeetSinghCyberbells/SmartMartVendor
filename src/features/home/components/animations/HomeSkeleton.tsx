import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CARD_WIDTH = (width - 55) / 2;

export const HomeSkeleton: React.FC = () => {
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
        <View style={styles.curvedHeaderSkeleton}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <Animated.View style={[styles.shimmerCircle, { opacity: pulseAnim }]} />
              <View style={styles.addressLines}>
                <Animated.View style={[styles.shimmerLine, { width: 70, height: 14, marginBottom: 6, opacity: pulseAnim }]} />
                <Animated.View style={[styles.shimmerLine, { width: 160, height: 10, opacity: pulseAnim }]} />
              </View>
            </View>
            <Animated.View style={[styles.cartCircle, { opacity: pulseAnim }]} />
          </View>

          {/* Search Bar Skeleton */}
          <View style={styles.searchRow}>
            <Animated.View style={[styles.searchPill, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.filterBox, { opacity: pulseAnim }]} />
          </View>
        </View>

        {/* Categories Section Skeleton */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerLineDark, { width: 140, height: 16, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerLineDark, { width: 50, height: 12, opacity: pulseAnim }]} />
        </View>
        <View style={styles.categoryGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <View key={item} style={styles.categoryItem}>
              <Animated.View style={[styles.categoryCircle, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerLineDark, { width: 45, height: 10, marginTop: 6, opacity: pulseAnim }]} />
            </View>
          ))}
        </View>

        {/* Best Deals Section Skeleton */}
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.shimmerLineDark, { width: 100, height: 16, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerLineDark, { width: 50, height: 12, opacity: pulseAnim }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.productCardSkeleton}>
              <Animated.View style={[styles.productImageSkeleton, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerLineDark, { width: '80%', height: 12, marginBottom: 6, opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerLineDark, { width: '50%', height: 10, marginBottom: 12, opacity: pulseAnim }]} />
              <View style={styles.priceRowSkeleton}>
                <Animated.View style={[styles.shimmerLineDark, { width: 45, height: 14, opacity: pulseAnim }]} />
                <Animated.View style={[styles.addButtonSkeleton, { opacity: pulseAnim }]} />
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={{ height: 30 }} />
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
  curvedHeaderSkeleton: {
    backgroundColor: '#f6f7f9',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shimmerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e5e9',
    marginRight: 10,
  },
  addressLines: {
    flex: 1,
  },
  shimmerLine: {
    borderRadius: 6,
    backgroundColor: '#e2e5e9',
  },
  cartCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e5e9',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPill: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eeeff2',
    marginRight: 12,
  },
  filterBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eeeff2',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  shimmerLineDark: {
    borderRadius: 6,
    backgroundColor: '#e6e8eb',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#f0f2f5',
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 5,
    marginBottom: 25,
  },
  productCardSkeleton: {
    width: CARD_WIDTH,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    height: 235,
  },
  productImageSkeleton: {
    height: 105,
    borderRadius: 14,
    backgroundColor: '#eceff2',
    marginBottom: 12,
  },
  priceRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonSkeleton: {
    width: 45,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#e6e8eb',
  },
});

export default HomeSkeleton;
