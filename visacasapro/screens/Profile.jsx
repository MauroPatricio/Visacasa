import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../hooks/createConnectionApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStore, setUpdatingStore] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchPendingWithdrawals = async () => {
    if (userData?.token) {
      try {
        const response = await api.get('/wallet/pending', {
          headers: { Authorization: `Bearer ${userData.token}` }
        });
        setPendingCount(response.data.length || 0);
      } catch (error) {
        console.error("Erro ao buscar solicitações pendentes:", error);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadUserAndPending = async () => {
        await checkIfUserExist();
        if (userData?.token && isAdmin) {
          fetchPendingWithdrawals();
        }
      };
      loadUserAndPending();
    }, [userData, isAdmin])
  );

  const checkIfUserExist = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserId = await AsyncStorage.getItem('id');

      if (storedUserData && storedUserId) {
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData._id === storedUserId) {
          setUserData(parsedUserData);
          setIsStoreOpen(parsedUserData.seller?.openstore || false);
          setUserLogin(true);
          setIsAdmin(parsedUserData.isAdmin);
        } else {
          navigation.navigate('Login');
        }
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      navigation.navigate('Login');
    } finally {
      setIsLoading(false);
    }
  };

  const userLogout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem('id');
    await AsyncStorage.removeItem('userData');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    setIsLoading(false);
  };

  const logout = () => {
    Alert.alert("Sair", "Tem a certeza que deseja sair da conta?", [
      { text: "Cancelar", style: 'cancel' },
      { text: "Continuar", onPress: () => userLogout(), style: 'destructive' },
    ]);
  };

  const toggleStoreStatus = async () => {
    setUpdatingStore(true);
    try {
      const id = await AsyncStorage.getItem('id');
      const newStatus = !isStoreOpen;

      const response = await api.patch(
        `/users/seller-status/${id}`,
        { isOpenStore: newStatus },
        { headers: { Authorization: `Bearer ${userData.token}` } }
      );

      if (response?.status === 200) {
        setIsStoreOpen(newStatus);
        const updatedUser = {
          ...userData,
          seller: { ...userData.seller, openstore: newStatus }
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      } else {
        Alert.alert('Erro', 'Falha ao atualizar o estado da loja.');
      }
    } catch (error) {
      console.error('Erro ao atualizar estado da loja:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o estado da loja.');
    } finally {
      setUpdatingStore(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#E85A4F" />
        <Text style={styles.loadingText}>Sincronizando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#E85A4F', '#D3483E']}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.profileInfoRow}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={userData?.seller?.logo ? { uri: userData.seller.logo } : require('../assets/default1.jpg')}
                    style={styles.avatar}
                  />
                  <View style={styles.activeIndicator} />
                </View>
                <View style={styles.textInfo}>
                  <Text style={styles.greeting}>Bem-vindo,</Text>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userLogin ? (userData?.seller?.name || userData?.name) : "Fazer Login"}
                  </Text>
                  <View style={styles.roleTag}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#FFF" />
                    <Text style={styles.roleText}>{isAdmin ? 'Administrador' : 'Parceiro PRO'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainContent}>

          {/* Stats/Quick Actions Card */}
          <View style={styles.statsCard}>
            <View style={styles.operationStatus}>
              <View>
                <Text style={styles.statLabel}>Estado da Operação</Text>
                <Text style={[styles.statValue, { color: isStoreOpen ? '#10B981' : '#EF4444' }]}>
                  {isStoreOpen ? 'Loja Aberta' : 'Loja Fechada'}
                </Text>
              </View>
              <Switch
                value={isStoreOpen}
                onValueChange={toggleStoreStatus}
                trackColor={{ false: "#D1D5DB", true: "#FECACA" }}
                thumbColor={isStoreOpen ? "#E85A4F" : "#F3F4FB"}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* Wallet Highlight */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financeiro</Text>
            <TouchableOpacity
              style={styles.menuCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Wallet')}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.menuCardGradient}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="wallet-outline" size={24} color="#E85A4F" />
                </View>
                <View style={styles.menuCardText}>
                  <Text style={styles.menuCardTitle}>Minha Carteira</Text>
                  <Text style={styles.menuCardSub}>Consulte saldo e histórico</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Admin Section */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Administração</Text>
              <TouchableOpacity
                style={styles.menuCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('WithdrawalRequests')}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={styles.menuCardGradient}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialCommunityIcons name="bank-transfer" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.menuCardText}>
                    <Text style={styles.menuCardTitle}>Autorizar Levantamentos</Text>
                    <Text style={[styles.menuCardSub, pendingCount > 0 && { color: '#EF4444', fontWeight: '700' }]}>
                      {pendingCount > 0 ? `${pendingCount} solicitações pendentes` : 'Tudo em dia'}
                    </Text>
                  </View>
                  {pendingCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{pendingCount}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferências</Text>

            <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
              <Ionicons name="person-outline" size={22} color="#4B5563" />
              <Text style={styles.listText}>Sintonizar Perfil</Text>
              <Feather name="chevron-right" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
              <Ionicons name="help-circle-outline" size={22} color="#4B5563" />
              <Text style={styles.listText}>Ajuda & FAQ</Text>
              <Feather name="chevron-right" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.listItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.6}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.listText, { color: '#EF4444' }]}>Terminar Sessão</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalInfo}>
            <Text style={styles.versionText}>VisacasaPRO v2.4.0</Text>
            <Text style={styles.copyrightText}>© 2024 Visacasa. Todos os direitos reservados.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Loading Modal */}
      <Modal transparent visible={updatingStore} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color="#E85A4F" />
            <Text style={styles.overlayText}>Atualizando estado...</Text>
          </View>
        </View>
      </Modal>
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
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#E85A4F',
  },
  textInfo: {
    marginLeft: 20,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  mainContent: {
    marginTop: -25,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 8,
  },
  operationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  menuCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardText: {
    flex: 1,
    marginLeft: 16,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  menuCardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 5,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 15,
  },
  legalInfo: {
    marginTop: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  copyrightText: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.7,
  },
  overlayText: {
    color: '#1F2937',
    marginTop: 15,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default React.memo(Profile);
