import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (authToken) {
            try {
                const decodedToken = jwtDecode(authToken);
                setUser({ email: decodedToken.sub });
                localStorage.setItem('token', authToken);
            } catch (error) {
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
    
    const value = { authToken, user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};