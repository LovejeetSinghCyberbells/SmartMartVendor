import React, { useState, useRef, useEffect } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback, Modal, FlatList, Animated } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../../shared/components/CustomInput';
import CustomButton from '../../../shared/components/CustomButton';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingItems from './FloatingItems';
import { DEMO_OTP, isValidDemoOtp, isValidPhoneNumber } from '../utils/authValidation';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { BottomSheet, Dialog, Chip } from '../../../shared/components/common';

const { width } = Dimensions.get('window');

type LoginRole = 'vendor' | 'employee';

// Change these to your real navigator route names.
const ROLE_ROUTES: Record<LoginRole, string> = {
    vendor: 'MainNavigation',
    employee: 'DeliveryNavigation',
};

type FeatherIconName = React.ComponentProps<typeof Icon>['name'];

const ROLE_CONTENT: Record<
    LoginRole,
    {
        icon: FeatherIconName;
        title: string;
        subtitle: string;
        formTitle: string;
        chips: { icon: FeatherIconName; label: string }[];
    }
> = {
    vendor: {
        icon: 'shopping-bag',
        title: 'SmartMart Vendor',
        subtitle: 'Run your store, track orders and grow your sales, all in one app.',
        formTitle: 'Vendor Login',
        chips: [
            { icon: 'package', label: 'Inventory' },
            { icon: 'clipboard', label: 'Orders' },
            { icon: 'bar-chart-2', label: 'Reports' },
        ],
    },
    employee: {
        icon: 'users',
        title: 'SmartMart Staff',
        subtitle: 'Pick, pack and serve orders with your team, right from your phone.',
        formTitle: 'Employee Login',
        chips: [
            { icon: 'clipboard', label: 'Orders' },
            { icon: 'check-square', label: 'Tasks' },
            { icon: 'clock', label: 'Shifts' },
        ],
    },
};

