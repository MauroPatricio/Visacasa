import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  useEffect(() => {
    checkIfUserExist();
  }, []);

  const checkIfUserExist = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserId = await AsyncStorage.getItem('id');

      if (storedUserData && storedUserId) {
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData._id === storedUserId) {
          setUserData(parsedUserData);
          setUserLogin(true);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
    }
  };

  const userLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('id');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao sair:', error);
      navigation.replace('Login');
    }
  };

  const logout = () => {
    Alert.alert(
      "Sair",
      "Tem a certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => userLogout() }
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, color = "#374151" }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuLabel, { color: color === "#E85A4F" ? "#E85A4F" : "#374151" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#E85A4F', '#D3483E']}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require('../assets/default1.jpg')}
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userLogin ? userData.name : "Bem-vindo!"}
                </Text>
                <Text style={styles.userSub}>
                  {userLogin ? userData?.phoneNumber : "Entre na sua conta para explorar melhor"}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {!userLogin ? (
            <TouchableOpacity
              style={styles.loginCard}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient
                colors={['#E85A4F', '#D3483E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <Text style={styles.loginButtonText}>Fazer Login / Criar Conta</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minha Atividade</Text>
            <View style={styles.card}>
              <MenuItem
                icon="receipt-outline"
                label="Meus Pedidos"
                onPress={() => navigation.navigate('Pedidos')}
              />
              <MenuItem
                icon="cart-outline"
                label="Meu Carrinho"
                onPress={() => navigation.navigate('Cart')}
              />
              <MenuItem
                icon="heart-outline"
                label="Favoritos"
                onPress={() => navigation.navigate('Favorites')}
              />
            </View>
          </View>

          {/* Tools Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ferramentas</Text>
            <View style={styles.card}>
              <MenuItem
                icon="pricetag-outline"
                label="Comparador de Preços"
                onPress={() => navigation.navigate('PriceComparison')}
              />
              <MenuItem
                icon="location-outline"
                label="Endereços de Entrega"
                onPress={() => { }}
              />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            <View style={styles.card}>
              <MenuItem
                icon="notifications-outline"
                label="Notificações"
                onPress={() => { }}
              />
              <MenuItem
                icon="shield-checkmark-outline"
                label="Privacidade & Segurança"
                onPress={() => { }}
              />
              {userLogin && (
                <MenuItem
                  icon="log-out-outline"
                  label="Sair da Conta"
                  color="#E85A4F"
                  onPress={logout}
                />
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.version}>Visacasa v1.0.2</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#374151',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  loginCard: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
  }
});

