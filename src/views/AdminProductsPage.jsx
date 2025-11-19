import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ProductForm from '../components/ProductForm.jsx';
import { toast } from 'react-toastify';
// 1. Importamos componentes de Bootstrap para el modal de confirmación
import { Modal, Button } from 'react-bootstrap';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para el formulario de productos
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // 2. Estado para el MODAL DE CONFIRMACIÓN (Reemplazo de window.confirm)
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 
    // pendingAction guardará: { type: 'delete' | 'reactivate', data: producto_a_modificar }

    const { authToken } = useAuth();

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
            toast.error(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const activeProducts = products.filter(p => p.active);
    const inactiveProducts = products.filter(p => !p.active);
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.description]));

    // Guardar (Crear/Editar) - Esto no requiere confirmación, usa el formulario
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
                return response.json().then(errData => {
                    throw new Error(errData.message || `Error al ${isUpdating ? 'actualizar' : 'crear'} el producto.`);
                });
            }
            return response.json();
        })
        .then(() => {
            toast.success(`Producto ${isUpdating ? 'actualizado' : 'creado'} con éxito.`);
            setShowFormModal(false);
            fetchData();
        })
        .catch(err => {
            setError(err.message);
            toast.error(err.message);
        });
    };
    
    // 3. Nuevas funciones para abrir el modal en lugar de window.confirm
    const requestDelete = (product) => {
        setPendingAction({ type: 'delete', data: product });
        setShowConfirmModal(true);
    };

    const requestReactivate = (product) => {
        setPendingAction({ type: 'reactivate', data: product });
        setShowConfirmModal(true);
    };

    // 4. Función que ejecuta la acción real (se llama desde el botón "Confirmar" del modal)
    const executeConfirmedAction = () => {
        if (!pendingAction) return;

        const { type, data } = pendingAction;
        setShowConfirmModal(false); // Cerramos el modal inmediatamente

        if (type === 'delete') {
            // Lógica de eliminar
            fetch(`http://localhost:4002/products/${data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            .then(response => {
                if (!response.ok) throw new Error("Error al eliminar el producto.");
            })
            .then(() => {
                toast.success("Producto eliminado con éxito.");
                fetchData();
            })
            .catch(err => {
                setError(err.message);
                toast.error("No se pudo eliminar el producto");
            });

        } else if (type === 'reactivate') {
            // Lógica de reactivar
            const productData = {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                price: data.price,
                stock: data.stock,
                discount: data.discount,
                active: true
            };
            const formData = new FormData();
            formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
            
            fetch(`http://localhost:4002/products/${data.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            })
            .then (response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error((`Error al reactivar.`));
                    });
                }
                return response.json();
            })
            .then((responseData) => {
                toast.success(responseData.message || "Producto reactivado con éxito.");
                fetchData(); 
            })
            .catch(err => {
                setError(err.message);
                toast.error("Error al reactivar el producto");
            })
            .finally(() => {
                setLoading(false); 
            });
        }
        
        setPendingAction(null); // Limpiamos la acción
    };

    const openFormModal = (product = null) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Productos</h2>
                <button className="btn btn-primary" onClick={() => openFormModal()}>Crear Nuevo Producto</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tabla de Productos Activos */}
            <h4 className="mt-4">Productos Activos ({activeProducts.length})</h4>
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
                                <td>{categoryMap.get(p.categoryId) || 'N/A'}</td>
                                <td>${p.price.toFixed(2)}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openFormModal(p)}>Editar</button>
                                    {/* Pasamos el objeto completo 'p' a requestDelete */}
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => requestDelete(p)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                    {!loading && activeProducts.length === 0 && !error && (
                        <tr><td colSpan="6" className="text-center">No hay productos activos.</td></tr>
                    )}
                </tbody>
            </table>
            
            {/* Acordeon para Productos Inactivos */}
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
                                    <table className="table table-sm table-hover"> 
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
                                                        {/* Usamos requestReactivate */}
                                                        <button className="btn btn-outline-success btn-sm" onClick={() => requestReactivate(p)} disabled={loading}>
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
            
            {/* Modal del Formulario (Crear/Editar) */}
            {showFormModal && <ProductForm product={editingProduct} onSave={handleSave} onHide={() => setShowFormModal(false)} />}
            
            {/* 5. Modal de Confirmación (Generado con React Bootstrap) */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Acción</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pendingAction && pendingAction.type === 'delete' && (
                        <p>¿Estás seguro de que quieres eliminar el producto <strong>{pendingAction.data.name}</strong>?</p>
                    )}
                    {pendingAction && pendingAction.type === 'reactivate' && (
                        <p>¿Seguro que quieres reactivar el producto <strong>{pendingAction.data.name}</strong>?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant={pendingAction?.type === 'delete' ? 'danger' : 'success'} 
                        onClick={executeConfirmedAction}
                    >
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default AdminProductsPage;