import React, { useState, useRef, useEffect, useMemo } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../shared/components/common';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NotificationType = 'order' | 'offer' | 'system';
type FilterId = 'all' | NotificationType;

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Earlier';
  read: boolean;
  icon: string;
  color: string;
  orderId?: string;
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'order', label: 'Orders' },
  { id: 'offer', label: 'Offers' },
  { id: 'system', label: 'System' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order out for delivery',
    message: 'Your order ORD-78395 is on the way and will arrive in 25-30 mins.',
    time: '10 min ago',
    group: 'Today',
    read: false,
    icon: 'truck',
    color: '#4A90E2',
    orderId: 'ORD-78395',
  },
  {
    id: '2',
    type: 'offer',
    title: 'Flat 20% off on fresh fruits',
    message: 'Use code FRESH20 on orders above ₹15. Valid till tonight.',
    time: '1 hr ago',
    group: 'Today',
    read: false,
    icon: 'tag',
    color: '#F39C12',
  },
  {
    id: '3',
    type: 'order',
    title: 'Order confirmed',
    message: 'We have received your order ORD-78395 and started preparing it.',
    time: '2 hr ago',
    group: 'Today',
    read: true,
    icon: 'check-circle',
    color: '#258B3E',
    orderId: 'ORD-78395',
  },
  {
    id: '4',
    type: 'order',
    title: 'Order delivered',
    message: 'ORD-78421 was delivered. Tap to reorder your items.',
    time: 'Yesterday',
    group: 'Earlier',
    read: true,
    icon: 'package',
    color: '#258B3E',
    orderId: 'ORD-78421',
  },
  {
    id: '5',
    type: 'system',
    title: 'Payment method added',
    message: 'Your Visa ending in 4242 was saved successfully.',
    time: 'Yesterday',
    group: 'Earlier',
    read: true,
    icon: 'credit-card',
    color: '#9B59B6',
  },
  {
    id: '6',
    type: 'offer',
    title: 'Weekend grocery sale',
    message: 'Save up to 30% on staples, dals and household essentials.',
    time: '2 days ago',
    group: 'Earlier',
    read: true,
    icon: 'gift',
    color: '#FF6B6B',
  },
  {
    id: '7',
    type: 'system',
    title: 'Security tip',
    message: 'Never share your OTP or card details with anyone.',
    time: '3 days ago',
    group: 'Earlier',
    read: true,
    icon: 'shield',
    color: '#1ABC9C',
  },
];

const NotificationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterId>('all');

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(
    INITIAL_NOTIFICATIONS.map(() => new Animated.Value(0))
  ).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;
  const bellPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(70, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const anims = itemAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 220 + index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(40, anims).start();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(
    () => notifications.filter((n) => filter === 'all' || n.type === filter),
    [notifications, filter]
  );

  const groups = useMemo(
    () =>
      (['Today', 'Earlier'] as const)
        .map((g) => ({ title: g, data: filtered.filter((n) => n.group === g) }))
        .filter((g) => g.data.length > 0),
    [filtered]
  );

  // Empty state animation
  useEffect(() => {
    if (filtered.length === 0) {
      emptyAnim.setValue(0);
      Animated.spring(emptyAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(bellPulse, {
            toValue: 1.12,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bellPulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [filtered.length]);

  const animateLayout = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const handleFilter = (id: FilterId) => {
    animateLayout();
    setFilter(id);
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handlePress = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.type === 'order' && item.orderId) {
      navigation.navigate('TrackOrderScreen', { order: { id: item.orderId } });
    }
  };

  const removeNotification = (id: string) => {
    animateLayout();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    animateLayout();
    setNotifications([]);
  };

  // Entrance anim lookup (new items fall back to fully visible)
  const getAnim = (id: string) => {
    const idx = INITIAL_NOTIFICATIONS.findIndex((n) => n.id === id);
    return idx >= 0 ? itemAnims[idx] : null;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-16, 0],
              }),
            },
          ],
        }}
      >
        <ScreenHeader
          title="Notifications"
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              onPress={markAllRead}
              disabled={unreadCount === 0}
              style={styles.markAllBtn}
              scaleTo={0.88}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Icon
                name="check-circle"
                size={20}
                color={unreadCount === 0 ? '#c0c0c0' : '#258B3E'}
              />
            </TouchableOpacity>
          }
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* Summary */}
        <Animated.View
          style={[
            styles.summaryRow,
            {
              opacity: filterAnim,
              transform: [
                {
                  translateY: filterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.summaryLeft}>
            <LocalizedText style={styles.summaryTitle}>
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? 'update' : 'updates'}`
                : 'You are all caught up'}
            </LocalizedText>
            <LocalizedText style={styles.summarySubtitle}>Offers & order updates</LocalizedText>
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} activeOpacity={0.8} style={styles.clearBtn}>
              <Icon name="trash-2" size={14} color="#ff4d4f" style={{ marginRight: 6 }} />
              <LocalizedText style={styles.clearText}>Clear all</LocalizedText>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Filters */}
        <Animated.View
          style={[
            styles.filterRow,
            {
              opacity: filterAnim,
              transform: [
                {
                  translateY: filterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => handleFilter(f.id)}
              >
                <LocalizedText style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </LocalizedText>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Empty State */}
        {filtered.length === 0 && (
          <Animated.View
            style={[
              styles.emptyWrapper,
              {
                opacity: emptyAnim,
                transform: [
                  {
                    translateY: emptyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: emptyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[styles.emptyIconWrapper, { transform: [{ scale: bellPulse }] }]}
            >
              <Icon name="bell-off" size={34} color="#258B3E" />
            </Animated.View>
            <LocalizedText style={styles.emptyTitle}>No notifications</LocalizedText>
            <LocalizedText style={styles.emptySubtitle}>
              New offers and order updates will show up here.
            </LocalizedText>
          </Animated.View>
        )}

        {/* Groups */}
        {groups.map((group) => (
          <View key={group.title}>
            <Animated.Text
              style={[
                styles.sectionTitle,
                {
                  opacity: listAnim,
                  transform: [
                    {
                      translateY: listAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {group.title}
            </Animated.Text>

            <View style={styles.card}>
              {group.data.map((item, index) => {
                const anim = getAnim(item.id);
                const isLast = index === group.data.length - 1;

                return (
                  <Animated.View
                    key={item.id}
                    style={
                      anim
                        ? {
                            opacity: anim,
                            transform: [
                              {
                                translateX: anim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-20, 0],
                                }),
                              },
                            ],
                          }
                        : undefined
                    }
                  >
                    <TouchableOpacity
                      style={[
                        styles.item,
                        !item.read && styles.itemUnread,
                        !isLast && styles.itemDivider,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => handlePress(item)}
                    >
                      <View
                        style={[
                          styles.iconWrapper,
                          { backgroundColor: `${item.color}15` },
                        ]}
                      >
                        <Icon name={item.icon as any} size={20} color={item.color} />
                      </View>

                      <View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                          <LocalizedText
                            style={[styles.itemTitle, item.read && styles.itemTitleRead]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </LocalizedText>
                          {!item.read && <View style={styles.unreadDot} />}
                        </View>
                        <LocalizedText style={styles.itemMessage} numberOfLines={2}>
                          {item.message}
                        </LocalizedText>
                        <LocalizedText style={styles.itemTime}>{item.time}</LocalizedText>
                      </View>

                      <TouchableOpacity
                        onPress={() => removeNotification(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.removeBtn}
                      >
                        <Icon name="x" size={16} color="#c0c0c0" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))}
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
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  markAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  summarySubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 77, 79, 0.08)',
  },
  clearText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#ff4d4f',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#EAF5ED',
    borderWidth: 1.5,
    borderColor: '#d4f0dc',
  },
  filterChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  filterTextActive: {
    color: '#ffffff',
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 14,
  },

  // List card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  itemUnread: {
    backgroundColor: '#f9fdf9',
  },
  itemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  itemTitleRead: {
    color: '#4a4a4a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#258B3E',
    marginLeft: 8,
  },
  itemMessage: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    lineHeight: 18,
    marginTop: 3,
  },
  itemTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 6,
  },
  removeBtn: {
    marginLeft: 8,
    paddingTop: 2,
  },

  // Empty
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;