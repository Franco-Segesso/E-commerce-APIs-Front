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
            if (itemExists) {
                return prevItems.map(item =>
                    item.id === productToAdd.id
                        ? { ...item, quantity: item.quantity + productToAdd.quantity }
                        : item
                );
            } else {
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

    const value = { cartItems, addToCart, removeFromCart, clearCart };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};