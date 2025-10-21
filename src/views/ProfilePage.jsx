import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfilePage.css'; // ¡Importamos los nuevos estilos!
import OrderDetailModal from '../components/OrderDetailModal.jsx';


const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '' });

    const [showModal, setShowModal] = useState(false); 
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { authToken } = useAuth();

    useEffect(() => {
        if (!authToken) return;
        setLoadingProfile(true);
        fetch('http://localhost:4002/users/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => response.ok ? response.json() : Promise.reject('No se pudo cargar el perfil.'))
        .then(data => {
            setUserData(data);
            setEditFormData({ firstName: data.firstName, lastName: data.lastName });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoadingProfile(false));
    }, [authToken, isEditing]); // Agregamos isEditing para recargar los datos al cancelar

    useEffect(() => {
        if (!authToken) return;
        setLoadingOrders(true);
        fetch('http://localhost:4002/users/orders', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => response.ok ? response.json() : Promise.reject('No se pudieron cargar las órdenes.'))
        .then(data => setOrders(data || []))
        .catch(err => setError(err.message)) 
        .finally(() => setLoadingOrders(false));
    }, [authToken]);

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setError('');
        fetch('http://localhost:4002/users/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify(editFormData)
        })
        .then(response => response.ok ? response.json() : response.json().then(err => Promise.reject(err)))
        .then(updatedUser => {
            setUserData(updatedUser);
            setIsEditing(false);
            alert("Perfil actualizado con éxito.");
        })
        .catch(err => setError(err.message || 'Error al actualizar el perfil.'));
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order); // Guarda la orden seleccionada
        setShowModal(true);      // Muestra el modal
    };

    return (
        <div className="para-el-fondo">
        <div className="profile-page-container">
            <h2>Mi Perfil</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="profile-card">
                <div className="profile-card-header">
                    <h3>Información Personal</h3>
                    {!isEditing && (
                        <button className="btn btn-edit" onClick={() => setIsEditing(true)}>Editar Datos</button>
                    )}
                </div>
                
                {loadingProfile ? <p>Cargando perfil...</p> : userData && (
                    isEditing ? (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="info-grid">
                                <div>
                                    <label htmlFor="firstName" className="form-label">Nombre</label>
                                    <input type="text" className="form-control" id="firstName" name="firstName" value={editFormData.firstName} onChange={handleEditChange} required/>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="form-label">Apellido</label>
                                    <input type="text" className="form-control" id="lastName" name="lastName" value={editFormData.lastName} onChange={handleEditChange} required/>
                                </div>
                                <div className="email-field">
                                    <label className="form-label">Email</label>
                                    <input type="email" readOnly disabled className="form-control-plaintext bg-light p-2 rounded" value={userData.email} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-grid">
                            <div>
                                <label className="form-label">Nombre</label>
                                <div className="info-field-display">{userData.firstName}</div>
                            </div>
                            <div>
                                <label className="form-label">Apellido</label>
                                <div className="info-field-display">{userData.lastName}</div>
                            </div>
                            <div className="email-field">
                                <label className="form-label">Email</label>
                                <div className="info-field-display">{userData.email}</div>
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="profile-card">
                <div className="profile-card-header">
                    <h3>Historial de Pedidos</h3>
                </div>
                
                {loadingOrders ? <p>Cargando órdenes...</p> : (
                    orders.length > 0 ? (
                        <div className="order-history-table">
                            <div className="order-row order-header">
                                <span>Número de Pedido</span>
                                <span>Fecha</span>
                                <span>Total</span>
                                <span></span> {/* Columna vacía para el link */}
                            </div>
                            {orders.map(order => (
                                <div key={order.id} className="order-row">
                                    <span className="fw-medium">#{order.id}</span>
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                    <span>${order.totalPrice.toFixed(2)}</span>
                                    <span className="text-end">
                                        <button
                                            className="btn btn-link order-details-link p-0" // Usamos btn-link para que parezca texto
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            Ver Detalles
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Todavía no has realizado ninguna orden.</p>
                    )
                )}
            </div>
            </div>

            <OrderDetailModal
                show={showModal}
                onHide={() => setShowModal(false)} // Función para cerrar el modal
                order={selectedOrder}              // Le pasamos la orden seleccionada
            />



        </div>
    );
};

export default ProfilePage;