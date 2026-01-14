import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import styles from './search.style';
import api from '../hooks/createConnectionApi';
import SearchTile from '../components/SearchTile';

const Search = () => {
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/products/search?query=${query}`);
      setSearchResults(response.data.products);
    } catch (error) {
      console.log('Failed to get Products', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKey.length > 0) {
        handleSearch(searchKey);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchKey]);

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      {/* Header / Search Bar Area */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.iconStyle} />
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              value={searchKey}
              onChangeText={setSearchKey}
              placeholder='O que você procura hoje?'
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {searchKey.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKey('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size={'large'} color={'#E85A4F'} />
        </View>
      ) : searchKey.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="search-outline" size={60} color="#E85A4F" />
            </View>
            <Text style={styles.emptyTitle}>Inicie sua pesquisa</Text>
            <Text style={styles.emptySubtitle}>
              Procure por produtos, fornecedores ou categorias favoritas.
            </Text>
          </View>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#E5E7EB" />
          <Text style={styles.noDataText}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptySubtitle}>Tente termos mais genéricos.</Text>
        </View>
      ) : (
        <FlatList
          style={styles.listStyle}
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <SearchTile item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Search;
