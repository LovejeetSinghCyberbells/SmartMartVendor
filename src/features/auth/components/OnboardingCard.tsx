import React, { useRef, useEffect, useMemo } from 'react';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { View, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingCardProps {
    title: string;
    description: string;
    image: any;
    currentIndex: number;
    onNext: () => void;
    onSkip: () => void;
}

const OnboardingCard = ({ title, description, image, currentIndex, onNext, onSkip }: OnboardingCardProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const arrowTranslateX = useRef(new Animated.Value(-60)).current;
    const arrowOpacity = useRef(new Animated.Value(0)).current;
    // 0 = entering from right, 1 = settled active in center, 2 = exiting to left (pure sliding left, no fading)
    const slideAnim = useRef(new Animated.Value(0)).current;
    const isAdvancing = useRef(false);

    const aspectRatio = useMemo(() => {
        const asset = Image.resolveAssetSource(image);
        return asset?.width && asset?.height ? asset.width / asset.height : 1;
    }, [image]);

    // Horizontal sliding left ONLY (no fading/opacity changes)
    const slideTranslateX = slideAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [SCREEN_WIDTH, 0, -SCREEN_WIDTH],
    });

    useEffect(() => {
        isAdvancing.current = false;
        arrowTranslateX.setValue(-60);
        arrowOpacity.setValue(0);
        slideAnim.setValue(0);

        // Slide left into view (pure horizontal slide, 100% opacity)
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 320,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(arrowTranslateX, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(arrowOpacity, {
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex, arrowTranslateX, arrowOpacity, slideAnim]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 5,
            tension: 140,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 140,
            useNativeDriver: true,
        }).start();
    };

    const handleNextPress = () => {
        if (isAdvancing.current) return;
        isAdvancing.current = true;

        // Slide left off-screen to -SCREEN_WIDTH (pure sliding left only), then advance to next slide
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 2,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(arrowTranslateX, {
                toValue: 60,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(arrowOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                onNext();
            } else {
                isAdvancing.current = false;
            }
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
            >
                <View style={styles.skipIconCircle}>
                    <Icon name="arrow-right" size={14} color="white" />
                </View>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.imageContainer,
                    {
                        transform: [{ translateX: slideTranslateX }],
                    },
                ]}
            >
                <Image
                    source={image}
                    style={[styles.image, { aspectRatio }]}
                    resizeMode="cover"
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.bottomCard,
                    {
                        transform: [{ translateX: slideTranslateX }],
                    },
                ]}
            >
                <View style={styles.paginationContainer}>
                    {[0, 1, 2].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
                <LocalizedText style={styles.title}>{title}</LocalizedText>
                <LocalizedText style={styles.description}>{description}</LocalizedText>

                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={currentIndex === 2 ? 'Finish onboarding' : 'Next onboarding screen'}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleNextPress}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.nextButton, { transform: [{ scale: scaleAnim }] }]}>
                        <Animated.View style={{ transform: [{ translateX: arrowTranslateX }], opacity: arrowOpacity }}>
                            <Icon name="arrow-right" size={28} color="white" />
                        </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
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
        marginBottom: 12,
    },
    skipIconCircle: {
        backgroundColor: '#258B3E',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',          
    },
    image: {
        width: '100%',               
        height:"120%"
    },
    bottomCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 40,
        alignItems: 'center',
        marginTop: -30,            
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 22,
        backgroundColor: '#258B3E',
    },
    inactiveDot: {
        backgroundColor: '#d3d3d3',
    },
    title: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#7a7a7a',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    nextButton: {
        backgroundColor: '#258B3E',
        width: 100,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#258B3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden',
    },
});

export default OnboardingCard;