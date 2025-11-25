import { createSlice } from '@reduxjs/toolkit';
import { logout } from './AuthSlice';
import { toast } from 'react-toastify';


const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  //REDUCERS (Acciones Sincrónicas)
  reducers: {

    //Acción de agregar producto al carrito
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
      
    },

    //Acción de remover producto del carrito
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      
    },

    //Acción de actualizar cantidad de un producto en el carrito
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
      
    },

    //Acción de limpiar el carrito
    clearCart: (state) => {
      state.items = [];
      
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      // Cuando ocurra un logout (venga de donde venga), vaciamos el carrito
      state.items = [];
      
    });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;