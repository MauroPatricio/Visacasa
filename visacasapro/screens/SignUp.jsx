import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../hooks/createConnectionApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackBtn from '../components/BackBtn';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('O nome é obrigatório'),
  email: Yup.string()
    .trim()
    .email('Email inválido')
    .required('O email é obrigatório'),
  password: Yup.string()
    .min(6, 'A senha deve conter no mínimo 6 dígitos')
    .required('A senha é obrigatória'),
  phoneNumber: Yup.string()
    .trim()
    .matches(/^8[2-7][0-9]{7}$/, 'Número de telefone inválido. Deve começar com 82, 83, 84, 85, 86 ou 87 e ter 9 dígitos.')
    .required('Número de telefone é obrigatório'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'As senhas não coincidem')
    .required('A confirmação da senha é obrigatória'),
  checkedTerms: Yup.boolean()
    .oneOf([true], 'Você deve aceitar os termos e condições'),
  seller: Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('O nome do estabelecimento é obrigatório'),
    logo: Yup.string()
      .trim()
      .required('A Logo é obrigatória'),
    description: Yup.string()
      .trim()
      .required('A descrição do estabelecimento é obrigatória'),
    address: Yup.string()
      .trim()
      .required('O endereço do estabelecimento é obrigatório'),
    phoneNumberAccount: Yup.string()
      .trim()
      .matches(/^8[4-5][0-9]{7}$/, 'O telefone deve ter 9 dígitos e começar com 84 ou 85.')
      .required('Número de telefone obrigatório'),
    alternativePhoneNumberAccount: Yup.string()
      .trim()
      .matches(/^8[6-7][0-9]{7}$/, 'O telefone deve ter 9 dígitos e começar com 86 ou 87.')
      .required('Número de telefone obrigatório'),
    province: Yup.string()
      .trim()
      .required('A localização do estabelecimento é obrigatória'),
    tipoEstabelecimento: Yup.string()
      .trim()
      .required('O tipo de estabelecimento é obrigatório'),
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
  const [locationValue, setLocationValue] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

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

  useEffect(() => {
    const fetchTiposEstabelecimentos = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('tipoestabelecimentos');
        setTiposEstabelecimentos(data.tipoestabelecimentos);
      } catch (error) {
        console.error('Erro ao buscar Tipos Estabelecimentos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTiposEstabelecimentos();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão de localização negada',
          text2: 'Por favor, permita o acesso à localização para continuar.',
        });
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Toast.show({
        type: 'success',
        text1: 'Localização atualizada',
        text2: 'Sua localização foi atualizada com sucesso.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao obter localização',
        text2: 'Não foi possível obter a localização atual.',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleImagePicker = async (setFieldValue) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permissão negada',
        text2: 'Permissão para acessar a galeria é necessária!',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const uploadedImage = await uploadImage(uri);
      setFieldValue('seller.logo', uploadedImage);
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    try {
      const { data } = await api.post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.secure_url;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar a imagem',
        text2: 'Tente novamente mais tarde.',
      });
      return null;
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (!location?.coords) {
        throw new Error('Localização indisponível. Por favor, ative o GPS.');
      }
      if (!location) {
        Toast.show({ 
          type:'error', 
          text1:'É preciso habilitar a localização para continuar.' 
        });
        return;
      }

      values.seller.latitude = location.coords.latitude;
      values.seller.longitude = location.coords.longitude;
      values.isSeller = true;

      // Criação do perfil
      const response = await api.post('users/signup', values);

      // Permissão para notificações
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permissão de notificações não concedida.');
      }

      // const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      // Atualiza o push token do usuário
      // await api.patch(`/users/updatePushToken/${response.data._id}`, { pushToken: token });

      Toast.show({
        type: 'success',
        text1: 'Perfil criado com sucesso',
        position: 'top',
      });
      

      navigation.navigate('Login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Ocorreu um erro inesperado.';
      Toast.show({
        type: 'error',
        text1: errorMessage,
        position: 'top',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <BackBtn onPress={() => navigation.goBack()} />
        <Image source={require('../assets/visacasa2.png')} style={styles.cover} />
        <Text style={styles.title}>NOVO REGISTO</Text>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            seller: {
              name: '',
              logo: '',
              description: '',
              address: '',
              phoneNumberAccount: '',
              alternativePhoneNumberAccount: '',
              province: '',
              tipoEstabelecimento: ''
            },
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <>
              {/* User Details */}
              <Text style={styles.sectionTitle}>Dados do representante</Text>

<<<<<<< HEAD
              <Text style={styles.label}>Nome e apelido</Text>
              <View style={styles.inputWrapper(touched.name ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                />
=======

            // workDayAndTime: [
            //     { dayNumber: '', dayOfWeek: '', opentime: '', closetime: '' },
            //   ]
          },
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {

          values.seller.latitude = location?.coords.latitude;
          values.seller.longitude = location?.coords.longitude

          try {
            const userSeller = await api.post('users/signup', values);


            const projectId = "92c183ff-d0ca-4dc4-a4ce-e7c112be9ee0";
            let token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            await updatePushToken(userSeller._id, token);
            setExpoPushToken(token);

            Toast.show({
                type: 'success',
                text1: 'Perfil criado com sucesso',
                position: 'top',
                visibilityTime: 4000, // Time for how long the toast will show
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
                style: {
                    
                backgroundColor: '#4CAF50', // Green background for success
                borderLeftWidth: 10,
                borderLeftColor: '#00C851', // Left border accent for success
                },
                text1Style: {
                fontSize: 18,
                fontWeight: 'bold',
                color: 'black', // Text color
                
                },
              });
              navigation.navigate('NewProduct')
          } catch (error) {
          
            const errorMessage = error?.response?.data?.message || 'Ocorreu um erro inesperado.';
            // Alert.alert('Erro', errorMessage);

            Toast.show({
                type: 'error',
                text1: errorMessage,
                // text2: 'Clique em Registar',
                position: 'top',
              });
          }
          // Submit logic goes here
        }}

        
      >
        {({ handleChange, handleBlur, handleSubmit,setFieldValue,values, errors, touched }) => (
          
          <>
            {/* User Details */}
            <Text style={{fontSize: 18, fontWeight: '500', paddingTop:15, paddingBottom: 5}}>Dados do representante</Text>

            <Text style={styles.label}>Nome e apelido</Text>
          

                 <View style={styles.inputWrapper(touched.name? '#7F00FF':'#ccc')}>
             
                <TextInput 
                autoCapitalize='none'
                autoCorrect={false}
                style={{flex:1}}
                value={values.name}
                onChangeText={(text) => {
                  const filteredText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); // Permitir apenas letras e espaços
                  setFieldValue('name', filteredText); // Atualiza o campo de nome com o texto filtrado
                }}
                />
            </View>
                {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <Text style={{fontSize: 18, fontWeight: '500', paddingTop:15, paddingBottom: 5}}>Dados de acesso</Text>

            <Text style={styles.label}>Número de telefone</Text>
            <View style={styles.inputWrapper(touched.phoneNumber? '#7F00FF':'#ccc')}>
            <TextInput
              onChangeText={handleChange('phoneNumber')}
              onBlur={handleBlur('phoneNumber')}
              value={values.phoneNumber}
              keyboardType="numeric"
              style={{flex:1}}

            />
            </View>
            {touched.phoneNumber && errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}



            <Text  style={styles.label}>Email</Text>

            <View style={styles.inputWrapper(touched.email? '#7F00FF':'#ccc')}>

            <TextInput
                            style={{flex:1}}

              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
            />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <Text  style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper(touched.password? '#7F00FF':'#ccc')}>
            <TextInput
                            style={{flex:1}}

              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            </View>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

   
            <Text  style={styles.label}>Confirmar Senha</Text>
            <View style={styles.inputWrapper(touched.password? '#7F00FF':'#ccc')}>
            <TextInput
                            style={{flex:1}}
                placeholder="Confirmar Senha"
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
              />
>>>>>>> main
              </View>
              {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={styles.sectionTitle}>Dados de acesso</Text>

              <Text style={styles.label}>Número de telefone</Text>
              <View style={styles.inputWrapper(touched.phoneNumber ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  keyboardType="numeric"
                />
              </View>
              {touched.phoneNumber && errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper(touched.email ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                />
              </View>
              {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper(touched.password ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#E85A4F"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

<<<<<<< HEAD
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputWrapper(touched.confirmPassword ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#E85A4F"
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
=======
              {/* Upload da Logo */}
              {image ? (
  <Image source={{ uri: image }} style={styles.logo} />
) : (
  <Text style={{color: 'red'}}>É obrigatório a imagem</Text>
)}
          <TouchableOpacity style={styles.button} onPress={() => handleImagePicker(setFieldValue)}>
            <Text style={styles.buttonText}>Adicionar a logo da empresa</Text>
          </TouchableOpacity>

            {/* Seller Details */}
            <Text  style={styles.label}>Nome da empresa</Text>
            <View style={styles.inputWrapper(touched.location? '#7F00FF':'#ccc')}>
            <TextInput
             style={{flex:1}}
             onChangeText={(text) => {
              const filteredText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); // Permitir apenas letras e espaços
              setFieldValue('seller.name', filteredText); // Atualiza o campo de nome com o texto filtrado
            }}
             onBlur={handleBlur('seller.name')}
              value={values.seller.name}
            />
            </View>
            {touched.seller?.name && errors.seller?.name && <Text style={styles.error}>{errors.seller?.name}</Text>}

            <Text  style={styles.label}>Descrição do estabelecimento [Especialidade]</Text>
            <View style={styles.inputWrapper(touched.location? '#7F00FF':'#ccc')}>

            <TextInput
              style={{flex:1}}
              onChangeText={handleChange('seller.description')}
              onBlur={handleBlur('seller.description')}
              value={values.seller.description}
            />
            </View>

            {touched.seller?.description && errors.seller?.description && (
              <Text style={styles.error}>{errors.seller?.description}</Text>
            )}


           

{/* <Text  style={styles.label}>Localização</Text> */}

{/* <View style={styles.inputWrapper(touched.location? '#7F00FF':'#ccc')}> */}
          <Picker
            selectedValue={values.province}
            onValueChange={(itemValue) => setFieldValue('seller.province', itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Localização do estabelecimento" value="" />
            {provinces && provinces.map((province) => (
              <Picker.Item key={province._id} label={province.name} value={province._id} />
            ))}
          </Picker>
{/* </View> */}
{touched.seller?.province && errors.seller?.province && (
            <Text style={styles.error}>{errors.seller.province}</Text> // Mensagem de erro
          )}

            <Text  style={styles.label}>Endereço do estabelecimento [Rua/Av.]</Text>
            <View style={styles.inputWrapper(touched.location? '#7F00FF':'#ccc')}>
            <TextInput
                            style={{flex:1}}
              onChangeText={handleChange('seller.address')}
              onBlur={handleBlur('seller.address')}
              value={values.seller.address}
            />
            </View>
            {touched.seller?.address && errors.seller?.address && (
              <Text style={styles.error}>{errors.seller?.address}</Text>
            )}

            <Text  style={styles.label}>Número de conta da empresa [MPESA]</Text>
            <View style={styles.inputWrapper(touched.location? '#7F00FF':'#ccc')}>
            <TextInput
               style={{flex:1}}
              onChangeText={handleChange('seller.phoneNumberAccount')}
              onBlur={handleBlur('seller.phoneNumberAccount')}
              value={values.seller.phoneNumberAccount}
              keyboardType="numeric"
            />
            {touched.seller?.phoneNumberAccount && errors.seller?.phoneNumberAccount && (
              <Text style={styles.error}>{errors.seller?.phoneNumberAccount}</Text>
            )}
            </View>

              {/* Work Day and Time Fields */}
              {/* <FieldArray name="seller.workDayAndTime">
              {({ remove, push }) => (
                <View>
                  <Text style={styles.sectionTitle}>Work Days and Time</Text>
                  {values.seller.workDayAndTime.map((day, index) => (
                    <View key={index} style={styles.dayContainer}>
                      <Text>Day Number</Text>
                      <TextInput
                        style={styles.input}
                        onChangeText={handleChange(`seller.workDayAndTime.${index}.dayNumber`)}
                        onBlur={handleBlur(`seller.workDayAndTime.${index}.dayNumber`)}
                        value={values.seller.workDayAndTime[index].dayNumber}
                        keyboardType="numeric"
                      />
                      {touched.seller?.workDayAndTime?.[index]?.dayNumber && errors.seller?.workDayAndTime?.[index]?.dayNumber && (
                        <Text style={styles.error}>{errors.seller.workDayAndTime[index].dayNumber}</Text>
                      )}

                      <Text>Day of the Week</Text>
                      <TextInput
                        style={styles.input}
                        onChangeText={handleChange(`seller.workDayAndTime.${index}.dayOfWeek`)}
                        onBlur={handleBlur(`seller.workDayAndTime.${index}.dayOfWeek`)}
                        value={values.seller.workDayAndTime[index].dayOfWeek}
                      />
                      {touched.seller?.workDayAndTime?.[index]?.dayOfWeek && errors.seller?.workDayAndTime?.[index]?.dayOfWeek && (
                        <Text style={styles.error}>{errors.seller.workDayAndTime[index].dayOfWeek}</Text>
                      )}

                      <Text>Open Time</Text>
                      <TextInput
                        style={styles.input}
                        onChangeText={handleChange(`seller.workDayAndTime.${index}.opentime`)}
                        onBlur={handleBlur(`seller.workDayAndTime.${index}.opentime`)}
                        value={values.seller.workDayAndTime[index].opentime}
                      />
                      {touched.seller?.workDayAndTime?.[index]?.opentime && errors.seller?.workDayAndTime?.[index]?.opentime && (
                        <Text style={styles.error}>{errors.seller.workDayAndTime[index].opentime}</Text>
                      )}

                      <Text>Close Time</Text>
                      <TextInput
                        style={styles.input}
                        onChangeText={handleChange(`seller.workDayAndTime.${index}.closetime`)}
                        onBlur={handleBlur(`seller.workDayAndTime.${index}.closetime`)}
                        value={values.seller.workDayAndTime[index].closetime}
                      />
                      {touched.seller?.workDayAndTime?.[index]?.closetime && errors.seller?.workDayAndTime?.[index]?.closetime && (
                        <Text style={styles.error}>{errors.seller.workDayAndTime[index].closetime}</Text>
                      )}

                      <TouchableOpacity onPress={() => remove(index)} style={styles.removeButton}>
                        <Text style={styles.removeText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <Button title="Adicionar dias de trabalho" onPress={() => push({ dayNumber: '', dayOfWeek: '', opentime: '', closetime: '' })} />
                </View>
>>>>>>> main
              )}

              <Text style={styles.sectionTitle}>Detalhes do estabelecimento</Text>

              <Text style={styles.label}>Logo do estabelecimento</Text>
              {image ? (
                <Image source={{ uri: image }} style={styles.logo} />
              ) : (
                <Text style={{ color: 'red' }}>A logo é obrigatória</Text>
              )}
              <TouchableOpacity style={styles.button} onPress={() => handleImagePicker(setFieldValue)}>
                <Text style={styles.buttonText}>Adicionar Logo</Text>
              </TouchableOpacity>
              {touched.seller?.logo && errors.seller?.logo && (
                <Text style={styles.error}>{errors.seller.logo}</Text>
              )}

              <Text style={styles.label}>Nome da empresa</Text>
              <View style={styles.inputWrapper(touched.seller?.name ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.seller.name}
                  onChangeText={handleChange('seller.name')}
                  onBlur={handleBlur('seller.name')}
                />
              </View>
              {touched.seller?.name && errors.seller?.name && (
                <Text style={styles.error}>{errors.seller?.name}</Text>
              )}

              <Text style={styles.label}>Descrição do estabelecimento [Especialidade]</Text>
              <View style={styles.inputWrapper(touched.seller?.description ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.seller.description}
                  onChangeText={handleChange('seller.description')}
                  onBlur={handleBlur('seller.description')}
                />
              </View>
              {touched.seller?.description && errors.seller?.description && (
                <Text style={styles.error}>{errors.seller?.description}</Text>
              )}

              <Text style={styles.label}>Localização do estabelecimento</Text>
              <Picker
                selectedValue={values.seller.province}
                onValueChange={(itemValue) => setFieldValue('seller.province', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione a localização" value="" />
                {provinces.map((province) => (
                  <Picker.Item key={province._id} label={province.name} value={province._id} />
                ))}
              </Picker>
              {touched.seller?.province && errors.seller?.province && (
                <Text style={styles.error}>{errors.seller?.province}</Text>
              )}

              <Text style={styles.label}>Endereço do estabelecimento [Rua/Av.]</Text>
              <View style={styles.inputWrapper(touched.seller?.address ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.seller.address}
                  onChangeText={handleChange('seller.address')}
                  onBlur={handleBlur('seller.address')}
                />
              </View>
              {touched.seller?.address && errors.seller?.address && (
                <Text style={styles.error}>{errors.seller?.address}</Text>
              )}

              <Text style={styles.label}>Tipo de Estabelecimento</Text>
              <Picker
                selectedValue={values.seller.tipoEstabelecimento}
                onValueChange={(itemValue) => setFieldValue('seller.tipoEstabelecimento', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo de estabelecimento" value="" />
                {tiposEstabelecimentos.map((tipo) => (
                  <Picker.Item key={tipo._id} label={tipo.nome} value={tipo._id} />
                ))}
              </Picker>
              {touched.seller?.tipoEstabelecimento && errors.seller?.tipoEstabelecimento && (
                <Text style={styles.error}>{errors.seller?.tipoEstabelecimento}</Text>
              )}

              <Text style={styles.label}>Número de telefone da empresa para pagamentos [MPESA]</Text>
              <View style={styles.inputWrapper(touched.seller?.phoneNumberAccount ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.seller.phoneNumberAccount}
                  onChangeText={handleChange('seller.phoneNumberAccount')}
                  onBlur={handleBlur('seller.phoneNumberAccount')}
                  keyboardType="numeric"
                />
              </View>
              {touched.seller?.phoneNumberAccount && errors.seller?.phoneNumberAccount && (
                <Text style={styles.error}>{errors.seller?.phoneNumberAccount}</Text>
              )}

   <Text style={styles.label}>Número de telefone da empresa para pagamentos [EMOLA]</Text>
              <View style={styles.inputWrapper(touched.seller?.alternativePhoneNumberAccount ? '#E85A4F' : '#E85A4F')}>
                <TextInput
                  style={styles.input}
                  value={values.seller.alternativePhoneNumberAccount}
                  onChangeText={handleChange('seller.alternativePhoneNumberAccount')}
                  onBlur={handleBlur('seller.alternativePhoneNumberAccount')}
                  keyboardType="numeric"
                />
              </View>
              {touched.seller?.alternativePhoneNumberAccount && errors.seller?.alternativePhoneNumberAccount && (
                <Text style={styles.error}>{errors.seller?.alternativePhoneNumberAccount}</Text>
              )}

              

              {/* Location Update Button */}
              <Text style={styles.label}>Localização GPS</Text>
              <TouchableOpacity
                style={[styles.button, locationLoading && styles.buttonDisabled]}
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Text style={styles.buttonText}>
                  {locationLoading ? 'Obtendo localização...' : 'Atualizar Localização'}
                </Text>
              </TouchableOpacity>
              {location?.coords && (
                <Text style={styles.locationText}>
                  Latitude: {location.coords.latitude.toFixed(6)}, Longitude: {location.coords.longitude.toFixed(6)}
                </Text>
              )}
              {!location?.coords && (
                <Text style={styles.error}>Localização não disponível</Text>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Aguarde...' : 'Registar'}
                </Text>
              </TouchableOpacity>
              <View style={{ marginBottom: 210 }} />
            </>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  cover: {
    height: 120,
    width: '100%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
<<<<<<< HEAD
=======
   label: {
    color: '#7F00FF'
   },
>>>>>>> main
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
<<<<<<< HEAD
    color: '#E85A4F',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
    color: '#E85A4F',
  },
  label: {
    fontSize: 14,
    color: '#E85A4F',
    marginBottom: 5,
  },
  inputWrapper: (borderColor) => ({
    borderColor: borderColor,
    backgroundColor: '#FFF',
=======
    color: '#7F00FF', // Sleek dark violet for branding
    marginBottom: 25,
  },
  inputWrapper: (borderColor) => ({
    borderColor: borderColor || '#7F00FF',
    backgroundColor: '#F8F8F8',
>>>>>>> main
    borderWidth: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
<<<<<<< HEAD
    marginBottom: 15,
=======
    // marginBottom: 20, // Additional spacing for cleaner layout
    shadowColor: '#7F00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4, // Softer shadow for more depth
    elevation: 3,
>>>>>>> main
  }),
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    borderRadius: 15,
    alignSelf: 'center',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
<<<<<<< HEAD
  picker: {
    borderWidth: 1,
    borderColor: '#E85A4F',
=======
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 20,
    color: '#7F00FF', // Modern purple accent
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#7F00FF', // Vibrant orange-red for emphasis
>>>>>>> main
    borderRadius: 12,
    marginBottom: 15,
  },
  button: {
<<<<<<< HEAD
    backgroundColor: '#E85A4F',
=======
    backgroundColor: '#7F00FF', // Fresh green for action buttons
>>>>>>> main
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
<<<<<<< HEAD
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  eyeIcon: {
    padding: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
=======
    button: {
      backgroundColor: '#7F00FF', // Vibrant purple color
      paddingVertical: 15,
      paddingHorizontal: 30, // Added horizontal padding for a wider button
      borderRadius: 12, // Rounded corners for a modern look
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10, // Spacing from other elements
      shadowColor: '#7F00FF', // Subtle shadow with the same color for depth
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5, // Shadow effect for Android
    },
    buttonText: {
      color: '#FFF', // White text for contrast
      fontSize: 18, // Slightly larger text for emphasis
      fontWeight: '700', // Bold for strong CTA
      letterSpacing: 1, // Spaced letters for elegance
    },

  
>>>>>>> main
});

export default SignUp;