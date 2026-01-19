import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../hooks/createConnectionApi';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BackBtn from '../components/BackBtn';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required('O nome é obrigatório'),
  email: Yup.string().trim().email('Email inválido').required('O email é obrigatório'),
  password: Yup.string().min(6, 'A senha deve conter no mínimo 6 dígitos').required('A senha é obrigatória'),
  phoneNumber: Yup.string()
    .trim()
    .matches(/^8[2-7][0-9]{7}$/, 'Número inválido. Deve possuir 9 dígitos.')
    .required('Número de telefone é obrigatório'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'As senhas não coincidem').required('Confirmação é obrigatória'),
  checkedTerms: Yup.boolean().oneOf([true], 'Você deve aceitar os termos e condições'),
  seller: Yup.object().shape({
    name: Yup.string().trim().required('O nome do estabelecimento é obrigatório'),
    description: Yup.string().trim().required('A descrição do estabelecimento é obrigatória'),
    address: Yup.string().trim().required('O endereço do estabelecimento é obrigatório'),

    phoneNumberAccount: Yup.string()
      .trim()
      .matches(/^8[4-5][0-9]{7}$/, 'O telefone deve ter 9 dígitos e começar com 84 ou 85.')
      .required('Número de telefone obrigatório'),
    alternativePhoneNumberAccount: Yup.string()
      .trim()
      .matches(/^8[6-7][0-9]{7}$/, 'O telefone deve ter 9 dígitos e começar com 86 ou 87.')
      .required('Número de telefone obrigatório'),
    province: Yup.string().trim().required('A localização do estabelecimento é obrigatória'),
    tipoEstabelecimento: Yup.string().trim().required('O tipo de estabelecimento é obrigatório'),
  }),
});

