import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/ProductSlice';

import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import './ProductPage.css'; 

const ProductsPage = () => {
    //Estado Global
    const dispatch = useDispatch();
    const { list: products, loading, error } = useSelector((state) => state.products);

    //Estado Local para filtros
    const [backendFilters, setBackendFilters] = useState({
        category: null,
        price_min: null,
        price_max: null,
        sort: 'asc',
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Cargar productos
    useEffect(() => {
        // Si la lista está vacía, pedimos los productos, si ya tiene productos mostramos lo que hay en memoria.
        if (products.length === 0) {
            dispatch(fetchProducts(backendFilters));
        }

       
    }, [dispatch, products.length]); 

    // Este efecto secundario maneja EXCLUSIVAMENTE los cambios de filtros POSTERIORES
    
    const handleBackendFilterChange = (newFilters) => {
        setSearchQuery('');
        const updatedFilters = { ...backendFilters, ...newFilters };
        setBackendFilters(updatedFilters);
        
        // Aquí forzamos el fetch porque el usuario pidió explícitamente cambiar los datos
        dispatch(fetchProducts(updatedFilters));
    };

    // Lógica de filtrado local por nombre
    const displayedProducts = products.filter(product => {
        // Solo mostrar activos
        if (!product.active || !product.stock > 0) return false;

        // Filtro de búsqueda
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleSearchChange = (query) => setSearchQuery(query);

    return (
        
        <>
            {/* INICIO DE LA SECCIÓN DE ONDA */}
            <section className="wave-wrap">
                
                {/*Onda superior */}
                <div className="wave-top wave-top-about">
                    
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> 
                        <path
                            d="M0,96 C240,128 480,32 720,64 C960,96 1200,96 1440,64 L1440,150 L0,150 Z" 
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>

                {/*Cuerpo Verde*/}
                <div className="wave-body about-wave-body text-center" style={{ backgroundColor: '#dcf8eaff' }}>
                    
                    <div style={{ transform: 'translateY(-2rem)' }}> 
                        <h1 className="display-4 fw-bold text-dark mb-3">Explorá nuestros productos</h1>
                        <p className="lead text-dark-emphasis mx-auto" style={{ maxWidth: '800px' }}>
                            Encontrá la opción perfecta para tu estilo de vida
                        </p>
                        
                    </div>
                </div>

                {/*Onda inferior */}
                <div className="wave-bottom wave-bottom-about">
                    
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> 
                        <path
                            d="M0,0 L0,0 C240,64 480,150 720,118 C960,86 1200,86 1440,118 L1440,150 L0,150 Z" 
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>
            </section>
            {/* FIN DE LA SECCIÓN DE ONDA */}

            {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
            <div className="container-fluid product-page-container px-lg-5">
                <div className="row gx-lg-5">
                    <div className="col-lg-3">
                        <div className="filter-sidebar">
                            <FilterSidebar onFilterChange={handleBackendFilterChange} />
                        </div>
                    </div>

                    {/* Columna de Productos */}
                    <div className="col-lg-9">
                        {/* Barra de Búsqueda y Ordenamiento */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 search-sort-bar">
                            <div className="flex-grow-1">

                                <SearchBar onSearch={handleSearchChange} />
                            </div>
                            <div style={{ minWidth: '200px' }}>
                                <select
                                    className="form-select"
                                    value={backendFilters.sort}
                                    // El select de orden actualiza los filtros del backend
                                    onChange={(e) => handleBackendFilterChange({ sort: e.target.value })}
                                >
                                    <option value="asc">Ordenar por Precio (Menor)</option>
                                    <option value="desc">Ordenar por Precio (Mayor)</option>
                                </select>
                            </div>
                        </div>

                        {/* ESTADOS DE CARGA desde Redux */}
                        {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        
                        {!loading && !error && (
                             <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 d-flex align-items-start">
                                {displayedProducts.length > 0 ? (
                                    displayedProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))
                                ) : (
                                    <p className="text-center text-muted col-12 mt-5">No hay productos.</p>
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