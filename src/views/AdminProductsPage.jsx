import React, { useState, useEffect } from 'react';
// 1. Imports de Redux
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../redux/slices/ProductSlice';

import ProductForm from '../components/ProductForm.jsx';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const AdminProductsPage = () => {
    const dispatch = useDispatch();

    // 2. Estado Global (Reemplaza los useState locales de products/loading/error)
    const { list: products, loading, error } = useSelector((state) => state.products);

    // Estado local para categorías (Las mantenemos locales por ahora o podrías hacer un categorySlice)
    const [categories, setCategories] = useState([]);

    // Estados para Modales (UI local)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 

    // 3. Carga de Datos
    useEffect(() => {
        // Cargar productos usando Redux
        dispatch(fetchProducts());

        // Cargar categorías (Fetch simple local para mapear nombres)
        fetch('http://localhost:4002/categories')
            .then(res => res.json())
            .then(data => setCategories(data.content || []))
            .catch(err => console.error("Error cargando categorías", err));
    }, [dispatch]);

    // Filtros visuales sobre la lista de Redux
    const activeProducts = products.filter(p => p.active);
    const inactiveProducts = products.filter(p => !p.active);
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.description]));

    // --- MANEJO DEL FORMULARIO (CREAR / EDITAR) ---
    const handleSave = (formData, productId) => {
        // Redux se encarga de limpiar el error global automáticamente al iniciar el thunk
        
        if (productId) {
            // Actualizar
            dispatch(updateProduct({ id: productId, formData }))
                .unwrap() // Permite manejar éxito/error como promesas
                .then(() => {
                    toast.success("Producto actualizado con éxito.");
                    setShowFormModal(false);
                    dispatch(fetchProducts()); // Recargar lista
                })
                .catch((err) => toast.error(err || "Error al actualizar."));
        } else {
            // Crear
            dispatch(createProduct(formData))
                .unwrap()
                .then(() => {
                    toast.success("Producto creado con éxito.");
                    setShowFormModal(false);
                    dispatch(fetchProducts());
                })
                .catch((err) => toast.error(err || "Error al crear."));
        }
    };
    
    // --- MANEJO DEL MODAL DE CONFIRMACIÓN ---
    
    const requestDelete = (product) => {
        setPendingAction({ type: 'delete', data: product });
        setShowConfirmModal(true);
    };

    const requestReactivate = (product) => {
        setPendingAction({ type: 'reactivate', data: product });
        setShowConfirmModal(true);
    };

    // Ejecución de la acción confirmada usando Redux
    const executeConfirmedAction = () => {
        if (!pendingAction) return;

        const { type, data } = pendingAction;
        setShowConfirmModal(false); // Cerramos modal

        if (type === 'delete') {
            dispatch(deleteProduct(data.id))
                .unwrap()
                .then(() => {
                    toast.success("Producto eliminado con éxito.");
                    // No hace falta recargar fetchProducts() aquí si el reducer actualiza la lista localmente,
                    // pero si quieres estar seguro, puedes descomentar:
                    // dispatch(fetchProducts());
                })
                .catch((err) => toast.error(err || "No se pudo eliminar el producto"));

        } else if (type === 'reactivate') {
            // Preparamos el FormData igual que antes
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
            
            // Reutilizamos el thunk de update
            dispatch(updateProduct({ id: data.id, formData }))
                .unwrap()
                .then(() => {
                    toast.success("Producto reactivado con éxito.");
                    dispatch(fetchProducts()); // Recargamos para ver el cambio de lista
                })
                .catch((err) => toast.error(err || "Error al reactivar el producto"));
        }
        
        setPendingAction(null);
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

            {/* Error Global de Redux */}
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
            
            {/* Modal de Confirmación (Bootstrap) */}
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