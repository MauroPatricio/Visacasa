import React, { useState, useReducer } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackBtn from '../components/BackBtn';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import * as Yup from 'yup';
import api from '../hooks/createConnectionApi';
import { useToast } from 'react-native-toast-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- Validação ---
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('O nome é obrigatório'),

  phoneNumber: Yup.string()
    .trim()
    .required('O número de telefone é obrigatório')
    .matches(
      /^(82|83|84|85|86|87)\d{7}$/,
      'Número inválido. Use 9 dígitos começando por 8x'
    ),

  email: Yup.string()
    .trim()
    .email('Email inválido')
    .required('O email é obrigatório'),

  password: Yup.string()
    .trim()
    .min(6, 'A senha deve conter pelo menos 6 dígitos')
    .required('A senha é obrigatória'),
});

// --- Reducer para loading e erro ---
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const SignUp = ({ navigation }) => {
  const [hideText, setHideText] = useState(true);
  const [state, dispatch] = useReducer(formReducer, { loading: false, error: null });
  const toast = useToast();

  const submitRegistration = async (values) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await api.post('/users/signup', values);

      if (response.status === 200) {
        toast.show('Conta criada com sucesso!', { type: 'success', placement: 'top' });
        navigation.replace('Login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar';
      toast.show(errorMessage, { type: 'danger', placement: 'top' });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BackBtn onPress={() => navigation.replace('Login')} />
          </View>

          <View style={styles.content}>
            <View style={styles.imageWrapper}>
              <Image source={require('../assets/visacasa2.png')} style={styles.logo} />
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Junte-se à família Visacasa hoje</Text>
            </View>

            <Formik
              initialValues={{ phoneNumber: '', password: '', name: '', email: '' }}
              validationSchema={validationSchema}
              onSubmit={(values) => submitRegistration(values)}
            >
              {({ handleChange, handleBlur, touched, handleSubmit, values, errors, isValid, setFieldTouched }) => (
                <View style={styles.form}>

                  {/* Nome */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome e Apelido</Text>
                    <View style={[styles.inputWrapper, touched.name && errors.name && styles.inputError]}>
                      <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="Ex: João Silva"
                        onFocus={() => setFieldTouched('name')}
                        style={styles.input}
                        value={values.name}
                        onChangeText={handleChange('name')}
                      />
                    </View>
                    {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>

                  {/* Telefone */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefone</Text>
                    <View style={[styles.inputWrapper, touched.phoneNumber && errors.phoneNumber && styles.inputError]}>
                      <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="84 123 4567"
                        onFocus={() => setFieldTouched('phoneNumber')}
                        style={styles.input}
                        value={values.phoneNumber}
                        onChangeText={handleChange('phoneNumber')}
                        maxLength={9}
                        keyboardType="phone-pad"
                      />
                    </View>
                    {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, touched.email && errors.email && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="seu@email.com"
                        onFocus={() => setFieldTouched('email')}
                        style={styles.input}
                        value={values.email}
                        onChangeText={handleChange('email')}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                    {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Senha */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha</Text>
                    <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="Mínimo 6 caracteres"
                        secureTextEntry={hideText}
                        onFocus={() => setFieldTouched('password')}
                        style={styles.input}
                        value={values.password}
                        onChangeText={handleChange('password')}
                      />
                      <TouchableOpacity onPress={() => setHideText(!hideText)}>
                        <Ionicons name={hideText ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={state.loading || !isValid}
                    activeOpacity={0.8}
                    style={{ marginTop: 10 }}
                  >
                    <LinearGradient
                      colors={isValid ? ['#E85A4F', '#D3483E'] : ['#E5E7EB', '#D1D5DB']}
                      style={styles.signUpButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {state.loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View style={styles.btnContent}>
                          <Text style={styles.signUpText}>Registar Conta</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.hasAccount}>Já tem uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.replace('Login')}>
                      <Text style={styles.loginLink}> Entrar aqui</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUp;

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
    marginVertical: 30,
  },
  logo: {
    height: 70,
    width: 180,
    resizeMode: 'contain',
  },
  titleSection: {
    marginBottom: 30,
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
    marginBottom: 18,
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
  signUpButton: {
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
  signUpText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 35,
  },
  hasAccount: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginLink: {
    color: '#E85A4F',
    fontWeight: '800',
    fontSize: 15,
  },
});

