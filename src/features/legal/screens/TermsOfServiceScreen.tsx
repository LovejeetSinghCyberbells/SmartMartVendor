import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Easing, Linking, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Chip, ListItem, InfoBanner } from '../../../shared/components/common';

const APP_NAME = 'Your Vendor & Employee App';
const LAST_UPDATED = 'October 26, 2026';
const SUPPORT_EMAIL = 'support@yourcompany.com';

interface TermsSection {
  id: string;
  short: string;
  title: string;
  icon: string;
  color: string;
  paragraphs?: string[];
  bullets?: string[];
}

const SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    short: 'Acceptance',
    title: 'Acceptance of Terms',
    icon: 'check-circle',
    color: '#258B3E',
    paragraphs: [
      `By registering for, accessing, or using ${APP_NAME}, you agree to comply with these Terms and Conditions and all applicable policies.`,
      'These terms apply to vendors, employees, and other authorized users according to their respective roles and responsibilities.',
      'If you do not agree with these terms, you must discontinue using the platform.',
      'Additional vendor agreements, employment contracts, and workplace policies may also apply to your relationship with the company.',
    ],
  },
  {
    id: 'registration',
    short: 'Registration',
    title: 'Account Registration & Verification',
    icon: 'user',
    color: '#4A90E2',
    paragraphs: [
      'Vendors and employees must provide accurate, complete, and up-to-date information during registration and whenever their details change.',
    ],
    bullets: [
      'Vendors must provide valid business details, contact information, and applicable registration or tax documents when required.',
      'Employees must provide accurate personal, employment, and contact information requested by the company.',
      'Submit authentic documents and cooperate with identity or business verification procedures.',
      'The company may request additional information to verify an account.',
      'Accounts may be restricted or suspended if information is false, misleading, incomplete, or cannot be verified.',
    ],
  },
  {
    id: 'vendor',
    short: 'Vendor obligations',
    title: 'Vendor Responsibilities',
    icon: 'briefcase',
    color: '#F39C12',
    paragraphs: [
      'Vendors are responsible for managing their business activities through the platform in a professional, lawful, and transparent manner.',
    ],
    bullets: [
      'Maintain accurate business profiles, contact details, product or service descriptions, and applicable pricing information.',
      'Provide products or services that meet agreed specifications, quality standards, and applicable legal requirements.',
      'Keep required licenses, registrations, certifications, and permits valid wherever applicable.',
      'Fulfil accepted orders, service commitments, and agreed delivery or completion timelines.',
      'Communicate professionally with customers, employees, and company representatives.',
      'Report material changes to business information, availability, pricing, or service capacity promptly.',
      'Do not publish misleading advertisements, fraudulent listings, or unauthorized content.',
      'Resolve customer complaints and service issues in accordance with applicable agreements and company policies.',
    ],
  },
  {
    id: 'employee',
    short: 'Employee obligations',
    title: 'Employee Responsibilities',
    icon: 'users',
    color: '#9B59B6',
    paragraphs: [
      'Employees are expected to perform their assigned duties responsibly and follow applicable employment agreements, workplace policies, and lawful instructions from authorized managers.',
    ],
    bullets: [
      'Perform assigned tasks with reasonable care, professionalism, and accountability.',
      'Follow applicable attendance, working-hours, leave, and reporting procedures.',
      'Keep assigned work records, reports, and task statuses accurate and up to date.',
      'Use company equipment, accounts, applications, and resources responsibly.',
      'Treat customers, vendors, colleagues, and management respectfully.',
      'Report work-related issues, security incidents, misconduct, or conflicts of interest through appropriate channels.',
      'Do not falsify attendance, timesheets, work reports, expenses, or performance records.',
      'Comply with applicable workplace safety, information security, and data protection policies.',
    ],
  },
  {
    id: 'attendance',
    short: 'Attendance & work',
    title: 'Attendance, Working Hours & Tasks',
    icon: 'clock',
    color: '#1ABC9C',
    paragraphs: [
      'Where the platform supports attendance, shift management, task assignment, or work tracking, users must use these features honestly and in accordance with the policies applicable to their role.',
    ],
    bullets: [
      'Employees must record attendance and working hours accurately using the designated process.',
      'Employees should follow assigned shifts, schedules, leave procedures, and reporting requirements.',
      'Report missed attendance entries, incorrect records, or scheduling conflicts promptly.',
      'Vendors must meet agreed availability, appointment, fulfilment, and service commitments.',
      'Do not manipulate attendance records, task completion statuses, location records, or other operational data.',
      'Any location or activity tracking is subject to the applicable privacy notice, permissions, and relevant laws.',
    ],
  },
  {
    id: 'payments',
    short: 'Payments & compensation',
    title: 'Payments, Fees & Compensation',
    icon: 'credit-card',
    color: '#E67E22',
    paragraphs: [
      'Vendor payments, platform fees, employee salaries, reimbursements, and other financial arrangements are governed by the applicable vendor agreement, employment agreement, payment terms, and company policies.',
    ],
    bullets: [
      'Vendors must provide accurate payment details and applicable invoices or supporting documents.',
      'Vendor commissions, service fees, settlement schedules, and deductions, if any, will be communicated through the applicable agreement or platform.',
      'Employees will receive salary, eligible benefits, and reimbursements in accordance with their employment terms and applicable law.',
      'Do not submit fraudulent invoices, false expense claims, or misleading payment information.',
      'Report payment discrepancies through the designated support or finance channel.',
      'Applicable taxes, statutory deductions, and other legal obligations will be handled according to the relevant agreement and applicable law.',
    ],
  },
  {
    id: 'conduct',
    short: 'Code of conduct',
    title: 'Professional Conduct & Fair Use',
    icon: 'shield',
    color: '#FF6B6B',
    paragraphs: [
      'All users must act honestly, professionally, and lawfully while accessing the platform or interacting with the company and its stakeholders.',
    ],
    bullets: [
      'Do not engage in fraud, bribery, harassment, discrimination, intimidation, or abusive behaviour.',
      'Do not misuse company systems, platform features, business opportunities, or confidential information.',
      'Do not impersonate another person or access accounts without authorization.',
      'Do not manipulate business transactions, work records, performance data, or platform activity.',
      'Do not offer, request, or accept unauthorized payments or benefits in connection with company activities.',
      'Respect professional boundaries and report serious misconduct through appropriate reporting channels.',
      'Follow applicable anti-harassment, workplace conduct, and conflict-of-interest policies.',
    ],
  },
  {
    id: 'security',
    short: 'Account security',
    title: 'Account Security & Access',
    icon: 'lock',
    color: '#34495E',
    paragraphs: [
      'Each user is responsible for protecting their account credentials and using the platform only within the permissions assigned to their role.',
    ],
    bullets: [
      'Keep passwords, OTPs, authentication codes, and other login credentials confidential.',
      'Do not share accounts or allow unauthorized individuals to use your access.',
      'Use only the features and information permitted for your assigned role.',
      'Notify the company promptly if an account is compromised, a device is lost, or unauthorized access is suspected.',
      'Do not attempt to bypass security controls, access restricted information, or disrupt platform operations.',
      'The company may modify or revoke access when reasonably necessary for security, operational, or compliance purposes.',
    ],
  },
  {
    id: 'confidentiality',
    short: 'Confidentiality',
    title: 'Confidentiality & Business Information',
    icon: 'eye-off',
    color: '#7F8C8D',
    paragraphs: [
      'Vendors and employees may have access to confidential business information, operational records, customer information, pricing, financial information, or internal documents. Such information must be handled responsibly and only for authorized purposes.',
    ],
    bullets: [
      'Do not disclose confidential information to unauthorized persons.',
      'Do not copy, download, transfer, or share restricted business information without appropriate authorization.',
      'Use confidential information only for legitimate business activities related to your role.',
      'Protect company documents, customer records, business strategies, credentials, and internal communications.',
      'Report suspected data leaks, unauthorized disclosure, or loss of confidential information promptly.',
      'Confidentiality obligations continue after access ends to the extent required by applicable agreements and law.',
      'Nothing in this section prevents lawful reporting to authorities or the exercise of rights protected by applicable law.',
    ],
  },
  {
    id: 'privacy',
    short: 'Privacy & data',
    title: 'Privacy & Data Protection',
    icon: 'shield',
    color: '#16A085',
    paragraphs: [
      'The company may collect and process personal, business, employment, attendance, transaction, and technical information as necessary to operate the platform and fulfil legitimate business, contractual, security, and legal requirements.',
      'Personal information will be handled in accordance with the applicable Privacy Policy and relevant data protection laws.',
    ],
    bullets: [
      'Provide personal or business information only when authorized and required for a legitimate purpose.',
      'Access personal data only when necessary for your assigned responsibilities.',
      'Do not use customer, employee, or vendor information for unauthorized marketing, personal gain, or unrelated purposes.',
      'Follow applicable data retention, access control, and information security procedures.',
      'Requests concerning personal information may be submitted through the designated company contact.',
    ],
  },
  {
    id: 'intellectual-property',
    short: 'Ownership',
    title: 'Intellectual Property & Work Product',
    icon: 'award',
    color: '#8E44AD',
    paragraphs: [
      'The platform software, branding, designs, documentation, and other company-owned materials remain the property of the company or its respective licensors, subject to applicable rights and agreements.',
      'Ownership and permitted use of work created by employees or vendors will be determined by applicable contracts, project agreements, and intellectual property laws.',
    ],
    bullets: [
      'Do not copy, modify, distribute, or commercially exploit company-owned materials without authorization.',
      'Do not use company trademarks, logos, or branding outside the scope of permitted activities.',
      'Vendors must ensure they have the necessary rights to materials, products, or content they provide.',
      'Employees and vendors must respect third-party intellectual property rights.',
      'Any assignment or licensing of work product must be governed by the applicable written agreement and law.',
    ],
  },
  {
    id: 'records',
    short: 'Records & reporting',
    title: 'Records, Reporting & Audits',
    icon: 'file-text',
    color: '#2980B9',
    paragraphs: [
      'Users must maintain accurate records relevant to their business or employment activities and cooperate with authorized reviews relating to platform usage, financial records, operational processes, or compliance.',
    ],
    bullets: [
      'Submit accurate reports, invoices, attendance records, task updates, and supporting documents.',
      'Do not delete, alter, conceal, or falsify records to mislead the company or another authorized party.',
      'Provide reasonable cooperation during authorized investigations or compliance reviews.',
      'Report suspected fraud, security incidents, policy violations, or material operational issues promptly.',
      'Any monitoring or review of platform activity must be carried out in accordance with applicable law and relevant policies.',
    ],
  },
  {
    id: 'suspension',
    short: 'Suspension',
    title: 'Account Suspension & Termination',
    icon: 'user-x',
    color: '#C0392B',
    paragraphs: [
      'The company may restrict, suspend, or terminate platform access where reasonably necessary because of suspected fraud, security risks, material policy violations, unauthorized access, or other legitimate operational or legal reasons.',
      'Where appropriate and legally permissible, the affected user may be notified and given an opportunity to respond or resolve the issue.',
    ],
    bullets: [
      'Vendors may be subject to account restrictions or termination for serious or repeated contractual violations.',
      'Employee access may be changed or revoked when employment ends or access is no longer authorized.',
      'Employment termination, disciplinary action, notice periods, and final settlements are governed by applicable employment terms and law.',
      'Vendors remain responsible for outstanding obligations under their applicable agreements.',
      'Users must return company property and cease using restricted information when required.',
      'Suspension or termination does not remove obligations that legally or contractually continue afterward.',
    ],
  },
  {
    id: 'liability',
    short: 'Liability',
    title: 'Responsibility & Limitations',
    icon: 'alert-triangle',
    color: '#F39C12',
    paragraphs: [
      'Users are responsible for their own actions, the accuracy of information they provide, and compliance with the obligations applicable to their role.',
      'To the extent permitted by applicable law, the company will not be liable for indirect or consequential losses arising from platform use. Any limitation of liability is subject to applicable law and the relevant agreement.',
      'Nothing in these terms excludes liability or limits rights that cannot lawfully be excluded or limited.',
    ],
  },
  {
    id: 'changes',
    short: 'Changes to terms',
    title: 'Updates to These Terms',
    icon: 'refresh-cw',
    color: '#4A90E2',
    paragraphs: [
      'The company may update these Terms and Conditions to reflect changes in its services, business operations, security requirements, or applicable laws.',
      'Material changes will be communicated through the platform or another appropriate channel where required.',
      'Updated terms will take effect from the stated effective date or as otherwise permitted by applicable law. Continued use of the platform after the effective date may constitute acceptance where legally valid.',
    ],
  },
  {
    id: 'law',
    short: 'Legal matters',
    title: 'Governing Law & Dispute Resolution',
    icon: 'book-open',
    color: '#4A90E2',
    paragraphs: [
      'These terms will be interpreted in accordance with applicable law and any valid governing-law provisions in the relevant vendor or employment agreement.',
      'Disputes will be handled through the dispute resolution procedure specified in the applicable agreement or, where no such procedure applies, through the competent forum under applicable law.',
      'Nothing in these terms removes any mandatory legal rights or remedies available to vendors or employees.',
    ],
  },
];

const TermsOfServiceScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const sectionY = useRef<Record<string, number>>({});
  const [showTop, setShowTop] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const introAnim = useRef(new Animated.Value(0)).current;
  const chipsAnim = useRef(new Animated.Value(0)).current;
  const sectionAnims = useRef(SECTIONS.map(() => new Animated.Value(0))).current;
  const contactAnim = useRef(new Animated.Value(0)).current;
  const topBtnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(introAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(chipsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const anims = sectionAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 420,
        delay: 300 + index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(40, anims).start();

    Animated.timing(contactAnim, {
      toValue: 1,
      duration: 400,
      delay: 300 + SECTIONS.length * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(topBtnAnim, {
      toValue: showTop ? 1 : 0,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [showTop]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldShow = e.nativeEvent.contentOffset.y > 400;
    if (shouldShow !== showTop) setShowTop(shouldShow);
  };

  const handleSectionLayout = (id: string) => (e: LayoutChangeEvent) => {
    sectionY.current[id] = e.nativeEvent.layout.y;
  };

  const jumpTo = (id: string) => {
    setActiveChip(id);
    const y = sectionY.current[id];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const fadeUp = (anim: Animated.Value, distance = 20) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

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
          title="Terms of Service"
          onBack={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* Intro */}
        <Animated.View
          style={[
            styles.introCard,
            {
              opacity: introAnim,
              transform: [
                {
                  translateY: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
                {
                  scale: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.introIcon}>
            <Icon name="file-text" size={28} color="#258B3E" />
          </View>
          <LocalizedText style={styles.introTitle}>Terms & Conditions</LocalizedText>
          <LocalizedText style={styles.introSubtitle}>
            Please read these terms carefully. They explain the responsibilities and rules for vendors and employees using {APP_NAME}.
          </LocalizedText>
          <View style={styles.updatedBadge}>
            <Icon name="clock" size={12} color="#258B3E" style={{ marginRight: 6 }} />
            <LocalizedText style={styles.updatedText}>Last updated {LAST_UPDATED}</LocalizedText>
          </View>
        </Animated.View>

        {/* Jump chips */}
        <Animated.View style={fadeUp(chipsAnim, 12)}>
          <LocalizedText style={styles.sectionTitle}>Jump to</LocalizedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SECTIONS.map((s) => {
              const active = activeChip === s.id;
              return (
                <Chip
                  key={s.id}
                  label={s.short}
                  selected={active}
                  onPress={() => jumpTo(s.id)}
                  style={styles.chip}
                />
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Sections */}
        {SECTIONS.map((section, index) => (
          <Animated.View
            key={section.id}
            onLayout={handleSectionLayout(section.id)}
            style={[styles.card, fadeUp(sectionAnims[index])]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIcon, { backgroundColor: `${section.color}15` }]}
              >
                <Icon name={section.icon as any} size={20} color={section.color} />
              </View>
              <LocalizedText style={styles.cardTitle}>{section.title}</LocalizedText>
            </View>

            {section.paragraphs?.map((p, i) => (
              <LocalizedText key={i} style={styles.paragraph}>
                {p}
              </LocalizedText>
            ))}

            {section.bullets?.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: section.color }]} />
                <LocalizedText style={styles.bulletText}>{b}</LocalizedText>
              </View>
            ))}
          </Animated.View>
        ))}

        {/* Contact + related */}
        <Animated.View style={fadeUp(contactAnim)}>
          <ListItem
            icon="shield"
            title="Privacy Policy"
            subtitle="Learn how we handle personal and business data"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
            style={styles.linkCard}
          />

          <ListItem
            icon="mail"
            title="Questions about these terms?"
            subtitle={SUPPORT_EMAIL}
            onPress={() =>
              Linking.openURL(
                `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Terms question')}`
              ).catch(() => {})
            }
            style={styles.linkCard}
          />

          <InfoBanner
            icon="info"
            message={`By using ${APP_NAME}, you agree to these Terms & Conditions.`}
            variant="success"
            style={{ marginTop: 14 }}
          />
        </Animated.View>
      </ScrollView>

      {/* Back to top */}
      <Animated.View
        pointerEvents={showTop ? 'auto' : 'none'}
        style={[
          styles.topBtnWrapper,
          {
            bottom: insets.bottom + 20,
            opacity: topBtnAnim,
            transform: [
              {
                scale: topBtnAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.topBtn}
          activeOpacity={0.85}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Icon name="arrow-up" size={20} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 14,
  },

  // Intro
  introCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  updatedText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },

  // Chips
  chipRow: {
    gap: 10,
    paddingBottom: 20,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#EAF5ED',
    borderWidth: 1.5,
    borderColor: '#d4f0dc',
  },
  chipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // Section cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  paragraph: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    lineHeight: 21,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    lineHeight: 21,
  },

  // Link cards
  linkCard: {
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
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  linkTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  linkSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 2,
  },
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

  // Back to top
  topBtnWrapper: {
    position: 'absolute',
    right: 20,
  },
  topBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default TermsOfServiceScreen;