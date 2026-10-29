import React, { useState, useRef, useEffect, useMemo } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Easing, LayoutAnimation, Linking, Platform, UIManager } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SearchBar, ListItem, InfoBanner } from '../../../shared/components/common';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUPPORT_PHONE = '+12025550147';
const SUPPORT_EMAIL = 'support@yourapp.com';

type CategoryId = 'all' | 'orders' | 'payments' | 'delivery' | 'account';

interface Faq {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  question: string;
  answer: string;
}

const CATEGORIES: { id: CategoryId; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'All', icon: 'grid', color: '#258B3E' },
  { id: 'orders', label: 'Orders', icon: 'package', color: '#258B3E' },
  { id: 'payments', label: 'Payments', icon: 'credit-card', color: '#9B59B6' },
  { id: 'delivery', label: 'Delivery', icon: 'truck', color: '#4A90E2' },
  { id: 'account', label: 'Account', icon: 'user', color: '#F39C12' },
];

const CONTACT_OPTIONS = [
  { id: 'chat', title: 'Live Chat', subtitle: 'Replies in 2 mins', icon: 'message-circle', color: '#258B3E' },
  { id: 'call', title: 'Call Us', subtitle: '9 AM - 9 PM', icon: 'phone', color: '#4A90E2' },
  { id: 'email', title: 'Email', subtitle: 'Within 24 hrs', icon: 'mail', color: '#F39C12' },
];

const FAQS: Faq[] = [
  {
    id: '1',
    category: 'orders',
    question: 'How do I track my order?',
    answer:
      'Go to My Orders and tap Track on any active order. You will see live status updates and the expected delivery time.',
  },
  {
    id: '2',
    category: 'orders',
    question: 'Can I cancel or change my order?',
    answer:
      'You can cancel an order before it is marked as Preparing. After that, the items are packed and cannot be changed.',
  },
  {
    id: '3',
    category: 'orders',
    question: 'An item is missing or damaged. What should I do?',
    answer:
      'Open the order in My Orders, tap Need Help and select the item. We will refund or replace it after a quick review.',
  },
  {
    id: '4',
    category: 'payments',
    question: 'Which payment methods are accepted?',
    answer:
      'We accept Visa and Mastercard cards, UPI apps such as Google Pay and PhonePe, and wallets like Paytm.',
  },
  {
    id: '5',
    category: 'payments',
    question: 'My payment failed but money was deducted.',
    answer:
      'Failed payments are usually refunded to the original method within 5-7 business days. If not, contact support with your order ID.',
  },
  {
    id: '6',
    category: 'payments',
    question: 'How do I change my default payment method?',
    answer:
      'Open Profile > Payment Methods, then tap Set Default on the method you want to use first.',
  },
  {
    id: '7',
    category: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'Most orders arrive within 30-45 minutes. During peak hours or bad weather, it can take a little longer.',
  },
  {
    id: '8',
    category: 'delivery',
    question: 'How do I change my delivery address?',
    answer:
      'Update your addresses in Profile > Saved Addresses. You can pick a different address at checkout before you place the order.',
  },
  {
    id: '9',
    category: 'account',
    question: 'How do I update my phone number or email?',
    answer: 'Go to Profile and tap Edit Profile. Update your details and save the changes.',
  },
  {
    id: '10',
    category: 'account',
    question: 'How do I delete my account?',
    answer:
      'Contact support from this screen and we will help you delete your account and associated data.',
  },
];

/* ----------------------------- FAQ ITEM ----------------------------- */

const FaqItem = ({
  faq,
  isOpen,
  isLast,
  onToggle,
}: {
  faq: Faq;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
}) => {
  const rotate = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const fade = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: isOpen ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: isOpen ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  return (
    <View style={!isLast && styles.faqDivider}>
      <TouchableOpacity
        style={styles.faqHeader}
        activeOpacity={0.75}
        onPress={onToggle}
      >
        <LocalizedText style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>
          {faq.question}
        </LocalizedText>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <Icon name="chevron-down" size={20} color={isOpen ? '#258B3E' : '#c0c0c0'} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View style={[styles.faqBody, { opacity: fade }]}>
          <LocalizedText style={styles.faqAnswer}>{faq.answer}</LocalizedText>
        </Animated.View>
      )}
    </View>
  );
};

/* ------------------------------ SCREEN ------------------------------ */

const HelpScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const contactAnims = useRef(CONTACT_OPTIONS.map(() => new Animated.Value(0))).current;
  const faqAnim = useRef(new Animated.Value(0)).current;
  const orderHelpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(70, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const anims = contactAnims.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        delay: 200 + index * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(40, anims).start();

    Animated.timing(faqAnim, {
      toValue: 1,
      duration: 420,
      delay: 480,
      useNativeDriver: true,
    }).start();

    Animated.timing(orderHelpAnim, {
      toValue: 1,
      duration: 400,
      delay: 620,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchCat = category === 'all' || f.category === category;
      const matchQuery =
        !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, category]);

  const animateLayout = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const handleToggle = (id: string) => {
    animateLayout();
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleCategory = (id: CategoryId) => {
    animateLayout();
    setCategory(id);
    setOpenId(null);
  };

  const handleSearch = (text: string) => {
    animateLayout();
    setQuery(text);
    setOpenId(null);
  };

  const handleContact = (id: string) => {
    switch (id) {
      case 'chat':
        navigation.navigate('LiveChatScreen');
        break;
      case 'call':
        Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
        break;
      case 'email':
        Linking.openURL(
          `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Help needed')}`
        ).catch(() => {});
        break;
    }
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
          title="Help & Support"
          onBack={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* Search */}
        <Animated.View
          style={{
            opacity: searchAnim,
            transform: [
              {
                translateY: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <LocalizedText style={styles.greetTitle}>How can we help you?</LocalizedText>
          <SearchBar
            placeholder="Search for answers"
            value={query}
            onChangeText={handleSearch}
            onClear={() => handleSearch('')}
            containerStyle={{ paddingHorizontal: 0, marginTop: 12 }}
          />
        </Animated.View>

        {/* Contact options */}
        <View style={styles.contactRow}>
          {CONTACT_OPTIONS.map((opt, index) => {
            const anim = contactAnims[index];
            return (
              <Animated.View
                key={opt.id}
                style={[
                  styles.contactCol,
                  {
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.94, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.contactCard}
                  activeOpacity={0.85}
                  onPress={() => handleContact(opt.id)}
                >
                  <View
                    style={[styles.contactIcon, { backgroundColor: `${opt.color}15` }]}
                  >
                    <Icon name={opt.icon as any} size={22} color={opt.color} />
                  </View>
                  <LocalizedText style={styles.contactTitle}>{opt.title}</LocalizedText>
                  <LocalizedText style={styles.contactSubtitle}>{opt.subtitle}</LocalizedText>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* FAQs */}
        <Animated.View
          style={{
            opacity: faqAnim,
            transform: [
              {
                translateY: faqAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <LocalizedText style={styles.sectionTitle}>Frequently Asked Questions</LocalizedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  activeOpacity={0.8}
                  onPress={() => handleCategory(c.id)}
                >
                  <Icon
                    name={c.icon as any}
                    size={15}
                    color={active ? '#ffffff' : '#258B3E'}
                    style={{ marginRight: 8 }}
                  />
                  <LocalizedText
                    style={[styles.categoryText, active && styles.categoryTextActive]}
                  >
                    {c.label}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredFaqs.length > 0 ? (
            <View style={styles.faqCard}>
              {filteredFaqs.map((faq, index) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openId === faq.id}
                  isLast={index === filteredFaqs.length - 1}
                  onToggle={() => handleToggle(faq.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrapper}>
              <View style={styles.emptyIconWrapper}>
                <Icon name="search" size={28} color="#258B3E" />
              </View>
              <LocalizedText style={styles.emptyTitle}>No answers found</LocalizedText>
              <LocalizedText style={styles.emptySubtitle}>
                Try different keywords or contact our support team.
              </LocalizedText>
            </View>
          )}
        </Animated.View>

        {/* Order help */}
        <Animated.View
          style={{
            opacity: orderHelpAnim,
            transform: [
              {
                translateY: orderHelpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <ListItem
            icon="package"
            title="Issue with an order?"
            subtitle="Pick the order from My Orders to get help"
            onPress={() => navigation.navigate('MyOrdersScreen')}
            style={styles.orderHelpCard}
          />

          <InfoBanner
            icon="clock"
            message="Our support team is available every day from 9 AM to 9 PM."
            variant="success"
            style={{ marginTop: 14 }}
          />
        </Animated.View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Search
  greetTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },

  // Contact
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  contactCol: {
    flex: 1,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  contactSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 2,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 14,
  },

  // Categories
  categoryRow: {
    gap: 10,
    paddingBottom: 16,
    paddingRight: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#EAF5ED',
    borderWidth: 1.5,
    borderColor: '#d4f0dc',
  },
  categoryChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  categoryTextActive: {
    color: '#ffffff',
  },

  // FAQ
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  faqDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginRight: 12,
    lineHeight: 21,
  },
  faqQuestionOpen: {
    color: '#258B3E',
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -4,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    lineHeight: 21,
  },

  // Empty
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 30,
    marginBottom: 12,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Order help
  orderHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHelpIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  orderHelpTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  orderHelpSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 2,
  },

  // Info note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 139, 62, 0.08)',
    borderRadius: 14,
    padding: 14,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    lineHeight: 18,
  },
});

export default HelpScreen;