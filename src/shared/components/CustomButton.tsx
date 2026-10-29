import React, { useEffect, useRef, useState } from 'react';
import LocalizedText from '../i18n/LocalizedText';
import { StyleSheet, ViewStyle, TextStyle, View, DimensionValue, Animated, Easing } from 'react-native';
import TouchableOpacity from './AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';

interface CustomButtonProps {
    title?: string;
    onPress: () => void;
    iconName?: string; // Optional icon for the right corner
    iconSize?: number;
    color?: string; // Background color
    textColor?: string; // Text color
    width?: DimensionValue;
    height?: DimensionValue;
    style?: ViewStyle | ViewStyle[]; // Custom style that overrides default
    textStyle?: TextStyle | TextStyle[];
    overrideDefaultStyle?: boolean; // If true, only your custom style is applied (base styles are removed)
    gradientColors?: string[]; // Kept for backwards compatibility but not using native module
    isLoading?: boolean; // Triggers the cart animation
}

const CustomButton = ({
    title = 'Button',
    onPress,
    iconName,
    iconSize = 20,
    color = '#258B3E',
    textColor = 'white',
    width = '100%',
    height = 55,
    style,
    textStyle,
    overrideDefaultStyle = false,
    gradientColors,
    isLoading = false,
}: CustomButtonProps) => {
    
    const [buttonWidth, setButtonWidth] = useState(0);
    const cartAnim = useRef(new Animated.Value(0)).current;
    
    // We will use the first gradient color or default color for the glow effect
    const primaryColor = gradientColors ? gradientColors[0] : color;
    
    useEffect(() => {
        if (isLoading && buttonWidth > 0) {
            Animated.timing(cartAnim, {
                toValue: buttonWidth - 60, // Move to the right end (subtracting icon width/padding)
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            cartAnim.setValue(0);
        }
    }, [isLoading, buttonWidth]);

    // Default base style for the button
    const defaultButtonStyle: ViewStyle = {
        width: '100%',
        height: height,
        backgroundColor: primaryColor,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        // Premium Glow/Shadow Effect
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10, 
    };

    const containerStyle = overrideDefaultStyle 
        ? style 
        : [defaultButtonStyle, style];

    return (
        <TouchableOpacity 
            style={containerStyle} 
            onPress={isLoading ? undefined : onPress} 
            activeOpacity={0.8}
            scaleTo={0.94}
            bounciness={14}
            onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}
        >
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Animated.View style={{ transform: [{ translateX: cartAnim }] }}>
                        <Icon name="shopping-cart" size={24} color={textColor} />
                    </Animated.View>
                </View>
            ) : (
                <>
                    <View style={styles.contentContainer}>
                        <LocalizedText style={[styles.defaultText, { color: textColor }, textStyle]}>
                            {title}
                        </LocalizedText>
                    </View>
                    {iconName && (
                        <View style={styles.iconContainer}>
                            <Icon name={iconName as any} size={iconSize} color={textColor} />
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1, // Add flex 1 to center the text again now that justifyContent center was removed from parent
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        width: '100%',
        alignItems: 'flex-start', // Start at the left edge
        justifyContent: 'center',
    },
    defaultText: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    iconContainer: {
        position: 'absolute',
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CustomButton;
