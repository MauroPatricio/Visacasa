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
            size={22}
            color={isFavorited ? '#E85A4F' : '#666'}
        />
    </TouchableOpacity>
));

FavoriteButton.displayName = 'FavoriteButton';

// Memoized comparison checkbox
const ComparisonCheckbox = memo(({ isSelected, onPress }) => (
    <TouchableOpacity
        style={styles.checkboxBtn}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
    </TouchableOpacity>
));

ComparisonCheckbox.displayName = 'ComparisonCheckbox';

const ProductCardView = memo(({ item, showComparison = false }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const toast = useToast();

    const productDetail = item.item;
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
        <TouchableOpacity onPress={handleProductPress}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: productDetail.image }}
                        style={styles.image}
                    />

                    {/* Comparison Checkbox (top-left) */}
                    {showComparison && (
                        <ComparisonCheckbox
                            isSelected={isSelected}
                            onPress={handleToggleComparison}
                        />
                    )}

                    {/* Favorite Button (top-right) */}
                    <FavoriteButton
                        isFavorited={localFavorited}
                        onPress={handleToggleFavorite}
                    />

                    <View style={styles.details}>
                        <Text style={styles.title} numberOfLines={1}>
                            {productDetail.nome}
                        </Text>
                        <Text style={styles.supplier} numberOfLines={1}>
                            {productDetail.seller.seller.name}
                        </Text>

                        <Text style={styles.price} numberOfLines={1}>
                            {productDetail.price} Mt
                        </Text>
                        <Text>
                            {productDetail.isOrdered ? (
                                <Badge style={{ color: 'white', backgroundColor: 'green' }}>
                                    {' '}
                                    Por encomenda{' '}
                                </Badge>
                            ) : productDetail.countInStock !== 0 ? (
                                productDetail.countInStock + ` unidade(s)`
                            ) : (
                                <Badge bg="danger">Sem stock</Badge>
                            )}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.addBtn}>
                        <Ionicons name="cart" size={25} color={'#E85A4F'} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});

ProductCardView.displayName = 'ProductCardView';

export default ProductCardView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    imageContainer: {
        flex: 1,
        width: 170,
        marginLeft: 12 / 2,
        marginTop: 5,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "white",
    },
    image: {
        aspectRatio: 1,
        resizeMode: 'cover',
    },
    details: {
        padding: 12,
    },
    title: {
        fontSize: 12,
        fontWeight: '800',
    },
    supplier: {
        fontSize: 12,
        fontWeight: '600',
    },
    price: {
        fontSize: 12,
        fontWeight: '400',
    },
    addBtn: {
        position: "absolute",
        bottom: 10,
        right: 12,
    },
    favoriteBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    checkboxBtn: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 6,
        padding: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#E85A4F',
        borderColor: '#E85A4F',
    },
});