import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {


    const hasDiscount = product.discount && product.discount > 0;
    const finalPrice = hasDiscount 
        ? product.price * (1 - product.discount) 
        : product.price;

    return (
        <div className="col mb-5">
            {/* --- CORRECCIÓN CLAVE AQUÍ --- */}
            {/* Agregamos "position-relative" para "anclar" la etiqueta de oferta */}
            <div className="card h-100 position-relative">
                {hasDiscount && <div className="badge bg-dark text-white position-absolute" style={{top: '0.5rem', right: '0.5rem'}}>Oferta</div>}

                <img 
                    className="card-img-top" 
                    src={`data:image/jpeg;base64,${product.imageBase64}`}
                    alt={product.name} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                />
                
                <div className="card-body p-4">
                    <div className="text-center">
                        <h5 className="fw-bolder">{product.name}</h5>
                        {hasDiscount ? (
                            <div>
                                <span className="text-muted text-decoration-line-through">${product.price.toFixed(2)}</span>
                                <span className="ms-2 fw-bold">${finalPrice.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span>${product.price.toFixed(2)}</span>
                        )}
                    </div>
                </div>
                
                <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div className="text-center">
                        <Link className="btn btn-outline-dark mt-auto" to={`/products/${product.id}`}>
                            Ver detalles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;