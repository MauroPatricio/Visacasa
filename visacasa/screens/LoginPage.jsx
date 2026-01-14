import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../hooks/createConnectionApi';
import { useNavigation } from '@react-navigation/native';
import registerDeviceToken from '../utils/registerDeviceToken';
import BackBtn from '../components/BackBtn';
import { useToast } from 'react-native-toast-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginPage() {
  const navigation = useNavigation();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideText, setHideText] = useState(true);
  const [errors, setErrors] = useState({ phoneNumber: '', password: '' });

  const handleLogin = async () => {
    let valid = true;
    const newErrors = { phoneNumber: '', password: '' };

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Preencha o telefone';
      valid = false;
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'O telefone deve ter exatamente 9 dígitos';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Preencha a senha';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);
    try {
      const response = await api.post('/users/signin', { phoneNumber, password });

      if (response.data) {
        const userData = response.data;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('id', userData._id);
        registerDeviceToken(userData);

        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomNavigation' }],
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      toast.show(errorMessage, { type: 'danger', placement: 'top' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <BackBtn onPress={() => navigation.navigate('BottomNavigation')} />
            </View>

            <View style={styles.content}>
              <View style={styles.imageWrapper}>
                <Image
                  source={require('../assets/visacasa2.png')}
                  style={styles.logo}
                />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.title}>Bem-vindo de volta!</Text>
                <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
              </View>

              <View style={styles.form}>
                {/* Telefone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone</Text>
                  <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
                    <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="84 123 4567"
                      placeholderTextColor="#9CA3AF"
                      style={styles.input}
                      value={phoneNumber}
                      keyboardType="phone-pad"
                      onChangeText={text => {
                        setPhoneNumber(text);
                        setErrors({ ...errors, phoneNumber: '' });
                      }}
                    />
                  </View>
                  {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
                </View>

                {/* Senha */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha</Text>
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="Sua senha secreta"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={hideText}
                      style={styles.input}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        setErrors({ ...errors, password: '' });
                      }}
                    />
                    <TouchableOpacity onPress={() => setHideText(!hideText)}>
                      <Ionicons
                        name={hideText ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                <TouchableOpacity style={styles.forgotPass}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E85A4F', '#D3483E']}
                    style={styles.loginButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.loginText}>Entrar Agora</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.noAccount}>Não tem uma conta?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signUpLink}> Criar Conta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  imageWrapper: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    height: 80,
    width: 200,
    resizeMode: 'contain',
  },
  titleSection: {
    marginBottom: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#E85A4F',
    fontWeight: '700',
    fontSize: 14,
  },
  loginButton: {
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  noAccount: {
    color: '#6B7280',
    fontSize: 15,
  },
  signUpLink: {
    color: '#E85A4F',
    fontWeight: '800',
    fontSize: 15,
  },
});

