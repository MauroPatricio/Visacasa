import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
    toggleProductSelection,
    selectIsProductSelected,
    selectSelectedProductsCount,
    clearSelectedProducts,
} from '../features/comparisonSlice';

const { width } = Dimensions.get('window');

const ComparisonSelectionBar = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const selectedCount = useSelector(selectSelectedProductsCount);

    const handleCompare = useCallback(() => {
        if (selectedCount < 2) {
            return;
        }
        navigation.navigate('PriceComparison');
    }, [selectedCount, navigation]);

    const handleClear = useCallback(() => {
        dispatch(clearSelectedProducts());
    }, [dispatch]);

    if (selectedCount === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close-circle" size={20} color="#666" />
                    <Text style={styles.clearText}>Limpar</Text>
                </TouchableOpacity>

                <View style={styles.countContainer}>
                    <Ionicons name="analytics" size={20} color="#E85A4F" />
                    <Text style={styles.countText}>
                        {selectedCount} {selectedCount === 1 ? 'produto' : 'produtos'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.compareButton,
                        selectedCount < 2 && styles.compareButtonDisabled,
                    ]}
                    onPress={handleCompare}
                    disabled={selectedCount < 2}
                    activeOpacity={0.7}
                >
                    <Ionicons name="git-compare" size={20} color="#fff" />
                    <Text style={styles.compareText}>Comparar</Text>
                </TouchableOpacity>
            </View>

            {selectedCount === 1 && (
                <Text style={styles.hintText}>
                    Selecione mais 1 produto para comparar
                </Text>
            )}
        </View>
    );
};

export default ComparisonSelectionBar;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    clearText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    countText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    compareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E85A4F',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
    },
    compareButtonDisabled: {
        backgroundColor: '#ccc',
        elevation: 0,
    },
    compareText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    hintText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
});
