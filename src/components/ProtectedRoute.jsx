import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const { user, token } = useSelector((state) => state.auth);
    const location = useLocation();

    // Si no hay usuario ni token, redirigir
    if (!user || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;