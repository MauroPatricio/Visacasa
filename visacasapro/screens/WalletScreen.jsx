import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../hooks/createConnectionApi';
import BackBtn from '../components/BackBtn';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const WalletScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) throw new Error("Usuário não encontrado");
      const parsedUser = JSON.parse(storedUserData);
      setUserData(parsedUser);
      return parsedUser;
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err.message);
      navigation.navigate('Login');
      return null;
    }
  };

  const loadWallet = async (user) => {
    try {
      const res1 = await api.get('/wallet/balance', {
        headers: { authorization: `Bearer ${user.token}` },
      });
      const res2 = await api.get('/wallet/transactions', {
        headers: { authorization: `Bearer ${user.token}` },
      });

      setBalance(res1.data.balance || 0);
      setTransactions(res2.data || []);
    } catch (err) {
      console.error('Erro ao carregar carteira:', err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = await loadUserData();
      if (user) {
        loadWallet(user);
      }
    };
    init();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const user = await loadUserData();
    if (user) {
      await loadWallet(user);
    }
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const renderTransaction = ({ item }) => {
    const isCredit = item.type === 'credit';

    return (
      <View style={styles.transactionCard}>
        <View style={[styles.iconBox, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
          <MaterialCommunityIcons
            name={isCredit ? 'arrow-bottom-left' : 'arrow-top-right'}
            size={24}
            color={isCredit ? '#10B981' : '#EF4444'}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description || (isCredit ? 'Crédito' : 'Débito')}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isCredit ? '#10B981' : '#EF4444' }]}>
          {isCredit ? '+' : '-'}{Number(item.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <BackBtn onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Minha Carteira</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <FlatList
        data={transactions}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E85A4F" />
        }
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={['#E85A4F', '#D3483E']}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceHeader}>
                <Ionicons name="card-outline" size={24} color="rgba(255,255,255,0.7)" />
                <Text style={styles.balanceLabel}>Saldo Actual</Text>
              </View>
              <Text style={styles.balanceValue}>
                {Number(balance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.accountHolder}>{(userData?.seller?.name || userData?.name)?.toUpperCase()}</Text>
                <Image source={require('../assets/visacasa2.png')} style={styles.cardLogo} />
              </View>
            </LinearGradient>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('WalletWithdrawScreen')}
              >
                <LinearGradient
                  colors={['#E85A4F', '#D3483E']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="bank-transfer-out" size={24} color="white" />
                  <Text style={styles.actionText}>Solicitar Levantamento</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Histórico de Movimentos</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 25,
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 25,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountHolder: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardLogo: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
    tintColor: 'white',
    opacity: 0.8,
  },
  actionRow: {
    marginBottom: 35,
  },
  actionButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    gap: 15,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default WalletScreen;