const SignUp = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tiposEstabelecimentos, setTiposEstabelecimentos] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('provinces');
        setProvinces(data.provinces);
      } catch (error) {
        console.error('Erro ao buscar províncias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch tiposEstabelecimentos
  useEffect(() => {
    const fetchTipos = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('tipoestabelecimentos');
        setTiposEstabelecimentos(data.tipoestabelecimentos);
      } catch (error) {
        console.error('Erro ao buscar tipos de estabelecimento:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão de localização negada',
          text2: 'Permita o acesso à localização para continuar.',
        });
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Toast.show({ type: 'success', text1: 'Localização atualizada' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao obter localização',
        text2: 'Não foi possível obter a localização.',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleImagePicker = async (setFieldValue, setFieldTouched) => {
    try {
      setScrollEnabled(false);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão negada',
          text2: 'Permissão para acessar a galeria é necessária!',
        });
        setScrollEnabled(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Correção do 'fa' para 'false'
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        setScrollEnabled(true);
        return;
      }

      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      setImageUploading(true);

      const uploadedUrl = await uploadImage(imageUri);

      if (uploadedUrl) {
        setFieldValue('seller.logo', uploadedUrl);
        setFieldTouched('seller.logo', true);
        Toast.show({ type: 'success', text1: 'Logo carregada com sucesso!' });
      }
    } catch (err) {
      console.error('Erro ao escolher imagem:', err);
      Toast.show({ type: 'error', text1: 'Erro ao selecionar a imagem' });
    } finally {
      setImageUploading(false);
      setTimeout(() => setScrollEnabled(true), 100);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const fileName = uri.split('/').pop();
      const fileType = fileName.split('.').pop();

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: fileName,
        type: `image/${fileType}`,
      });

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      return response.data?.secure_url || response.data?.url || null;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Erro no upload da imagem',
        text2: 'Tente novamente com uma imagem menor'
      });
      return null;
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (!location?.coords) {
        Toast.show({ type: 'error', text1: 'Ative a localização para continuar.' });
        return;
      }

      values.seller.latitude = location.coords.latitude;
      values.seller.longitude = location.coords.longitude;
      values.isSeller = true;
      values.seller.logo = image;

      if (!values.seller.logo) {
        Alert.alert('Erro', 'A logo do estabelecimento é obrigatória!');
        return;
      }

      setLoading(true);
      const response = await api.post('/users/signup', values);

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      Toast.show({
        type: 'success',
        text1: 'Perfil criado com sucesso!',
        text2: 'Agora podes iniciar sessão na tua conta.',
      });

      navigation.navigate('Login');
    } catch (error) {
      let msg = error.response?.data?.message || 'Erro ao criar conta';
      Toast.show({ type: 'error', text1: 'Erro ao cadastrar', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
          >
            <View style={styles.header}>
              <BackBtn onPress={() => navigation.goBack()} />
            </View>

            <View style={styles.content}>
              <View style={styles.imageWrapper}>
                <Image source={require('../assets/visacasa2.png')} style={styles.logoTop} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.title}>Novo Registo PRO</Text>
                <Text style={styles.subtitle}>Crie o perfil da sua empresa na rede Visacasa</Text>
              </View>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phoneNumber: '',
                  checkedTerms: true,
                  seller: {
                    name: '',
                    logo: '',
                    description: '',
                    address: '',
                    phoneNumberAccount: '',
                    alternativePhoneNumberAccount: '',
                    province: '',
                    tipoEstabelecimento: '',
                  },
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched, values, errors, touched, isValid }) => (
                  <View style={styles.form}>

                    <Text style={styles.sectionHeader}>Representante</Text>

                    {/* Nome */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nome Completo</Text>
                      <View style={[styles.inputWrapper, touched.name && errors.name && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="Ex: João Mavila"
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.name}
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                        />
                      </View>
                      {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Telefone Representante */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Telefone Pessoal</Text>
                      <View style={[styles.inputWrapper, touched.phoneNumber && errors.phoneNumber && styles.inputError]}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="84/82..."
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.phoneNumber}
                          onChangeText={handleChange('phoneNumber')}
                          onBlur={handleBlur('phoneNumber')}
                          keyboardType="phone-pad"
                        />
                      </View>
                      {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Profissional</Text>
                      <View style={[styles.inputWrapper, touched.email && errors.email && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="empresa@exemplo.com"
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.email}
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                      {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Senha */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Senha de Acesso</Text>
                      <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="Mínimo 6 caracteres"
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.password}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                      {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    {/* Confirmar Senha */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirmar Senha</Text>
                      <View style={[styles.inputWrapper, touched.confirmPassword && errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="Repita a senha"
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.confirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                          onBlur={handleBlur('confirmPassword')}
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                      {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    <Text style={[styles.sectionHeader, { marginTop: 20 }]}>O Estabelecimento</Text>

                    {/* Logo */}
                    <View style={styles.logoSection}>
                      <Text style={styles.label}>Logo da Empresa</Text>
                      <View style={styles.logoUploadContainer}>
                        {image ? (
                          <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : (
                          <View style={styles.logoPlaceholder}>
                            <MaterialCommunityIcons name="store-outline" size={50} color="#E85A4F" />
                            <Text style={styles.placeholderLabel}>Pendente</Text>
                          </View>
                        )}

                        <View style={styles.logoActions}>
                          <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => handleImagePicker(setFieldValue, setFieldTouched)}
                            disabled={imageUploading}
                          >
                            <LinearGradient
                              colors={['#E85A4F', '#D3483E']}
                              style={styles.uploadGradient}
                            >
                              {imageUploading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                              ) : (
                                <>
                                  <Ionicons name="cloud-upload-outline" size={18} color="white" />
                                  <Text style={styles.uploadBtnText}>{image ? 'Alterar' : 'Enviar Logo'}</Text>
                                </>
                              )}
                            </LinearGradient>
                          </TouchableOpacity>
                          <Text style={styles.logoHint}>JPG ou PNG, máx 2MB</Text>
                        </View>
                      </View>
                      {touched.seller?.logo && errors.seller?.logo && <Text style={styles.errorText}>{errors.seller.logo}</Text>}
                    </View>

                    {/* Nome Empresa */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nome Comercial</Text>
                      <View style={[styles.inputWrapper, touched.seller?.name && errors.seller?.name && styles.inputError]}>
                        <Ionicons name="business-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="Nome do estabelecimento"
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.seller.name}
                          onChangeText={handleChange('seller.name')}
                          onBlur={handleBlur('seller.name')}
                        />
                      </View>
                      {touched.seller?.name && errors.seller?.name && <Text style={styles.errorText}>{errors.seller?.name}</Text>}
                    </View>

                    {/* Descrição */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Especialidade / Descrição</Text>
                      <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12 }, touched.seller?.description && errors.seller?.description && styles.inputError]}>
                        <Ionicons name="list-outline" size={20} color="#9CA3AF" style={{ marginTop: 2 }} />
                        <TextInput
                          placeholder="O que o seu estabelecimento oferece?"
                          placeholderTextColor="#9CA3AF"
                          style={[styles.inputText, { height: 80, textAlignVertical: 'top' }]}
                          value={values.seller.description}
                          onChangeText={handleChange('seller.description')}
                          onBlur={handleBlur('seller.description')}
                          multiline
                        />
                      </View>
                      {touched.seller?.description && errors.seller?.description && <Text style={styles.errorText}>{errors.seller?.description}</Text>}
                    </View>

                    {/* Província */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Província</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={values.seller.province}
                          onValueChange={(item) => setFieldValue('seller.province', item)}
                          style={styles.nativePicker}
                        >
                          <Picker.Item label="Escolha a região" value="" color="#9CA3AF" />
                          {provinces.map((province) => (
                            <Picker.Item key={province._id} label={province.name} value={province._id} />
                          ))}
                        </Picker>
                      </View>
                      {touched.seller?.province && errors.seller?.province && <Text style={styles.errorText}>{errors.seller?.province}</Text>}
                    </View>

                    {/* Endereço */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Endereço Completo</Text>
                      <View style={[styles.inputWrapper, touched.seller?.address && errors.seller?.address && styles.inputError]}>
                        <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="AV, Rua, Bairro..."
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.seller.address}
                          onChangeText={handleChange('seller.address')}
                          onBlur={handleBlur('seller.address')}
                        />
                      </View>
                      {touched.seller?.address && errors.seller?.address && <Text style={styles.errorText}>{errors.seller?.address}</Text>}
                    </View>

                    {/* Tipo */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Tipo de Negócio</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={values.seller.tipoEstabelecimento}
                          onValueChange={(item) => setFieldValue('seller.tipoEstabelecimento', item)}
                          style={styles.nativePicker}
                        >
                          <Picker.Item label="Escolha o setor" value="" color="#9CA3AF" />
                          {tiposEstabelecimentos.map((tipo) => (
                            <Picker.Item key={tipo._id} label={tipo.nome} value={tipo._id} />
                          ))}
                        </Picker>
                      </View>
                      {touched.seller?.tipoEstabelecimento && errors.seller?.tipoEstabelecimento && <Text style={styles.errorText}>{errors.seller?.tipoEstabelecimento}</Text>}
                    </View>

                    <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Pagamentos</Text>

                    {/* Mpesa */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número MPESA da Empresa</Text>
                      <View style={[styles.inputWrapper, touched.seller?.phoneNumberAccount && errors.seller?.phoneNumberAccount && styles.inputError]}>
                        <Image source={require('../assets/visacasa2.png')} style={{ width: 24, height: 24, opacity: 0 }} />
                        <Ionicons name="cash-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <TextInput
                          placeholder="84 / 85..."
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.seller.phoneNumberAccount}
                          onChangeText={handleChange('seller.phoneNumberAccount')}
                          onBlur={handleBlur('seller.phoneNumberAccount')}
                          keyboardType="numeric"
                        />
                      </View>
                      {touched.seller?.phoneNumberAccount && errors.seller?.phoneNumberAccount && <Text style={styles.errorText}>{errors.seller?.phoneNumberAccount}</Text>}
                    </View>

                    {/* Emola */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número E-MOLA da Empresa</Text>
                      <View style={[styles.inputWrapper, touched.seller?.alternativePhoneNumberAccount && errors.seller?.alternativePhoneNumberAccount && styles.inputError]}>
                        <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                        <TextInput
                          placeholder="86 / 87..."
                          placeholderTextColor="#9CA3AF"
                          style={styles.inputText}
                          value={values.seller.alternativePhoneNumberAccount}
                          onChangeText={handleChange('seller.alternativePhoneNumberAccount')}
                          onBlur={handleBlur('seller.alternativePhoneNumberAccount')}
                          keyboardType="numeric"
                        />
                      </View>
                      {touched.seller?.alternativePhoneNumberAccount && errors.seller?.alternativePhoneNumberAccount && <Text style={styles.errorText}>{errors.seller?.alternativePhoneNumberAccount}</Text>}
                    </View>

                    {/* Localização GPS */}
                    <View style={styles.gpsSection}>
                      <View style={styles.gpsRow}>
                        <Ionicons name="navigate" size={22} color={location?.coords ? "#10B981" : "#E85A4F"} />
                        <View style={styles.gpsInfo}>
                          <Text style={styles.gpsLabel}>Localização de Entrega</Text>
                          <Text style={styles.gpsStatus}>
                            {locationLoading ? "Buscando satélites..." : location?.coords ? "Coordenadas capturadas" : "Acesso GPS necessário"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.gpsBtn}
                          onPress={getCurrentLocation}
                          disabled={locationLoading}
                        >
                          {locationLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="refresh" size={20} color="white" />}
                        </TouchableOpacity>
                      </View>
                      {!location?.coords && <Text style={styles.errorTextGPS}>* Necessário para clientes te encontrarem</Text>}
                    </View>

                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={handleSubmit}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#E85A4F', '#D3483E']}
                        style={styles.submitGradient}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <View style={styles.submitContent}>
                            <Text style={styles.submitText}>Finalizar Registo PRO</Text>
                            <Ionicons name="rocket-outline" size={22} color="white" />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footerLinks}>
                      <Text style={styles.alreadyPartner}>Já é parceiro?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}> Entrar no Painel</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ height: 60 }} />
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Toast />
    </View>
  );
};

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
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  imageWrapper: {
    alignItems: 'center',
    marginVertical: 25,
  },
  logoTop: {
    height: 60,
    width: 150,
    resizeMode: 'contain',
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 15,
    marginTop: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#E85A4F',
    paddingLeft: 12,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
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
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
    height: 56,
    justifyContent: 'center',
  },
  nativePicker: {
    height: 56,
    width: '100%',
  },
  logoSection: {
    marginBottom: 20,
    backgroundColor: '#FFF1F0',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E85A4F',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E85A4F',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  placeholderLabel: {
    fontSize: 10,
    color: '#E85A4F',
    fontWeight: '700',
    marginTop: 2,
  },
  logoActions: {
    flex: 1,
    marginLeft: 20,
  },
  uploadBtn: {
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    width: 140,
  },
  uploadGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logoHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  gpsSection: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gpsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  gpsStatus: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  gpsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E85A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTextGPS: {
    color: '#E85A4F',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
    marginLeft: 34,
  },
  submitBtn: {
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 35,
  },
  alreadyPartner: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginLink: {
    color: '#E85A4F',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default SignUp;
