/*
* CRIADO POR MAURO FERNANDES PATRICIO
*/
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import styles from './welcome.style'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
const welcome = () => {
  const navigation = useNavigation();
  return (

    <View>
      <View style={styles.container}>
        <Text style={styles.welcomeText('black', 30, 0)}><Text style={{ color: '#E85A4F' }}>Visa</Text>Casa</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            value=""
            onPressIn={() => { navigation.navigate('Pesquisa') }}
            placeholder='O que deseja para hoje?'
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Pesquisa')}>
          <Ionicons name="search-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default welcome