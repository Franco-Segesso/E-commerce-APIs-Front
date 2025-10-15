import React, { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:4002/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.content || []);
                }
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleApplyPriceFilter = () => {
        if (minPrice && maxPrice) {
            if (parseFloat(minPrice) > parseFloat(maxPrice)) {
                setError('El precio mínimo no puede ser mayor que el máximo.');
                return;
            }
            setError('');
            onFilterChange({ price_min: minPrice, price_max: maxPrice });
        } else {
            setError('Por favor, complete ambos campos de precio.');
        }
    };
    
    const handleCategoryClick = (categoryId) => {
        setError('');
        onFilterChange({ category: categoryId });
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setError('');
        onFilterChange({ category: null, price_min: '', price_max: '', sort: 'asc' });
    };

    return (
        // Quitamos el fondo y el borde para un look más integrado
        <div className="p-3">
            <h4 className="fw-bolder">Filtros</h4>
            <hr />

            <h5>Categorías</h5>
            {/* Usamos list-group-flush y border-0 para un estilo más limpio */}
            <ul className="list-group list-group-flush mb-3">
                <li 
                    className="list-group-item list-group-item-action border-0"
                    style={{cursor: 'pointer'}}
                    onClick={() => handleCategoryClick(null)}
                >
                    Todas
                </li>
                {categories.map(category => (
                    <li 
                        key={category.id} 
                        className="list-group-item list-group-item-action border-0"
                        style={{cursor: 'pointer'}}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        {category.description}
                    </li>
                ))}
            </ul>

            <hr />

            <h5 className="mt-3">Precio</h5>
            <div className="input-group mb-2">
                <input type="number" className="form-control" placeholder="Mínimo" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0"/>
            </div>
            <div className="input-group mb-3">
                <input type="number" className="form-control" placeholder="Máximo" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0"/>
            </div>
            {error && <small className="text-danger d-block mb-2">{error}</small>}
            {/* Botón verde para coincidir con el estilo del ejemplo */}
            <button className="btn btn-success w-100" onClick={handleApplyPriceFilter}>
                Aplicar
            </button>

            <hr />

            <button className="btn btn-outline-secondary w-100 mt-2" onClick={handleClearFilters}>
                Limpiar Filtros
            </button>
        </div>
    );
};

export default FilterSidebar;