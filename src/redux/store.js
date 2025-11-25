// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/CartSlice';
import productReducer from './slices/ProductSlice';
import authReducer from './slices/AuthSlice';
import userReducer from './slices/UserSlice';
import ordersReducer from './slices/OrdersSlice';
import categoryReducer from './slices/CategorySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    user: userReducer,
    auth: authReducer,
    categories: categoryReducer,
    orders: ordersReducer
  },
});

export default store;