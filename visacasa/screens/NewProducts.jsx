import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProductList from '../components/products/ProductList';
import ComparisonSelectionBar from '../components/ComparisonSelectionBar';

const NewProducts = () => {
    const navigation = useNavigation();
    const [comparisonMode, setComparisonMode] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>
                <View style={styles.upperRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back-circle" size={30} color={'white'} />
                    </TouchableOpacity>
                    <Text style={styles.text}>Lista de produtos</Text>

                    {/* Comparison Mode Toggle */}
                    <TouchableOpacity
                        style={styles.compareToggle}
                        onPress={() => setComparisonMode(!comparisonMode)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={comparisonMode ? "git-compare" : "git-compare-outline"}
                            size={24}
                            color={comparisonMode ? "#E85A4F" : "white"}
                        />
                    </TouchableOpacity>
                </View>

                <ProductList showComparison={comparisonMode} />

                {/* Floating comparison bar */}
                {comparisonMode && <ComparisonSelectionBar />}
            </View>
        </SafeAreaView>
    );
};

export default NewProducts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    wrapper: {
        flex: 1,
        backgroundColor: 'lightwhite',
    },
    upperRow: {
        width: 300,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: "center",
        position: "absolute",
        backgroundColor: "black",
        borderRadius: 24,
        top: 22,
        zIndex: 999,
    },
    text: {
        color: "white",
        marginLeft: 10,
        flex: 1,
    },
    compareToggle: {
        padding: 8,
        marginRight: 8,
    },
});