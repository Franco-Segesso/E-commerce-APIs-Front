import React from 'react';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';

const ProductsPage = () => {
    // Estado para la lista COMPLETA de productos
    const [allProducts, setAllProducts] = useState([]);
    // Estado para la lista de productos que se MUESTRAN (ya filtrados)
    const [displayedProducts, setDisplayedProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado unificado para todos los filtros
    const [filters, setFilters] = useState({
        category: null,
        price_min: '',
        price_max: '',
        sort: 'asc',
        searchQuery: ''
    });

    // 1. Cargar TODOS los productos del backend UNA SOLA VEZ
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:4002/products');
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                
                const data = await response.json();
                setAllProducts(data.content || []);
                setDisplayedProducts(data.content || []); // Al inicio, mostramos todos
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []); // El array vacío asegura que esto se ejecute solo una vez

    // 2. Aplicar filtros y búsqueda CADA VEZ que cambien los filtros o la lista de productos
    useEffect(() => {
        let filteredProducts = [...allProducts];

        // Aplicar filtro de categoría
        if (filters.category) {
            filteredProducts = filteredProducts.filter(p => p.category.id === filters.category);
        }

        // Aplicar filtro de precio
        if (filters.price_min && filters.price_max) {
            filteredProducts = filteredProducts.filter(p => {
                const finalPrice = p.discount > 0 ? p.price * (1 - p.discount) : p.price;
                return finalPrice >= parseFloat(filters.price_min) && finalPrice <= parseFloat(filters.price_max);
            });
        }

        // Aplicar filtro de búsqueda por nombre
        if (filters.searchQuery) {
            filteredProducts = filteredProducts.filter(p =>
                p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
            );
        }

        // Aplicar ordenamiento
        filteredProducts.sort((a, b) => {
            const priceA = a.discount > 0 ? a.price * (1 - a.discount) : a.price;
            const priceB = b.discount > 0 ? b.price * (1 - b.discount) : b.price;
            return filters.sort === 'asc' ? priceA - priceB : priceB - priceA;
        });

        setDisplayedProducts(filteredProducts);

    }, [filters, allProducts]);

    // Handler para actualizar cualquier filtro
    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    return (
        <div className="container my-5">
            <div className="row">
                {/* Columna de Filtros */}
                <div className="col-lg-3">
                    <FilterSidebar onFilterChange={handleFilterChange} />
                </div>

                {/* Columna de Productos */}
                <div className="col-lg-9">
                    <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                        {/* Barra de búsqueda ahora ocupa el espacio principal */}
                        <div className="flex-grow-1">
                            <SearchBar onSearch={(query) => handleFilterChange({ searchQuery: query })} />
                        </div>
                        
                        {/* Control para ordenar */}
                        <div>
                            <select 
                                className="form-select" 
                                value={filters.sort} 
                                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                            >
                                <option value="asc">Menor a Mayor Precio</option>
                                <option value="desc">Mayor a Menor Precio</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading && <div className="text-center"><h4>Cargando...</h4></div>}
                    {error && <div className="alert alert-danger">Error: {error}</div>}
                    
                    {!loading && !error && (
                        <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-2 row-cols-xl-3 justify-content-center">
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p>No se encontraron productos que coincidan con tu búsqueda o filtros.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;