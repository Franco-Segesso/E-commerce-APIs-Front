import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../redux/slices/CategorySlice';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState(null); // Para resaltar la categoría activa

    const dispatch = useDispatch();

    const categories = useSelector(state => state.categories.list);

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [dispatch, categories.length]);

    const handleApplyPriceFilter = () => { // Valida y aplica el filtro de precio
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
    
    const handleCategoryClick = (categoryId) => { // Maneja el clic en una categoría
        setError('');
        setActiveCategory(categoryId); // Guardamos la categoría activa
        onFilterChange({ 
            category: categoryId,
            price_min: '', // Limpiamos precio al cambiar categoría
            price_max: ''
        });

    };

    const handleClearFilters = () => { // Limpia todos los filtros
        setMinPrice('');
        setMaxPrice('');
        setError('');
        onFilterChange({ category: null, price_min: '', price_max: '', sort: 'asc' });
        setActiveCategory(null);
    };

    return (
        <div>
            <h5>Categorías</h5>
            <ul className="list-group list-group-flush mb-4 category-list">
                {/* Botón para "Todas" */}
                <li
                    className={`list-group-item ${activeCategory === null ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(null)}
                >
                    Todas
                </li>
                {/* Mapeo de categorías */}
                {categories.map(category => (
                    <li
                        key={category.id}
                        className={`list-group-item ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        {category.description}
                    </li>
                ))}
            </ul>

            <h5>Precio</h5>
            <div className="input-group mb-2">
                <span className="input-group-text">$</span>
                <input type="number" className="form-control" placeholder="Mínimo" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0"/>
            </div>
            <div className="input-group mb-3">
                 <span className="input-group-text">$</span>
                <input type="number" className="form-control" placeholder="Máximo" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0"/>
            </div>
            {error && <small className="text-danger d-block mb-2">{error}</small>}
            <button className="btn btn-primary w-100 mb-4" onClick={handleApplyPriceFilter}>
                Aplicar Precio
            </button>

            <button className="btn btn-outline-secondary w-100 btn-sm" onClick={handleClearFilters}>
                Limpiar Filtros
            </button>
        </div>
    );
};

export default FilterSidebar;