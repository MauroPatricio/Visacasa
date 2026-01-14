import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
  StatusBar as RNStatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import api from '../../hooks/createConnectionApi';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const ProductListSeller = () => {
  const [userData, setUserData] = useState(null);
  const [productsOfSeller, setProductsOfSeller] = useState([]);
  const [userLogin, setUserLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkIfUserExist();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        fetchData(1, true);
      }
    }, [userData])
  );

  const fetchData = async (pageNumber = 1, replace = false) => {
    if (pageNumber > 1) setIsFetchingMore(true);
    else setIsLoading(true);

    try {
      const response = await api.get(`products?seller=${userData._id}&page=${pageNumber}&limit=20`, {
        headers: { authorization: `Bearer ${userData?.token}` },
      });

      if (response?.status === 200) {
        const newProducts = response?.data?.products || [];
        setProductsOfSeller(prev => replace ? newProducts : [...prev, ...newProducts]);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const checkIfUserExist = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserId = await AsyncStorage.getItem('id');

      if (storedUserData && storedUserId) {
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData._id === storedUserId) {
          setUserData(parsedUserData);
          setUserLogin(true);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const confirm = await new Promise((resolve) => {
        Alert.alert(
          'Remover Produto',
          'Tem certeza que deseja apagar este item permanentemente?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Apagar', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
      if (!confirm) return;

      const response = await api.delete(`products/${productId}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      });

      if (response.status === 200) {
        setProductsOfSeller(productsOfSeller.filter(p => p._id !== productId));
      }
    } catch (error) {
      console.error('Erro ao apagar produto:', error?.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível apagar o produto.');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const response = await api.patch(
        `products/${product._id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${userData.token}` } }
      );

      if (response.status === 200) {
        setProductsOfSeller(prev =>
          prev.map(p =>
            p._id === product._id ? { ...p, isActive: response.data.product.isActive } : p
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do produto.');
    }
  };

  const renderProduct = ({ item: product }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductSellerDetail', { product })}
      >
        <View style={styles.imageSection}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImg}>
              <Ionicons name="cube-outline" size={40} color="#CBD5E1" />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: product?.isActive ? '#DCFCE7' : '#FEE2E2' }]}>
            <View style={[styles.statusDot, { backgroundColor: product?.isActive ? '#22C55E' : '#EF4444' }]} />
            <Text style={[styles.statusBadgeText, { color: product?.isActive ? '#166534' : '#991B1B' }]}>
              {product?.isActive ? 'Público' : 'Oculto'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName} numberOfLines={1}>{product?.nome}</Text>
          <View style={styles.stockRow}>
            <Feather name="package" size={12} color="#64748B" />
            <Text style={styles.stockText}>{product?.countInStock} disponível(is)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              {Number(product?.price || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.currency}> MT</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionToolbar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => navigation.navigate('NewProduct', { productToEdit: product })}
        >
          <Feather name="edit-3" size={18} color="#1E90FF" />
          <Text style={[styles.toolBtnText, { color: '#1E90FF' }]}>Editar</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => handleToggleStatus(product)}
        >
          <Ionicons name={product.isActive ? "eye-off-outline" : "eye-outline"} size={18} color="#4B5563" />
          <Text style={styles.toolBtnText}>{product.isActive ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => handleDelete(product._id)}
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
          <Text style={[styles.toolBtnText, { color: '#EF4444' }]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerir Inventário</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewProduct')}
          style={styles.headerAddBtn}
        >
          <Ionicons name="add" size={24} color="#E85A4F" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryTitle}>{productsOfSeller.length}</Text>
        <Text style={styles.summaryText}>Produtos registados</Text>
      </View>

      {isLoading && page === 1 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#E85A4F" />
          <Text style={styles.loaderText}>Sincronizando produtos...</Text>
        </View>
      ) : (
        <FlatList
          data={productsOfSeller}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant-closed" size={80} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sem produtos</Text>
              <Text style={styles.emptySub}>Comece a vender adicionando o seu primeiro produto.</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator size="small" color="#E85A4F" style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ height: 120 }} />
            )
          }
          onEndReached={() => fetchData(page + 1)}
          onEndReachedThreshold={0.5}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('NewProduct')}
      >
        <LinearGradient
          colors={['#E85A4F', '#D3483E']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E85A4F',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    padding: 15,
  },
  imageSection: {
    position: 'relative',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  placeholderImg: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoSection: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E85A4F',
  },
  currency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E85A4F',
  },
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 15,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    right: 25,
    bottom: 40,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    elevation: 8,
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductListSeller;