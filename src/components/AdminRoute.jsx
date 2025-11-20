import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
    // Desestructuramos user, token y status desde Redux
    const { user, token, status } = useSelector((state) => state.auth);

    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Verificamos si tiene el rol de admin
    const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');

    if (!isAdmin) {
        // Puedes usar un Toast aquí si prefieres, pero el alert es funcional para bloquear
        toast.error("Acceso denegado. No tienes permisos de administrador.");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;