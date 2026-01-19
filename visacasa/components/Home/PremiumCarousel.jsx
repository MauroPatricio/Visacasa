import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    FlatList,
    Image,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.85;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

const PremiumCarousel = ({ data, loading }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    const handleProductPress = (product) => {
        navigation.navigate("ProductDetail", { item: product });
    };

    const renderItem = ({ item, index }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 1],
        });

        return (
            <View style={{ width, alignItems: 'center' }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item)}
                    style={styles.cardContainer}
                >
                    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.gradient}
                        >
                            <View style={styles.textContainer}>
                                <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
                                <Text style={styles.name} numberOfLines={1}>{item.nome || item.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>{item.price} MT</Text>
                                    {item.onSale && (
                                        <View style={styles.saleBadge}>
                                            <Text style={styles.saleText}>PROMOÇÃO</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <View style={styles.loadingSkeleton} />
            </View>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width}
                decelerationRate="fast"
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setActiveIndex(index);
                }}
            />

            {/* Pagination Indicators */}
            <View style={styles.pagination}>
                {data.map((_, index) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    const dotWidth = scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [8, 20, 8],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                { opacity, width: dotWidth }
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    loadingContainer: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingSkeleton: {
        width: ITEM_WIDTH,
        height: 200,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    cardContainer: {
        width: ITEM_WIDTH,
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: 15,
    },
    textContainer: {
        gap: 2,
    },
    brand: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },
    price: {
        color: '#E85A4F',
        fontSize: 18,
        fontWeight: '900',
    },
    saleBadge: {
        backgroundColor: '#E85A4F',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E85A4F',
    },
});

export default PremiumCarousel;
