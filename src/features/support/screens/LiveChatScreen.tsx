import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, ScrollView, StatusBar, Animated, Easing, Platform, KeyboardAvoidingView } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  from: 'user' | 'agent';
  text: string;
  time: string;
}

const AGENT_NAME = 'Support Team';

const QUICK_REPLIES = [
  'Where is my order?',
  'Payment issue',
  'Change address',
  'Refund status',
];

const getTime = () => {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

// Placeholder replies. Replace with your real chat backend / socket.
const getAutoReply = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('order') || t.includes('track') || t.includes('where')) {
    return 'You can track your order live from My Orders. Share your order ID and I will check the status for you.';
  }
  if (t.includes('pay') || t.includes('card') || t.includes('upi')) {
    return 'Sorry about the trouble with your payment. Could you tell me the order ID and the payment method you used?';
  }
  if (t.includes('address')) {
    return 'You can edit your address in Profile > Saved Addresses. If the order is already out for delivery, I can ask the rider to update it.';
  }
  if (t.includes('refund')) {
    return 'Refunds usually reach your original payment method within 5-7 business days. Share your order ID and I will check the status.';
  }
  return 'Thanks for reaching out. Could you share a few more details so I can help you better?';
};

/* --------------------------- MESSAGE BUBBLE --------------------------- */

const MessageBubble = ({ message }: { message: Message }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const isUser = message.from === 'user';

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAgent,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
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
      {!isUser && (
        <View style={styles.msgAvatar}>
          <Icon name="headphones" size={14} color="#258B3E" />
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
          <LocalizedText style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {message.text}
          </LocalizedText>
        </View>
        <LocalizedText style={[styles.msgTime, isUser && styles.msgTimeUser]}>{message.time}</LocalizedText>
      </View>
    </Animated.View>
  );
};

/* -------------------------- TYPING INDICATOR -------------------------- */

const TypingIndicator = () => {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((2 - i) * 160),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <Animated.View
      style={[styles.messageRow, styles.messageRowAgent, { opacity: enter }]}
    >
      <View style={styles.msgAvatar}>
        <Icon name="headphones" size={14} color="#258B3E" />
      </View>
      <View style={[styles.bubble, styles.bubbleAgent, styles.typingBubble]}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                opacity: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

/* ------------------------------ SCREEN ------------------------------ */

const LiveChatScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      from: 'agent',
      text: 'Hi there! Welcome to support. How can we help you today?',
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const quickAnim = useRef(new Animated.Value(0)).current;
  const sendScale = useRef(new Animated.Value(1)).current;
  const liveDot = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bodyAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(inputAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(quickAnim, {
      toValue: 1,
      duration: 400,
      delay: 500,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDot, {
          toValue: 1.5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(liveDot, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      pulse.stop();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(sendScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      from: 'user',
      text: trimmed,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowQuick(false);
    scrollToEnd();

    // Simulated agent response
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
      scrollToEnd();
    }, 500);

    const replyTimer = setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          from: 'agent',
          text: getAutoReply(trimmed),
          time: getTime(),
        },
      ]);
      scrollToEnd();
    }, 2200);

    timers.current.push(typingTimer, replyTimer);
  };

  const canSend = input.trim().length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          scaleTo={0.88}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-left" size={20} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Icon name="headphones" size={20} color="#258B3E" />
          </View>
          <View>
            <LocalizedText style={styles.headerTitle}>{AGENT_NAME}</LocalizedText>
            <View style={styles.statusRow}>
              <View style={styles.liveDotWrapper}>
                <Animated.View
                  style={[styles.liveDotPulse, { transform: [{ scale: liveDot }] }]}
                />
                <View style={styles.liveDot} />
              </View>
              <LocalizedText style={styles.statusText}>Online</LocalizedText>
            </View>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages */}
        <Animated.View style={{ flex: 1, opacity: bodyAnim }}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={scrollToEnd}
          >
            <View style={styles.dayBadge}>
              <LocalizedText style={styles.dayBadgeText}>Today</LocalizedText>
            </View>

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {isTyping && <TypingIndicator />}

            {/* Quick replies */}
            {showQuick && (
              <Animated.View
                style={[
                  styles.quickWrapper,
                  {
                    opacity: quickAnim,
                    transform: [
                      {
                        translateY: quickAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [16, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {QUICK_REPLIES.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.quickChip}
                    activeOpacity={0.8}
                    onPress={() => sendMessage(q)}
                  >
                    <LocalizedText style={styles.quickText}>{q}</LocalizedText>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Input bar */}
        <Animated.View
          style={[
            styles.inputBar,
            {
              paddingBottom: Platform.OS === 'ios' ? insets.bottom || 12 : 12,
              opacity: inputAnim,
              transform: [
                {
                  translateY: inputAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <LocalizedTextInput
              style={styles.input}
              placeholder="Type your message"
              placeholderTextColor="#9e9e9e"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              activeOpacity={0.85}
              disabled={!canSend}
              onPress={() => sendMessage(input)}
            >
              <Icon name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  liveDotWrapper: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  liveDotPulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(37, 139, 62, 0.3)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#258B3E',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },

  // Messages
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  dayBadge: {
    alignSelf: 'center',
    backgroundColor: '#f5f6f8',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 18,
  },
  dayBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#9e9e9e',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  messageRowAgent: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 18,
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAgent: {
    backgroundColor: '#f5f6f8',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: '#258B3E',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  msgTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginTop: 4,
    marginLeft: 4,
  },
  msgTimeUser: {
    textAlign: 'right',
    marginRight: 4,
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 18,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#258B3E',
    marginHorizontal: 3,
  },

  // Quick replies
  quickWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    paddingLeft: 36,
  },
  quickChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#EAF5ED',
    borderWidth: 1.5,
    borderColor: '#d4f0dc',
  },
  quickText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    borderRadius: 18,
    paddingHorizontal: 16,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: '#c8e6d0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default LiveChatScreen;