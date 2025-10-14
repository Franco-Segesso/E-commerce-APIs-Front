import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx'; // Mantenemos el searchbar aquí

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para manejar los filtros activos
    const [filters, setFilters] = useState({
        category: null,
        price_min: null,
        price_max: null,
        sort: 'asc',
        searchQuery: ''
    });

    // Usamos useCallback para que la función no se recree en cada render
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // Construimos la URL dinámicamente según la prioridad de los filtros
        let url;

        if (filters.searchQuery) {
            // Nota: Este endpoint no existe aún en tu backend.
            // Por ahora, la búsqueda se hará en el frontend sobre la lista actual.
            // Lo ideal sería agregar el endpoint `/products/search?name=...` al backend.
            console.log("Búsqueda por frontend (temporal):", filters.searchQuery);
        } else if (filters.category) {
            url = new URL(`http://localhost:4002/categories/${filters.category}/products`);
        } else if (filters.price_min && filters.price_max) {
            url = new URL('http://localhost:4002/products/by-price');
            url.searchParams.append('minPrice', filters.price_min);
            url.searchParams.append('maxPrice', filters.price_max);
        } else {
             // Vista por defecto: productos ordenados por precio
             url = new URL('http://localhost:4002/products/sorted-by-price');
             url.searchParams.append('order', filters.sort);
        }

        try {
            if (url) { // Solo hacemos fetch si se construyó una URL para el backend
                const response = await fetch(url.toString());
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                
                const data = await response.json();
                setProducts(data.content || []);
            }
        } catch (error) {
            setError(error.message);
            setProducts([]); // Limpiamos los productos si hay un error
        } finally {
            setLoading(false);
        }
    }, [filters.category, filters.price_min, filters.price_max, filters.sort]); // Dependencias para el fetch

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Lógica de filtrado y búsqueda en el frontend
    const displayedProducts = products.filter(product => {
        if (filters.searchQuery) {
            return product.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
        }
        return true; // Si no hay búsqueda, no filtramos por nombre
    });

    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const handleSearch = (query) => {
        setFilters(prev => ({
            ...prev,
            searchQuery: query,
            // Cuando buscamos, reseteamos los otros filtros para evitar conflictos
            category: null,
            price_min: null,
            price_max: null
        }));
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
                        <div className="flex-grow-1">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                        
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
                        <div className="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 row-cols-xl-3">
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="text-center">No se encontraron productos que coincidan con los filtros.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;