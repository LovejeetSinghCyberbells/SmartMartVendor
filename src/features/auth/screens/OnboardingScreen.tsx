import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingCard from '../components/OnboardingCard';
import ImagePath from '../../../shared/constants/ImagePath';

const onboardingData = [
    {
        title: 'Manage Your Store\nfrom One Place',
        description: 'Track inventory, update prices and add\nnew products in just a few taps.',
        image: ImagePath.FirstBoardingImage,
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
];

const OnBoardingScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const insets = useSafeAreaInsets();

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.replace('LoginScreen');
        }
    };

    const handleSkip = () => {
        navigation.replace('LoginScreen');
    };

    const currentData = onboardingData[currentIndex];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <OnboardingCard
                title={currentData.title}
                description={currentData.description}
                image={currentData.image}
                currentIndex={currentIndex}
                onNext={handleNext}
                onSkip={handleSkip}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});

export default OnBoardingScreen;