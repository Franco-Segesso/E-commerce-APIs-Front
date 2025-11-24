import { createSlice } from '@reduxjs/toolkit';
// 1. Importamos la acción de logout para "escucharla"
import { logout } from './AuthSlice';
import { toast } from 'react-toastify';

// Recuperar carrito del localStorage
const itemsInStorage = localStorage.getItem('cartItems') 
  ? JSON.parse(localStorage.getItem('cartItems')) 
  : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: itemsInStorage,
  },
  reducers: {
    addToCart: (state, action) => {
      const productToAdd = action.payload;
      const existingItem = state.items.find(item => item.id === productToAdd.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + productToAdd.quantity;
        // Validamos stock antes de sumar
        if (newQuantity <= productToAdd.stock) {
            existingItem.quantity = newQuantity;
        }
      } else {
        state.items.push(productToAdd);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    updateQuantity: (state, action) => {
      const { id, amount } = action.payload;
      const item = state.items.find(i => i.id === id);
      
      if (item) {
        const newQuantity = item.quantity + amount;

        if (newQuantity < 1) {
          return ; // No permitimos cantidades menores a 1
        }


        if (newQuantity > item.stock) {
            toast.warning("No hay suficiente stock disponible.");
            return ;
        }
        // Si pasa las validaciones, actualizamos
        item.quantity = newQuantity;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    }
  },
  // 2. AQUÍ LA MAGIA: Escuchamos acciones de otros slices
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      // Cuando ocurra un logout (venga de donde venga), vaciamos el carrito
      state.items = [];
      localStorage.removeItem('cartItems');
    });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;