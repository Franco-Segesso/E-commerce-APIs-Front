import React from 'react';
import { Link } from 'react-router-dom';


const ProductCard = ({ product }) => {
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200';

    const hasDiscount = product.discount && product.discount > 0;
    const finalPrice = hasDiscount 
        ? product.price * (1 - product.discount) 
        : product.price;

    return (
        <div className="col mb-4">
            {/* --- ESTILO DE TARJETA ACTUALIZADO --- */}
            {/* Tarjeta sin bordes, con sombra y esquinas redondeadas */}
            <div className="card h-100 border-0 shadow-sm rounded-3">
                {hasDiscount && <div className="badge bg-dark text-white position-absolute" style={{top: '0.75rem', right: '0.75rem'}}>Oferta</div>}

                <img 
                    className="card-img-top rounded-top-3" 
                    src={`data:image/jpeg;base64,${product.imageBase64}`} 
                    alt={product.name}
                    // Estilo para que todas las imágenes tengan la misma altura
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300'; }}
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
                        <Link className="btn btn-verde mt-auto" to={`/products/${product.id}`}>
                            Ver detalles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;