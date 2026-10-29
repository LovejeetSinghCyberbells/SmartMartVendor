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
import { ScreenHeader, AnimatedEntranceView, Badge, InfoBanner } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

interface SOPCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  rules: string[];
}

const SOP_CATEGORIES: SOPCategory[] = [
  {
    id: 'cold_chain',
    title: 'Cold-Chain & Perishables SOP',
    subtitle: 'Dairy, fresh produce, frozen meat & ice cream',
    icon: 'thermometer',
    iconColor: '#0891b2',
    iconBg: '#cffafe',
    rules: [
      'Maintain milk, curd and paneer chiller at constant 2°C to 4°C temperature.',
      'Perishables must be staged in the cool zone within 3 minutes of receiving.',
      'Check expiry dates strictly using FIFO (First-In, First-Out) rule on shelf front.',
      'Any packet with seal rupture or swelling must be reported and written off immediately.',
    ],
  },
  {
    id: 'picking_packing',
    title: 'Online Order Picking & Bagging',
    subtitle: 'Blinkit, Swiggy & Zomato quick delivery orders',
    icon: 'package',
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    rules: [
      'Pack heavy items (atta, oil, rice, sugar) at the bottom of delivery bags.',
      'Place fragile items (eggs, bread, chips, tomatoes) gently on top.',
      'Separate raw cleaning chemicals (detergents, phenyl) from edible food items into separate polybags.',
      'Seal bags with barcoded security tamper sticker before handing over to rider.',
      'Always verify 4-digit rider OTP on your screen before bag release.',
    ],
  },
  {
    id: 'pos_billing',
    title: 'Walk-in Counter POS Billing SOP',
    subtitle: 'Cash management, barcode scanning & receipt printing',
    icon: 'file-text',
    iconColor: '#258B3E',
    iconBg: '#EAF5ED',
    rules: [
      'Scan every item individually; never multiply quantities unless barcoded multi-packs.',
      'Count cash notes out loud in front of customer and verify high denomination currency.',
      'Ensure UPI transaction shows green success checkmark on QR screen before issuing bill.',
      'Voiding or canceling bills requires manager PIN authorization to prevent stock mismatch.',
    ],
  },
  {
    id: 'hygiene',
    title: 'Store Cleanliness & Sanitation',
    subtitle: 'Daily floor maintenance, pest prevention & shelves',
    icon: 'check-circle',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    rules: [
      'Morning floor mop and aisle sweep completed before 08:00 AM customer opening.',
      'Sanitize walk-in customer shopping baskets and trolley handles twice daily.',
      'Empty organic waste and spoiled fruit bins into store dumpster every 4 hours.',
      'Keep store aisles free of pallets, cardboard boxes, and loose stepstools.',
    ],
  },
  {
    id: 'emergency',
    title: 'Store Safety & Emergency Protocol',
    subtitle: 'Fire extinguisher, electrical main trip & first aid',
    icon: 'alert-triangle',
    iconColor: '#dc2626',
    iconBg: '#fee2e2',
    rules: [
      'First Aid Medical Kit is located next to Billing Counter #1.',
      'Store Main Electrical Breaker is behind Manager Cabin #1 in case of wire spark.',
      'CO2 Fire Extinguisher is mounted in Aisle 4 opposite the grocery dry storage.',
      'In case of emergency evacuation, gather all customers toward the front double doors.',
    ],
  },
];

const EmployeeGuidelinesSOPScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();

  const [expandedId, setExpandedId] = useState<string>('cold_chain');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'cold_chain-0': true,
    'cold_chain-1': true,
    'picking_packing-0': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  const toggleCheck = (itemKey: string) => {
    setCompletedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      if (next[itemKey]) {
        showToast('Rule acknowledged and checked off', 'success');
      }
      return next;
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="In-Store SOP & Safety"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <InfoBanner
            icon="book-open"
            title="Store Standard Operating Procedures"
            message="Official compliance, hygiene & packing guidelines for Green Basket Kirana staff."
            variant="success"
            style={{ marginBottom: 16, paddingVertical: 14 }}
          />
        </AnimatedEntranceView>

        {/* SOP Accordions */}
        {SOP_CATEGORIES.map((cat, idx) => {
          const isExpanded = expandedId === cat.id;
          return (
            <AnimatedEntranceView
              key={cat.id}
              delay={80 + idx * 35}
              direction="up"
              distance={14}
            >
              <View style={styles.catCard}>
                <TouchableOpacity
                  style={styles.catHeader}
                  scaleTo={0.98}
                  onPress={() => toggleExpand(cat.id)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: cat.iconBg }]}>
                    <Icon name={cat.icon as any} size={18} color={cat.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LocalizedText style={styles.catTitle}>{cat.title}</LocalizedText>
                    <LocalizedText style={styles.catSub}>{cat.subtitle}</LocalizedText>
                  </View>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.catBody}>
                    {cat.rules.map((rule, rIdx) => {
                      const key = `${cat.id}-${rIdx}`;
                      const isChecked = !!completedItems[key];
                      return (
                        <TouchableOpacity
                          key={rIdx}
                          style={styles.ruleRow}
                          scaleTo={0.98}
                          onPress={() => toggleCheck(key)}
                        >
                          <View
                            style={[
                              styles.checkCircle,
                              isChecked && styles.checkCircleActive,
                            ]}
                          >
                            {isChecked && <Icon name="check" size={12} color="#ffffff" />}
                          </View>
                          <LocalizedText
                            style={[
                              styles.ruleText,
                              isChecked && styles.ruleTextDone,
                            ]}
                          >
                            {rule}
                          </LocalizedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#c6e8cf',
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#166534',
  },
  bannerSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginTop: 2,
    lineHeight: 16,
  },

  catCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8edea',
    overflow: 'hidden',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catTitle: {
    fontSize: 13.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  catSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  catBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkCircleActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  ruleText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  ruleTextDone: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
});

export default EmployeeGuidelinesSOPScreen;

