import React, { useRef, useEffect, useMemo } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import {
    View,
    StyleSheet,
    Image,
    Animated,
    Easing,
    Dimensions,
    PanResponder,
    TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import ImagePath from '../../../shared/constants/ImagePath';
import { safeVibrate } from '../../../shared/utils/vibration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TEXT_WINDOW_WIDTH = SCREEN_WIDTH - 50;

export interface OnboardingSlideItem {
    title: string;
    description: string;
    image: any;
}

interface OnboardingCardProps {
    title?: string;
    description?: string;
    image?: any;
    currentIndex: number;
    onNext: () => void;
    onPrev?: () => void;
    onSkip: () => void;
    slides?: OnboardingSlideItem[];
}

const OnboardingCard = ({
    title = '',
    description = '',
    image,
    currentIndex,
    onNext,
    onPrev,
    onSkip,
    slides,
}: OnboardingCardProps) => {
    const isAdvancing = useRef(false);

    // Continuous horizontal slide progress: 0 -> 1 -> 2 (100% native driver, 60 FPS)
    const slideAnim = useRef(new Animated.Value(currentIndex)).current;

    // Arrow kinetic micro-glides
    const arrowTranslateX = useRef(new Animated.Value(0)).current;

    // Fallback slides if not explicitly passed
    const defaultSlides: OnboardingSlideItem[] = useMemo(
        () => [
            {
                title: title || 'Manage Your Store\nfrom One Place',
                description: description || 'Track inventory, update prices and add\nnew products in just a few taps.',
                image: image || ImagePath.FirstBoardingImage,
            },
            {
                title: 'Process Orders\nFast and Accurately',
                description: 'Receive, pack and dispatch customer orders\nwith real-time status updates.',
                image: ImagePath.SecondBoardingImage,
            },
            {
                title: 'Keep Your Team\nin Sync',
                description: 'Assign tasks, manage staff roles and grow\nyour business together.',
                image: ImagePath.ThirdBoardingImage,
            },
        ],
        [title, description, image]
    );

    const slidesData = slides && slides.length > 0 ? slides : defaultSlides;
    const isFinalSlide = currentIndex >= slidesData.length - 1;

    // Top image continuous sliding left (hardware accelerated)
    const imageTranslateX = slideAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, -SCREEN_WIDTH, -2 * SCREEN_WIDTH],
    });

    // Bottom text continuous sliding left (hardware accelerated)
    const textTranslateX = slideAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, -TEXT_WINDOW_WIDTH, -2 * TEXT_WINDOW_WIDTH],
    });

    // Keep slide position synced with currentIndex without double-animating
    useEffect(() => {
        isAdvancing.current = false;
        slideAnim.setValue(currentIndex);
    }, [currentIndex, slideAnim]);

    // Ultra-snappy, zero-lag button press handler
    const handleNextPress = () => {
        if (isAdvancing.current) return;
        isAdvancing.current = true;
        safeVibrate(isFinalSlide ? 40 : 25);

        if (isFinalSlide) {
            onNext();
            isAdvancing.current = false;
            return;
        }

        const nextIndex = currentIndex + 1;

        // Snappy 250ms native slide - instant start, zero JS thread delay
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: nextIndex,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(arrowTranslateX, {
                    toValue: 24,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowTranslateX, {
                    toValue: -24,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.spring(arrowTranslateX, {
                    toValue: 0,
                    friction: 7,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(({ finished }) => {
            if (finished) {
                onNext();
            } else {
                isAdvancing.current = false;
            }
        });
    };

    const handlePrevPress = () => {
        if (isAdvancing.current || currentIndex <= 0) return;
        isAdvancing.current = true;
        safeVibrate(20);
        const prevIndex = currentIndex - 1;

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: prevIndex,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(arrowTranslateX, {
                    toValue: -24,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowTranslateX, {
                    toValue: 24,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.spring(arrowTranslateX, {
                    toValue: 0,
                    friction: 7,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(({ finished }) => {
            if (finished) {
                onPrev?.();
            }
            isAdvancing.current = false;
        });
    };

    // PanResponder attached ONLY to the top illustration area so button touches are never delayed
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    return (
                        Math.abs(gestureState.dx) > 18 &&
                        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
                    );
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dx < -50) {
                        handleNextPress();
                    } else if (gestureState.dx > 50 && currentIndex > 0) {
                        handlePrevPress();
                    }
                },
            }),
        [currentIndex, slidesData.length]
    );

    return (
        <View style={styles.container}>
            {/* Skip Button: Instant touch feedback */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
                activeOpacity={0.65}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
                <View style={styles.skipIconCircle}>
                    <Icon name="arrow-right" size={14} color="white" />
                </View>
            </TouchableOpacity>

            {/* Top Carousel: Full-Width Continuous Horizontal Ribbon (Gesture-enabled here only) */}
            <View style={styles.carouselTopWindow} {...panResponder.panHandlers}>
                <Animated.View
                    style={[
                        styles.carouselTopRow,
                        {
                            width: SCREEN_WIDTH * slidesData.length,
                            transform: [{ translateX: imageTranslateX }],
                        },
                    ]}
                >
                    {slidesData.map((slide, index) => {
                        const asset = Image.resolveAssetSource(slide.image);
                        const slideAspectRatio = asset?.width && asset?.height ? asset.width / asset.height : 1;
                        return (
                            <View key={index} style={styles.imageSlideItem}>
                                <Image
                                    source={slide.image}
                                    style={[styles.image, { aspectRatio: slideAspectRatio }]}
                                    resizeMode="cover"
                                />
                            </View>
                        );
                    })}
                </Animated.View>
            </View>

            {/* Stable White Bottom Card: Zero touch interception delay */}
            <View style={styles.bottomCard}>
                {/* Modern Pagination Pills: Crisp, zero-overhead styling */}
                <View style={styles.paginationContainer}>
                    {slidesData.map((_, index) => {
                        const isActive = currentIndex === index;
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    isActive ? styles.activeDot : styles.inactiveDot,
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Text Carousel Window: Continuous Horizontal Ribbon for Title & Description */}
                <View style={styles.textCarouselWindow}>
                    <Animated.View
                        style={[
                            styles.textCarouselRow,
                            {
                                width: TEXT_WINDOW_WIDTH * slidesData.length,
                                transform: [{ translateX: textTranslateX }],
                            },
                        ]}
                    >
                        {slidesData.map((slide, index) => (
                            <View key={index} style={styles.textSlideItem}>
                                <LocalizedText style={styles.title}>{slide.title}</LocalizedText>
                                <LocalizedText style={styles.description}>{slide.description}</LocalizedText>
                            </View>
                        ))}
                    </Animated.View>
                </View>

                {/* Next / Get Started Action Button: Instant 0ms tap response */}
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={isFinalSlide ? 'Finish onboarding' : 'Next onboarding screen'}
                    onPress={handleNextPress}
                    activeOpacity={0.8}
                    style={[
                        styles.nextButton,
                        isFinalSlide ? styles.getStartedButton : styles.standardNextButton,
                    ]}
                >
                    {isFinalSlide ? (
                        <View style={styles.buttonContentRow}>
                            <LocalizedText style={styles.getStartedText}>Get Started</LocalizedText>
                            <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                                <Icon name="arrow-right" size={20} color="white" />
                            </Animated.View>
                        </View>
                    ) : (
                        <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                            <Icon name="arrow-right" size={28} color="white" />
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ebf7ed',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 16,
        marginRight: 20,
        marginBottom: 8,
        zIndex: 10,
    },
    skipIconCircle: {
        backgroundColor: '#258B3E',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#258B3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    carouselTopWindow: {
        flex: 1,
        width: SCREEN_WIDTH,
        overflow: 'hidden',
    },
    carouselTopRow: {
        flexDirection: 'row',
        height: '100%',
    },
    imageSlideItem: {
        width: SCREEN_WIDTH,
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '120%',
    },
    bottomCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingTop: 28,
        paddingBottom: 38,
        alignItems: 'center',
        marginTop: -30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        height: 10,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#258B3E',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#d3d3d3',
    },
    textCarouselWindow: {
        width: TEXT_WINDOW_WIDTH,
        overflow: 'hidden',
        marginBottom: 20,
    },
    textCarouselRow: {
        flexDirection: 'row',
    },
    textSlideItem: {
        width: TEXT_WINDOW_WIDTH,
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 28,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
        lineHeight: 22,
    },
    nextButton: {
        backgroundColor: '#258B3E',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#258B3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 6,
        overflow: 'hidden',
    },
    standardNextButton: {
        width: 100,
    },
    getStartedButton: {
        width: 154,
    },
    buttonContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    getStartedText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginRight: 6,
    },
});

export default OnboardingCard;
