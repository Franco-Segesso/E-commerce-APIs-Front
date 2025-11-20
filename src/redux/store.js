// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/UserSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    
    user: userReducer,

    // Aquí agregaremos auth, products, etc. más adelante
  },
});

export default store;