const COUNTRIES = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
];

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { showDialog } = useFeedback();
    const insets = useSafeAreaInsets();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [storeCode, setStoreCode] = useState('');
    const [selectedRole, setSelectedRole] = useState<LoginRole>('vendor');
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

    // Role toggle
    const [toggleWidth, setToggleWidth] = useState(0);
    const toggleAnim = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(1)).current;

    const dot1Scale = useRef(new Animated.Value(1)).current;
    const dot2Scale = useRef(new Animated.Value(1)).current;
    const dot3Scale = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const content = ROLE_CONTENT[selectedRole];
    const segmentWidth = Math.max(0, (toggleWidth - 8) / 2);


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

        return () => {
            pulseAnimation.stop();
        };
    }, [pulseAnim]);

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

    const handleRoleChange = (role: LoginRole) => {
        if (role === selectedRole) return;
        setSelectedRole(role);
        Animated.spring(toggleAnim, {
            toValue: role === 'vendor' ? 0 : 1,
            friction: 7,
            tension: 80,
            useNativeDriver: true,
        }).start();
        contentFade.setValue(0);
        Animated.timing(contentFade, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    };

    const toggleCountryPicker = () => {
        setIsPickerVisible(!isPickerVisible);
    };

    const selectCountry = (item: any) => {
        setFlag(item.flag);
        setCountryCode(item.code);
        setIsPickerVisible(false);
    };

    const handleLogin = () => {
        if (selectedRole === 'employee' && storeCode.trim().length < 4) {
            showDialog('Check store code', 'Enter the store code (at least 4 characters) shared by your store owner.');
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
            navigation.replace(ROLE_ROUTES[selectedRole]);
        }, 3000);
    };

    const countryPrefix = (
        <TouchableOpacity style={styles.countryPickerContainer} onPress={toggleCountryPicker}>
            <LocalizedText style={styles.flagText}>{flag}</LocalizedText>
            <LocalizedText style={styles.countryCodeText}>{countryCode}</LocalizedText>
            <Icon name="chevron-down" size={16} color="#7a7a7a" />
            <View style={styles.verticalDivider} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>

                        {/* Top Illustration/Background Section (fills the remaining space) */}
                        <View
                            style={styles.headerSection}
                            onLayout={(e) => {
                                const h = Math.round(e.nativeEvent.layout.height);
                                // Keep the largest measured height so the floating items
                                // don't restart when the keyboard opens or the card grows.
                                setHeaderHeight((prev) => (h > prev ? h : prev));
                            }}
                        >
                            <Animated.View style={[styles.decorativeCircle1, { transform: [{ scale: pulseAnim }] }]} />
                            <Animated.View style={[styles.decorativeCircle2, { transform: [{ scale: pulseAnim }] }]} />

                            {headerHeight > 0 && <FloatingItems layer="back" travelHeight={headerHeight} />}
                            <Animated.View style={[styles.headerContent, { opacity: contentFade }]}>
                                <View style={styles.iconWrapper}>
                                    <Icon name={content.icon} size={44} color="#ffffff" />
                                </View>

                                <LocalizedText style={styles.welcomeTitle}>{content.title}</LocalizedText>
                                <LocalizedText style={styles.welcomeSubtitle}>{content.subtitle}</LocalizedText>

                                <View style={styles.chipRow}>
                                    {content.chips.map((chip) => (
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
                            </Animated.View>
                            {headerHeight > 0 && <FloatingItems layer="front" travelHeight={headerHeight} />}
                        </View>

                        {/* Bottom Form Section (height decided by its content) */}
                        <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
                            <Animated.View style={{ opacity: contentFade }}>
                                <LocalizedText style={styles.formTitle}>{content.formTitle}</LocalizedText>
                            </Animated.View>

                            {/* Vendor / Employee toggle */}
                            <View
                                style={styles.toggleContainer}
                                onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}
                            >
                                {toggleWidth > 0 && (
                                    <Animated.View
                                        style={[
                                            styles.toggleIndicator,
                                            {
                                                width: segmentWidth,
                                                transform: [{
                                                    translateX: toggleAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, segmentWidth],
                                                    }),
                                                }],
                                            },
                                        ]}
                                    />
                                )}
                                {(['vendor', 'employee'] as LoginRole[]).map((role) => {
                                    const active = selectedRole === role;
                                    return (
                                        <TouchableOpacity
                                            key={role}
                                            style={styles.toggleOption}
                                            onPress={() => handleRoleChange(role)}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: active }}
                                        >
                                            <Icon
                                                name={role === 'vendor' ? 'shopping-bag' : 'users'}
                                                size={16}
                                                color={active ? '#ffffff' : '#7a7a7a'}
                                            />
                                            <LocalizedText
                                                style={[styles.toggleText, active && styles.toggleTextActive]}
                                            >
                                                {role === 'vendor' ? 'Vendor' : 'Employee'}
                                            </LocalizedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {selectedRole === 'employee' && (
                                <View style={styles.storeCodeWrapper}>
                                    <CustomInput
                                        label="Store Code"
                                        value={storeCode}
                                        onChangeText={(value) =>
                                            setStoreCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12))
                                        }
                                        maxLength={12}
                                    />
                                </View>
                            )}

                            <CustomInput
                                label="Phone Number"
                                value={phoneNumber}
                                onChangeText={(value) => setPhoneNumber(value.replace(/\D/g, '').slice(0, 10))}
                                keyboardType="phone-pad"
                                leftComponent={countryPrefix}
                                labelLeftOffset={115}
                                maxLength={10}
                            />

                            {/* Submit Button placed right below input with Gradient */}
                            <CustomButton
                                title="Send OTP"
                                onPress={handleLogin}
                                isLoading={isLoading}
                                gradientColors={['#258B3E', '#1A632C']} // Rich gradient
                                style={styles.loginButton}
                            />

                            {/* Terms Text placed directly under the button */}
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

                            {selectedRole === 'vendor' ? (
                                <LocalizedText style={styles.signupPrompt}>
                                    New vendor?{' '}
                                    <LocalizedText
                                        style={styles.termsLink}
                                        onPress={() => navigation.navigate('SignupScreen')}
                                    >
                                        Register your store
                                    </LocalizedText>
                                </LocalizedText>
                            ) : (
                                <LocalizedText style={styles.signupPrompt}>
                                    No access yet? Ask your store owner to add you.
                                </LocalizedText>
                            )}
                        </View>

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
                title="Enter OTP"
                icon="shield"
                type="info"
                cancelText="Cancel"
                confirmText={isVerifying ? 'Verifying...' : 'Verify'}
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
        minHeight: 120,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 0,
        elevation: 0,
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
        bottom: 20,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(37, 139, 62, 0.1)',
    },
    headerContent: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        elevation: 1,
    },
    iconWrapper: {
        width: 84,
        height: 84,
        backgroundColor: '#258B3E',
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
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
        marginTop: 4,
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
        marginTop: 14,
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
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingTop: 24,
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
        marginBottom: 14,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f2',
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
        position: 'relative',
    },
    toggleIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#258B3E',
        shadowColor: '#258B3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    toggleOption: {
        flex: 1,
        height: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#7a7a7a',
    },
    toggleTextActive: {
        color: '#ffffff',
    },
    storeCodeWrapper: {
        marginBottom: 4,
    },
    countryPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    flagText: {
        fontSize: 22,
        marginRight: 5,
    },
    countryCodeText: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: '#1a1a1a',
        marginRight: 5,
    },
    verticalDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#d3d3d3',
        marginLeft: 10,
    },
    loginButton: {
        marginTop: 16,
        marginBottom: 12,
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
    signupPrompt: {
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

export default LoginScreen;