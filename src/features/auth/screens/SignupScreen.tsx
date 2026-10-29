import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback, Modal, FlatList, Animated, Easing } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../../shared/components/CustomButton';
import FloatingItems from './FloatingItems';
import { DEMO_OTP, isValidDemoOtp, isValidPhoneNumber } from '../utils/authValidation';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { BottomSheet, Dialog, Chip } from '../../../shared/components/common';

const { width } = Dimensions.get('window');

// Change to your real navigator route name for a newly registered vendor.
const VENDOR_ROUTE = 'MainNavigation';

type FeatherIconName = React.ComponentProps<typeof Icon>['name'];

const CHIPS: { icon: FeatherIconName; label: string }[] = [
    { icon: 'package', label: 'Inventory' },
    { icon: 'clipboard', label: 'Orders' },
    { icon: 'users', label: 'Team' },
];

const COUNTRIES = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
];

const SignupScreen = () => {
    const navigation = useNavigation<any>();
    const { showDialog } = useFeedback();
    const insets = useSafeAreaInsets();
    const [fullName, setFullName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [flag, setFlag] = useState('🇮🇳');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // OTP Modal states
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const otpInputs = useRef<any>([]);

    // Header fills whatever space the form card leaves; we measure it for the floating items.
    const [headerHeight, setHeaderHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const dot1Scale = useRef(new Animated.Value(1)).current;
    const dot2Scale = useRef(new Animated.Value(1)).current;
    const dot3Scale = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const headerEntrance = useRef(new Animated.Value(0)).current;
    const formEntrance = useRef(new Animated.Value(0)).current;
    const iconEntrance = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ])
        );
        pulseAnimation.start();

        const entranceAnimation = Animated.stagger(120, [
            Animated.timing(headerEntrance, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(formEntrance, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);
        entranceAnimation.start();
        const iconAnimation = Animated.spring(iconEntrance, {
            toValue: 1,
            friction: 6,
            tension: 55,
            useNativeDriver: true,
        });
        iconAnimation.start();

        return () => {
            pulseAnimation.stop();
            entranceAnimation.stop();
            iconAnimation.stop();
        };
    }, [
        pulseAnim,
        headerEntrance,
        formEntrance,
        iconEntrance,
    ]);

    useEffect(() => {
        let dotsAnimation: Animated.CompositeAnimation | undefined;
        if (isVerifying) {
            dotsAnimation = Animated.loop(
                Animated.stagger(150, [
                    Animated.sequence([
                        Animated.timing(dot1Scale, { toValue: 1.5, duration: 250, useNativeDriver: true }),
                        Animated.timing(dot1Scale, { toValue: 1, duration: 250, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot2Scale, { toValue: 2, duration: 250, useNativeDriver: true }),
                        Animated.timing(dot2Scale, { toValue: 1, duration: 250, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot3Scale, { toValue: 1.5, duration: 250, useNativeDriver: true }),
                        Animated.timing(dot3Scale, { toValue: 1, duration: 250, useNativeDriver: true }),
                    ])
                ])
            );
            dotsAnimation.start();
        } else {
            dot1Scale.setValue(1);
            dot2Scale.setValue(1);
            dot3Scale.setValue(1);
        }

        return () => dotsAnimation?.stop();
    }, [isVerifying, dot1Scale, dot2Scale, dot3Scale]);

    const toggleCountryPicker = () => {
        setIsPickerVisible(!isPickerVisible);
    };

    const selectCountry = (item: any) => {
        setFlag(item.flag);
        setCountryCode(item.code);
        setIsPickerVisible(false);
    };

    const handleSignup = () => {
        if (fullName.trim().length < 2) {
            showDialog('Check your name', 'Enter the store owner’s full name to continue.');
            return;
        }
        if (storeName.trim().length < 2) {
            showDialog('Check store name', 'Enter your store name to continue.');
            return;
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            showDialog('Check phone number', 'Enter 7 to 10 digits for the selected country.');
            return;
        }
        setOtp(['', '', '', '']);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsOtpModalVisible(true);
        }, 1000);
    };

    const handleVerifyOTP = () => {
        if (!isValidDemoOtp(otp.join(''))) {
            showDialog('Invalid demo code', `Enter ${DEMO_OTP} to continue. No SMS is sent in demo mode.`);
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setIsOtpModalVisible(false);
            navigation.replace(VENDOR_ROUTE);
        }, 3000);
    };

    return (
        <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* No ScrollView: the card is as tall as its content and the header takes the rest. */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>

                        {/* Top Illustration/Background Section (fills the remaining space) */}
                        <Animated.View
                            style={[
                                styles.headerSection,
                                {
                                    opacity: headerEntrance,
                                    transform: [
                                        {
                                            translateY: headerEntrance.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                            onLayout={(e) => {
                                const h = Math.round(e.nativeEvent.layout.height);
                                // Keep the largest measured height so the floating items
                                // don't restart when the keyboard opens.
                                setHeaderHeight((prev) => (h > prev ? h : prev));
                            }}
                        >
                            <Animated.View style={[styles.decorativeCircle1, { transform: [{ scale: pulseAnim }] }]} />
                            <Animated.View style={[styles.decorativeCircle2, { transform: [{ scale: pulseAnim }] }]} />

                            {headerHeight > 0 && <FloatingItems layer="back" travelHeight={headerHeight} />}
                            <View style={styles.headerContent}>
                                <Animated.View
                                    style={[
                                        styles.iconWrapper,
                                        {
                                            transform: [
                                                {
                                                    scale: iconEntrance.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0.65, 1],
                                                    }),
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <Icon name="shopping-bag" size={40} color="#ffffff" />
                                </Animated.View>

                                <LocalizedText style={styles.welcomeTitle}>Register Your Store</LocalizedText>

                                {!keyboardVisible && (
                                    <>
                                        <LocalizedText style={styles.welcomeSubtitle}>
                                            Set up your SmartMart vendor account and start selling in minutes.
                                        </LocalizedText>

                                        <View style={styles.chipRow}>
                                            {CHIPS.map((chip) => (
                                                <Chip
                                                    key={chip.label}
                                                    label={chip.label}
                                                    icon={chip.icon}
                                                    size="sm"
                                                    activeColor="#1A632C"
                                                    inactiveColor="#1A632C"
                                                    inactiveBackgroundColor="rgba(255, 255, 255, 0.85)"
                                                    style={styles.chip}
                                                />
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>
                            {headerHeight > 0 && <FloatingItems layer="front" travelHeight={headerHeight} />}
                        </Animated.View>

                        {/* Bottom Form Section (height decided by its content) */}
                        <Animated.View
                            style={[
                                styles.bottomCard,
                                { paddingBottom: Math.max(insets.bottom, 12) + 10 },
                                {
                                    opacity: formEntrance,
                                    transform: [
                                        {
                                            translateY: formEntrance.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [32, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <LocalizedText style={styles.formTitle}>Vendor Sign Up</LocalizedText>

                            {/* Full Name Field */}
                            <LocalizedText style={styles.inputLabel}>Owner Name</LocalizedText>
                            <View style={styles.inputContainer}>
                                <Icon name="user" size={18} color="#7a7a7a" style={styles.inputIcon} />
                                <LocalizedTextInput
                                    style={styles.textInput}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9e9e9e"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            {/* Store Name Field */}
                            <LocalizedText style={styles.inputLabel}>Store Name</LocalizedText>
                            <View style={styles.inputContainer}>
                                <Icon name="shopping-bag" size={18} color="#7a7a7a" style={styles.inputIcon} />
                                <LocalizedTextInput
                                    style={styles.textInput}
                                    placeholder="Enter your store name"
                                    placeholderTextColor="#9e9e9e"
                                    value={storeName}
                                    onChangeText={setStoreName}
                                />
                            </View>

                            {/* Phone Number Field */}
                            <LocalizedText style={styles.inputLabel}>Phone Number</LocalizedText>
                            <View style={styles.inputContainer}>
                                <TouchableOpacity style={styles.countryPickerContainer} onPress={toggleCountryPicker}>
                                    <LocalizedText style={styles.flagText}>{flag}</LocalizedText>
                                    <LocalizedText style={styles.countryCodeText}>{countryCode}</LocalizedText>
                                    <Icon name="chevron-down" size={16} color="#7a7a7a" />
                                    <View style={styles.verticalDivider} />
                                </TouchableOpacity>
                                <LocalizedTextInput
                                    style={[styles.textInput, styles.phoneInput]}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#9e9e9e"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChangeText={(value) => setPhoneNumber(value.replace(/\D/g, '').slice(0, 10))}
                                />
                            </View>

                            {/* Sign Up Button */}
                            <CustomButton
                                title="Send OTP"
                                onPress={handleSignup}
                                isLoading={isLoading}
                                gradientColors={['#258B3E', '#1A632C']}
                                style={styles.signupButton}
                            />

                            <LocalizedText style={styles.termsText}>
                                By continuing, you agree to our{' '}
                                <LocalizedText
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('TermsOfServiceScreen')}
                                >
                                    Terms of Service
                                </LocalizedText>
                                {' '}and{' '}
                                <LocalizedText
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('PrivacyPolicyScreen')}
                                >
                                    Privacy Policy
                                </LocalizedText>
                            </LocalizedText>
                            <LocalizedText style={styles.loginPrompt}>
                                Already registered?{' '}
                                <LocalizedText
                                    style={styles.termsLink}
                                    onPress={() => navigation.goBack()}
                                >
                                    Log in
                                </LocalizedText>
                            </LocalizedText>
                        </Animated.View>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Country Picker Bottom Sheet */}
            <BottomSheet
                visible={isPickerVisible}
                onClose={toggleCountryPicker}
                title="Select Country"
                contentStyle={{ maxHeight: '70%' }}
            >
                <FlatList
                    data={COUNTRIES}
                    keyExtractor={(item) => item.code + item.name}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.countryItem} scaleTo={0.97} onPress={() => selectCountry(item)}>
                            <LocalizedText style={styles.countryItemFlag}>{item.flag}</LocalizedText>
                            <LocalizedText style={styles.countryItemName}>{item.name}</LocalizedText>
                            <LocalizedText style={styles.countryItemCode}>{item.code}</LocalizedText>
                        </TouchableOpacity>
                    )}
                />
            </BottomSheet>

            {/* OTP Dialog */}
            <Dialog
                visible={isOtpModalVisible}
                onClose={() => setIsOtpModalVisible(false)}
                title="Verify Phone"
                icon="shield"
                type="info"
                cancelText="Cancel"
                confirmText={isVerifying ? 'Verifying...' : 'Verify & Register'}
                loading={isVerifying}
                onConfirm={handleVerifyOTP}
            >
                <LocalizedText style={styles.otpSubtitle}>
                    {`Demo only: no SMS is sent. Use ${DEMO_OTP} to continue.`}
                </LocalizedText>
                <LocalizedText style={[styles.otpSubtitle, { marginTop: -15, fontWeight: '600', color: '#258B3E' }]}>
                    {countryCode} {phoneNumber}
                </LocalizedText>

                <View style={styles.otpInputContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <LocalizedTextInput
                            key={index}
                            ref={(ref: any) => {
                                otpInputs.current[index] = ref;
                            }}
                            style={[
                                styles.otpInput,
                                otp[index] ? styles.otpInputFilled : null
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={otp[index]}
                            onChangeText={(text) => {
                                const newOtp = [...otp];
                                newOtp[index] = text.replace(/\D/g, '').slice(0, 1);
                                setOtp(newOtp);

                                if (newOtp[index] && index < 3) {
                                    otpInputs.current[index + 1].focus();
                                }
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                                    otpInputs.current[index - 1].focus();
                                    const newOtp = [...otp];
                                    newOtp[index - 1] = '';
                                    setOtp(newOtp);
                                }
                            }}
                        />
                    ))}
                </View>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
    },
    headerSection: {
        flex: 1,                 // takes all the space the card doesn't need
        minHeight: 110,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 0,
        elevation: 0,
    },
    headerContent: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        elevation: 1,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -width * 0.2,
        right: -width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(37, 139, 62, 0.15)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: 10,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(37, 139, 62, 0.1)',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        backgroundColor: '#258B3E',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#258B3E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 2,
    },
    welcomeTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 6,
        zIndex: 2,
    },
    welcomeSubtitle: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
        paddingHorizontal: 30,
        zIndex: 2,
    },
    chipRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        zIndex: 2,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        marginHorizontal: 4,
    },
    chipText: {
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        color: '#1A632C',
        marginLeft: 5,
    },
    bottomCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingTop: 22,
        // paddingBottom is set inline from the safe-area inset
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 15,
    },
    formTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#eee',
        paddingHorizontal: 14,
        height: 50,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#1a1a1a',
        height: '100%',
    },
    phoneInput: {
        paddingLeft: 10,
    },
    countryPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    flagText: {
        fontSize: 20,
        marginRight: 5,
    },
    countryCodeText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#1a1a1a',
        marginRight: 5,
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#d3d3d3',
        marginLeft: 10,
    },
    signupButton: {
        marginTop: 4,
        marginBottom: 10,
    },
    termsText: {
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
        lineHeight: 16,
    },
    termsLink: {
        color: '#258B3E',
        fontFamily: 'Poppins-Medium',
    },
    loginPrompt: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    countryItemFlag: {
        fontSize: 24,
        marginRight: 15,
    },
    countryItemName: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: '#1a1a1a',
    },
    countryItemCode: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
    },
    otpModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    otpTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    otpSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1.5,
        borderColor: '#e8e8e8',
        borderRadius: 15,
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    otpInputFilled: {
        borderColor: '#258B3E',
        backgroundColor: '#f4fbf6',
    },
    verifyButton: {
        backgroundColor: '#258B3E',
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#258B3E",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    verifyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        marginHorizontal: 10,
    },
});

export default SignupScreen;