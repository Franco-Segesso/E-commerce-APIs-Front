import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// Este componente recibe la orden completa y la muestra en un modal
const OrderDetailModal = ({ show, onHide, order }) => {
    if (!order) return null; // No renderizar nada si no hay orden seleccionada

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles de la Orden #{order.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Información General de la Orden */}
                <div className="mb-3">
                    <p><strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
                    <p><strong>Dirección de Envío:</strong> {order.shippingAddress}</p>
                    <p><strong>Método de Pago:</strong> {order.paymentMethod}</p>
                </div>
                <hr />
                {/* Tabla de Productos */}
                <h5>Productos</h5>
                <table className="table table-striped table-sm">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Precio Unit.</th>
                            <th className="text-end">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderDetails && order.orderDetails.map(detail => {
                            // Calculamos el precio unitario (considerando posible descuento en el futuro si lo agregas)
                            const unitPrice = detail.product ? detail.product.price : 0;
                            const subtotal = unitPrice * detail.quantity;

                            return (
                                <tr key={detail.id}>
                                    <td>{detail.product ? detail.product.name : 'Producto no disponible'}</td>
                                    <td className="text-center">{detail.quantity}</td>
                                    <td className="text-end">${unitPrice.toFixed(2)}</td>
                                    <td className="text-end">${subtotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OrderDetailModal;