import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    comparisons: [],
    currentComparison: null,
    selectedProducts: [],
    comparisonResults: null,
    loading: false,
    error: null,
};

export const comparisonSlice = createSlice({
    name: 'comparison',
    initialState,
    reducers: {
        setComparisons: (state, action) => {
            state.comparisons = action.payload;
        },

        setCurrentComparison: (state, action) => {
            state.currentComparison = action.payload;
            if (action.payload?.products) {
                state.selectedProducts = action.payload.products.map(p => p.product);
            }
        },

        addProductToComparison: (state, action) => {
            const product = action.payload;
            const exists = state.selectedProducts.find(p => p._id === product._id);
            if (!exists) {
                state.selectedProducts.push(product);
            }
        },

        removeProductFromComparison: (state, action) => {
            const productId = action.payload;
            state.selectedProducts = state.selectedProducts.filter(p => p._id !== productId);
        },

        toggleProductSelection: (state, action) => {
            const product = action.payload;
            const index = state.selectedProducts.findIndex(p => p._id === product._id);

            if (index >= 0) {
                state.selectedProducts.splice(index, 1);
            } else {
                state.selectedProducts.push(product);
            }
        },

        setComparisonResults: (state, action) => {
            state.comparisonResults = action.payload;
        },

        clearSelectedProducts: (state) => {
            state.selectedProducts = [];
            state.comparisonResults = null;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setComparisons,
    setCurrentComparison,
    addProductToComparison,
    removeProductFromComparison,
    toggleProductSelection,
    setComparisonResults,
    clearSelectedProducts,
    setLoading,
    setError,
    clearError,
} = comparisonSlice.actions;

// Selectors
export const selectComparisons = (state) => state.comparison.comparisons;
export const selectCurrentComparison = (state) => state.comparison.currentComparison;
export const selectSelectedProducts = (state) => state.comparison.selectedProducts;
export const selectComparisonResults = (state) => state.comparison.comparisonResults;
export const selectComparisonLoading = (state) => state.comparison.loading;
export const selectComparisonError = (state) => state.comparison.error;
export const selectIsProductSelected = (productId) => (state) => {
    return state.comparison.selectedProducts.some(p => p._id === productId);
};
export const selectSelectedProductsCount = (state) => state.comparison.selectedProducts.length;

export default comparisonSlice.reducer;
