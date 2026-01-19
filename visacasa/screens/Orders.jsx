import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../hooks/createConnectionApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Orders = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userLogin, setUserLogin] = useState(false);

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
        setIsLoading(false); // ✅ Para o loading se inconsistente
      }
    } else {
      console.log('⚠️ Usuário não está logado');
      setIsLoading(false); // ✅ Para o loading se não logado
    }
  } catch (error) {
    console.error('❌ Erro ao verificar se o usuário existe:', error);
    setIsLoading(false); // ✅ Garante parada mesmo em erro
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return '#FFD700';
      case 'Em trânsito': return '#1E90FF';
      case 'Entregue': return '#32CD32';
      case 'Cancelado': return '#FF4500';
      default: return '#E85A4F';
    }
  };

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};


  const fetchData = async () => {
  try {
    setIsLoading(true);
    if (!userData?.token) {
      setIsLoading(false); // ✅ Garante fim do loading
      return;
    }

    const { data } = await api.get('/orders/mine', {
      headers: { Authorization: `Bearer ${userData.token}` },
    });

    setOrders(data || []);

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
     setIsLoading(false); // ✅ Garante parada mesmo em erro

  } finally {
    setIsLoading(false); // ✅ Sempre finaliza o loading
  }
};

  useEffect(() => {
    checkIfUserExist();
  }, []);

  useEffect(() => {
    if (userData) fetchData();
  }, [userData]);

  useFocusEffect(
    useCallback(() => {
      if (userData) fetchData();
    }, [userData])
  );

  const renderItem = ({ item }) => (
      <TouchableOpacity
    style={styles.container}
    onPress={() => navigation.navigate('OrderDetailsScreen', { item })}
  >
    {/* Barra lateral colorida */}
    <View
      style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]}
    />

    {/* Conteúdo principal */}
    <Image
      source={{ uri: item?.seller?.seller?.logo }}
      style={styles.supplierImage}
    />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.code}>
        {item?.seller?.seller?.name} - {item.code}
      </Text>
      <Text style={styles.createAt}>{formatDate(item.createdAt)}</Text>
      <Text style={styles.price}>{item.totalPrice} Mt</Text>
      <Text style={styles.status}>{item.status}</Text>
    </View>
  </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Text style={styles.title}>Meus Pedidos</Text>
<<<<<<< HEAD

      {isLoading ? (
        <ActivityIndicator size="large" color="#E85A4F" style={styles.loader} />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.noOrdersText}>Sem pedidos disponíveis.</Text>
        </ScrollView>
      )}
      
      <View style={{ paddingBottom: 65 }} />
=======
      <ScrollView
        style={{ backgroundColor: "white" }}
        contentContainerStyle={{
          paddingHorizontal: 10,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#7F00FF" />
        ) : orders.length > 0 ? (
          orders.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.container}
              onPress={() => {
              navigation.navigate('OrderDetailsScreen', { item });
              }}
            >
              <Ionicons name="cart-outline" size={25} style={styles.cartIcon} />
              <View>
                <Text style={styles.code}>{item.code}</Text>
              </View>
              <View>
                <Text style={styles.createAt}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.price}>{item.totalPrice} MT</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Sem pedidos disponíveis.</Text>
        )}
        <View style={{ marginBottom: 210 }} />
      </ScrollView>
>>>>>>> main
    </SafeAreaView>
  );
};

export default Orders;
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
<<<<<<< HEAD
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
=======
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 5,
>>>>>>> main
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  statusBar: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 12,
  },
  title: {
<<<<<<< HEAD
    fontSize: 28,
    fontWeight: 'bold',
    paddingVertical: 15,
    color: '#E85A4F',
    textAlign: 'center',
  },
  supplierImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  createAt: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E85A4F',
    marginTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
=======
    marginTop: 20,
    fontSize: 30,
    fontWeight: '700',
    padding: 15,
    color: '#7F00FF',
    marginBottom: 20
  },
  cartIcon: {
    color: '#7F00FF',
    padding: 20,
    borderRadius: 22,
    backgroundColor: 'white',
  },
  code: {
    fontWeight: '500',
    fontSize: 17,
    color: '#333',
    marginLeft: 10,
    textAlign: 'center',
    top: 20,
  },
  status: {
    fontWeight: '700',
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
  },
  price: {
    color: '#666',
    fontSize: 15,
    marginLeft: 10,
  },
  createAt: {
    color: '#888',
    fontSize: 15,
    marginLeft: 10,
>>>>>>> main
  },
});
