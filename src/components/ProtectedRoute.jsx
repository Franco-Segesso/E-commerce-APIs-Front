import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { authToken, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        //returnea un spinner indicando que está cargando
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!authToken) {
        // Si no hay token, redirigimos al login, guardando la página que quería visitar
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay token, mostramos la página protegida (CheckoutPage)
    return children;
};

export default ProtectedRoute;