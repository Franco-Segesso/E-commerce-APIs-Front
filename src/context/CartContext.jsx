import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => { // Hook personalizado para usar el contexto del carrito
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => { // Proveedor de contexto del carrito. Maneja agregar, eliminar y actualizar productos en el carrito.
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) { return []; }
    });

    useEffect(() => { // Cada vez que 'cartItems' cambie, actualizamos el localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (productToAdd) => { // Agrega un producto al carrito, respetando el stock disponible
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === productToAdd.id);

            const stockDisponible = productToAdd.stock;

            if (itemExists) { // Si el producto ya está en el carrito, actualizamos la cantidad
                const newQuantity = itemExists.quantity + productToAdd.quantity;
                if (newQuantity > stockDisponible) { // Verificamos el stock. Si se excede, no permitimos agregar más. Si no se excede, actualizamos la cantidad.
                    alert(`No puedes agregar más unidades de "${productToAdd.name}". Stock máximo: ${stockDisponible}.`);
                    return prevItems; // Devolvemos el carrito sin cambios
                }

                return prevItems.map(item =>
                    item.id === productToAdd.id
                        ? { ...item, quantity: item.quantity + productToAdd.quantity }
                        : item
                );
            } else { // Si el producto no está en el carrito, lo agregamos
                if (productToAdd.quantity > stockDisponible) { // Verificamos el stock al agregar un nuevo producto. Si se excede, no permitimos agregarlo.
                    alert(`No puedes agregar ${productToAdd.quantity} unidades de "${productToAdd.name}". Stock disponible: ${stockDisponible}.`);
                    return prevItems;
                }
                return [...prevItems, { ...productToAdd }];
            }
        });
    };

    const removeFromCart = (productId) => { // Elimina un producto del carrito
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    
    const clearCart = () => { // Limpia todo el carrito
        setCartItems([]);
    };

    const updateQuantity = (productId, amount) => { // Actualiza la cantidad de un producto en el carrito, respetando el stock disponible
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === productId) { // Encontramos el producto a actualizar
                    const newQuantity = item.quantity + amount;

                    if (item.stock !== undefined && newQuantity > item.stock) { // Verificamos el stock antes de actualizar. Si se excede, no permitimos el cambio.
                        alert(`¡Stock insuficiente! Solo quedan ${item.stock} unidades de "${item.name}".`);
                        return item; // No cambiamos la cantidad
                    }

                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const value = { cartItems, addToCart, removeFromCart, clearCart, updateQuantity }; // Valores que estarán disponibles en el contexto

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};