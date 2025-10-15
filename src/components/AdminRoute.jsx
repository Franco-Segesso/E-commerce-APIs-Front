import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
    const { authToken, isAdmin, loading } = useAuth();

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
        // Si no está logueado, lo mandamos al login
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Si está logueado pero NO es admin, lo mandamos al inicio
        // (y podríamos mostrar un mensaje de "Acceso denegado")
        alert("Acceso denegado. No tienes permisos de administrador.");
        return <Navigate to="/" replace />;
    }

    // Si es admin, mostramos la página
    return children;
};

export default AdminRoute;