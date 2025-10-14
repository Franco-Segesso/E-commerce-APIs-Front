import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para manejar los filtros activos
    const [filters, setFilters] = useState({
        category: null,
        price_min: null,
        price_max: null,
        sort: 'asc'
    });

    // Usamos useCallback para que la función no se recree en cada render
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // Construimos la URL dinámicamente según los filtros
        let url = new URL('http://localhost:4002/products');

        if (filters.category) {
            url = new URL(`http://localhost:4002/categories/${filters.category}/products`);
        } else if (filters.price_min && filters.price_max) {
            url = new URL('http://localhost:4002/products/by-price');
            url.searchParams.append('minPrice', filters.price_min);
            url.searchParams.append('maxPrice', filters.price_max);
        } else {
             url = new URL('http://localhost:4002/products/sorted-by-price');
             url.searchParams.append('order', filters.sort);
        }

        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            setProducts(data.content || []);
        } catch (error) {
            setError(error.message);
            setProducts([]); // Limpiamos los productos si hay un error
        } finally {
            setLoading(false);
        }
    }, [filters]); // La función se actualiza si los filtros cambian

    // useEffect para llamar a fetchProducts cuando los filtros cambien
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const handleSortChange = (e) => {
        handleFilterChange({ sort: e.target.value });
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
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bolder">Nuestro Catálogo</h2>
                        {/* Control para ordenar */}
                        <div className="col-md-3">
                            <select className="form-select" value={filters.sort} onChange={handleSortChange}>
                                <option value="asc">Precio: Menor a Mayor</option>
                                <option value="desc">Precio: Mayor a Menor</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading && <div className="text-center"><h4>Cargando...</h4></div>}
                    {error && <div className="alert alert-danger">Error: {error}</div>}
                    
                    {!loading && !error && (
                        <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-2 row-cols-xl-3 justify-content-center">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p>No se encontraron productos que coincidan con los filtros.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;