import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const ProductDetailPage = () => {
    // ... (toda la lógica de fetch y de agregar al carrito no cambia)
    const { productId } = useParams();
    const { addToCart } = useCart();
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
    const finalPrice = hasDiscount ? product.price * (1 - product.discount) : product?.price;

    const handleAddToCart = () => {
        if (product) {
            const productToAdd = { ...product, price: finalPrice, quantity: parseInt(quantity, 10) || 1 };
            addToCart(productToAdd);
            alert(`${product.name} (x${quantity}) agregado al carrito.`);
        }
    };
    
    if (loading) return <div className="text-center p-5"><h4>Cargando...</h4></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center">{error}</div></div>;
    if (!product) return null;


    return (
        <section className="py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    {/* --- CORRECCIÓN CLAVE AQUÍ --- */}
                    {/* Agregamos "position-relative" al contenedor de la imagen */}
                    <div className="col-md-6 position-relative">
                        
                        <img className="card-img-top mb-5 mb-md-0" src={`data:image/jpeg;base64,${product.imageBase64}`} alt={product.name} />
                    </div>
                    <div className="col-md-6">
                        <h1 className="display-5 fw-bolder">{product.name}</h1>
                        <div className="fs-5 mb-3">
                            {hasDiscount ? (
                                <div>
                                    <span className="text-decoration-line-through me-2">${product.price.toFixed(2)}</span>
                                    <span className="fw-bold">${finalPrice.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span>${product.price.toFixed(2)}</span>
                            )}
                        </div>
                        <p className="lead">{product.description}</p>
                        <div className="d-flex">
                            <input className="form-control text-center me-3" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" style={{maxWidth: '4rem'}} />
                            <button onClick={handleAddToCart} className="btn btn-outline-dark flex-shrink-0" type="button">
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetailPage;