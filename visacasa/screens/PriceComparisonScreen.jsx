import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import {
    selectSelectedProducts,
    selectComparisonResults,
    selectComparisonLoading,
    setComparisonResults,
    setLoading,
    clearSelectedProducts,
} from '../features/comparisonSlice';
import { selectUser } from '../features/userSlice';
import api from '../hooks/createConnectionApi';

const PriceComparisonScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const toast = useToast();

    const selectedProducts = useSelector(selectSelectedProducts);
    const comparisonResults = useSelector(selectComparisonResults);
    const loading = useSelector(selectComparisonLoading);
    const user = useSelector(selectUser);

    const fetchComparison = useCallback(async () => {
        if (selectedProducts.length < 2) {
            toast.show('Selecione pelo menos 2 produtos para comparar', { type: 'warning' });
            return;
        }

        try {
            dispatch(setLoading(true));

            const productIds = selectedProducts.map(p => p._id);
            const { data } = await api.post('/comparisons/create', {
                userId: user._id,
                name: `Comparação ${new Date().toLocaleDateString()}`,
                productIds,
            });

            if (data.success) {
                dispatch(setComparisonResults(data.comparison));
            }
        } catch (error) {
            console.error('Erro ao criar comparação:', error);
            toast.show('Erro ao calcular comparação', { type: 'danger' });
        } finally {
            dispatch(setLoading(false));
        }
    }, [selectedProducts, user, dispatch, toast]);

    useEffect(() => {
        if (selectedProducts.length >= 2 && !comparisonResults) {
            fetchComparison();
        }
    }, [selectedProducts, comparisonResults, fetchComparison]);

    const handleClearComparison = useCallback(() => {
        dispatch(clearSelectedProducts());
        navigation.goBack();
    }, [dispatch, navigation]);

    const renderProductCard = ({ item, index }) => {
        const product = item.product || item;
        const isCheapest = comparisonResults?.metadata?.cheapestProduct?.toString() === product._id?.toString();

        return (
            <View style={[styles.productCard, isCheapest && styles.cheapestCard]}>
                {isCheapest && (
                    <View style={styles.cheapestBadge}>
                        <Ionicons name="trophy" size={16} color="#FFD700" />
                        <Text style={styles.cheapestText}>Mais Barato</Text>
                    </View>
                )}

                <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                <Text style={styles.productName} numberOfLines={2}>
                    {product.nome || product.name}
                </Text>

                <Text style={styles.sellerName} numberOfLines={1}>
                    {product.seller?.seller?.name || product.seller?.name || 'Vendedor'}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={[styles.price, isCheapest && styles.cheapestPrice]}>
                        {product.price?.toFixed(2)} Mt
                    </Text>
                </View>

                {comparisonResults?.metadata?.lowestPrice && product.price > comparisonResults.metadata.lowestPrice && (
                    <View style={styles.differenceContainer}>
                        <Text style={styles.differenceText}>
                            +{(product.price - comparisonResults.metadata.lowestPrice).toFixed(2)} Mt
                        </Text>
                        <Text style={styles.percentageText}>
                            (+{(((product.price - comparisonResults.metadata.lowestPrice) / comparisonResults.metadata.lowestPrice) * 100).toFixed(1)}%)
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Comparação de Preços</Text>
            <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearComparison}
            >
                <Ionicons name="close" size={24} color="#E85A4F" />
            </TouchableOpacity>
        </View>
    );

    const renderMetadata = () => {
        if (!comparisonResults?.metadata) return null;

        const metadata = comparisonResults.metadata;

        return (
            <View style={styles.metadataContainer}>
                <Text style={styles.metadataTitle}>Resumo da Comparação</Text>

                <View style={styles.metadataRow}>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Preço Mais Baixo</Text>
                        <Text style={styles.metadataValue}>{metadata.lowestPrice?.toFixed(2)} Mt</Text>
                    </View>

                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Preço Mais Alto</Text>
                        <Text style={styles.metadataValue}>{metadata.highestPrice?.toFixed(2)} Mt</Text>
                    </View>
                </View>

                <View style={styles.metadataRow}>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Preço Médio</Text>
                        <Text style={styles.metadataValue}>{metadata.averagePrice?.toFixed(2)} Mt</Text>
                    </View>

                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Diferença Máxima</Text>
                        <Text style={styles.savingsValue}>
                            {metadata.maxDifference?.toFixed(2)} Mt ({metadata.maxDifferencePercentage}%)
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (selectedProducts.length < 2) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Selecione Produtos para Comparar</Text>
                    <Text style={styles.emptySubtitle}>
                        Adicione pelo menos 2 produtos para ver a comparação de preços
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('Início')}
                    >
                        <Text style={styles.browseButtonText}>Explorar Produtos</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E85A4F" />
                    <Text style={styles.loadingText}>Calculando comparação...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {renderMetadata()}

                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>
                        Produtos ({selectedProducts.length})
                    </Text>

                    <FlatList
                        data={comparisonResults?.products || selectedProducts}
                        renderItem={renderProductCard}
                        keyExtractor={(item, index) => item.product?._id || item._id || index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.productsList}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default PriceComparisonScreen;

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
    clearButton: {
        padding: 8,
    },
    scrollContent: {
        padding: 16,
    },
    metadataContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    metadataTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    metadataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metadataItem: {
        flex: 1,
        marginHorizontal: 4,
    },
    metadataLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    metadataValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    savingsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    productsSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    productsList: {
        paddingRight: 16,
    },
    productCard: {
        width: 180,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cheapestCard: {
        borderColor: '#FFD700',
        backgroundColor: '#FFFEF0',
    },
    cheapestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    cheapestText: {
        color: '#333',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    productImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
        minHeight: 36,
    },
    sellerName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    priceContainer: {
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E85A4F',
    },
    cheapestPrice: {
        color: '#4CAF50',
    },
    differenceContainer: {
        backgroundColor: '#FFF3E0',
        padding: 8,
        borderRadius: 6,
    },
    differenceText: {
        fontSize: 12,
        color: '#F57C00',
        fontWeight: '600',
    },
    percentageText: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});
