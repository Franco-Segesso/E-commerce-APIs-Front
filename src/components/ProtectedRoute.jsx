import React from 'react';
import { useSelector } from 'react-redux'; // Hook de Redux
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Leemos token y status desde el slice de auth
    const { token, status } = useSelector((state) => state.auth);
    const location = useLocation();

    // Si está cargando (ej: verificando sesión al inicio), mostramos spinner
    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no hay token, redirigimos al login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;