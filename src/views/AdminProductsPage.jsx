import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ProductForm from '../components/ProductForm.jsx';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { authToken } = useAuth();

    // Función para obtener los datos iniciales (productos y categorías)
    const fetchData = () => {
        setLoading(true);
        setError('');
        Promise.all([
            fetch('http://localhost:4002/products/all'),
            fetch('http://localhost:4002/categories')
        ])
        .then(([productsRes, categoriesRes]) => {
            if (!productsRes.ok || !categoriesRes.ok) {
                throw new Error('No se pudieron cargar los datos del servidor.');
            }
            return Promise.all([productsRes.json(), categoriesRes.json()]);
        })
        .then(([productsData, categoriesData]) => {
            setProducts(productsData.content || []);
            setCategories(categoriesData.content || []);
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    // Llama a fetchData solo una vez cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);


    // Separamos los productos en activos e inactivos
    const activeProducts = products.filter(p => p.active);
    const inactiveProducts = products.filter(p => !p.active);

    // Se crea un "diccionario" para buscar nombres de categoría por ID
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.description]));

    // Función para guardar (crear o actualizar) un producto
    const handleSave = (formData, productId) => {
        setError('');
        const isUpdating = productId !== null;
        const url = isUpdating ? `http://localhost:4002/products/${productId}` : 'http://localhost:4002/products';
        const method = isUpdating ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                // Si hay un error, intentamos leer el mensaje del backend
                return response.json().then(errData => {
                    throw new Error(errData.message || `Error al ${isUpdating ? 'actualizar' : 'crear'} el producto.`);
                });
            }
            return response.json();
        })
        .then(() => {
            alert(`Producto ${isUpdating ? 'actualizado' : 'creado'} con éxito.`);
            setShowModal(false);
            fetchData(); // Recargamos los datos para ver los cambios
        })
        .catch(err => {
            setError(err.message);
        });
    };
    
    // Función para eliminar un producto
    const handleDelete = (productId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
        setError('');

        fetch(`http://localhost:4002/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al eliminar el producto.");
            }
            // DELETE no suele devolver contenido, así que no es necesario un .json()
        })
        .then(() => {
            alert("Producto eliminado con éxito.");
            fetchData(); // Recargamos los datos
        })
        .catch(err => {
            setError(err.message);
        });
    };

    const handleReactivate = (product) => {
        if (!window.confirm(`¿Seguro que quieres reactivar el producto "${product.name}"?`)) return;
        setError('');

        // Preparamos los datos para la actualización. 
        // NO necesitamos enviar imagen si solo queremos reactivar.
        // Creamos un objeto simple con los datos necesarios para el backend.
        const productData = {
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            price: product.price,
            stock: product.stock,
            discount: product.discount,
            active: true
        };
        const formData = new FormData();
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
        
        fetch(`http://localhost:4002/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
        .then (response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error((errData.message || errData.error || errData.reason || `Error al reactivar el producto.`));
                });
            }
            return response.json();
        })
        .then((responseData) => {
            alert(responseData.message || "Producto reactivado con éxito.");
            fetchData(); // Recargamos la lista de productos
        })
        .catch(err => {
            setError("Error al reactivar el producto: " + err.message);
        })
        .finally(() => {
            setLoading(false); // Aseguramos que el estado de carga se actualice
        });
    };        


    // Función para abrir el modal (para crear o editar)
    const openModal = (product = null) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Productos</h2>
                <button className="btn btn-primary" onClick={() => openModal()}>Crear Nuevo Producto</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}


            {/* Tabla de Productos Activos */}
            <h4 classname="mt-4">Productos Activos ({activeProducts.length})</h4>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
                    ) : (
                        activeProducts.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                {/* Usamos el mapa para encontrar el nombre de la categoría por su ID */}
                                <td>{categoryMap.get(p.categoryId) || 'N/A'}</td>
                                <td>${p.price.toFixed(2)}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openModal(p)}>Editar</button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                    { !loading && activeProducts.length === 0 && !error && (
                        <tr><td colSpan="6" className="text-center">No hay productos activos.</td></tr>
                    )}
                </tbody>
            </table>
            
            {/* Acordeón para Productos Inactivos */}
            <div className="accordion mt-5" id="inactiveProductsAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        Productos Eliminados ({inactiveProducts.length})
                    </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#inactiveProductsAccordion">
                        <div className="accordion-body">
                             {loading ? <p>Cargando...</p> : (
                                inactiveProducts.length > 0 ? (
                                    <table className="table table-sm table-hover"> {/* Usamos table-sm para que sea más compacta */}
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Categoría</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inactiveProducts.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.id}</td>
                                                    <td>{p.name}</td>
                                                    <td>{categoryMap.get(p.categoryId) || 'N/A'}</td>
                                                    <td>
                                                        {/* Botón que llama a handleReactivate */}
                                                        <button className="btn btn-outline-success btn-sm" onClick={() => handleReactivate(p)} disabled={loading}>
                                                            Reactivar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No hay productos eliminados.</p>
                                )
                             )}
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <ProductForm product={editingProduct} onSave={handleSave} onHide={() => setShowModal(false)} />}
        </div>
    );
};

export default AdminProductsPage;