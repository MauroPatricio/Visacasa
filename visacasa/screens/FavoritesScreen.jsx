import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import {
    selectFavorites,
    selectFavoritesLoading,
    setFavorites,
    setLoading,
    removeFavorite,
    toggleFavoriteOptimistic,
} from '../features/favoriteSlice';
import { selectUser } from '../features/userSlice';
import api from '../hooks/createConnectionApi';

const FavoritesScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const toast = useToast();

    const favorites = useSelector(selectFavorites);
    const loading = useSelector(selectFavoritesLoading);
    const user = useSelector(selectUser);

    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!user?._id) return;

        try {
            dispatch(setLoading(true));
            const { data } = await api.get(`/favorites/user/${user._id}`);

            if (data.success) {
                dispatch(setFavorites(data.favorites));
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            toast.show('Erro ao carregar favoritos', { type: 'danger' });
        } finally {
            dispatch(setLoading(false));
        }
    }, [user, dispatch, toast]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFavorites();
        setRefreshing(false);
    }, [fetchFavorites]);

    const handleRemoveFavorite = useCallback(async (productId) => {
        try {
            // Optimistic update
            dispatch(toggleFavoriteOptimistic(productId));

            // API call
            await api.delete('/favorites/remove', {
                data: { userId: user._id, productId },
            });

            toast.show('Removido dos favoritos', { type: 'success' });
        } catch (error) {
            // Revert on error
            dispatch(toggleFavoriteOptimistic(productId));
            console.error('Erro ao remover favorito:', error);
            toast.show('Erro ao remover favorito', { type: 'danger' });
        }
    }, [user, dispatch, toast]);

    const handleProductPress = useCallback((product) => {
        navigation.navigate('ProductDetail', { item: { item: product } });
    }, [navigation]);

    const renderFavoriteItem = ({ item }) => {
        const product = item.product;

        if (!product) return null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.nome || product.name}
                    </Text>

                    <Text style={styles.sellerName} numberOfLines={1}>
                        {product.seller?.seller?.name || product.seller?.name}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{product.price} Mt</Text>
                        {product.onSale && (
                            <View style={styles.saleBadge}>
                                <Text style={styles.saleText}>-{product.onSalePercentage}%</Text>
                            </View>
                        )}
                    </View>

                    {product.countInStock > 0 ? (
                        <Text style={styles.stock}>{product.countInStock} em stock</Text>
                    ) : (
                        <Text style={styles.outOfStock}>Sem stock</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(product._id)}
                >
                    <Ionicons name="heart" size={24} color="#E85A4F" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptySubtitle}>
                Adicione produtos aos favoritos para vê-los aqui
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Início')}
            >
                <Text style={styles.browseButtonText}>Explorar Produtos</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meus Favoritos</Text>
            <View style={styles.headerRight}>
                <Text style={styles.count}>{favorites.length}</Text>
            </View>
        </View>
    );

    if (loading && !refreshing && favorites.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E85A4F" />
                <Text style={styles.loadingText}>Carregando favoritos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item._id || item.product?._id}
                contentContainerStyle={
                    favorites.length === 0 ? styles.emptyListContainer : styles.listContainer
                }
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#E85A4F']}
                        tintColor="#E85A4F"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    count: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E85A4F',
    },
    listContainer: {
        padding: 16,
    },
    emptyListContainer: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sellerName: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E85A4F',
    },
    saleBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    saleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stock: {
        fontSize: 12,
        color: '#4CAF50',
    },
    outOfStock: {
        fontSize: 12,
        color: '#F44336',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    browseButton: {
        backgroundColor: '#E85A4F',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});
