import { createSlice } from '@reduxjs/toolkit';

// 1. Recuperar carrito del localStorage al iniciar
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

      // Si ya existe, sumamos cantidad
      if (existingItem) {
        // OJO: La validación de stock visual (alerta) la haremos en el componente antes de llamar a esto.
        // Aquí solo aseguramos la integridad de los datos.
        const newQuantity = existingItem.quantity + productToAdd.quantity;
        // Solo actualizamos si no supera el stock (doble seguridad)
        if (newQuantity <= productToAdd.stock) {
            existingItem.quantity = newQuantity;
        }
      } else {
        // Si no existe, lo agregamos
        state.items.push(productToAdd);
      }
      
      // Guardamos en localStorage automáticamente
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
        // Validamos límites (mínimo 1, máximo stock)
        if (newQuantity >= 1 && newQuantity <= item.stock) {
            item.quantity = newQuantity;
        }
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    }
  }
});

// Exportamos las acciones para usarlas en los componentes
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Exportamos el reducer para el Store
export default cartSlice.reducer;