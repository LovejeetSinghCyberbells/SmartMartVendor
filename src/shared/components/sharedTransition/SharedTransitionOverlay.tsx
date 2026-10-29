import React, { useEffect, useRef, useState } from 'react';
import LocalizedText from '../../i18n/LocalizedText';
import { View, StyleSheet, Dimensions, Animated, Easing, Image, ScrollView, PanResponder, FlatList, Platform } from 'react-native';
import TouchableOpacity from '../AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSharedTransition } from './SharedTransitionContext';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SIMILAR_PRODUCTS = [
  { id: '1', name: 'Fortune Soyabean Refined Oil', size: '5 L', price: '₹10', originalPrice: '₹12', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553609.png' },
  { id: '2', name: 'Fortune Rice Bran Refined Oil', size: '5 L', price: '₹15', originalPrice: '₹18', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553609.png' },
];
const PRODUCT_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci, sem feugiat ut nullam nisl orci, volutpat, felis. Nunc elit, et mattis commodo condimentum tellus et. Carefully selected for freshness and quality, this product is a reliable choice for your everyday needs.';

interface SlideItem {
  id: string;
  uri?: string;
  source?: any;
  label: string;
}

const getProductGallery = (prodItem: any): SlideItem[] => {
  if (prodItem?.images && Array.isArray(prodItem.images) && prodItem.images.length > 0) {
    const labels = ['Front View', 'Back & Ingredients', 'Side View', 'Nutrition & Seal'];
    return prodItem.images.map((img: any, idx: number) => ({
      id: String(idx),
      uri: typeof img === 'string' ? img : undefined,
      source: typeof img !== 'string' ? img : undefined,
      label: labels[idx] || `Side ${idx + 1}`,
    }));
  }

  const name = (prodItem?.name || '').toLowerCase();
  const primaryImg = prodItem?.image || 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png';

  if (name.includes('surf') || name.includes('detergent') || (typeof primaryImg === 'string' && primaryImg.includes('2553691'))) {
    return [
      { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', label: 'Front Pack' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Ingredients' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/2553/2553673.png', label: 'Side & Open Pack' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: 'Nutrition Facts & Seal' },
    ];
  }

  if (name.includes('oil') || name.includes('fortune') || name.includes('dal')) {
    return [
      { id: '1', uri: typeof primaryImg === 'string' ? primaryImg : 'https://cdn-icons-png.flaticon.com/512/2553/2553609.png', label: 'Front Bottle' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Nutritional Info' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/2553/2553634.png', label: 'Side & Pouring Spout' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: 'Purity & Quality Seal' },
    ];
  }

  if (name.includes('apple') || name.includes('fruit')) {
    return [
      { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', label: 'Fresh Whole Fruit' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/415/415682.png', label: 'Sliced Cross-Section' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082011.png', label: 'Farm Fresh Box' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: 'Organic Certified' },
    ];
  }

  if (name.includes('atta') || name.includes('flour') || name.includes('aashirvaad')) {
    return [
      { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/3014/3014436.png', label: 'Pack Front' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Nutrition Table' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', label: '100% Whole Wheat Grain' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3014/3014476.png', label: 'Soft Roti Preparation' },
    ];
  }

  if (name.includes('milk') || name.includes('dairy')) {
    return [
      { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/869/869687.png', label: 'Carton Front' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Barcode' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', label: 'Poured Milk Glass' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: 'Pure Dairy Certified' },
    ];
  }

  if (name.includes('juice') || name.includes('drink')) {
    return [
      { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/2405/2405597.png', label: 'Bottle Front' },
      { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Ingredients' },
      { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/2405/2405451.png', label: 'Fresh Pour & Pulp' },
      { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: '100% Real Juice Seal' },
    ];
  }

  return [
    { id: '1', uri: typeof primaryImg === 'string' ? primaryImg : undefined, source: typeof primaryImg !== 'string' ? primaryImg : undefined, label: 'Front View' },
    { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', label: 'Back & Ingredients' },
    { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/2553/2553673.png', label: 'Side Profile' },
    { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/3655/3655589.png', label: 'Nutrition Facts & Seal' },
  ];
};

interface SharedTransitionOverlayProps {
  onNavigateToCart: () => void;
  onNavigateToShop: () => void;
  onNavigateToReviews: (item: any) => void;
}

export const SharedTransitionOverlay = ({
  onNavigateToCart,
  onNavigateToShop,
  onNavigateToReviews,
}: SharedTransitionOverlayProps) => {
  const {
    activeItem,
    sourceLayout,
    isOverlayVisible,
    closeProduct,
    openProduct,
  } = useSharedTransition();

  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const animProgress = useRef(new Animated.Value(0)).current;
  const contentProgress = useRef(new Animated.Value(0)).current;
  const bottomBarAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const carouselRef = useRef<FlatList>(null);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const similarCardRefs = useRef<
    Record<string, React.ElementRef<typeof View> | null>
  >({});
  const detailsLayoutY = useRef(0);
  const reviewsLayoutY = useRef(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const wasOverlayVisible = useRef(false);
  const openingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (activeItem && sourceLayout) {
      setVisible(true);
      setIsClosing(false);
      setIsTransitioning(true);
      setIsFavorite(false);
      setIsDescriptionExpanded(false);
      dragY.setValue(0);
      contentProgress.setValue(0);
      bottomBarAnim.setValue(0);
      animProgress.setValue(0);
      backdropOpacity.setValue(0);
      scrollX.setValue(0);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      carouselRef.current?.scrollToOffset({ offset: 0, animated: false });

      const openingFrame = requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(animProgress, {
            toValue: 1,
            duration: 500,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: Platform.OS === 'android',
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();

        const contentTimer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(contentProgress, {
              toValue: 1,
              duration: 340,
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.spring(bottomBarAnim, {
              toValue: 1,
              friction: 8,
              tension: 38,
              useNativeDriver: true,
            }),
          ]).start();
        }, 240);

        const hardwareLayerTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 620);

        openingTimers.current = [contentTimer, hardwareLayerTimer];
      });

      return () => {
        cancelAnimationFrame(openingFrame);
        openingTimers.current.forEach(clearTimeout);
        openingTimers.current = [];
      };
    }
  }, [
    activeItem,
    sourceLayout,
    animProgress,
    backdropOpacity,
    bottomBarAnim,
    contentProgress,
    dragY,
    scrollX,
  ]);

  useEffect(() => {
    if (!isOverlayVisible) {
      wasOverlayVisible.current = false;
      return;
    }

    if (!wasOverlayVisible.current || !activeItem || !sourceLayout) {
      wasOverlayVisible.current = true;
      return;
    }

    wasOverlayVisible.current = true;
    setIsTransitioning(true);
    contentProgress.setValue(0);
    bottomBarAnim.setValue(0);
    backdropOpacity.setValue(0);

    const returnAnimation = Animated.parallel([
      Animated.timing(contentProgress, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(bottomBarAnim, {
        toValue: 1,
        friction: 8,
        tension: 42,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    returnAnimation.start(({ finished }) => {
      if (finished) {
        setIsTransitioning(false);
      }
    });

    return () => returnAnimation.stop();
  }, [
    isOverlayVisible,
    activeItem,
    sourceLayout,
    contentProgress,
    bottomBarAnim,
    backdropOpacity,
  ]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsTransitioning(true);

    // Reverse flow: quick content fade out, smooth cubic-bezier shrink to card position
    Animated.parallel([
      Animated.timing(contentProgress, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 420,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: Platform.OS === 'android',
      }),
      Animated.timing(dragY, {
        toValue: 0,
        duration: 380,
        useNativeDriver: Platform.OS === 'android',
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setIsClosing(false);
      setIsTransitioning(false);
      closeProduct();
    });
  };

  // Drag down PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 8 && Math.abs(gestureState.dx) < 15;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.55) {
          handleClose();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: Platform.OS === 'android',
          }).start();
        }
      },
    })
  ).current;

  if (!visible || !isOverlayVisible || !activeItem || !sourceLayout) {
    return null;
  }

  const gallery = getProductGallery(activeItem);

  const handleDotPress = (index: number) => {
    carouselRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const scrollToReviews = () => {
    scrollRef.current?.scrollTo({
      y: detailsLayoutY.current + reviewsLayoutY.current,
      animated: true,
    });
  };

  const openSimilarProduct = (product: (typeof SIMILAR_PRODUCTS)[number]) => {
    similarCardRefs.current[product.id]?.measureInWindow((x, y, width, height) => {
     
    });
  };

  const handleAddToCart = () => {
    if (activeItem) {
    }
    onNavigateToCart();
  };
  const handleOpenCart = () => {
    onNavigateToCart();
  };

  // Interpolated Card Dimensions & Position
  const cardTop = Animated.add(
    animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [sourceLayout.y, 0],
    }),
    dragY
  );

  const cardLeft = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.x, 0],
  });

  const cardWidth = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.width, SCREEN_WIDTH],
  });

  const cardHeight = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.height, SCREEN_HEIGHT],
  });

  const cardBorderRadius = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const cardScale = dragY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.88],
    extrapolate: 'clamp',
  });

  const cardTranslateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      sourceLayout.x + sourceLayout.width / 2 - SCREEN_WIDTH / 2,
      0,
    ],
  });
  const cardTranslateY = Animated.add(
    animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        sourceLayout.y + sourceLayout.height / 2 - SCREEN_HEIGHT / 2,
        0,
      ],
    }),
    dragY
  );
  const cardScaleX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.width / SCREEN_WIDTH, 1],
  });
  const cardScaleY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.height / SCREEN_HEIGHT, 1],
  });

  // Delayed Secondary Content Reveal Interpolations
  const contentOpacity = contentProgress;
  const contentTranslateY = contentProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  const heroImageContainerHeight = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sourceLayout.height * 0.55, 300],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.65],
            }),
          },
        ]}
      />

      {/* Shared Expanding Card Container */}
      <Animated.View
        style={[
          styles.expandedCard,
          Platform.OS === 'android'
            ? {
                ...styles.expandedCardAndroid,
                transform: [
                  { translateX: cardTranslateX },
                  { translateY: cardTranslateY },
                  { scaleX: cardScaleX },
                  { scaleY: cardScaleY },
                  { scale: cardScale },
                ],
              }
            : {
                top: cardTop,
                left: cardLeft,
                width: cardWidth,
                height: cardHeight,
                borderRadius: cardBorderRadius,
                transform: [{ scale: cardScale }],
              },
        ]}
        renderToHardwareTextureAndroid={Platform.OS === 'android' && isTransitioning}
      >
        {/* Drag Gesture Handle Header */}
        <View style={styles.headerArea} {...panResponder.panHandlers}>
          {/* Subtle pull down indicator bar */}
          <Animated.View
            style={[
              styles.dragIndicatorBar,
              {
                opacity: animProgress,
              },
            ]}
          />

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => handleClose()}
              style={styles.headerIcon}
              scaleTo={0.88}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-left" size={20} color="#1a1a1a" />
            </TouchableOpacity>
            <LocalizedText style={styles.headerTitle}>Item Details</LocalizedText>
            <TouchableOpacity
              style={styles.cartIconWrapper}
              activeOpacity={0.85}
              onPress={handleOpenCart}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
            >
              <View style={styles.cartButton}>
                <Icon name="shopping-bag" size={20} color="#1a1a1a" />
                <View style={styles.cartBadge}>
                  <LocalizedText style={styles.cartBadgeText}>{}</LocalizedText>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Hero Product Image Carousel (Swipeable with Liquid Dots) */}
          <Animated.View
            style={[
              styles.imageContainer,
              Platform.OS === 'android'
                ? styles.androidImageContainer
                : { height: heroImageContainerHeight },
            ]}
          >
            <FlatList
              ref={carouselRef}
              data={gallery}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              keyExtractor={(slideItem) => slideItem.id}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  carouselRef.current?.scrollToOffset({ offset: info.index * SCREEN_WIDTH, animated: true });
                }, 100);
              }}
              renderItem={({ item: slide }) => (
                <View style={styles.imageSlide}>
                  <Image
                    source={slide.source ? slide.source : { uri: slide.uri }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                  <View style={styles.angleBadge}>
                    <LocalizedText style={styles.angleBadgeText}>{slide.label}</LocalizedText>
                  </View>
                </View>
              )}
            />

            {/* Liquid Pagination Dots */}
            <View style={styles.paginationContainer}>
              {gallery.map((_: SlideItem, idx: number) => {
                const isFirst = idx === 0;
                const isLast = idx === gallery.length - 1;

                const dotWidth = scrollX.interpolate({
                  inputRange: [(idx - 1) * SCREEN_WIDTH, idx * SCREEN_WIDTH, (idx + 1) * SCREEN_WIDTH],
                  outputRange: [
                    isFirst ? 24 : 8,
                    24,
                    isLast ? 24 : 8,
                  ],
                  extrapolate: 'clamp',
                });

                const dotColor = scrollX.interpolate({
                  inputRange: [(idx - 1) * SCREEN_WIDTH, idx * SCREEN_WIDTH, (idx + 1) * SCREEN_WIDTH],
                  outputRange: [
                    isFirst ? '#1a1a1a' : '#e4e6eb',
                    '#1a1a1a',
                    isLast ? '#1a1a1a' : '#e4e6eb',
                  ],
                  extrapolate: 'clamp',
                });

                const dotOpacity = scrollX.interpolate({
                  inputRange: [(idx - 1) * SCREEN_WIDTH, idx * SCREEN_WIDTH, (idx + 1) * SCREEN_WIDTH],
                  outputRange: [
                    isFirst ? 1 : 0.45,
                    1,
                    isLast ? 1 : 0.45,
                  ],
                  extrapolate: 'clamp',
                });

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleDotPress(idx)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
                    style={styles.dotTouchable}
                  >
                    <Animated.View
                      style={[
                        styles.dot,
                        {
                          width: dotWidth,
                          backgroundColor: dotColor,
                          opacity: dotOpacity,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Secondary Details (Gently Faded in with 170ms Delay) */}
          <Animated.View
            style={[
              styles.detailsContainer,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
            onLayout={(event) => {
              detailsLayoutY.current = event.nativeEvent.layout.y;
            }}
          >
            {/* Product Name with Heart in Circular Button on the Right */}
            <View style={styles.nameAndFavoriteRow}>
              <LocalizedText style={styles.productName}>{activeItem.name}</LocalizedText>
              <TouchableOpacity
                style={styles.favoriteCircleButton}
                activeOpacity={0.8}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Icon
                  name="heart"
                  size={20}
                  color={isFavorite ? '#ff4d4f' : '#1a1a1a'}
                />
              </TouchableOpacity>
            </View>

            {/* Price on Left, 4.5 Rating on Right Corner */}
            <View style={styles.priceAndRatingRow}>
              <View style={styles.priceContainer}>
                <LocalizedText style={styles.currentPrice}>{activeItem.price}</LocalizedText>
                <LocalizedText style={styles.originalPrice}>{activeItem.originalPrice}</LocalizedText>
                <View style={styles.discountBadge}>
                  <LocalizedText style={styles.discountText}>10% OFF</LocalizedText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.ratingBadge}
                activeOpacity={0.75}
                onPress={scrollToReviews}
                accessibilityRole="button"
                accessibilityLabel="View product reviews"
              >
                <Icon name="star" size={16} color="#0d3b29" style={styles.ratingStarIcon} />
                <LocalizedText style={styles.ratingBadgeText}>{} Rating</LocalizedText>
              </TouchableOpacity>
            </View>

            <LocalizedText style={styles.descriptionText} numberOfLines={isDescriptionExpanded ? undefined : 2}>
              {activeItem.description || PRODUCT_DESCRIPTION}
            </LocalizedText>
            <TouchableOpacity
              onPress={() => setIsDescriptionExpanded((expanded) => !expanded)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <LocalizedText style={[styles.readMoreText, styles.readMoreButton]}>
                {isDescriptionExpanded ? 'Read Less' : 'Read More'}
              </LocalizedText>
            </TouchableOpacity>

            {/* Shop Section */}
            <LocalizedText style={styles.sectionTitle}>Shop</LocalizedText>
            <TouchableOpacity
              style={styles.shopCard}
              activeOpacity={0.8}
              onPress={onNavigateToShop}
              accessibilityRole="button"
              accessibilityLabel="View Green Valley Organic Mart"
            >
              <View style={styles.shopLeft}>
                <View style={styles.shopIconContainer}>
                  <Icon name="shopping-bag" size={20} color="#258B3E" />
                </View>
                <View style={styles.shopInfo}>
                  <LocalizedText style={styles.shopName}>Green Valley Organic Mart</LocalizedText>
                  <LocalizedText style={styles.shopSubtext}>Delaware • 1.2 km away</LocalizedText>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={15} color="#0d3b29" style={styles.ratingStarIcon} />
                <LocalizedText style={styles.ratingBadgeText}>4.8 Rating</LocalizedText>
              </View>
            </TouchableOpacity>

            {/* Reviews Section */}
            <View
              onLayout={(event) => {
                reviewsLayoutY.current = event.nativeEvent.layout.y;
              }}
            >
              <View style={styles.reviewsHeadingRow}>
                <LocalizedText style={styles.sectionTitle}>Reviews</LocalizedText>
                <TouchableOpacity
                  onPress={() => onNavigateToReviews(activeItem)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="See all product reviews"
                >
                  <LocalizedText style={styles.seeAllReviews}>See all</LocalizedText>
                </TouchableOpacity>
              </View>

              {/* {productReviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <LocalizedText style={styles.avatarInitial}>{review.name.charAt(0)}</LocalizedText>
                      </View>
                      <View>
                        <LocalizedText style={styles.reviewerName}>{review.name}</LocalizedText>
                        <LocalizedText style={styles.reviewDate}>{review.date}</LocalizedText>
                      </View>
                    </View>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="star"
                          size={14}
                          color={star <= review.rating ? '#258B3E' : '#dfe4e1'}
                          style={styles.star}
                        />
                      ))}
                    </View>
                  </View>
                  <LocalizedText style={styles.reviewText}>{review.text}</LocalizedText>
                  {review.images.length > 0 && (
                    <View style={styles.reviewPhotos}>
                      {review.images.slice(0, 2).map((image, index) => (
                        <Image
                          key={`${review.id}-preview-${index}`}
                          source={{ uri: image }}
                          style={styles.reviewPhoto}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))} */}
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => onNavigateToReviews(activeItem)}
                activeOpacity={0.75}
                accessibilityRole="button"
              >
                <LocalizedText style={styles.seeAllButtonText}>
                  See all 1 reviews
                </LocalizedText>
                <Icon name="arrow-right" size={16} color="#1A632C" />
              </TouchableOpacity>
            </View>

            {/* Similar Products Grid */}
            <LocalizedText style={styles.sectionTitle}>Similar Products</LocalizedText>
            <View style={styles.similarProductsGrid}>
              {SIMILAR_PRODUCTS.map((prod) => (
                <View
                  key={prod.id}
                  ref={(ref) => {
                    similarCardRefs.current[prod.id] = ref;
                  }}
                  collapsable={false}
                  style={styles.similarCard}
                >
                  <TouchableOpacity style={styles.favoriteIcon}>
                    <Icon name="heart" size={18} color="#1a1a1a" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openSimilarProduct(prod)}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${prod.name}`}
                  >
                    <Image source={{ uri: prod.image }} style={styles.similarImage} resizeMode="contain" />
                    <LocalizedText style={styles.similarName} numberOfLines={2}>
                      {prod.name}
                    </LocalizedText>
                    <LocalizedText style={styles.similarSize}>{prod.size}</LocalizedText>
                  </TouchableOpacity>
                  <View style={styles.similarPriceRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <LocalizedText style={styles.similarCurrentPrice}>{prod.price}</LocalizedText>
                      <LocalizedText style={styles.similarOriginalPrice}>{prod.originalPrice}</LocalizedText>
                    </View>
                    <TouchableOpacity
                      style={styles.similarAddBtn}
                      accessibilityRole="button"
                    >
                      <LocalizedText style={styles.similarAddBtnText}>Add</LocalizedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>

        {/* Animated Bottom Action Bar with 'Add to Cart' & 'Buy Now' */}
        <Animated.View
          style={[
            styles.bottomActionBar,
            {
              opacity: bottomBarAnim,
              transform: [
                {
                  translateY: bottomBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [90, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.addToCartBtn}
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-bag" size={18} color="#258B3E" style={{ marginRight: 8 }} />
            <LocalizedText style={styles.addToCartBtnText}>Add to Cart</LocalizedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyNowBtn}
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <LocalizedText style={styles.buyNowBtnText}>Buy Now</LocalizedText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 9998,
  },
  expandedCard: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    zIndex: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 25,
  },
  expandedCardAndroid: {
    ...StyleSheet.absoluteFill,
    borderRadius: 0,
  },
  androidImageContainer: {
    height: 300,
  },
  headerArea: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  dragIndicatorBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dcdcdc',
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  cartIconWrapper: {
    padding: 2,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff4d4f',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainImage: {
    width: SCREEN_WIDTH * 0.72,
    height: 200,
  },
  angleBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: '#f5f6f8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  angleBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4a5568',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
  },
  dotTouchable: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  nameAndFavoriteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginRight: 15,
    lineHeight: 28,
  },
  favoriteCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  priceAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#9e9e9e',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: 'rgba(37, 139, 62, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#258B3E',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f8f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingStarIcon: {
    marginRight: 5,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0d3b29',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  star: {
    marginRight: 2,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  addToCartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#258B3E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addToCartBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  buyNowBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  buyNowBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    lineHeight: 22,
    marginBottom: 4,
  },
  readMoreText: {
    color: '#258B3E',
    fontFamily: 'Poppins-Medium',
  },
  readMoreButton: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 14,
    marginTop: 6,
  },
  reviewsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllReviews: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1A632C',
    marginBottom: 8,
  },
  seeAllButton: {
    minHeight: 48,
    marginTop: 2,
    marginBottom: 22,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dcefe1',
    backgroundColor: '#f4fbf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  seeAllButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1A632C',
  },
  shopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#edf2ee',
  },
  shopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  shopIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(37, 139, 62, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  shopSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7a7a7a',
    marginTop: 1,
  },
  reviewItem: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#f8faf8',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f6ec',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#30984d',
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    lineHeight: 20,
  },
  reviewPhotos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  reviewPhoto: {
    width: 72,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#edf0ed',
  },
  similarProductsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  similarCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 15,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  similarImage: {
    width: '100%',
    height: 90,
    marginBottom: 15,
  },
  similarName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
    height: 40,
    marginBottom: 5,
  },
  similarSize: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    marginBottom: 10,
  },
  similarPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarCurrentPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginRight: 5,
  },
  similarOriginalPrice: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9e9e9e',
    textDecorationLine: 'line-through',
  },
  similarAddBtn: {
    backgroundColor: '#258B3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  similarAddBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});
