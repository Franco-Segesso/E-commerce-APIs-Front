import React, { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Efecto para cargar las categorías desde el backend al montar el componente
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

    const handleApplyFilters = () => {
        onFilterChange({
            price_min: minPrice,
            price_max: maxPrice,
        });
    };
    
    const handleCategoryClick = (categoryId) => {
        onFilterChange({ category: categoryId });
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        onFilterChange({
            category: null,
            price_min: null,
            price_max: null,
            sort: 'asc' // Volvemos al orden por defecto
        });
    };

    return (
        <div className="p-3 border rounded-3 bg-light">
            <h4>Filtros</h4>
            <hr />

            {/* Filtro por Categoría */}
            <h5>Categorías</h5>
            <ul className="list-group list-group-flush">
                <li 
                    className="list-group-item list-group-item-action"
                    style={{cursor: 'pointer'}}
                    onClick={() => onFilterChange({ category: null })}
                >
                    Todas
                </li>
                {categories.map(category => (
                    <li 
                        key={category.id} 
                        className="list-group-item list-group-item-action"
                        style={{cursor: 'pointer'}}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        {category.description}
                    </li>
                ))}
            </ul>

            <hr />

            {/* Filtro por Precio */}
            <h5 className="mt-3">Precio</h5>
            <div className="input-group mb-2">
                <span className="input-group-text">$</span>
                <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Mínimo" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />
            </div>
            <div className="input-group mb-3">
                <span className="input-group-text">$</span>
                <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
            </div>
            <button className="btn btn-primary w-100" onClick={handleApplyFilters}>
                Aplicar Precio
            </button>

            <hr />

            {/* Botón para limpiar filtros */}
            <button className="btn btn-outline-secondary w-100 mt-2" onClick={handleClearFilters}>
                Limpiar Filtros
            </button>
        </div>
    );
};

export default FilterSidebar;