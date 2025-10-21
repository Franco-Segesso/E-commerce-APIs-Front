import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import './ProductPage.css'; // Asumiendo que tenés los estilos aquí

const ProductsPage = () => {
    const [products, setProducts] = useState([]); // Productos recibidos del backend (filtrados por categoría/precio)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado SOLO para los filtros que SÍ van al backend
    const [backendFilters, setBackendFilters] = useState({
        category: null,
        price_min: null,
        price_max: null,
        sort: 'asc',
    });

    // --- ESTADO SEPARADO PARA LA BÚSQUEDA ---
    const [searchQuery, setSearchQuery] = useState('');

    // useCallback para la función de fetch, depende SOLO de los filtros del backend
    const fetchProducts = useCallback(async () => {
        setLoading(true); // Mostramos carga SOLO al pedir datos al back
        setError(null);

        let url;
        if (backendFilters.category) {
            url = new URL(`http://localhost:4002/categories/${backendFilters.category}/products`);
        } else if (backendFilters.price_min && backendFilters.price_max) {
            url = new URL('http://localhost:4002/products/by-price');
            url.searchParams.append('minPrice', backendFilters.price_min);
            url.searchParams.append('maxPrice', backendFilters.price_max);
        } else {
             url = new URL('http://localhost:4002/products/sorted-by-price');
             url.searchParams.append('order', backendFilters.sort);
        }

        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            setProducts(data.content || []); // Guardamos los productos recibidos
        } catch (error) {
            setError(error.message);
            setProducts([]);
        } finally {
            setLoading(false); // Ocultamos carga
        }
    }, [backendFilters]); // <-- SOLO depende de los filtros del backend

    // useEffect que llama a fetchProducts cuando cambian los filtros del backend
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // --- FILTRADO EN FRONTEND PARA LA BÚSQUEDA ---
    // Filtramos la lista 'products' actual basándonos en 'searchQuery'
    const displayedProducts = products.filter(product => {
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true; // Si no hay búsqueda, muestra todos los productos de la lista actual
    });

    // Función que actualiza los filtros del BACKEND
    const handleBackendFilterChange = (newFilters) => {
        // Al aplicar un filtro de categoría/precio/orden, limpiamos la búsqueda
        setSearchQuery('');
        setBackendFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    // Función que actualiza SOLO el estado de búsqueda
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        // NO llamamos a handleBackendFilterChange aquí
    };

    return (
        // Usamos un fragmento <> para poder tener la sección de ondas y el contenido como hermanos
        <>
            {/* INICIO DE LA SECCIÓN DE ONDA (Estructura de 3 partes replicada) */}
            <section className="wave-wrap">
                
                {/* 1. Onda superior (AHORA MÁS GRANDE con viewBox y path ajustados) */}
                <div className="wave-top wave-top-about">
                    {/* viewBox: Ajustado a 1440 de ancho y 150 de alto (antes 100)
                        path d: Modificado para una curva más pronunciada */}
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> {/* Aumentado el height del viewBox */}
                        <path
                            d="M0,96 C240,128 480,32 720,64 C960,96 1200,96 1440,64 L1440,150 L0,150 Z" /* Ajustado para una curva más alta */
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>

                {/* 2. Cuerpo Verde (Contiene el Título y Badges, usa el CSS de ajuste) */}
                <div className="wave-body about-wave-body text-center" style={{ backgroundColor: '#dcf8eaff' }}>
                    {/* Agregamos un translateY para subir el contenido dentro de la onda más grande */}
                    <div style={{ transform: 'translateY(-2rem)' }}> 
                        <h1 className="display-4 fw-bold text-dark mb-3">Explorá nuestros productos</h1>
                        <p className="lead text-dark-emphasis mx-auto" style={{ maxWidth: '800px' }}>
                            Encontrá la opción perfecta para tu estilo de vida
                        </p>
                        
                    </div>
                </div>

                {/* 3. Onda inferior (AHORA MÁS GRANDE con viewBox y path ajustados) */}
                <div className="wave-bottom wave-bottom-about">
                    {/* viewBox: Ajustado a 1440 de ancho y 150 de alto (antes 100)
                        path d: Modificado para una curva más pronunciada */}
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> {/* Aumentado el height del viewBox */}
                        <path
                            d="M0,0 L0,0 C240,64 480,150 720,118 C960,86 1200,86 1440,118 L1440,150 L0,150 Z" /* Ajustado para una curva más alta */
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>
            </section>
            {/* FIN DE LA SECCIÓN DE ONDA */}

            {/* --- CONTENIDO PRINCIPAL DE LA PÁGINA --- */}
            <div className="container-fluid product-page-container px-lg-5">
            {/* ... (Título) ... */}
                <div className="row gx-lg-5">
                    {/* Columna de Filtros */}
                    <div className="col-lg-3">
                        <div className="filter-sidebar">
                            {/* Pasamos handleBackendFilterChange al sidebar */}
                            <FilterSidebar onFilterChange={handleBackendFilterChange} />
                        </div>
                    </div>

                    {/* Columna de Productos */}
                    <div className="col-lg-9">
                        {/* Barra de Búsqueda y Ordenamiento */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 search-sort-bar">
                            <div className="flex-grow-1">
                                {/* El SearchBar ahora llama a handleSearchChange */}
                                <SearchBar onSearch={handleSearchChange} />
                            </div>
                            <div style={{ minWidth: '200px' }}>
                                <select
                                    className="form-select"
                                    value={backendFilters.sort}
                                    // El select de orden SÍ actualiza los filtros del backend
                                    onChange={(e) => handleBackendFilterChange({ sort: e.target.value })}
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
                            // Mostramos 'displayedProducts' (la lista filtrada en el frontend)
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 d-flex align-items-start" style={{ minHeight: '300px' }}>
                                {displayedProducts.length > 0 ? (
                                    displayedProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))
                                ) : (
                                    <p className="text-center text-muted col-12 mt-5">
                                        No se encontraron productos que coincidan con tu búsqueda o filtros.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductsPage;