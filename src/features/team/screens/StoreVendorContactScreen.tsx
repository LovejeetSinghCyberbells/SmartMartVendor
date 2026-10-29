import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, Badge, SummaryRow, Divider, Avatar } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { useFloorPager, useStaffChat } from '../../team';
import { colors } from '../../../shared/theme/colors';

const StoreVendorContactScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();
  const { sendCabinNotification } = useFloorPager();
  const { openDirectChatWithStaff } = useStaffChat();

  const [quickNote, setQuickNote] = useState('');

  const handleCallOwner = () => {
    Linking.openURL('tel:+919876543210').catch(() => {
      showToast('Could not open phone dialer', 'error');
    });
  };

  const handleSendFloorNote = (messageText: string) => {
    sendCabinNotification('emp-1', 'Manager Cabin #1', messageText);
    showToast(`Floor page sent to Manager Cabin: "${messageText}"`, 'success');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Store Vendor & Management"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= STORE OWNER HERO CARD ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.ownerCard}>
            <View style={styles.ownerTopRow}>
              <Avatar
                role="OWNER"
                size={54}
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.ownerName}>Rajesh Kumar</LocalizedText>
                <LocalizedText style={styles.ownerRole}>
                  Store Owner &amp; Principal Vendor
                </LocalizedText>
                <View style={styles.storeBadgeRow}>
                  <Icon name="shopping-bag" size={12} color="#258B3E" style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.storeBadgeText}>
                    Green Basket Kirana (#TK-VB-8821)
                  </LocalizedText>
                </View>
              </View>
              <Badge label="Owner" backgroundColor="#EAF5ED" textColor="#258B3E" size="sm" />
            </View>

            <View style={styles.contactDetails}>
              <SummaryRow icon="phone" label="Phone" value="+91 98765 43210" />
              <SummaryRow icon="mail" label="Email" value="rajesh.kumar@greenbasket.in" />
              <SummaryRow icon="map-pin" label="Location" value="Store Management Office (Cabin #1)" />
            </View>

            {/* Quick Contact Actions */}
            <View style={styles.contactActionRow}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: '#258B3E' }]}
                scaleTo={0.96}
                onPress={handleCallOwner}
              >
                <Icon name="phone-call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <LocalizedText style={[styles.contactBtnText, { color: '#ffffff' }]}>
                  Call Owner
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: '#EAF5ED', borderWidth: 1, borderColor: '#258B3E' }]}
                scaleTo={0.96}
                onPress={() => {
                  Linking.openURL('https://wa.me/919876543210').catch(() => {
                    showToast('WhatsApp not available', 'info');
                  });
                }}
              >
                <Icon name="message-circle" size={16} color="#258B3E" style={{ marginRight: 6 }} />
                <LocalizedText style={[styles.contactBtnText, { color: '#258B3E' }]}>
                  WhatsApp Note
                </LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= INSTANT CABIN FLOOR INTERCOM ================= */}
        <AnimatedEntranceView delay={90} direction="up" distance={14}>
          <View style={styles.intercomCard}>
            <View style={styles.intercomHeader}>
              <View style={styles.intercomIconWrap}>
                <Icon name="radio" size={18} color="#0891b2" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.intercomTitle}>
                  Store Floor &amp; Cabin Intercom
                </LocalizedText>
                <LocalizedText style={styles.intercomSub}>
                  Page Store Manager (Rahul Sharma) directly on the shop floor
                </LocalizedText>
              </View>
            </View>

            <LocalizedText style={styles.intercomSectionLabel}>
              Quick One-Tap Intercom Pages:
            </LocalizedText>

            <View style={styles.intercomButtonsCol}>
              <TouchableOpacity
                style={styles.intercomChipBtn}
                scaleTo={0.97}
                onPress={() =>
                  handleSendFloorNote('Need cash change (₹100 & ₹500 notes) at Billing Counter #1')
                }
              >
                <Icon name="dollar-sign" size={15} color="#16a34a" style={{ marginRight: 8 }} />
                <LocalizedText style={styles.intercomChipText}>
                  "Need Cash Change at POS Counter"
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.intercomChipBtn}
                scaleTo={0.97}
                onPress={() =>
                  handleSendFloorNote('Milk & Paneer inventory depleted in Aisle 1 cooler')
                }
              >
                <Icon name="alert-circle" size={15} color="#d97706" style={{ marginRight: 8 }} />
                <LocalizedText style={styles.intercomChipText}>
                  "Cooler Stock Empty • Restock Needed"
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.intercomChipBtn}
                scaleTo={0.97}
                onPress={() =>
                  handleSendFloorNote('Customer query requiring manager authorization at billing desk')
                }
              >
                <Icon name="help-circle" size={15} color="#2563eb" style={{ marginRight: 8 }} />
                <LocalizedText style={styles.intercomChipText}>
                  "Customer Query / Need Manager Approval"
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.intercomChipBtn, { borderColor: '#fca5a5', backgroundColor: '#fef2f2' }]}
                scaleTo={0.97}
                onPress={() =>
                  handleSendFloorNote('Urgent assistance required on store floor immediately!')
                }
              >
                <Icon name="bell" size={15} color="#dc2626" style={{ marginRight: 8 }} />
                <LocalizedText style={[styles.intercomChipText, { color: '#dc2626' }]}>
                  "🚨 Urgent: Please Come to Floor Counter"
                </LocalizedText>
              </TouchableOpacity>
            </View>

            {/* Custom Intercom Note */}
            <View style={styles.customNoteWrap}>
              <TextInput
                style={styles.customNoteInput}
                value={quickNote}
                onChangeText={setQuickNote}
                placeholder="Type custom note to manager..."
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={[
                  styles.sendNoteBtn,
                  !quickNote.trim() && { opacity: 0.5 },
                ]}
                scaleTo={0.94}
                disabled={!quickNote.trim()}
                onPress={() => {
                  handleSendFloorNote(quickNote);
                  setQuickNote('');
                }}
              >
                <Icon name="send" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.chatManagerBtn}
              scaleTo={0.96}
              onPress={() => {
                const convId = openDirectChatWithStaff('1');
                navigation.navigate('TeamChatConversation', { conversationId: convId });
              }}
            >
              <Icon name="message-circle" size={16} color="#258B3E" style={{ marginRight: 6 }} />
              <LocalizedText style={styles.chatManagerBtnText}>
                Open Live Chat with Store Manager
              </LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* ================= STORE EMERGENCY HELPLINES ================= */}
        <AnimatedEntranceView delay={140} direction="up" distance={14}>
          <View style={styles.emergencyCard}>
            <LocalizedText style={styles.emergencyTitle}>
              Store Emergency Contacts
            </LocalizedText>

            <View style={styles.contactItemRow}>
              <View style={[styles.contactItemIcon, { backgroundColor: '#fef3c7' }]}>
                <Icon name="zap" size={15} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.contactItemName}>Store Electrician</LocalizedText>
                <LocalizedText style={styles.contactItemPhone}>+91 98220 11223</LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.miniCallBtn}
                scaleTo={0.88}
                onPress={() => Linking.openURL('tel:+919822011223')}
              >
                <Icon name="phone" size={14} color="#258B3E" />
              </TouchableOpacity>
            </View>

            <View style={styles.emergencyDivider} />

            <View style={styles.contactItemRow}>
              <View style={[styles.contactItemIcon, { backgroundColor: '#eff6ff' }]}>
                <Icon name="thermometer" size={15} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.contactItemName}>Refrigeration Technician</LocalizedText>
                <LocalizedText style={styles.contactItemPhone}>+91 98440 55667</LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.miniCallBtn}
                scaleTo={0.88}
                onPress={() => Linking.openURL('tel:+919844055667')}
              >
                <Icon name="phone" size={14} color="#258B3E" />
              </TouchableOpacity>
            </View>

            <View style={styles.emergencyDivider} />

            <View style={styles.contactItemRow}>
              <View style={[styles.contactItemIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="shield" size={15} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.contactItemName}>Store Mall Security Desk</LocalizedText>
                <LocalizedText style={styles.contactItemPhone}>+91 98111 88990</LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.miniCallBtn}
                scaleTo={0.88}
                onPress={() => Linking.openURL('tel:+919811188990')}
              >
                <Icon name="phone" size={14} color="#258B3E" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatManagerBtn}
                scaleTo={0.96}
                onPress={() => {
                  const convId = openDirectChatWithStaff('1');
                  navigation.navigate('TeamChatConversation', { conversationId: convId });
                }}
              >
                <Icon name="message-circle" size={16} color="#258B3E" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.chatManagerBtnText}>
                  Open Live Chat with Store Manager
                </LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntranceView>
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
  ownerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  ownerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  ownerRole: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  storeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  storeBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  contactDetails: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 14,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  contactActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  contactBtnText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
  },

  intercomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  intercomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  intercomIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#cffafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  intercomTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  intercomSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  intercomSectionLabel: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  intercomButtonsCol: {
    gap: 8,
    marginBottom: 12,
  },
  intercomChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  intercomChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    flex: 1,
  },
  customNoteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customNoteInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  sendNoteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatManagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#c6e8cf',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  chatManagerBtnText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },

  emergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  emergencyTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactItemName: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  contactItemPhone: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  miniCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 6,
  },
});

export default StoreVendorContactScreen;

