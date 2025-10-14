import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { authToken } = useAuth();
    const location = useLocation();

    if (!authToken) {
        // Si no hay token, redirigimos al login, guardando la página que quería visitar
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay token, mostramos la página protegida (CheckoutPage)
    return children;
};

export default ProtectedRoute;