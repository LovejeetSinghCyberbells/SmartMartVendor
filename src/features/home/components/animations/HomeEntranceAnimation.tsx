import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

// ========== VENDOR ENTRANCE ANIMATION ==========
export interface UseVendorEntranceAnimationResult {
  headerStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  getSectionStyle: (sectionIndex: number) => {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  getStatCardStyle: (index: number) => {
    opacity: Animated.Value;
    transform: ({ scale: Animated.Value } | { translateY: Animated.Value })[];
  };
  isHeaderLanded: boolean;
}

export const useVendorEntranceAnimation = (
  isLoading: boolean,
  topInset: number = 47
): UseVendorEntranceAnimationResult => {
  const initialHeaderY = -(topInset + 180);

  const [isHeaderLanded, setIsHeaderLanded] = useState(false);

  const headerSlideY = useRef(new Animated.Value(initialHeaderY)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // 4 stat cards in header (Today's Orders, Pending, Ready, Earnings)
  const statCards = useRef([
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
  ]).current;

  // 3 main sections: Pending Orders, Quick Actions, Low Stock
  const feedSections = useRef([
    { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
  ]).current;

  useEffect(() => {
    if (!isLoading) {
      // Reset
      headerSlideY.setValue(initialHeaderY);
      headerOpacity.setValue(0);
      statCards.forEach((c) => {
        c.opacity.setValue(0);
        c.scale.setValue(0.6);
        c.translateY.setValue(16);
      });
      feedSections.forEach((sec) => {
        sec.opacity.setValue(0);
        sec.translateY.setValue(40);
      });

      const landTimer = setTimeout(() => {
        setIsHeaderLanded(true);
      }, 220);

      // Header animation
      Animated.parallel([
        Animated.timing(headerSlideY, {
          toValue: 0,
          duration: 680,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]).start();

      // Quick Stats pop-in stagger inside header
      const statTimers = statCards.map((card, idx) => {
        return setTimeout(() => {
          Animated.parallel([
            Animated.timing(card.opacity, {
              toValue: 1,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.spring(card.scale, {
              toValue: 1,
              friction: 5.5,
              tension: 190,
              useNativeDriver: true,
            }),
            Animated.spring(card.translateY, {
              toValue: 0,
              friction: 6,
              tension: 190,
              useNativeDriver: true,
            }),
          ]).start();
        }, 200 + idx * 75);
      });

      // Sections stagger
      const sectionTimers = feedSections.map((section, idx) => {
        return setTimeout(() => {
          Animated.parallel([
            Animated.timing(section.translateY, {
              toValue: 0,
              duration: 620,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(section.opacity, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
          ]).start();
        }, 440 + idx * 130);
      });

      return () => {
        clearTimeout(landTimer);
        statTimers.forEach((t) => clearTimeout(t));
        sectionTimers.forEach((t) => clearTimeout(t));
      };
    } else {
      setIsHeaderLanded(false);
    }
  }, [isLoading, topInset]);

  return {
    headerStyle: {
      opacity: headerOpacity,
      transform: [{ translateY: headerSlideY }],
    },
    getStatCardStyle: (index: number) => {
      const card = statCards[index] || {
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
        translateY: new Animated.Value(0),
      };
      return {
        opacity: card.opacity,
        transform: [{ scale: card.scale }, { translateY: card.translateY }],
      };
    },
    getSectionStyle: (sectionIndex: number) => {
      const section = feedSections[sectionIndex] || {
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
      };
      return {
        opacity: section.opacity,
        transform: [{ translateY: section.translateY }],
      };
    },
    isHeaderLanded,
  };
};

// Re-export the shared wrapper (if not already exported)
export const AnimatedSectionWrapper: React.FC<{
  style?: ViewStyle;
  animStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  children: ReactNode;
}> = ({ style, animStyle, children }) => {
  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
};

// ========== EMPLOYEE ENTRANCE ANIMATION ==========
export interface UseEmployeeEntranceAnimationResult {
  headerStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  getStatCardStyle: (index: number) => {
    opacity: Animated.Value;
    transform: ({ scale: Animated.Value } | { translateY: Animated.Value })[];
  };
  getSectionStyle: (sectionIndex: number) => {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  isHeaderLanded: boolean;
}

export const useEmployeeEntranceAnimation = (
  isLoading: boolean,
  topInset: number = 47
): UseEmployeeEntranceAnimationResult => {
  const initialHeaderY = -(topInset + 170);

  const [isHeaderLanded, setIsHeaderLanded] = useState(false);

  const headerSlideY = useRef(new Animated.Value(initialHeaderY)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // 3 stat cards for employee
  const statCards = useRef([
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
    { opacity: new Animated.Value(0), scale: new Animated.Value(0.6), translateY: new Animated.Value(16) },
  ]).current;

  // 3 sections: Stats, My Tasks, Quick Actions
  const feedSections = useRef([
    { opacity: new Animated.Value(0), translateY: new Animated.Value(36) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(36) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(36) },
  ]).current;

  useEffect(() => {
    if (!isLoading) {
      headerSlideY.setValue(initialHeaderY);
      headerOpacity.setValue(0);
      statCards.forEach((c) => {
        c.opacity.setValue(0);
        c.scale.setValue(0.6);
        c.translateY.setValue(16);
      });
      feedSections.forEach((sec) => {
        sec.opacity.setValue(0);
        sec.translateY.setValue(36);
      });

      const landTimer = setTimeout(() => {
        setIsHeaderLanded(true);
      }, 210);

      Animated.parallel([
        Animated.timing(headerSlideY, {
          toValue: 0,
          duration: 650,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 460,
          useNativeDriver: true,
        }),
      ]).start();

      const statTimers = statCards.map((card, idx) => {
        return setTimeout(() => {
          Animated.parallel([
            Animated.timing(card.opacity, {
              toValue: 1,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.spring(card.scale, {
              toValue: 1,
              friction: 5.5,
              tension: 190,
              useNativeDriver: true,
            }),
            Animated.spring(card.translateY, {
              toValue: 0,
              friction: 6,
              tension: 190,
              useNativeDriver: true,
            }),
          ]).start();
        }, 220 + idx * 75);
      });

      const sectionTimers = feedSections.map((section, idx) => {
        return setTimeout(() => {
          Animated.parallel([
            Animated.timing(section.translateY, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(section.opacity, {
              toValue: 1,
              duration: 460,
              useNativeDriver: true,
            }),
          ]).start();
        }, 440 + idx * 130);
      });

      return () => {
        clearTimeout(landTimer);
        statTimers.forEach((t) => clearTimeout(t));
        sectionTimers.forEach((t) => clearTimeout(t));
      };
    } else {
      setIsHeaderLanded(false);
    }
  }, [isLoading, topInset]);

  return {
    headerStyle: {
      opacity: headerOpacity,
      transform: [{ translateY: headerSlideY }],
    },
    getStatCardStyle: (index: number) => {
      const card = statCards[index] || {
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
        translateY: new Animated.Value(0),
      };
      return {
        opacity: card.opacity,
        transform: [{ scale: card.scale }, { translateY: card.translateY }],
      };
    },
    getSectionStyle: (sectionIndex: number) => {
      const section = feedSections[sectionIndex] || {
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
      };
      return {
        opacity: section.opacity,
        transform: [{ translateY: section.translateY }],
      };
    },
    isHeaderLanded,
  };
};
