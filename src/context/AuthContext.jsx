import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null); // El estado 'user' guardará el email y los roles

    useEffect(() => {
        if (authToken) {
            try {
                const decodedToken = jwtDecode(authToken);
                
                console.log("Token decodificado:", decodedToken);
                // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
                // Ahora guardamos tanto el email (sub) como los roles (authorities)
                setUser({ 
                    email: decodedToken.sub,
                    roles: decodedToken.authorities || [] // 'authorities' es donde Spring Security pone los roles en el token
                });
                
                localStorage.setItem('token', authToken);
            } catch (error) {
                console.error("Token inválido o expirado:", error);
                setUser(null);
                localStorage.removeItem('token');
            }
        } else {
            setUser(null);
            localStorage.removeItem('token');
        }
    }, [authToken]);

    const login = (token) => {
        setAuthToken(token);
    };

    const logout = () => {
        setAuthToken(null);
    };
    
    // Esta función ahora funcionará correctamente porque 'user.roles' ya existe
    const isAdmin = user && user.roles.includes('ROLE_ADMIN');

    // Nos aseguramos de pasar 'isAdmin' al resto de la aplicación
    const value = { authToken, user, login, logout, isAdmin };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};