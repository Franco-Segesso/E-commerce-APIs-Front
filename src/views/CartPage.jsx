import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import './CartPage.css';

const CartPage = () => {
    // Obtenemos updateQuantity del contexto
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Simulación de impuestos y envío (ajusta o quita si no aplica)
    const estimatedTaxes = subtotal * 0.05;
    const shipping = subtotal > 50000 ? 0.00 : 5000.00;
    const totalPrice = (subtotal + estimatedTaxes + shipping).toFixed(2);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="container text-center my-5 py-5">
                <h2>Tu carrito está vacío</h2>
                <p className="text-muted">Parece que todavía no has añadido nada.</p>
                <Link to="/products" className="btn btn-primary mt-3">Ver productos</Link>
            </div>
        );
    }

    return (
        <div className="container-fluid cart-page-container px-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Tu Carrito de Compras</h2>
                <Link to="/products" className="continue-shopping-link">← Continuar Comprando</Link>
            </div>

            <div className="row">
                {/* Columna de Items */}
                <div className="col-lg-8">
                    {cartItems.map(item => (
                        <div key={item.id} className="card cart-item-card">
                            <div className="d-flex align-items-center p-3">
                                {/* Imagen */}
                                <div className="cart-item-image me-3">
                                    <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} />
                                </div>
                                {/* Detalles */}
                                <div className="flex-grow-1 cart-item-details">
                                    <h5 className="cart-item-title">{item.name}</h5>
                                    <p className="cart-item-price-unit mb-2">${item.price.toFixed(2)} c/u</p>
                                    {/* Selector de Cantidad */}
                                    <div className="cart-quantity-selector">
                                        <button
                                            className="btn btn-quantity"
                                            onClick={() => updateQuantity(item.id, -1)}
                                            aria-label="Disminuir cantidad"
                                        >-</button>
                                        <input
                                            className="form-control quantity-input"
                                            type="number"
                                            value={item.quantity}
                                            readOnly // Hacemos que solo se pueda cambiar con los botones
                                            aria-label="Cantidad"
                                        />
                                        <button
                                            className="btn btn-quantity"
                                            onClick={() => updateQuantity(item.id, 1)}
                                            aria-label="Aumentar cantidad"
                                        >+</button>
                                    </div>
                                </div>
                                {/* Precio Total y Eliminar */}
                                <div className="text-end ms-3">
                                    <p className="cart-item-total-price mb-2">${(item.price * item.quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="btn-remove-item" aria-label="Eliminar item">
                                        &times; {/* Símbolo 'x' para eliminar */}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Columna Resumen del Pedido */}
                <div className="col-lg-4">
                    <div className="order-summary-card">
                        <h5 className="fw-bold mb-3">Resumen del Pedido</h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>Impuestos Estimados</span>
                            <span>${estimatedTaxes.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 text-muted">
                            <span>Envío</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between order-summary-total mb-4">
                            <span>Total</span>
                            <span>${totalPrice}</span>
                        </div>
                        <div className="d-grid">
                            <button onClick={handleCheckout} className="btn btn-proceed btn-lg">
                                Proceder al Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;