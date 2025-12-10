import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    favorites: [],
    loading: false,
    syncing: false,
    error: null,
    count: 0,
};

export const favoriteSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        setFavorites: (state, action) => {
            state.favorites = action.payload;
            state.count = action.payload.length;
        },

        addFavorite: (state, action) => {
            const exists = state.favorites.find(fav => fav.product?._id === action.payload.product?._id);
            if (!exists) {
                state.favorites.unshift(action.payload);
                state.count += 1;
            }
        },

        removeFavorite: (state, action) => {
            const productId = action.payload;
            state.favorites = state.favorites.filter(fav => fav.product?._id !== productId);
            state.count = state.favorites.length;
        },

        toggleFavoriteOptimistic: (state, action) => {
            const productId = action.payload;
            const index = state.favorites.findIndex(fav => fav.product?._id === productId);

            if (index >= 0) {
                // Remove if exists
                state.favorites.splice(index, 1);
                state.count -= 1;
            } else {
                // Add if doesn't exist (with minimal data for optimistic update)
                state.favorites.unshift({
                    product: { _id: productId },
                    favoritedAt: new Date().toISOString(),
                });
                state.count += 1;
            }
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setSyncing: (state, action) => {
            state.syncing = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        clearFavorites: (state) => {
            state.favorites = [];
            state.count = 0;
        },
    },
});

export const {
    setFavorites,
    addFavorite,
    removeFavorite,
    toggleFavoriteOptimistic,
    setLoading,
    setSyncing,
    setError,
    clearError,
    clearFavorites,
} = favoriteSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesCount = (state) => state.favorites.count;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesSyncing = (state) => state.favorites.syncing;
export const selectFavoritesError = (state) => state.favorites.error;
export const selectIsFavorited = (productId) => (state) => {
    return state.favorites.favorites.some(fav => fav.product?._id === productId);
};

export default favoriteSlice.reducer;
