import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Imports Redux
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    
    // Leemos el carrito para validar stock
    const cartItems = useSelector((state) => state.cart.items);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:4002/products/${productId}`);
                if (response.status === 204) throw new Error("Producto no encontrado.");
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);
    
    const hasDiscount = product?.discount && product.discount > 0;
    const finalPricePerUnit = hasDiscount ? product.price * (1 - product.discount) : product?.price;
    const totalPriceForQuantity = (finalPricePerUnit * quantity).toFixed(2);
    
    const handleQuantityChange = (amount) => {
        setQuantity(prev => {
            const val = prev + amount;
            return val < 1 ? 1 : val;
        });
    };
    
    const handleAddToCart = () => {
        if (!product) return;

        // Validación de Stock usando Redux
        const itemInCart = cartItems.find(item => item.id === product.id);
        const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
        const requestedQuantity = parseInt(quantity, 10) || 1;

        if (currentQuantityInCart + requestedQuantity > product.stock) {
            toast.warning(`¡Stock insuficiente! Solo quedan ${product.stock} unidades.`);
            return; 
        }
        
        const productToAdd = { 
            ...product, 
            price: finalPricePerUnit, 
            quantity: requestedQuantity
        };

        // Despachamos la acción
        dispatch(addToCart(productToAdd));
        toast.success(`${product.name} (x${quantity}) agregado al carrito.`);
    };
    
    if (loading) return <div className="text-center p-5"><h4>Cargando...</h4></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center">{error}</div></div>;
    if (!product) return null;

    return (
        <div className="container-fluid product-detail-page px-lg-5"> 
            <div className="row gx-lg-5 align-items-center"> 
                <div className="col-lg-6 mb-4 mb-lg-0">
                    <img className="img-fluid product-detail-img w-100" src={`data:image/jpeg;base64,${product.imageBase64}`} alt={product.name} />
                </div>
                
                <div className="col-lg-6 product-details">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <div className="product-detail-price">
                        {hasDiscount ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="fw-bold">${finalPricePerUnit.toFixed(2)}</span>
                            </>
                        ) : (
                            <span>${finalPricePerUnit.toFixed(2)}</span>
                        )}
                    </div>
                    <p className="lead mb-4">{product.description}</p>

                    <div className = "quantity-selector-wrapper">
                        <label className="form-label fw-bold">ELIGE LA CANTIDAD</label>
                        <div className="quantity-selector">
                            <button className="btn btn-quantity" onClick={() => handleQuantityChange(-1)}>-</button>
                            <input className="form-control quantity-input" type="number" value={quantity} readOnly />
                            <button className="btn btn-quantity" onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>

                    <div className="d-grid">
                        <button onClick={handleAddToCart} className="btn btn-add-to-cart btn-lg" type="button">
                            Añadir - ${totalPriceForQuantity} 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;