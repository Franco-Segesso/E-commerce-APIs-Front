import React, { useEffect } from 'react';
// 1. REDUX
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOrders } from '../redux/slices/OrdersSlice';
// Asegúrate de que en UserSlice exportas esta acción. Si no la tienes, avísame y la agregamos.
import { fetchAllUsers } from '../redux/slices/UserSlice'; 

import { Accordion } from 'react-bootstrap';

const AdminOrdersPage = () => {
    const dispatch = useDispatch();

    // 2. LEER ESTADO GLOBAL
    // Órdenes (Admin list)
    const { adminOrders, status: orderStatus, error: orderError } = useSelector((state) => state.orders);
    
    // Usuarios (Para mapear ID -> Email). Asumimos que tienes una lista 'list' o 'users' en UserSlice
    // Si tu UserSlice no tiene la lista de todos los usuarios, necesitaremos agregar ese Thunk.
    // Por ahora usaré state.user.list basándome en la estructura estándar.
    const { list: users, loading: userLoading } = useSelector((state) => state.user);

    // 3. EFECTO DE CARGA
    useEffect(() => {
        // Cargamos todo al entrar
        dispatch(fetchAllOrders());
        // Solo si tienes el thunk fetchAllUsers implementado en UserSlice:
        if (fetchAllUsers) dispatch(fetchAllUsers());
    }, [dispatch]);

    // 4. MAPEO DE USUARIOS (ID -> Email)
    // Creamos un mapa para acceso rápido O(1) en lugar de buscar en el array cada vez
    const userMap = new Map((users || []).map(u => [u.id, u.email]));

    // Ordenamos órdenes por fecha/ID descendente
    const sortedOrders = [...(adminOrders || [])].sort((a, b) => b.id - a.id);

    const isLoading = orderStatus === 'loading' || userLoading;
    const error = orderError;

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
                                    <span className="fw-bold">Orden #{order.id}</span>
                                    <span>{order.date}</span>
                                    {/* Mostramos el email si lo encontramos, sino el ID */}
                                    <span className="text-muted small">
                                        {userMap.get(order.userId) || `Usuario ID: ${order.userId}`}
                                    </span>
                                    <span className="badge bg-success">
                                        ${(order.totalPrice || 0).toFixed(2)}
                                    </span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold">Detalles de Envío</h6>
                                        <p className="mb-1 text-muted">{order.shippingAddress}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold">Pago</h6>
                                        <p className="mb-1 text-muted">{order.paymentMethod}</p>
                                    </div>
                                </div>
                                
                                <hr />
                                
                                <h6 className="fw-bold mb-3">Productos Comprados:</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-striped align-middle">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Precio Unit.</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(order.orderDetails || []).map(detail => {
                                                const price = detail.product?.price || 0;
                                                return (
                                                    <tr key={detail.id}>
                                                        <td>{detail.product?.name || <span className="text-danger">Producto eliminado</span>}</td>
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