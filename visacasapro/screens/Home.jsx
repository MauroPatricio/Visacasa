import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from "@expo/vector-icons";
import api from '../hooks/createConnectionApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import FlashMessage, { showMessage } from "react-native-flash-message";
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// ✅ Configuração segura de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Home = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [lastUpdate, setLastUpdate] = useState(null);
  const pollingRef = useRef(null);

  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  const updatePushToken = useCallback(async (userId, newPushToken) => {
    if (!userId || !newPushToken) return;
    try {
      await api.patch(`/users/updatePushToken/${userId}`, { pushToken: newPushToken });
    } catch (error) {
      console.log('Erro ao atualizar PushToken:', error.message);
    }
  }, []);

  const registerForPushNotificationsAsync = useCallback(async (user) => {
    if (!user) return;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      await updatePushToken(user._id, token);
    } catch (error) {
      console.log("Erro ao registrar notificações:", error.message);
    }
  }, [updatePushToken]);

  const fetchWalletBalance = useCallback(async (user) => {
    if (!user) return;
    try {
      const response = await api.get('/wallet/balance', {
        headers: { authorization: `Bearer ${user.token}` },
      });
      setWalletBalance(Number(response.data?.balance) || 0);
    } catch (error) {
      console.log("Erro ao buscar saldo:", error.message);
    }
  }, []);

  const fetchData = useCallback(async (user, showNotification = false) => {
    if (!user) return;
    try {
      const response = await api.get(`/orders/sellerview?seller=${user._id}`, {
        headers: { authorization: `Bearer ${user.token}` },
      });
      if (response.status === 200) {
        const newOrders = response.data.orders;

        if (showNotification && newOrders.length > orders.length) {
          const newOrdersCount = newOrders.length - orders.length;
          showMessage({
            message: `${newOrdersCount} novo(s) pedido(s)`,
            description: "Atualizando lista de vendas...",
            type: "success",
            icon: "auto",
            duration: 2500,
          });
        }

        setOrders(newOrders);
        const stats = [...new Set(newOrders.map(o => o.status))];
        setAvailableStatuses(stats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.log("Erro ao buscar pedidos:", error.message);
    }
  }, [orders]);

  const startPolling = useCallback((user) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      if (user) {
        await fetchData(user, true);
        await fetchWalletBalance(user);
      }
    }, 30000);
  }, [fetchData, fetchWalletBalance]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const validateAndSetUser = useCallback(async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserId = await AsyncStorage.getItem('id');

      if (!storedUserData || !storedUserId) throw new Error("Usuário não encontrado");

      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      return parsedUserData;
    } catch (error) {
      navigation.navigate('Login');
      return null;
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const initialize = async () => {
        const user = await validateAndSetUser();
        if (!user || !active) return;

        await registerForPushNotificationsAsync(user);
        await Promise.all([fetchData(user), fetchWalletBalance(user)]);
        startPolling(user);
      };

      initialize();

      return () => {
        active = false;
        stopPolling();
      };
    }, [validateAndSetUser, registerForPushNotificationsAsync, fetchData, fetchWalletBalance, startPolling, stopPolling])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const user = await validateAndSetUser();
    if (user) {
      await Promise.all([fetchData(user), fetchWalletBalance(user)]);
    }
    setRefreshing(false);
  }, [validateAndSetUser, fetchData, fetchWalletBalance]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      showMessage({
        message: "Novo pedido disponível",
        description: notification.request.content.body,
        type: "success",
        icon: "auto",
        duration: 3500,
      });

      const user = await validateAndSetUser();
      if (user) {
        await fetchData(user);
        await fetchWalletBalance(user);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const extraData = response.notification.request.content.data?.extraData;
      const user = await validateAndSetUser();
      if (user) {
        await fetchData(user);
      }
      if (extraData) {
        navigation.navigate('OrderDetail', { extraData });
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && !state.isInternetReachable) {
        validateAndSetUser().then(user => {
          if (user) {
            fetchData(user);
            fetchWalletBalance(user);
          }
        });
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
      unsubscribeNetInfo();
      stopPolling();
    };
  }, [navigation, validateAndSetUser, fetchData, fetchWalletBalance, stopPolling]);

  const filteredOrders = useMemo(
    () => (selectedStatus ? orders.filter(order => order.status === selectedStatus) : orders),
    [orders, selectedStatus]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} às ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendente': return '#F59E0B';
      case 'preparando': return '#3B82F6';
      case 'entregue': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#E85A4F', '#D3483E']}
          style={styles.headerArea}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.greetingText}>Bem-vindo,</Text>
                  <Text style={styles.sellerBrand}>{userData?.seller?.name || userData?.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  activeOpacity={0.7}
                >
                  <Image
                    source={userData?.seller?.logo ? { uri: userData.seller.logo } : require('../assets/default1.jpg')}
                    style={styles.avatarImg}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceValue}>
                    {walletBalance.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.currency}> MT</Text>
                </View>
                <TouchableOpacity
                  style={styles.walletBtn}
                  onPress={() => navigation.navigate('Wallet')}
                >
                  <Feather name="trending-up" size={16} color="#FFF" />
                  <Text style={styles.walletBtnText}>Ver Carteira</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainWrapper}>
          {/* Status Section */}
          <View style={styles.storeStatusCard}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: userData?.seller?.openstore ? '#10B981' : '#EF4444' }]} />
              <Text style={styles.statusLabel}>
                Operação: <Text style={{ color: userData?.seller?.openstore ? '#10B981' : '#EF4444', fontWeight: '800' }}>
                  {userData?.seller?.openstore ? 'LOJA ABERTA' : 'LOJA FECHADA'}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.manageBtn}
            >
              <Text style={styles.manageBtnText}>Gerir</Text>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Gestão de Pedidos</Text>
              <Text style={styles.sectionSub}>{orders.length} pedidos encontrados</Text>
            </View>
            {lastUpdate && (
              <View style={styles.syncBox}>
                <Ionicons name="sync" size={12} color="#9CA3AF" />
                <Text style={styles.syncText}>{lastUpdate.getHours()}:{String(lastUpdate.getMinutes()).padStart(2, '0')}</Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedStatus && styles.activeChip]}
              onPress={() => setSelectedStatus(null)}
            >
              <Text style={[styles.filterText, !selectedStatus && styles.activeFilterText]}>Todos</Text>
            </TouchableOpacity>
            {availableStatuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, selectedStatus === status && styles.activeChip]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.filterText, selectedStatus === status && styles.activeFilterText]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Orders List */}
          <View style={styles.ordersContainer}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TouchableOpacity
                  key={order._id}
                  style={styles.orderCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('OrderDetail', { order })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.orderLabel}>
                      <FontAwesome5 name="receipt" size={14} color="#E85A4F" />
                      <Text style={styles.orderCode}>#{order.code || order._id.slice(-6).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                      <View style={[styles.miniDot, { backgroundColor: getStatusColor(order.status) }]} />
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.customerRow}>
                      <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
                      <Text style={styles.customerName}>{order.user?.name || 'Cliente Visacasa'}</Text>
                    </View>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Feather name="clock" size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>{formatDate(order.createdAt)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.totalLabel}>Total do Pedido</Text>
                    <Text style={styles.totalValue}>{Number(order.total || 0).toFixed(2)} MT</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-search-outline" size={80} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Nenhum pedido</Text>
                <Text style={styles.emptySub}>Aguardando novas solicitações de clientes ao vivo.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <FlashMessage position="top" style={{ borderRadius: 12, marginTop: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerArea: {
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  sellerBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  balanceContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 20,
    borderRadius: 25,
  },
  balanceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
  },
  currency: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  walletBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mainWrapper: {
    marginTop: -25,
    paddingHorizontal: 20,
  },
  storeStatusCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  manageBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 35,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
  },
  sectionSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  filterBar: {
    paddingBottom: 10,
    paddingHorizontal: 5,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#E85A4F',
    borderColor: '#E85A4F',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFF',
  },
  ordersContainer: {
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  detailsGrid: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  totalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E85A4F',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default Home;