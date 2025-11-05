import React, { useEffect, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from './hooks/createConnectionApi';
import { store } from './store';
import { enableScreens } from 'react-native-screens';

// Screens
import ButtomTabNavegation from './navegation/ButtomTabNavegation';
import ProductDetail from './components/products/ProductDetail';
import NewProduct from './screens/NewProduct';
import ProductListSeller from './components/products/ProductListSeller';
import ProductSellerDetail from './components/products/ProductSellerDetail';
import PaymentsHistory from './screens/PaymentsHistory';
import LoginPage from './screens/LoginPage';
import SignUp from './screens/SignUp';
import SellerScreen from './components/SellerScreen';
import SellerProduct from './components/SellerProduct';
import PaymentMethod from './screens/PaymentMethod';
import OrderDetail from './screens/OrderDetail';
import MpesaScreen from './screens/MpesaScreen';
import SuccessPayment from './screens/SuccessPayment';
import FailedPayment from './screens/FailedPayment';
import MapScreen from './screens/MapScreen';
import RideOptionsCard from './components/RideOptionsCard';
import TransportType from './components/TransportType';
import EditProductView from './components/products/EditProductView';
import Cart from './screens/Cart';
import PayWithWallet from './screens/PayWithWallet';
import TopUpScreen from './screens/TopUpScreen';
import WalletScreen from './screens/WalletScreen';
import WalletWithdrawScreen from './screens/WalletWithdrawScreen';
import WithdrawalRequestsScreen from './components/WithdrawalRequests';
import { navigationRef, navigate } from './navegation/RootNavigation';

const Stack = createNativeStackNavigator();

enableScreens();

// 🔔 Configuração do handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notificationResponseListener = useRef();
  const notificationReceivedListener = useRef();

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('order-updates', {
        name: 'Atualizações de Pedido',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const setupNotifications = async () => {
      const deviceToken = await registerForPushNotificationsAsync();
      if (deviceToken) {
        const userId = await AsyncStorage.getItem('id');
        if (userId) {
          try {
            await api.post('/notifications/savedevicetoken', {
              deviceToken,
              userId,
              platform: Platform.OS,
            });
            console.log('✅ deviceToken salvo com sucesso.');
          } catch (err) {
            console.error('❌ Erro ao salvar token:', err);
          }
        }
      }

      // Quando app está em foreground
      notificationReceivedListener.current = Notifications.addNotificationReceivedListener((notification) => {
        Toast.show({
          type: 'info',
          text1: notification.request.content.title || 'Nova notificação',
          text2: notification.request.content.body || '',
          position: 'top',
          visibilityTime: 4000,
        });
      });

      // Quando usuário toca na notificação
      notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification?.request?.content?.data;
        if (data?.orderId && navigationRef.isReady()) {
          navigate('OrderDetail', { orderId: data.orderId });
        }
      });
    };

    setupNotifications();

    return () => {
      notificationReceivedListener.current?.remove();
      notificationResponseListener.current?.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              <Stack.Navigator>
                <Stack.Screen
                  name="BottomNavigation"
                  component={ButtomTabNavegation}
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false }} />
                <Stack.Screen name="NewProduct" component={NewProduct} options={{ headerShown: false }} />
                <Stack.Screen name="ProductListSeller" component={ProductListSeller} options={{ headerShown: false }} />
                <Stack.Screen name="ProductSellerDetail" component={ProductSellerDetail} options={{ headerShown: false }} />
                <Stack.Screen name="PaymentsHistory" component={PaymentsHistory} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="SellerScreen" component={SellerScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SellerProduct" component={SellerProduct} options={{ headerShown: false }} />
                <Stack.Screen name="PaymentMethod" component={PaymentMethod} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ headerShown: false }} />
                <Stack.Screen name="MpesaScreen" component={MpesaScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SuccessPayment" component={SuccessPayment} options={{ headerShown: false }} />
                <Stack.Screen name="FailedPayment" component={FailedPayment} options={{ headerShown: false }} />
                <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
                <Stack.Screen name="RideOptionsCard" component={RideOptionsCard} options={{ headerShown: false }} />
                <Stack.Screen name="TransportType" component={TransportType} options={{ headerShown: false }} />
                <Stack.Screen name="EditProduct" component={EditProductView} options={{ headerShown: false }} />
                <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
                <Stack.Screen name="WithdrawalRequests" component={WithdrawalRequestsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
                <Stack.Screen name="TopUp" component={TopUpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Pay" component={PayWithWallet} options={{ headerShown: false }} />
                <Stack.Screen name="withdraw" component={WalletWithdrawScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            </KeyboardAvoidingView>
          </NavigationContainer>

          {/* ✅ Toast dentro do SafeAreaProvider e fora da Navigation */}
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

// 🔧 Registro de notificações
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Use um dispositivo físico para notificações.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissão para notificações foi negada.');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '3955dd7f-ad17-497a-966b-33dfae1b0b18',
  });

  return tokenData.data;
}
