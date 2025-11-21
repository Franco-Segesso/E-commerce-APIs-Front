import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. REDUX
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/CartSlice';
import { createOrder } from '../redux/slices/OrdersSlice';
import { fetchProfile } from '../redux/slices/UserSlice';
import { decreaseStockLocally } from '../redux/slices/ProductSlice';


import { toast } from 'react-toastify'; 
import './CheckoutPage.css';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 2. ESTADO GLOBAL
    // Carrito
    const cartItems = useSelector((state) => state.cart.items);
    // Usuario (Necesitamos el ID para la orden)
    const { profile: userProfile, loading: loadingUser } = useSelector((state) => state.user);
    // Estado de la orden (para saber si se está enviando)
    const { loading: loadingOrder } = useSelector((state) => state.orders);

    // 3. ESTADOS LOCALES (Formulario)
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); 
    
    // Datos de tarjeta (Solo UI local)
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // 4. CÁLCULOS
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedTaxes = subtotal * 0.05;
    const shipping = subtotal > 50000 ? 0.00 : 5000.00;
    const totalPrice = (subtotal + estimatedTaxes + shipping).toFixed(2);

    // 5. EFECTOS
    // Cargar el perfil del usuario al entrar para tener su ID disponible
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!shippingAddress) return toast.error("Por favor, completa la dirección de envío.");
        if (!paymentMethod) return toast.error("Por favor, selecciona un método de pago.");
        
        // Verificamos si tenemos el ID del usuario cargado desde Redux
        if (!userProfile?.id) {
            return toast.error("Error: No se pudo identificar al usuario. Recarga la página.");
        }

        // Validación de Tarjeta
        if (paymentMethod === 'Tarjeta de Credito') { 
            const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!regex.test(cardExpiry)) return toast.error("La fecha de vencimiento debe ser MM/AA.");

            const [mm, yy] = cardExpiry.split('/').map(Number);
            const currentYear = Number(new Date().getFullYear().toString().slice(-2));
            const currentMonth = new Date().getMonth() + 1;

            if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
                return toast.error("La tarjeta está vencida.");
            }
        }

        // Preparar datos para el backend
        const productsIdList = cartItems.flatMap(item => Array(item.quantity).fill(item.id));
    
        const orderData = {
            productsId: productsIdList,
            userId: userProfile.id, // ID obtenido de Redux UserSlice
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod
        };
        
        // DESPACHAR LA ORDEN
        // createOrder ya es "inteligente" y busca el token solo (gracias a tu OrdersSlice)
        dispatch(createOrder(orderData))
            .unwrap() // Nos permite manejar el éxito/error como promesa
            .then((createdOrder) => {
                toast.success(`¡Orden creada con éxito! ID: ${createdOrder.id}`);
                dispatch(decreaseStockLocally(cartItems)); // Actualizamos stocks localmente
                dispatch(clearCart()); // Limpiamos el carrito en Redux
                navigate('/');
            })
            .catch((err) => {
                toast.error(err || "No se pudo procesar la orden.");
            });
    };

    const isLoading = loadingUser || loadingOrder;

    return (
        <div className="container-fluid checkout-page-container">
            <div className="checkout-layout"> 
                
                {/* FORMULARIO (Columna Izquierda) */}
                <div className="checkout-form-section">
                    <h4 className="mb-3 fw-bold">Método de pago</h4>
                    <div className="payment-methods">
                        {['Tarjeta de Credito', 'Mercado Pago', 'Google Pay'].map(method => (
                            <button 
                                key={method}
                                type="button" 
                                className={`btn ${paymentMethod === method ? 'active' : ''}`}
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method}
                            </button>
                        ))}
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
                        
                        {/* Campos de Tarjeta (Condicional) */}
                        {paymentMethod === 'Tarjeta de Credito' && (
                            <div className="mt-3 card-fields">
                                <h4 className="fw-bold mb-3">Datos de la tarjeta</h4>
                                <div className="mb-3">
                                    <label className="form-label">Número de Tarjeta</label>
                                    <input type="text" className="form-control" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" required />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">Vencimiento (MM/AA)</label>
                                        <input type="text" className="form-control" value={cardExpiry} 
                                            onChange={(e) => {
                                                // Tu lógica de formateo original
                                                let v = e.target.value.replace(/[^\d]/g, "");
                                                if (v.length > 4) v = v.slice(0, 4);
                                                if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                                                setCardExpiry(v);
                                            }} 
                                            placeholder="MM/AA" required 
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">CVV</label>
                                        <input type="text" className="form-control" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" required />
                                    </div>
                                </div>
                            </div>
                        )} 
                    </form>
                </div>

                {/* RESUMEN (Columna Derecha) */}
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
                        <div><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="text-muted"><span>Envío</span><span>${shipping.toFixed(2)}</span></div>
                        <div className="text-muted"><span>Impuestos</span><span>${estimatedTaxes.toFixed(2)}</span></div>
                        <hr/>
                        <div className="total-row">
                            <span>Total</span><span>${totalPrice}</span>
                        </div>
                    </div>

                    <div className="d-grid mt-4">
                        <button 
                            type="submit" 
                            form="checkout-form" 
                            className="btn btn-confirm-checkout btn-lg" 
                            disabled={isLoading || cartItems.length === 0}
                        >
                            {isLoading ? 'Procesando...' : 'Confirmar Orden'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;