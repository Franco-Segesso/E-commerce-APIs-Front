import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { authToken } = useAuth();
    const navigate = useNavigate();
    
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tarjeta de Crédito');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress) {
            setError("Por favor, completa la dirección de envío.");
            return;
        }
        
        setLoading(true);
        setError('');

        // --- TRANSFORMACIÓN DE DATOS CLAVE AQUÍ ---
        // 1. "Aplanamos" el carrito: si hay 3 milanesas, agregamos el ID de la milanesa 3 veces a la lista.
        const productsIdList = cartItems.flatMap(item => Array(item.quantity).fill(item.id));
        
        // 2. Simulamos el userId. Tu backend espera que el frontend lo envíe, lo cual no es seguro,
        // pero para este TP, lo simulamos con un valor fijo.
        const mockUserId = 1;

        // 3. Creamos el objeto final con los nombres que el backend SÍ entiende.
        const orderData = {
            productsId: productsIdList,
            userId: mockUserId,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod
        };
        
        try {
            const response = await fetch('http://localhost:4002/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                // Si la respuesta es 403, el problema son los permisos (ver Problema 2).
                if (response.status === 403) {
                    throw new Error("Error de permisos (403): Tu usuario no tiene el rol necesario para crear órdenes.");
                }
                throw new Error("No se pudo procesar la orden. Revisa la consola del backend.");
            }

            const createdOrder = await response.json();
            alert(`¡Orden creada con éxito! Número de orden: ${createdOrder.id}`);
            
            clearCart();
            navigate('/');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '800px' }}>
            <form onSubmit={handleConfirmOrder}>
                <h2 className="mb-4">Finalizar Compra</h2>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Resumen y Datos</h5>
                        {/* El resto del formulario no cambia, solo la lógica del botón */}
                        <ul className="list-group list-group-flush mb-3">
                            {cartItems.map(item => (
                                <li key={item.id} className="list-group-item d-flex justify-content-between">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                            <li className="list-group-item d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>${totalPrice}</span>
                            </li>
                        </ul>

                        <div className="mb-3">
                            <label className="form-label">Dirección de Envío</label>
                            <input type="text" className="form-control" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                             <label className="form-label">Método de Pago</label>
                             <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option>Tarjeta de Crédito</option>
                                <option>Mercado Pago</option>
                             </select>
                        </div>
                        
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;