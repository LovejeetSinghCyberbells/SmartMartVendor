import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { Badge, Avatar, Chip } from '../../../shared/components/common';
import { useStaffChat, ChatAttachment } from '../context/StaffChatContext';
import { useStaffRole } from '../context/StaffRoleContext';
import { useFloorPager } from '../context/FloorPagerContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

const SMART_QUICK_REPLIES = [
  'On my way to the cabin!',
  'Checking stock on shelf right now.',
  'Queue is cleared at Counter 1.',
  'Need manager assistance at POS.',
  'Order #TK-1024 is sealed & staged.',
  'Barcode verified on price terminal.',
];

const PRESET_ATTACHMENTS: ChatAttachment[] = [
  {
    type: 'location',
    title: 'Manager Cabin #1',
    subtitle: 'Store Management Office',
    badge: 'LOCATION',
  },
  {
    type: 'location',
    title: 'POS Billing Counter #1',
    subtitle: 'Walk-in Cart Checkout Bay',
    badge: 'LOCATION',
  },
  {
    type: 'order',
    id: 'TK-1024',
    title: 'Order #TK-1024',
    subtitle: 'Blinkit 8 items • Staged at Bay #4',
    badge: 'ONLINE ORDER',
  },
  {
    type: 'product',
    title: 'Fortune Sunlite Sunflower Oil 1L',
    subtitle: 'Store Price: ₹145 • MRP: ₹175',
    badge: 'BARCODE VERIFIED',
  },
];

const TeamChatConversationScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const {
    activeConversation,
    messages,
    isPartnerTyping,
    sendMessage,
  } = useStaffChat();
  const { ringEmployeePhone } = useFloorPager();
  const { showToast } = useFeedback();

  const [inputVal, setInputVal] = useState('');
  const [showAttachModal, setShowAttachModal] = useState(false);
  const scrollRef = useRef<any>(null);

  // Typing dots animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPartnerTyping) {
      const animateDot = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: -6, duration: 250, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.delay(400),
          ])
        );
      };

      const a1 = animateDot(dot1, 0);
      const a2 = animateDot(dot2, 150);
      const a3 = animateDot(dot3, 300);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
      };
    }
  }, [isPartnerTyping]);

  useEffect(() => {
    // Scroll to bottom on new messages
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, isPartnerTyping]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const handleSendQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleSendAttachment = (att: ChatAttachment) => {
    setShowAttachModal(false);
    sendMessage('', att);
    showToast(`Shared ${att.title}`, 'info');
  };

  const handleQuickRing = () => {
    if (!activeConversation || activeConversation.type === 'channel') {
      showToast('Urgent 20s ringer is for direct staff members', 'info');
      return;
    }
    const targetId = activeConversation.otherParticipantId;
    if (targetId) {
      ringEmployeePhone(
        targetId,
        'Manager Cabin #1',
        `Urgent call from ${currentEmployee.name} via Chat. Report to cabin immediately.`
      );
      showToast(`🚨 Ringing ${activeConversation.title}'s phone for 20 seconds!`, 'success');
    }
  };

  if (!activeConversation) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={{ padding: 20 }}>
          <LocalizedText>No active conversation selected.</LocalizedText>
        </View>
      </View>
    );
  }

  const isChannel = activeConversation.type === 'channel';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ===== CHAT HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          scaleTo={0.88}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>

        <Avatar
          source={!isChannel ? (activeConversation as any).avatarUrl : undefined}
          icon={isChannel ? 'message-square' : undefined}
          role={!isChannel ? activeConversation.otherParticipantRole : undefined}
          size={38}
          showStatus={!isChannel}
          status={activeConversation.isOnline ? 'online' : 'offline'}
          style={styles.headerAvatarWrap}
        />

        <View style={styles.headerInfo}>
          <LocalizedText style={styles.headerTitle} numberOfLines={1}>
            {activeConversation.title}
          </LocalizedText>
          <LocalizedText style={styles.headerSubtitle} numberOfLines={1}>
            {isChannel ? '#floor-general • All Store Staff' : activeConversation.subtitle}
          </LocalizedText>
        </View>

        {/* Action Buttons in Chat Header */}
        <View style={styles.headerActions}>
          {!isChannel && (
            <TouchableOpacity
              style={styles.urgentRingBtn}
              scaleTo={0.88}
              onPress={handleQuickRing}
              accessibilityLabel="20-Second Urgent Ring"
            >
              <Icon name="bell" size={16} color="#dc2626" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.callBtn}
            scaleTo={0.88}
            onPress={() => {
              showToast(`Connected to store intercom for ${activeConversation.title}`, 'info');
            }}
            accessibilityLabel="Voice Intercom"
          >
            <Icon name="phone" size={16} color="#258B3E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== MESSAGES SCROLL VIEW ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.messagesContainer, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Day Header */}
          <View style={styles.dateBanner}>
            <LocalizedText style={styles.dateBannerText}>TODAY</LocalizedText>
          </View>

          {/* Messages */}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentEmployee.id;

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowMe : styles.messageRowOther,
                ]}
              >
                {!isMe && (
                  <Avatar
                    source={(msg as any).avatarUrl}
                    role={msg.senderRole}
                    size={30}
                    style={{ marginRight: 8, marginTop: 4 }}
                  />
                )}

                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  {/* Sender Name in group channels */}
                  {!isMe && (
                    <View style={styles.senderHeaderRow}>
                      <LocalizedText style={styles.senderName}>
                        {msg.senderName}
                      </LocalizedText>
                      <LocalizedText style={styles.senderRole}>
                        • {msg.senderRole}
                      </LocalizedText>
                    </View>
                  )}

                  {/* Attachment Card */}
                  {msg.attachment && (
                    <View style={styles.attachCard}>
                      <View style={styles.attachCardHeader}>
                        <Icon
                          name={
                            msg.attachment.type === 'location'
                              ? 'map-pin'
                              : msg.attachment.type === 'order'
                              ? 'package'
                              : 'tag'
                          }
                          size={13}
                          color={isMe ? '#ffffff' : '#258B3E'}
                          style={{ marginRight: 5 }}
                        />
                        <LocalizedText
                          style={[
                            styles.attachBadge,
                            isMe && { color: 'rgba(255,255,255,0.9)' },
                          ]}
                        >
                          {msg.attachment.badge || 'ATTACHMENT'}
                        </LocalizedText>
                      </View>
                      <LocalizedText
                        style={[
                          styles.attachTitle,
                          isMe && { color: '#ffffff' },
                        ]}
                      >
                        {msg.attachment.title}
                      </LocalizedText>
                      {msg.attachment.subtitle && (
                        <LocalizedText
                          style={[
                            styles.attachSub,
                            isMe && { color: 'rgba(255,255,255,0.85)' },
                          ]}
                        >
                          {msg.attachment.subtitle}
                        </LocalizedText>
                      )}
                    </View>
                  )}

                  {/* Message Text */}
                  {Boolean(msg.text) && (
                    <LocalizedText
                      style={[
                        styles.msgText,
                        isMe ? styles.msgTextMe : styles.msgTextOther,
                      ]}
                    >
                      {msg.text}
                    </LocalizedText>
                  )}

                  {/* Time & Delivery Checkmarks */}
                  <View style={styles.metaRow}>
                    <LocalizedText
                      style={[
                        styles.timeText,
                        isMe ? styles.timeTextMe : styles.timeTextOther,
                      ]}
                    >
                      {msg.timeFormatted}
                    </LocalizedText>
                    {isMe && (
                      <Icon
                        name="check"
                        size={12}
                        color={msg.status === 'read' ? '#bbf7d0' : '#ffffff'}
                        style={{ marginLeft: 3 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isPartnerTyping && (
            <View style={[styles.messageRow, styles.messageRowOther]}>
              <Avatar
                source={(activeConversation as any).avatarUrl}
                role={activeConversation.otherParticipantRole}
                size={28}
                style={{ marginRight: 8 }}
              />
              <View style={[styles.bubble, styles.bubbleOther, styles.typingBubble]}>
                <LocalizedText style={styles.typingName}>
                  {activeConversation.title} is typing
                </LocalizedText>
                <View style={styles.dotsRow}>
                  <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
                  />
                  <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
                  />
                  <Animated.View
                    style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ===== QUICK SMART REPLIES CAROUSEL ===== */}
        <View style={styles.quickRepliesBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesContent}
          >
            {SMART_QUICK_REPLIES.map((reply, i) => (
              <Chip
                key={i}
                label={reply}
                size="sm"
                onPress={() => handleSendQuickReply(reply)}
                style={styles.quickChip}
              />
            ))}
          </ScrollView>
        </View>

        {/* ===== INPUT BAR ===== */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.attachBtn}
            scaleTo={0.9}
            onPress={() => setShowAttachModal(true)}
            accessibilityLabel="Attach order or station"
          >
            <Icon name="plus" size={20} color="#258B3E" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputVal}
            onChangeText={setInputVal}
            placeholder={`Message ${activeConversation.title}...`}
            placeholderTextColor="#9ca3af"
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              Boolean(inputVal.trim()) && styles.sendBtnActive,
            ]}
            scaleTo={0.9}
            onPress={handleSend}
            disabled={!inputVal.trim()}
          >
            <Icon
              name="send"
              size={17}
              color={inputVal.trim() ? '#ffffff' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ===== ATTACHMENT MODAL ===== */}
      {showAttachModal && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachModal(false)}
        >
          <View style={styles.attachModalBackdrop}>
            <View style={[styles.attachModalCard, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.attachModalHeader}>
                <View style={styles.attachModalIconWrap}>
                  <Icon name="share-2" size={18} color="#258B3E" />
                </View>
                <View style={{ flex: 1 }}>
                  <LocalizedText style={styles.attachModalTitle}>
                    Share Store Floor Reference
                  </LocalizedText>
                  <LocalizedText style={styles.attachModalSub}>
                    Send real-time location, online order or item price check
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.attachModalClose}
                  scaleTo={0.9}
                  onPress={() => setShowAttachModal(false)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {PRESET_ATTACHMENTS.map((att, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.attachItem}
                    scaleTo={0.97}
                    onPress={() => handleSendAttachment(att)}
                  >
                    <View style={styles.attachItemIcon}>
                      <Icon
                        name={
                          att.type === 'location'
                            ? 'map-pin'
                            : att.type === 'order'
                            ? 'package'
                            : 'tag'
                        }
                        size={17}
                        color="#258B3E"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <LocalizedText style={styles.attachItemTitle}>
                          {att.title}
                        </LocalizedText>
                        <Badge
                          label={att.badge || 'TAG'}
                          backgroundColor="#EAF5ED"
                          textColor="#258B3E"
                          size="sm"
                          style={{ marginLeft: 6 }}
                        />
                      </View>
                      <LocalizedText style={styles.attachItemSub}>
                        {att.subtitle}
                      </LocalizedText>
                    </View>
                    <Icon name="chevron-right" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  headerAvatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentRingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Messages List */
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  dateBanner: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateBannerText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  msgAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  msgAvatarText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#258B3E',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  senderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  senderName: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  senderRole: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginLeft: 3,
  },
  msgText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  msgTextMe: {
    color: '#ffffff',
  },
  msgTextOther: {
    color: '#1f2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.75)',
  },
  timeTextOther: {
    color: '#9ca3af',
  },

  /* Attachment in bubble */
  attachCard: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  attachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  attachBadge: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
    letterSpacing: 0.4,
  },
  attachTitle: {
    fontSize: 12.5,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  attachSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },

  /* Typing Indicator */
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  typingName: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginRight: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#258B3E',
  },

  /* Quick Replies Bar */
  quickRepliesBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingVertical: 8,
  },
  quickRepliesContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#EAF5ED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c6e8cf',
  },
  quickChipText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnActive: {
    backgroundColor: '#258B3E',
  },

  /* Attach Modal */
  attachModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  attachModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '75%',
  },
  attachModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },
  attachModalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachModalTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  attachModalSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  attachModalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachItemTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  attachItemSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
});

export default TeamChatConversationScreen;
