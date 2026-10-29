import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, TextInputProps } from 'react-native';
import TouchableOpacity from './AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useLocalization } from '../i18n/LocalizationProvider';

interface CustomInputProps extends TextInputProps {
    label: string;
    iconName?: string;
    onIconPress?: () => void;
    iconColor?: string;
    containerStyle?: any;
    backgroundColor?: string;
    leftComponent?: React.ReactNode; // Optional component to render on the left (like a country code picker)
    labelLeftOffset?: number; // Optional offset for the floating label (useful when leftComponent is present)
}

const CustomInput = ({
    label,
    iconName,
    onIconPress,
    iconColor = '#7a7a7a',
    containerStyle,
    backgroundColor = '#ffffff',
    leftComponent,
    labelLeftOffset = 15, // Default label left position
    value,
    onChangeText,
    ...props
}: CustomInputProps) => {
    const { t } = useLocalization();
    const [isFocused, setIsFocused] = useState(false);
    
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: (isFocused || value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        props.onFocus && props.onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        props.onBlur && props.onBlur(e);
    };

    const labelStyle = {
        position: 'absolute',
        left: labelLeftOffset,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: isFocused ? '#258B3E' : '#7a7a7a',
        backgroundColor: backgroundColor,
        paddingHorizontal: 5,
        zIndex: 1,
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[styles.inputContainer, { borderColor: isFocused ? '#258B3E' : '#d3d3d3' }]}>
                {/* Floating Label */}
                <Animated.Text style={labelStyle as any}>
                    {t(label)}
                </Animated.Text>
                
                {leftComponent && (
                    <View style={styles.leftComponentContainer}>
                        {leftComponent}
                    </View>
                )}

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor="#258B3E"
                    {...props}
                    placeholder={props.placeholder ? t(props.placeholder) : props.placeholder}
                />
                
                {iconName && (
                    <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
                        <Icon name={iconName as any} size={20} color={iconColor} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
    },
    inputContainer: {
        borderWidth: 1.5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 60,
    },
    leftComponentContainer: {
        marginRight: 10,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: '#1a1a1a',
        height: '100%',
        marginTop: 5,
    },
    iconContainer: {
        padding: 5,
        marginLeft: 10,
    }
});

export default CustomInput;
