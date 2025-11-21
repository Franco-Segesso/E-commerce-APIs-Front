import React, { useEffect } from 'react';
import { Accordion } from 'react-bootstrap';

// 1. REDUX
import { useSelector, useDispatch } from 'react-redux';

// Orders: Importamos solo el Thunk (accederemos al estado manualmente)
import { fetchAllOrders } from '../redux/slices/OrdersSlice';

// Users: Importamos Thunk y Selector (porque este sí está completo)
import { fetchAllUsers, selectAllUsers } from '../redux/slices/UserSlice';

const AdminOrdersPage = () => {
    const dispatch = useDispatch();

    // 2. LEER ESTADO GLOBAL
    
    // A. Órdenes (Acceso manual porque no hay selectores en OrdersSlice)
    // En tu OrdersSlice la lista global se llama 'adminOrders'
    const { adminOrders, status, error } = useSelector((state) => state.orders);

    // B. Usuarios (Usando el selector que sí existe en UserSlice)
    const users = useSelector(selectAllUsers);

    // 3. CARGA DE DATOS
    useEffect(() => {
        dispatch(fetchAllOrders());
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // 4. LÓGICA DE UI
    
    // Mapa para buscar email por ID rápidamente: O(1)
    // Si users es null/undefined, usamos array vacío para que no explote
    const userMap = new Map((users || []).map(u => [u.id, u.email]));

    // Ordenamos por ID descendente (lo más nuevo arriba)
    // Hacemos copia con [...] para no mutar el estado de Redux
    const sortedOrders = [...(adminOrders || [])].sort((a, b) => b.id - a.id);

    const isLoading = status === 'loading';

    if (isLoading) {
        return <div className="text-center p-5"><h4>Cargando gestión de órdenes...</h4></div>;
    }

    if (error) {
        return <div className="container my-5"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4">Gestión de Órdenes</h2>
            
            {sortedOrders.length === 0 ? (
                <p className="text-muted">No se han encontrado órdenes en el sistema.</p>
            ) : (
                <Accordion defaultActiveKey="0">
                    {sortedOrders.map((order, index) => (
                        <Accordion.Item eventKey={String(index)} key={order.id}>
                            <Accordion.Header>
                                <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                                    <div className="d-flex gap-3 align-items-center">
                                        <span className="fw-bold">Orden #{order.id}</span>
                                        <span className="text-muted small">{order.date}</span>
                                    </div>
                                    
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Buscamos el email en el mapa que creamos con los datos de UserSlice */}
                                        <span className="text-muted fst-italic d-none d-md-inline">
                                            {userMap.get(order.userId) || `Usuario ID: ${order.userId}`}
                                        </span>
                                        <span className="badge bg-success rounded-pill">
                                            ${(order.totalPrice || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-secondary">Envío</h6>
                                        <p className="mb-1">{order.shippingAddress}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-secondary">Pago</h6>
                                        <p className="mb-1">{order.paymentMethod}</p>
                                    </div>
                                </div>
                                
                                <h6 className="fw-bold mb-2">Productos:</h6>
                                <div className="table-responsive border rounded">
                                    <table className="table table-sm table-striped align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Producto</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Unitario</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(order.orderDetails || []).map(detail => {
                                                const price = detail.product?.price || 0;
                                                return (
                                                    <tr key={detail.id}>
                                                        <td>
                                                            {detail.product ? detail.product.name : <span className="text-danger fst-italic">Producto eliminado</span>}
                                                        </td>
                                                        <td className="text-center">{detail.quantity}</td>
                                                        <td className="text-end">${price.toFixed(2)}</td>
                                                        <td className="text-end fw-bold">${(price * detail.quantity).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
        </div>
    );
};

export default AdminOrdersPage;