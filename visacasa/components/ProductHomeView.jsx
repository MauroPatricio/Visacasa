// components/ProductHomeView.js (atualizado)
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import {
  toggleFavoriteOptimistic,
  selectIsFavorited,
} from '../features/favoriteSlice';
import {
  toggleProductSelection,
  selectIsProductSelected,
} from '../features/comparisonSlice';
import { selectUser } from '../features/userSlice';
import api from '../hooks/createConnectionApi';

const ProductHomeView = ({
  title,
  description,
  categoryid,
  products,
  loading = false
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector(selectUser);

  const ProductItem = ({ item, navigation, dispatch, toast, user }) => {
    const isFavorited = useSelector(selectIsFavorited(item?._id));
    const isSelected = useSelector(selectIsProductSelected(item?._id));

    const handleToggleFavorite = async (e) => {
      e.stopPropagation();
      if (!user?._id) {
        toast.show('Faça login para adicionar favoritos', { type: 'warning' });
        navigation.navigate('Login');
        return;
      }
      try {
        dispatch(toggleFavoriteOptimistic(item._id));
        const { data } = await api.post('/favorites/toggle', {
          userId: user._id,
          productId: item._id,
        });
        toast.show(data.message, { type: 'success' });
      } catch (error) {
        dispatch(toggleFavoriteOptimistic(item._id));
        console.error('Erro ao toggle favorito:', error);
        toast.show('Erro ao atualizar favoritos', { type: 'danger' });
      }
    };

    const handleToggleComparison = (e) => {
      e.stopPropagation();
      dispatch(toggleProductSelection(item));
    };

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { item })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Action Buttons (Top Corners) */}
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorited ? '#FF3B30' : '#000'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToggleComparison} style={styles.comparisonBtn}>
            <Ionicons
              name={isSelected ? 'repeat' : 'repeat-outline'}
              size={18}
              color={isSelected ? '#3B82F6' : '#000'}
            />
          </TouchableOpacity>

          {item.discount > 0 && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>PROMO</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.nome || item.name}
          </Text>

          <Text style={styles.stockText}>
            {item.countInStock > 0 ? `${item.countInStock} unidade(s)` : 'Sem stock'}
          </Text>

          <Text style={styles.sellerName} numberOfLines={1}>
            {item.sellerName || item.seller?.seller?.name || 'N/A'}
          </Text>

          <View style={styles.bottomRow}>
            {item.discount > 0 ? (
              <View style={styles.priceContainer}>
                <Text style={styles.discountPrice}>{item.discount} MT</Text>
                <Text style={styles.originalPrice}>{item.price} MT</Text>
              </View>
            ) : (
              <Text style={styles.productPrice}>{item.price} MT</Text>
            )}

            <TouchableOpacity style={styles.cartIconBtn}>
              <Ionicons name="cart-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          <ActivityIndicator size="small" color="#E85A4F" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductListByCategory', { title, categoryid })}
        >
          <Text style={styles.seeAll}>Ver tudo</Text>
        </TouchableOpacity>
      </View>

      {products && products.length > 0 ? (
        <FlatList
          horizontal
          data={products}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              navigation={navigation}
              dispatch={dispatch}
              toast={toast}
              user={user}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum produto disponível</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#272343',
  },
  description: {
    fontSize: 11,
    color: '#9A9CAA',
    marginTop: 2,
  },
  seeAll: {
    color: '#E85A4F',
    fontWeight: '700',
    fontSize: 13,
  },
  productsList: {
    paddingBottom: 15,
  },
  productItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 15,
    width: 165,
    height: 300, // Altura fixa para todos os cards
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
    backgroundColor: '#F0F2F3',
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9A9CAA',
    fontSize: 13,
  }
});




export default ProductHomeView;
