import { configureStore } from "@reduxjs/toolkit";
import basketReducer from "./features/basketSlice";
import sellerReducer from "./features/sellerSlice";
import navReducer from "./features/navSlice";
import favoriteReducer from "./features/favoriteSlice";
import comparisonReducer from "./features/comparisonSlice";
import userReducer from "./features/userSlice";

export const store = configureStore({
  reducer: {
    basket: basketReducer,
    seller: sellerReducer,
    nav: navReducer,
    favorites: favoriteReducer,
    comparison: comparisonReducer,
    user: userReducer,
  }
})