import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => { // Hook personalizado para usar el contexto de autenticación
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => { // Proveedor de contexto de autenticación. Maneja login, logout y estado del usuario.
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null); // El estado 'user' guardará el email y los roles
    const [loading, setLoading] = useState(true);

    useEffect(() => { // Cada vez que 'authToken' cambie, actualizamos el estado del usuario
        if (authToken) {
            try {
                const decodedToken = jwtDecode(authToken); // Decodifica el token JWT
                
                // Ahora guardamos tanto el email (sub) como los roles (authorities)
                setUser({ 
                    email: decodedToken.sub,
                    roles: decodedToken.authorities || [] // 'authorities' es donde se encuentra el rol del usuario en el token
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
        setLoading(false);
    }, [authToken]);

    const login = (token) => { // Maneja el login estableciendo el token de autenticación
        setAuthToken(token);
    };

    const logout = () => { // Maneja el logout limpiando el token y el estado del usuario
        setAuthToken(null);
    };
    
    const isAdmin = user && user.roles.includes('ROLE_ADMIN'); // Verifica si el usuario tiene rol de admin

    const value = { authToken, user, loading, login, logout, isAdmin }; // Valores que estarán disponibles en el contexto

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};