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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../hooks/createConnectionApi';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import registerDeviceToken from '../utils/registerDeviceToken';

export default function LoginPage() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideText, setHideText] = useState(true);

  const [errors, setErrors] = useState({ phoneNumber: '', password: '' });

  const handleLogin = async () => {
    let valid = true;
    const newErrors = { phoneNumber: '', password: '' };

    // Telefone: obrigatório + 9 dígitos
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Preencha o telefone';
      valid = false;
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'O telefone deve ter exatamente 9 dígitos';
      valid = false;
    }

    // Senha: obrigatório + mínimo 6 caracteres
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
      const response = await api.post('/users/signinseller', { phoneNumber, password });
      if (response.data) {
        const userData = response.data;

        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('id', userData._id);
        registerDeviceToken(userData);

        Toast.show({
          type: 'success',
          text1: 'Bem-vindo!',
          text2: 'Login efetuado com sucesso',
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomNavigation' }],
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Falha no login',
        text2: err?.response?.data?.message || 'Verifique as credenciais e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            {/* Logotipo */}
            <Image
              source={require('../assets/visacasa2.png')}
              style={styles.cover}
            />
            <Text style={styles.title}>Bem-vindo à VisacasaPRO</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            {/* Telefone */}
            <View style={styles.wrapper}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputWrapper(errors.phoneNumber ? 'red' : '#E85A4F')}>
                <Ionicons name="phone-portrait" size={20} color="grey" style={styles.iconStyle} />
                <TextInput
                  placeholder="Insira o telefone"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={phoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  onChangeText={text => { setPhoneNumber(text); setErrors({...errors, phoneNumber: ''}); }}
                />
              </View>
              {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
            </View>

            {/* Senha */}
            <View style={styles.wrapper}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper(errors.password ? 'red' : '#E85A4F')}>
                <Ionicons name="lock-closed-outline" size={20} color="grey" style={styles.iconStyle} />
                <TextInput
                  placeholder="Insira a senha"
                  placeholderTextColor="#999"
                  secureTextEntry={hideText}
                  style={styles.input}
                  value={password}
                  onChangeText={text => { setPassword(text); setErrors({...errors, password: ''}); }}
                />
                <TouchableOpacity onPress={() => setHideText(!hideText)}>
                  <Ionicons
                    name={hideText ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Botão Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Registrar */}
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={{ marginTop: 15 }}
            >
              <Text style={styles.registerText}>
                Não tens conta? <Text style={styles.link}>Criar conta</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  cover: {
    height: 150,
    width: 320,
    resizeMode: 'contain',
    marginVertical: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 30,
  },
  wrapper: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#E85A4F',
  },
  inputWrapper: (borderColor) => ({
    borderColor,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
    elevation: 2,
  }),
  iconStyle: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#E85A4F',
    borderRadius: 12,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 6,
  },
  registerText: {
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#E85A4F',
    fontWeight: '600',
  },
});
