import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect } from 'react';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { authToken } = useAuth();
    const navigate = useNavigate();
    
    // Simplificamos los estados del formulario
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card'); // Valor por defecto
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    // Cálculos de precios
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedTaxes = subtotal * 0.05;
    const shipping = subtotal > 50000 ? 0.00 : 5000.00;
    const totalPrice = (subtotal + estimatedTaxes + shipping).toFixed(2);

    useEffect(() => {
        if(authToken){
            setLoading(true);
            fetch('http://localhost:4002/users/profile', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el perfil.');
                }
                return response.json();
            })
            .then(data => {
                setUserId(data.id);
            })
            .catch(err => {
                setError("Error al obtener el ID de usuario. Por favor, intenta de nuevo.");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
        }
    }, [authToken]);



    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress) {
            setError("Por favor, completa la dirección de envío.");
            return;
        }
        if (!userId) {
            setError("ID de usuario no disponible. No se puede procesar la orden.");
            return;
        }
        
        setLoading(true);
        setError('');

        // --- TRANSFORMACIÓN DE DATOS CLAVE AQUÍ ---
        // 1. "Aplanamos" el carrito: si hay 3 milanesas, agregamos el ID de la milanesa 3 veces a la lista.
        const productsIdList = cartItems.flatMap(item => Array(item.quantity).fill(item.id));
    

        // 2. Creamos el objeto final con los nombres que el backend SÍ entiende.
        const orderData = {
            productsId: productsIdList,
            userId: userId,
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
        <div className="container-fluid checkout-page-container">
            <div className="checkout-layout"> {/* Contenedor de 2 columnas */}
                
                {/* --- Columna Izquierda: Formulario --- */}
                <div className="checkout-form-section">
                    <h4 className="mb-3 fw-bold">Método de pago</h4>
                    <div className="payment-methods">
                        {/* Botones para seleccionar método de pago */}
                        <button 
                            type="button" 
                            className={`btn ${paymentMethod === 'Tarjeta de Credito' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('Tarjeta de Credito')}
                        >
                            Tarjeta de Credito
                        </button>
                        <button 
                            type="button" 
                            className={`btn ${paymentMethod === 'Mercado Pago' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('Mercado Pago')}
                        >
                            Mercado Pago
                        </button>
                         <button 
                            type="button" 
                            className={`btn ${paymentMethod === 'Google Pay' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('Google Pay')}
                        >
                            Google Pay
                        </button>
                    </div>

                    <h4 className="mb-3 fw-bold">Dirección de envío</h4>
                    <form id="checkout-form" onSubmit={handleConfirmOrder}> {/* Damos un ID al form */}
                        <div className="mb-3">
                            <label htmlFor="shippingAddress" className="form-label">Dirección</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="shippingAddress" 
                                value={shippingAddress} 
                                onChange={(e) => setShippingAddress(e.target.value)} 
                                placeholder="Av. Callao 1240"
                                required 
                            />
                        </div>
                        {/* Quitamos los otros campos: nombre, email, teléfono, ciudad, etc. */}
                        
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </form>
                </div>

                {/* --- Columna Derecha: Resumen del Pedido --- */}
                <div className="order-summary-section">
                    <h4 className="mb-4 fw-bold">Tu orden</h4>
                    
                    {/* Lista de productos en el resumen */}
                    {cartItems.map(item => (
                        <div key={item.id} className="order-summary-item">
                            <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} />
                            <div className="order-summary-item-details">
                                <p className="fw-medium mb-0">{item.name}</p>
                                <p className="text-muted">Cant: {item.quantity}</p>
                            </div>
                            <span className="order-summary-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    {/* Totales */}
                    <div className="summary-totals mt-3">
                        <div>
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-muted">
                            <span>Envío</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="text-muted">
                            <span>Impuestos</span>
                            <span>${estimatedTaxes.toFixed(2)}</span>
                        </div>
                        <hr/>
                        <div className="total-row">
                            <span>Total</span>
                            <span>${totalPrice}</span>
                        </div>
                    </div>

                    {/* Botón de Confirmar (ahora fuera del form, pero lo activa) */}
                    <div className="d-grid mt-4">
                        <button 
                            type="submit" 
                            form="checkout-form" // Vincula este botón al formulario
                            className="btn btn-confirm-checkout btn-lg" 
                            disabled={loading || !userId}
                        >
                            {loading ? 'Procesando...' : 'Confirmar Orden'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;