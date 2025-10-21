import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Accordion } from 'react-bootstrap'; 

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authToken } = useAuth();

useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                // Hacemos las peticiones para órdenes y usuarios
                const [ordersRes, usersRes] = await Promise.all([
                    fetch('http://localhost:4002/orders', {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    }),
                    fetch('http://localhost:4002/users', { 
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    }) 
                ]);

                if (!ordersRes.ok) throw new Error('No se pudieron cargar las órdenes.');
                if (!usersRes.ok) throw new Error('No se pudieron cargar los usuarios.');
                
                const ordersData = await ordersRes.json();
                const usersData = await usersRes.json(); // Asumimos que devuelve una lista o un objeto con 'content'

                // Ordenamos las órdenes de más reciente a más antigua
                const sortedOrders = (ordersData.content || ordersData || []).sort((a, b) => b.id - a.id);
                setOrders(sortedOrders);
                setUsers(usersData.content || usersData || []); // Guardamos la lista de usuarios

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (authToken) {
            fetchInitialData();
        } else {
             setLoading(false);
             setError("Necesitas iniciar sesión como administrador.");
        }
    }, [authToken]);

    const userMap = new Map(users.map(user => [user.id, user.email]));

    if (loading) {
        return <div className="text-center p-5"><h4>Cargando órdenes...</h4></div>;
    }

    if (error) {
        return <div className="container"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4">Gestión de Órdenes</h2>
            
            {orders.length === 0 ? (
                <p className="text-muted">No se han encontrado órdenes.</p>
            ) : (
                <Accordion defaultActiveKey="0">
                    {orders.map((order, index) => (
                        <Accordion.Item eventKey={String(index)} key={order.id}>
                            <Accordion.Header>
                                <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                                    <span className="fw-bold">Orden #{order.id}</span>
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                    <span className="text-muted">{userMap.get(order.userId) || 'Usuario no disponible'}</span>
                                    <span className="badge bg-success">${(order.totalPrice || 0).toFixed(2)}</span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <h5>Detalles de la Orden</h5>
                                <p><strong>Dirección de Envío:</strong> {order.shippingAddress}</p>
                                <p><strong>Método de Pago:</strong> {order.paymentMethod}</p>
                                <hr />
                                <h6>Productos:</h6>
                                <table className="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                        {(order.orderDetails || []).map(detail => (
                                            <tr key={detail.id}>
                                                <td>{detail.product?.name || 'Producto eliminado'}</td>
                                                <td>{detail.quantity}</td>
                                                <td>${(detail.product?.price || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
        </div>
    );
};

export default AdminOrdersPage;