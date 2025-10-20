import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './CartPage.css';


const CartPage = () => {
    const { cartItems, removeFromCart } = useCart();
    const { authToken } = useAuth();
    const navigate = useNavigate();

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const handleCheckout = () => {
        // Si no está logueado, el ProtectedRoute se encargará de redirigirlo.
        // Nosotros solo lo mandamos a la página de checkout.
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="container text-center my-5">
                <h2>Tu carrito está vacío</h2>
                <Link to="/products" className="btn btn-primary mt-3">Ver productos</Link>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4">Tu Carrito de Compras</h2>
            <div className="row">
                <div className="col-md-8">
                    {cartItems.map(item => (
                        <div key={item.id} className="card mb-3">
                            <div className="row g-0">
                                <div className="col-md-2 d-flex align-items-center justify-content-center p-2">
                                    <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} className="img-fluid rounded-start"/>
                                </div>
                                <div className="col-md-10">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <h5 className="card-title">{item.name}</h5>
                                            <h5 className="card-title">${(item.price * item.quantity).toFixed(2)}</h5>
                                        </div>
                                        <p className="card-text">Cantidad: {item.quantity}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="btn btn-outline-danger btn-sm">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Resumen del Pedido</h5>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>${totalPrice}</span>
                            </div>
                            <div className="d-grid mt-4">
                                <button onClick={handleCheckout} className="btn btn-success">
                                    Proceder al Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;