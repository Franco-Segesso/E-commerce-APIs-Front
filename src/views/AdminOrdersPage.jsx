import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Accordion } from 'react-bootstrap'; // Usamos un componente de React-Bootstrap

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:4002/orders', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error('No tienes permiso para ver las órdenes o hubo un error en el servidor.');
                }
                const data = await response.json();
                // Ordenamos las órdenes de la más reciente a la más antigua
                const sortedOrders = (data.content || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [authToken]);

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
                                    {/* --- CÓDIGO SEGURO --- */}
                                    {/* Accede al email del usuario de forma segura */}
                                    <span className="text-muted">{order.userId || 'Usuario no disponible'}</span>
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
                                        {/* Accede a los detalles de la orden de forma segura */}
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