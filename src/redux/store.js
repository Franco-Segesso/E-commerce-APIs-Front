// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/ProductSlice';
import authReducer from './slices/AuthSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    // Aquí agregaremos auth, products, etc. más adelante
    auth: authReducer,
  },
});