import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx'; // Mantenemos el searchbar aquí
import './ProductPage.css'; // Asegúrate de tener estilos específicos para esta página

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
        // Contenedor principal con fondo blanco y padding
        <div className="container-fluid product-page-container px-lg-5">
            {/* Sección de Título */}
            <div className="text-center mb-5">
                <h1 className="page-title">Explorá Nuestros Productos</h1>
                <p className="page-subtitle">Encontrá la opción perfecta para tu estilo de vida.</p>
            </div>

            <div className="row gx-lg-5"> {/* gx-lg-5 añade espacio horizontal entre columnas en pantallas grandes */}
                {/* Columna de Filtros */}
                <div className="col-lg-3">
                    <div className="filter-sidebar">
                        <FilterSidebar onFilterChange={handleFilterChange} />
                    </div>
                </div>

                {/* Columna de Productos */}
                <div className="col-lg-9">
                    {/* Barra de Búsqueda y Ordenamiento */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 search-sort-bar">
                        <div className="flex-grow-1">
                            <SearchBar onSearch={(query) => handleFilterChange({ searchQuery: query })} />
                        </div>
                        <div style={{ minWidth: '200px' }}> {/* Ancho mínimo para el dropdown */}
                            <select
                                className="form-select"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                            >
                                <option value="asc">Ordenar por Precio (Menor)</option>
                                <option value="desc">Ordenar por Precio (Mayor)</option>
                            </select>
                        </div>
                    </div>

                    {/* Grilla de Productos */}
                    {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div></div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    {!loading && !error && (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"> {/* g-4 añade espacio entre tarjetas */}
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="text-center text-muted col-12 mt-5">No se encontraron productos que coincidan con tu búsqueda o filtros.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;