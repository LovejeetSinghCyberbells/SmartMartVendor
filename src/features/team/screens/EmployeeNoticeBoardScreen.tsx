import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, Badge } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

interface NoticeItem {
  id: string;
  isPinned?: boolean;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
}

const NOTICES: NoticeItem[] = [
  {
    id: '1',
    isPinned: true,
    tag: 'FESTIVE INCENTIVE',
    tagColor: '#d97706',
    tagBg: '#fef3c7',
    title: 'Diwali Peak Weekend Staff Bonus (+₹50/order)',
    content:
      'All pickers and billers on duty this Saturday & Sunday evening (05:00 PM – 10:00 PM) will receive an extra ₹50 per order fulfilled above target! Free evening tea and snacks will be provided at Main Office.',
    author: 'Rajesh Kumar (Store Vendor)',
    date: 'Today • 09:30 AM',
    likes: 12,
  },
  {
    id: '2',
    isPinned: true,
    tag: 'STAR EMPLOYEE',
    tagColor: '#258B3E',
    tagBg: '#EAF5ED',
    title: 'Employee of the Month: Priya Patel (Biller)',
    content:
      'Congratulations to Priya Patel for achieving a 99.8% checkout accuracy and over 480 walk-in customer bills served with zero cash discrepancies. Award certificate and ₹2,000 cash bonus awarded in morning briefing!',
    author: 'Rahul Sharma (Store Manager)',
    date: 'Yesterday • 04:00 PM',
    likes: 18,
  },
  {
    id: '3',
    tag: 'STOCK AUDIT',
    tagColor: '#2563eb',
    tagBg: '#eff6ff',
    title: 'Monthly Dairy & Cold-Chain Audit on Thursday',
    content:
      'The regional quality auditor will visit Thursday at 11:00 AM. Please ensure all cooler shelves are cleaned, temperature logs are updated in Aisle 1, and expired packets are purged.',
    author: 'Rahul Sharma (Store Manager)',
    date: '25 Oct • 02:15 PM',
    likes: 7,
  },
  {
    id: '4',
    tag: 'NEW ARRIVALS',
    tagColor: '#7c3aed',
    tagBg: '#ede9fe',
    title: 'New Aisle 3 Restocking: Festive Chocolate Hampers',
    content:
      'Three fresh crates of festive sweet boxes and dry fruit hampers have arrived. Please stage them at the front entrance display bay alongside the store price-check board.',
    author: 'Amit Verma (Inventory Lead)',
    date: '24 Oct • 11:00 AM',
    likes: 9,
  },
];

const EmployeeNoticeBoardScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({
    '1': { count: 12, liked: false },
    '2': { count: 18, liked: false },
    '3': { count: 7, liked: false },
    '4': { count: 9, liked: false },
  });

  const handleToggleLike = (id: string) => {
    setLikesState((prev) => {
      const current = prev[id] || { count: 0, liked: false };
      const nextLiked = !current.liked;
      const nextCount = nextLiked ? current.count + 1 : current.count - 1;
      if (nextLiked) {
        showToast('Appreciated notice!', 'success');
      }
      return { ...prev, [id]: { count: nextCount, liked: nextLiked } };
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Store Notice Board"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notice Items */}
        {NOTICES.map((item, idx) => {
          const likeInfo = likesState[item.id] || { count: item.likes, liked: false };
          return (
            <AnimatedEntranceView
              key={item.id}
              delay={40 + idx * 35}
              direction="up"
              distance={14}
            >
              <View style={[styles.noticeCard, item.isPinned && styles.pinnedCard]}>
                {item.isPinned && (
                  <View style={styles.pinnedRow}>
                    <Icon name="bookmark" size={13} color="#d97706" style={{ marginRight: 4 }} />
                    <LocalizedText style={styles.pinnedText}>PINNED ANNOUNCEMENT</LocalizedText>
                  </View>
                )}

                <View style={styles.noticeHeader}>
                  <Badge
                    label={item.tag}
                    backgroundColor={item.tagBg}
                    textColor={item.tagColor}
                    size="sm"
                  />
                  <LocalizedText style={styles.noticeDate}>{item.date}</LocalizedText>
                </View>

                <LocalizedText style={styles.noticeTitle}>{item.title}</LocalizedText>
                <LocalizedText style={styles.noticeContent}>{item.content}</LocalizedText>

                <View style={styles.noticeFooter}>
                  <View style={styles.authorRow}>
                    <Icon name="user-check" size={14} color="#6b7280" style={{ marginRight: 6 }} />
                    <LocalizedText style={styles.authorText}>{item.author}</LocalizedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.likeBtn,
                      likeInfo.liked && styles.likeBtnActive,
                    ]}
                    scaleTo={0.92}
                    onPress={() => handleToggleLike(item.id)}
                  >
                    <Icon
                      name="thumbs-up"
                      size={14}
                      color={likeInfo.liked ? '#258B3E' : '#6b7280'}
                      style={{ marginRight: 5 }}
                    />
                    <LocalizedText
                      style={[
                        styles.likeCount,
                        likeInfo.liked && styles.likeCountActive,
                      ]}
                    >
                      {likeInfo.count}
                    </LocalizedText>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedEntranceView>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  pinnedCard: {
    borderColor: '#fde68a',
    backgroundColor: '#fffdfa',
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Bold',
    color: '#d97706',
    letterSpacing: 0.5,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeDate: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  noticeTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  noticeContent: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 18,
    marginBottom: 14,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  likeBtnActive: {
    backgroundColor: '#EAF5ED',
  },
  likeCount: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  likeCountActive: {
    color: '#258B3E',
  },
});

export default EmployeeNoticeBoardScreen;

