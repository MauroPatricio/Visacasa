import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import React, { useState, useCallback, useEffect, memo } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import {
    toggleFavoriteOptimistic,
    selectIsFavorited,
} from '../../features/favoriteSlice';
import {
    toggleProductSelection,
    selectIsProductSelected,
} from '../../features/comparisonSlice';
import { selectUser } from '../../features/userSlice';
import api from '../../hooks/createConnectionApi';

// Memoized favorite button
const FavoriteButton = memo(({ isFavorited, onPress }) => (
    <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorited ? '#FF3B30' : '#000'}
        />
    </TouchableOpacity>
));

FavoriteButton.displayName = 'FavoriteButton';

// Memoized comparison button
const ComparisonButton = memo(({ isSelected, onPress }) => (
    <TouchableOpacity
        style={styles.comparisonBtn}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={isSelected ? 'repeat' : 'repeat-outline'}
            size={18}
            color={isSelected ? '#3B82F6' : '#000'}
        />
    </TouchableOpacity>
));

ComparisonButton.displayName = 'ComparisonButton';

const ProductCardView = memo(({ item, showComparison = false }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const toast = useToast();

    const productDetail = item.item || item;
    const user = useSelector(selectUser);
    const isFavorited = useSelector(selectIsFavorited(productDetail?._id));
    const isSelected = useSelector(selectIsProductSelected(productDetail?._id));

    const [localFavorited, setLocalFavorited] = useState(isFavorited);

    useEffect(() => {
        setLocalFavorited(isFavorited);
    }, [isFavorited]);

    const handleToggleFavorite = useCallback(async (e) => {
        e.stopPropagation();

        if (!user?._id) {
            toast.show('Faça login para adicionar favoritos', { type: 'warning' });
            navigation.navigate('Login');
            return;
        }

        try {
            setLocalFavorited(!localFavorited);
            dispatch(toggleFavoriteOptimistic(productDetail._id));

            const { data } = await api.post('/favorites/toggle', {
                userId: user._id,
                productId: productDetail._id,
            });

            toast.show(data.message, { type: 'success' });
        } catch (error) {
            setLocalFavorited(localFavorited);
            dispatch(toggleFavoriteOptimistic(productDetail._id));
            console.error('Erro ao toggle favorito:', error);
            toast.show('Erro ao atualizar favoritos', { type: 'danger' });
        }
    }, [user, productDetail, localFavorited, dispatch, toast, navigation]);

    const handleToggleComparison = useCallback((e) => {
        e.stopPropagation();
        dispatch(toggleProductSelection(productDetail));
    }, [dispatch, productDetail]);

    const handleProductPress = useCallback(() => {
        navigation.navigate("ProductDetail", { item });
    }, [navigation, item]);

    return (
        <TouchableOpacity onPress={handleProductPress} activeOpacity={0.9}>
            <View style={styles.productItem}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: productDetail.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onError={(e) => {
                            // Basic error handling for mobile
                            console.log('Image load error:', e.nativeEvent.error);
                        }}
                    />

                    {/* Action Buttons (Top Corners) */}
                    {showComparison && (
                        <ComparisonButton
                            isSelected={isSelected}
                            onPress={handleToggleComparison}
                        />
                    )}

                    <FavoriteButton
                        isFavorited={localFavorited}
                        onPress={handleToggleFavorite}
                    />

                    {productDetail.discount > 0 && (
                        <View style={styles.promoBadge}>
                            <Text style={styles.promoText}>PROMO</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                        {productDetail.nome || productDetail.name}
                    </Text>

                    <Text style={styles.stockText}>
                        {productDetail.countInStock > 0 ? `${productDetail.countInStock} unidade(s)` : 'Sem stock'}
                    </Text>

                    <Text style={styles.sellerName} numberOfLines={1}>
                        {productDetail.sellerName || productDetail.seller?.seller?.name || 'N/A'}
                    </Text>

                    <View style={styles.bottomRow}>
                        {productDetail.discount > 0 ? (
                            <View style={styles.priceContainer}>
                                <Text style={styles.discountPrice}>{productDetail.discount} MT</Text>
                                <Text style={styles.originalPrice}>{productDetail.price} MT</Text>
                            </View>
                        ) : (
                            <Text style={styles.productPrice}>{productDetail.price} MT</Text>
                        )}

                        <TouchableOpacity style={styles.cartIconBtn}>
                            <Ionicons name="cart-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

ProductCardView.displayName = 'ProductCardView';

export default ProductCardView;

const styles = StyleSheet.create({
    productItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 15,
        marginHorizontal: 8,
        width: 165,
        height: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#F5F5F5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'white',
        padding: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    comparisonBtn: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'white',
        padding: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    promoBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#E85A4F',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    promoText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    productInfo: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#272343',
        marginBottom: 2,
    },
    stockText: {
        fontSize: 11,
        color: '#9A9CAA',
        marginBottom: 2,
    },
    sellerName: {
        fontSize: 11,
        color: '#9A9CAA',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    priceContainer: {
        gap: 2,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#272343',
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E85A4F',
    },
    originalPrice: {
        fontSize: 11,
        color: '#9A9CAA',
        textDecorationLine: 'line-through',
    },
    cartIconBtn: {
        backgroundColor: '#E85A4F', // Mantendo o salmon para o botão de ação principal
        padding: 8,
        borderRadius: 8,
    },
});