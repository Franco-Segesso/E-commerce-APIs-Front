import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

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
        // 1. Usamos 'cartItems' (estado actual) para las validaciones y los Toasts
        const itemExists = cartItems.find(item => item.id === productToAdd.id);
        const stockDisponible = productToAdd.stock;

        if (itemExists) { 
            const newQuantity = itemExists.quantity + productToAdd.quantity;
            
            // Validación
            if (newQuantity > stockDisponible) { 
                toast.error(`Stock máximo alcanzado (${stockDisponible}) para "${productToAdd.name}".`);
                return; // Cortamos acá, no actualizamos el estado
            }

            // Éxito
            toast.success(`Agregaste más unidades de ${productToAdd.name}`);

            // 2. Actualizamos el estado SIN efectos secundarios dentro
            setCartItems(prevItems => 
                prevItems.map(item =>
                    item.id === productToAdd.id
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

        } else { 
            // Validación
            if (productToAdd.quantity > stockDisponible) { 
                toast.error(`No hay suficiente stock de "${productToAdd.name}".`);
                return;
            }

            // Éxito
            toast.success(`Agregado al carrito: ${productToAdd.name}`);

            // Actualización
            setCartItems(prevItems => [...prevItems, { ...productToAdd }]);
        }
    };

    const removeFromCart = (productId) => { 
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    
    const clearCart = () => { 
        setCartItems([]);
    };

    const updateQuantity = (productId, amount) => { 
        // Buscamos el item en el estado actual para validar
        const item = cartItems.find(i => i.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + amount;

        // Validación de stock
        if (item.stock !== undefined && newQuantity > item.stock) { 
            toast.warning(`¡Stock insuficiente! Solo quedan ${item.stock} unidades.`);
            return; 
        }

        // Si la validación pasa, actualizamos el estado
        setCartItems(prevItems =>
            prevItems.map(prod => {
                if (prod.id === productId) { 
                    return { ...prod, quantity: Math.max(1, newQuantity) };
                }
                return prod;
            }).filter(prod => prod.quantity > 0)
        );
    };

    const value = { cartItems, addToCart, removeFromCart, clearCart, updateQuantity }; 

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};