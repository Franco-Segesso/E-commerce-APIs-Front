import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para el formulario de edición
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '' });

    const { authToken } = useAuth(); // Obtenemos el token para las peticiones

    // Fetch para datos del perfil
    useEffect(() => {
        if (!authToken) return; // No hacer nada si no hay token
        setLoadingProfile(true);
        fetch('http://localhost:4002/users/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar el perfil.');
            return response.json();
        })
        .then(data => {
            setUserData(data);
            setEditFormData({ firstName: data.firstName, lastName: data.lastName }); // Pre-llenar form
        })
        .catch(err => setError(err.message))
        .finally(() => setLoadingProfile(false));
    }, [authToken]);

    // Fetch para las órdenes del usuario
    useEffect(() => {
        if (!authToken) return;
        setLoadingOrders(true);
        fetch('http://localhost:4002/users/orders', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('No se pudieron cargar las órdenes.');
            return response.json();
        })
        .then(data => {
            setOrders(data || []);
        })
        .catch(err => setError(err.message)) 
        .finally(() => setLoadingOrders(false));
    }, [authToken]);

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Función para guardar los cambios del perfil
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
        .then(response => {
            if (!response.ok) {
                 return response.json().then(errData => {
                    throw new Error(errData.message || 'Error al actualizar el perfil.');
                 });
            }
            return response.json();
        })
        .then(updatedUser => {
            setUserData(updatedUser); // Actualizamos los datos mostrados
            setIsEditing(false); // Cerramos el modo edición
            alert("Perfil actualizado con éxito.");
        })
        .catch(err => {
            setError(err.message);
        });
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Mi Perfil</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Sección de Datos del Usuario */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    Datos Personales
                    {!isEditing && (
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditing(true)}>Editar</button>
                    )}
                </div>
                <div className="card-body">
                    {loadingProfile ? <p>Cargando perfil...</p> : userData && (
                        isEditing ? (
                            // Formulario de Edición
                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Email:</label>
                                    <div className="col-sm-9">
                                        <input type="email" readOnly className="form-control-plaintext" value={userData.email} />
                                    </div>
                                </div>
                                <div className="mb-3 row">
                                    <label htmlFor="firstName" className="col-sm-3 col-form-label">Nombre:</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control" id="firstName" name="firstName" value={editFormData.firstName} onChange={handleEditChange} required/>
                                    </div>
                                </div>
                                <div className="mb-3 row">
                                    <label htmlFor="lastName" className="col-sm-3 col-form-label">Apellido:</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control" id="lastName" name="lastName" value={editFormData.lastName} onChange={handleEditChange} required/>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditFormData({ firstName: userData.firstName, lastName: userData.lastName }); }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        ) : (
                            // Vista de Datos (no editable)
                            <>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>Nombre:</strong> {userData.firstName}</p>
                                <p><strong>Apellido:</strong> {userData.lastName}</p>
                            </>
                        )
                    )}
                </div>
            </div>

            {/* Sección de Historial de Órdenes */}
            <h3 className="mb-3">Mis Órdenes</h3>
            {loadingOrders ? <p>Cargando órdenes...</p> : (
                orders.length > 0 ? (
                    // Usamos un div para contener las tarjetas de cada orden
                    <div className="d-grid gap-3">
                        {orders.map(order => (
                            <div key={order.id} className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>
                                        <strong>Orden #{order.id}</strong> - Fecha: {new Date(order.date).toLocaleDateString()}
                                    </span>
                                    <span className="fw-bold fs-5">
                                        Total: ${order.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Detalles del pedido:</h6>
                                    {/* Lista de productos dentro de la orden */}
                                    <ul className="list-group list-group-flush">
                                        {order.orderDetails && order.orderDetails.map(detail => (
                                            <li key={detail.id} className="list-group-item d-flex justify-content-between align-items-center ps-0">
                                                <div>
                                                    {/* Mostramos el nombre del producto */}
                                                    {detail.product ? detail.product.name : 'Producto no disponible'}
                                                    {/* Mostramos la cantidad */}
                                                    <span className="badge bg-secondary rounded-pill ms-2">x{detail.quantity}</span>
                                                </div>
                                                {/* Podríamos mostrar el precio unitario si el backend lo incluyera */}
                                                {/* <span>${detail.product ? detail.product.price.toFixed(2) : 'N/A'} c/u</span> */}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3">
                                        <p className="mb-1"><small><strong>Dirección de envío:</strong> {order.shippingAddress}</small></p>
                                        <p className="mb-0"><small><strong>Método de pago:</strong> {order.paymentMethod}</small></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Todavía no has realizado ninguna orden.</p>
                )
            )}
        </div>
    );
};

export default ProfilePage;