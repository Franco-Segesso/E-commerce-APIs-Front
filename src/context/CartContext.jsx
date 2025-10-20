import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (productToAdd) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === productToAdd.id);

            const stockDisponible = productToAdd.stock;

            if (itemExists) {
                const newQuantity = itemExists.quantity + productToAdd.quantity;
                if (newQuantity > stockDisponible) {
                    alert(`No puedes agregar más unidades de "${productToAdd.name}". Stock máximo: ${stockDisponible}.`);
                    return prevItems; // Devolvemos el carrito sin cambios
                }

                return prevItems.map(item =>
                    item.id === productToAdd.id
                        ? { ...item, quantity: item.quantity + productToAdd.quantity }
                        : item
                );
            } else {
                if (productToAdd.quantity > stockDisponible) {
                    alert(`No puedes agregar ${productToAdd.quantity} unidades de "${productToAdd.name}". Stock disponible: ${stockDisponible}.`);
                    return prevItems;
                }
                return [...prevItems, { ...productToAdd }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    
    const clearCart = () => {
        setCartItems([]);
    };

    const updateQuantity = (productId, amount) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + amount;

                    if (item.stock !== undefined && newQuantity > item.stock) {
                        alert(`¡Stock insuficiente! Solo quedan ${item.stock} unidades de "${item.name}".`);
                        return item; // No cambiamos la cantidad
                    }

                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                
                return item;
            }).filter(item => item.quantity > 0) //Si la cantidad es 0, se elimina
        );
    };

    const value = { cartItems, addToCart, removeFromCart, clearCart, updateQuantity };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};