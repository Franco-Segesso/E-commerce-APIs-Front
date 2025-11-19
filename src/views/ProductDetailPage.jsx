import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import './ProductDetailPage.css';
import { toast } from 'react-toastify'; // <-- IMPORTAR

const ProductDetailPage = () => {
    
    const { productId } = useParams();
    const { addToCart, cartItems } = useCart();
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
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            // Asegura que la cantidad no sea menor que 1
            return newQuantity < 1 ? 1 : newQuantity;
        });
    };
    
    
    const handleAddToCart = () => {
        if (!product) return;

        // Buscamos si el producto ya está en el carrito para saber su cantidad actual
        const itemInCart = cartItems.find(item => item.id === product.id);
        const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
        const requestedQuantity = parseInt(quantity, 10) || 1;

        // VALIDACIÓN DE STOCK 
        if (currentQuantityInCart + requestedQuantity > product.stock) {
            toast.error(`¡Stock insuficiente! Solo quedan ${product.stock} unidades disponibles de "${product.name}".`);
            return; 
        }
        
        const productToAdd = { 
            ...product, 
            price: finalPricePerUnit, 
            quantity: requestedQuantity
        };
        addToCart(productToAdd);
        // No es necesario alert aquí si ya pusiste el toast en el context, pero si quieres reforzar:
        // toast.success(`${product.name} (x${quantity}) agregado al carrito.`);
    };
    
    if (loading) return <div className="text-center p-5"><h4>Cargando...</h4></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center">{error}</div></div>;
    if (!product) return null;


    return (
        
        <div className="container-fluid product-detail-page px-lg-5"> 
            <div className="row gx-lg-5 align-items-center"> 
                {/* Columna de la Imagen */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                    <img 
                        className="img-fluid product-detail-img w-100" 
                        src={`data:image/jpeg;base64,${product.imageBase64}`} 
                        alt={product.name} 
                    />
                </div>
                
                {/* Columna de Detalles */}
                <div className="col-lg-6 product-details">
                    <h1 className="product-detail-title">{product.name}</h1>
                    
                    {/* Sección de Precio */}
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

                    {/* Selector de Cantidad */}
                    <div className = "quantity-selector-wrapper">
                    <label className="form-label fw-bold">ELIGE LA CANTIDAD</label>
                    <div className="quantity-selector">
                        <button 
                            className="btn btn-quantity" 
                            onClick={() => handleQuantityChange(-1)}
                            aria-label="Disminuir cantidad"
                        >
                            -
                        </button>
                        <input 
                            className="form-control quantity-input" 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                            min="1"
                            aria-label="Cantidad"
                        />
                        <button 
                            className="btn btn-quantity" 
                            onClick={() => handleQuantityChange(1)}
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>
                    </div>
                    </div>

                    {/* Botón Agregar al Carrito*/}
                    <div className="d-grid">
                        <button 
                            onClick={handleAddToCart} 
                            className="btn btn-add-to-cart btn-lg" 
                            type="button"
                        >
                            Añadir - ${totalPriceForQuantity} 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;