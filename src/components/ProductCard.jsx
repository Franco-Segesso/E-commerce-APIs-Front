import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const hasDiscount = product.discount && product.discount > 0;
    const finalPrice = hasDiscount 
        ? product.price * (1 - product.discount) 
        : product.price;

    return (
        <div className="col">
            <div className="card h-100 product-card-enhanced"> {/* Usamos la nueva clase base */}
                {hasDiscount && <div className="badge bg-dark text-white position-absolute top-0 end-0 m-2">Oferta</div>}

                {/* Contenedor para controlar el aspect ratio */}
                <div className="product-card-img-container"> 
                    <img
                        src={`data:image/jpeg;base64,${product.imageBase64}`}
                        className="product-card-img" 
                        alt={product.name}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300'; }}
                    />
                </div>
                
                <div className="product-card-body"> {/* Nueva clase para el cuerpo */}
                    <h5 className="product-card-title">{product.name}</h5> {/* Nueva clase para el título */}
                    
                    {/* Estilo mejorado para precios */}
                    <div className="product-card-price"> 
                        {hasDiscount ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span>${finalPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span>${product.price.toFixed(2)}</span>
                        )}
                    </div>
                </div>
                
                {/* Footer sin borde superior y con padding ajustado */}
                <div className="product-card-footer"> 
                    <div className="text-center">
                        <Link className="btn btn-verde mt-auto" to={`/products/${product.id}`}> {/* Botón más pequeño */}
                            Ver detalles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;