import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { useFloorPager } from '../context/FloorPagerContext';
import { useStaffRole } from '../context/StaffRoleContext';
import { colors } from '../../../shared/theme/colors';

const { width } = Dimensions.get('window');

const ManagerSummonOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    activeIncomingAlert,
    activeIncomingNotification,
    activeOutgoingCall,
    acknowledgeAlert,
    dismissAlert,
    cancelOutgoingCall,
  } = useFloorPager();
  const { currentEmployee, switchEmployee } = useStaffRole();

  // Animation values for Urgent Ringing
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Animation values for Heads-Up Notification Banner
  const slideAnim = useRef(new Animated.Value(-140)).current;

  // Outgoing pulsing dot animation
  const callPulseAnim = useRef(new Animated.Value(1)).current;

  // Incoming Urgent Ring animations
  useEffect(() => {
    if (activeIncomingAlert && activeIncomingAlert.status === 'RINGING') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      const rippleLoop = Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );

      const shakeLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );

      pulseLoop.start();
      rippleLoop.start();
      shakeLoop.start();

      return () => {
        pulseLoop.stop();
        rippleLoop.stop();
        shakeLoop.stop();
      };
    }
  }, [activeIncomingAlert?.id, activeIncomingAlert?.status]);

  // Heads-Up Notification slide-in animation
  useEffect(() => {
    if (activeIncomingNotification && activeIncomingNotification.status === 'NOTIFIED') {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIncomingNotification?.id, activeIncomingNotification?.status]);

  // Outgoing Call pulsing animation
  useEffect(() => {
    if (activeOutgoingCall && activeOutgoingCall.status === 'RINGING') {
      const callPulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(callPulseAnim, { toValue: 1.25, duration: 400, useNativeDriver: true }),
          Animated.timing(callPulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      callPulseLoop.start();
      return () => callPulseLoop.stop();
    }
  }, [activeOutgoingCall?.id]);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.8, 0.4, 0],
  });

  const isSender =
    Boolean(activeIncomingAlert) &&
    activeIncomingAlert?.senderId === currentEmployee.id &&
    activeIncomingAlert?.targetEmployeeId !== currentEmployee.id;

  const showIncomingModal =
    Boolean(activeIncomingAlert) &&
    activeIncomingAlert?.status === 'RINGING' &&
    !isSender;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FULL-SCREEN URGENT 20-SECOND RINGING MODAL (FOR EMPLOYEE)  */}
      {/* ============================================================== */}
      {showIncomingModal && activeIncomingAlert && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => dismissAlert(activeIncomingAlert.id)}
        >
          <View style={styles.overlayRoot}>
            <View style={styles.backdrop} />

            <View style={styles.summonCard}>
              {/* Top Live Ringing Pill */}
              <View style={styles.topStatusPill}>
                <View style={styles.liveRingDot} />
                <LocalizedText style={styles.topStatusText}>
                  {activeIncomingAlert.status === 'ACKNOWLEDGED'
                    ? 'ACKNOWLEDGED • ON THE WAY'
                    : `PHONE RINGING • ${activeIncomingAlert.remainingSeconds}s LEFT`}
                </LocalizedText>
              </View>

              {/* Animated Sonar Rings & Bell */}
              <View style={styles.bellContainer}>
                {activeIncomingAlert.status === 'RINGING' && (
                  <>
                    <Animated.View
                      style={[
                        styles.rippleRing,
                        {
                          transform: [{ scale: rippleScale }],
                          opacity: rippleOpacity,
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.rippleRingSecond,
                        {
                          transform: [{ scale: rippleScale }],
                          opacity: rippleOpacity,
                        },
                      ]}
                    />
                  </>
                )}

                <Animated.View
                  style={[
                    styles.bellCircle,
                    activeIncomingAlert.status === 'ACKNOWLEDGED'
                      ? { backgroundColor: '#16a34a' }
                      : {
                          transform: [
                            { scale: pulseAnim },
                            {
                              rotate: shakeAnim.interpolate({
                                inputRange: [-10, 10],
                                outputRange: ['-10deg', '10deg'],
                              }),
                            },
                          ],
                        },
                  ]}
                >
                  <Icon
                    name={
                      activeIncomingAlert.status === 'ACKNOWLEDGED'
                        ? 'check'
                        : 'bell'
                    }
                    size={44}
                    color="#ffffff"
                  />
                </Animated.View>
              </View>

              {/* Urgent Title */}
              <LocalizedText style={styles.urgentTitle}>
                {activeIncomingAlert.status === 'ACKNOWLEDGED'
                  ? 'ON MY WAY TO CABIN!'
                  : 'PLEASE COME TO THE CABIN'}
              </LocalizedText>

              {/* Destination Badge */}
              <View style={styles.locationBadge}>
                <Icon name="map-pin" size={14} color="#15803d" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.locationText}>
                  Destination: {activeIncomingAlert.location}
                </LocalizedText>
              </View>

              {/* Manager Caller Card */}
              <View style={styles.callerCard}>
                <View style={styles.callerAvatar}>
                  <Icon name="user-check" size={18} color="#258B3E" />
                </View>
                <View style={styles.callerInfo}>
                  <LocalizedText style={styles.callerLabel}>Summoned by:</LocalizedText>
                  <LocalizedText style={styles.callerName}>
                    {activeIncomingAlert.senderName}
                  </LocalizedText>
                  <LocalizedText style={styles.callerRole}>
                    {activeIncomingAlert.senderRole}
                  </LocalizedText>
                </View>
              </View>

              {/* Message Text */}
              <View style={styles.messageBox}>
                <Icon name="message-square" size={14} color="#6b7280" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.messageText}>
                  "{activeIncomingAlert.message}"
                </LocalizedText>
              </View>

              {/* Timer Progress Indicator */}
              {activeIncomingAlert.status === 'RINGING' && (
                <>
                  <View style={styles.timerWrap}>
                    <View
                      style={[
                        styles.timerFill,
                        {
                          width: `${(activeIncomingAlert.remainingSeconds / 20) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <LocalizedText style={styles.timerCountdownText}>
                    Floor ringer auto-silences in {activeIncomingAlert.remainingSeconds} seconds
                  </LocalizedText>
                </>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {activeIncomingAlert.status === 'RINGING' ? (
                  <>
                    <TouchableOpacity
                      style={styles.ackBtn}
                      scaleTo={0.94}
                      onPress={() => acknowledgeAlert(activeIncomingAlert.id)}
                    >
                      <Icon name="navigation" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                      <LocalizedText style={styles.ackBtnText}>I'm On My Way</LocalizedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dismissBtn}
                      scaleTo={0.92}
                      onPress={() => dismissAlert(activeIncomingAlert.id)}
                    >
                      <Icon name="bell-off" size={16} color="#6b7280" style={{ marginRight: 6 }} />
                      <LocalizedText style={styles.dismissBtnText}>Silence</LocalizedText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.ackBtn, { backgroundColor: '#16a34a' }]}
                    scaleTo={0.94}
                    onPress={() => dismissAlert(activeIncomingAlert.id)}
                  >
                    <Icon name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <LocalizedText style={styles.ackBtnText}>Close</LocalizedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 2. HEADS-UP IN-STORE NOTIFICATION BANNER (FOR EMPLOYEE)        */}
      {/* ============================================================== */}
      {activeIncomingNotification && (
        <Animated.View
          style={[
            styles.headsUpContainer,
            { top: insets.top + 8, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headsUpCard}>
            <View style={styles.headsUpIconWrap}>
              <Icon name="bell" size={20} color="#258B3E" />
            </View>

            <View style={styles.headsUpBody}>
              <View style={styles.headsUpHeaderRow}>
                <LocalizedText style={styles.headsUpTag}>
                  MANAGER CABIN SUMMON
                </LocalizedText>
                <LocalizedText style={styles.headsUpSender}>
                  • {activeIncomingNotification.senderName}
                </LocalizedText>
              </View>

              <LocalizedText style={styles.headsUpLocation}>
                📍 Report to: {activeIncomingNotification.location}
              </LocalizedText>

              <LocalizedText style={styles.headsUpMessage} numberOfLines={2}>
                "{activeIncomingNotification.message}"
              </LocalizedText>

              <View style={styles.headsUpActionsRow}>
                <TouchableOpacity
                  style={styles.headsUpAckBtn}
                  scaleTo={0.94}
                  onPress={() => acknowledgeAlert(activeIncomingNotification.id)}
                >
                  <Icon name="check" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.headsUpAckBtnText}>
                    I'm On My Way
                  </LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headsUpDismissBtn}
                  scaleTo={0.94}
                  onPress={() => dismissAlert(activeIncomingNotification.id)}
                >
                  <LocalizedText style={styles.headsUpDismissBtnText}>
                    Dismiss
                  </LocalizedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ============================================================== */}
      {/* 3. MANAGER OUTGOING CALL HUD (FOR STORE MANAGER)               */}
      {/* ============================================================== */}
      {activeOutgoingCall && (
        <View style={[styles.outgoingHudContainer, { bottom: insets.bottom + 70 }]}>
          <View style={styles.outgoingHudCard}>
            <View style={styles.outgoingTopRow}>
              <View style={styles.outgoingPulseRow}>
                <Animated.View
                  style={[
                    styles.outgoingPulseDot,
                    { transform: [{ scale: callPulseAnim }] },
                  ]}
                />
                <LocalizedText style={styles.outgoingTag}>
                  RINGING EMPLOYEE PHONE • {activeOutgoingCall.remainingSeconds}s
                </LocalizedText>
              </View>

              <TouchableOpacity
                style={styles.outgoingCancelBtn}
                scaleTo={0.92}
                onPress={cancelOutgoingCall}
              >
                <Icon name="x" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.outgoingDetailsRow}>
              <View style={styles.outgoingAvatar}>
                <Icon name="user" size={18} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.outgoingTargetName}>
                  {activeOutgoingCall.targetEmployeeName}
                </LocalizedText>
                <LocalizedText style={styles.outgoingLocation}>
                  Summoned to: {activeOutgoingCall.location}
                </LocalizedText>
              </View>
            </View>

            {/* Outgoing Progress Track */}
            <View style={styles.outgoingTrack}>
              <View
                style={[
                  styles.outgoingFill,
                  {
                    width: `${(activeOutgoingCall.remainingSeconds / 20) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Demo Switch Action for single device test */}
            <View style={styles.outgoingBottomRow}>
              <TouchableOpacity
                style={styles.demoSwitchBtn}
                scaleTo={0.94}
                onPress={() => {
                  switchEmployee(activeOutgoingCall.targetEmployeeId);
                }}
              >
                <Icon name="smartphone" size={14} color="#1d4ed8" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.demoSwitchText}>
                  Switch to {activeOutgoingCall.targetEmployeeName} to Answer (Demo)
                </LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  summonCard: {
    width: width - 40,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  topStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  liveRingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  topStatusText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#b91c1c',
    letterSpacing: 0.5,
  },
  bellContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bellCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  rippleRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rippleRingSecond: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#f87171',
  },
  urgentTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803d',
  },
  callerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  callerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  callerInfo: {
    flex: 1,
  },
  callerLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  callerName: {
    fontSize: 13.5,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  callerRole: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  timerWrap: {
    width: '100%',
    height: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
  timerCountdownText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  ackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#258B3E',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  ackBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  dismissBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },

  /* Heads-Up Notification Banner */
  headsUpContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  headsUpCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#c6e8cf',
  },
  headsUpIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headsUpBody: {
    flex: 1,
  },
  headsUpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headsUpTag: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
    letterSpacing: 0.5,
  },
  headsUpSender: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  headsUpLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  headsUpMessage: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    lineHeight: 16,
    marginBottom: 8,
  },
  headsUpActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headsUpAckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#258B3E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  headsUpAckBtnText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  headsUpDismissBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  headsUpDismissBtnText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },

  /* Outgoing Call Floating HUD */
  outgoingHudContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9998,
  },
  outgoingHudCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
  },
  outgoingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outgoingPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outgoingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  outgoingTag: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Bold',
    color: '#b91c1c',
    letterSpacing: 0.4,
  },
  outgoingCancelBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outgoingDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outgoingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  outgoingTargetName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  outgoingLocation: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  outgoingTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  outgoingFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  outgoingBottomRow: {
    alignItems: 'flex-start',
  },
  demoSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  demoSwitchText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#1d4ed8',
  },
});

export default ManagerSummonOverlay;
