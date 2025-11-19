import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTS DE REDUX (Reemplazan a useCart)
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';

// 2. Mantenemos AuthContext y Toastify
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify'; 
import './CheckoutPage.css';

const CheckoutPage = () => {
    // --- A. HOOKS DE REDUX ---
    // Leemos los items del carrito desde el estado global
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch(); // Para ejecutar acciones como clearCart

    const { authToken } = useAuth();
    const navigate = useNavigate();
    
    // Estados del formulario
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); 
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    // Estados de la Tarjeta
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');


    // --- B. CÁLCULOS (Usando cartItems de Redux) ---
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedTaxes = subtotal * 0.05;
    const shipping = subtotal > 50000 ? 0.00 : 5000.00;
    const totalPrice = (subtotal + estimatedTaxes + shipping).toFixed(2);

    // Fetch del Perfil (Igual que tu código)
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
        
        // --- VALIDACIONES GENERALES ---
        if (!shippingAddress) {
            toast.error("Por favor, completa la dirección de envío.");
            return;
        }
        if (!paymentMethod) {
            toast.error("Por favor, selecciona un método de pago.");
            return;
        }
        if (!userId) {
            toast.error("ID de usuario no disponible. No se puede procesar la orden.");
            return;
        }

        // --- VALIDACIÓN DE TARJETA DE CRÉDITO ---
        if (paymentMethod === 'Tarjeta de Credito') { 
            const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!regex.test(cardExpiry)) {
                setError("La fecha de vencimiento debe ser MM/AA.");
                return;
            }

            const [mm, yy] = cardExpiry.split('/').map(Number);

            const currentYear = Number(new Date().getFullYear().toString().slice(-2));
            const currentMonth = new Date().getMonth() + 1;

            if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
                setError("La tarjeta está vencida.");
                return;
            }
        }

        setLoading(true);
        setError('');

        // Preparamos la lista plana de IDs para el backend
        const productsIdList = cartItems.flatMap(item => Array(item.quantity).fill(item.id));
    
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
                if (response.status === 403) {
                    throw new Error("Error de permisos (403): Tu usuario no tiene el rol necesario para crear órdenes.");
                }
                throw new Error("No se pudo procesar la orden.");
            }

            const createdOrder = await response.json();
            
            toast.success(`¡Orden creada con éxito! Número de orden: ${createdOrder.id}`);
            
            // --- C. LIMPIAR CARRITO CON REDUX ---
            dispatch(clearCart()); // Ejecutamos la acción importada del slice
            
            navigate('/');

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid checkout-page-container">
            <div className="checkout-layout"> 
                
                {/* Columna Izquierda: Formulario */}
                <div className="checkout-form-section">
                    <h4 className="mb-3 fw-bold">Método de pago</h4>
                    <div className="payment-methods">
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
                    <form id="checkout-form" onSubmit={handleConfirmOrder}> 
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
                        
                        {/* Formulario Condicional de Tarjeta */}
                        {paymentMethod === 'Tarjeta de Credito' && (
                            <div className="mt-3 card-fields">
                                <h4 className="fw-bold mb-3">Datos de la tarjeta</h4>

                                <div className="mb-3">
                                    <label className="form-label">Número de Tarjeta</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="1234 5678 9012 3456"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Vencimiento (MM/AA)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cardExpiry}
                                        onChange={(e) => {
                                            let v = e.target.value;
                                            v = v.replace(/[^\d]/g, "");
                                            if (v.length > 4) v = v.slice(0, 4);
                                            if (v.length === 1 && Number(v) > 1) {
                                                v = "0" + v;
                                            }
                                            if (v.length >= 3) {
                                                v = v.slice(0, 2) + "/" + v.slice(2);
                                            }
                                            setCardExpiry(v);
                                        }}
                                        placeholder="MM/AA"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">CVV</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        placeholder="123"
                                        required
                                    />
                                </div>
                            </div>
                        )} 

                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </form>
                </div>

                {/* Columna Derecha: Resumen del Pedido */}
                <div className="order-summary-section">
                    <h4 className="mb-4 fw-bold">Tu orden</h4>
                    
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

                    <div className="d-grid mt-4">
                        <button 
                            type="submit" 
                            form="checkout-form" 
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