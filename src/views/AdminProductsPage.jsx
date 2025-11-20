import React, { useState, useEffect } from 'react';
// 1. REDUX
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../redux/slices/ProductSlice';
// Importamos también las categorías para el dropdown
import { fetchCategories } from '../redux/slices/CategorySlice';

import ProductForm from '../components/ProductForm.jsx';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const AdminProductsPage = () => {
    const dispatch = useDispatch();

    // 2. ESTADO GLOBAL (Productos y Categorías)
    const { list: products, loading: loadingProducts, error: errorProducts } = useSelector((state) => state.products);
    const { list: categories } = useSelector((state) => state.categories);

    // Estados locales para la UI (Modales)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 

    // 3. CARGA INICIAL
    useEffect(() => {
        // Cargamos productos (el thunk ya maneja traer todos o activos según la lógica del slice)
        dispatch(fetchProducts());
        // Cargamos categorías para poder mostrar el nombre en la tabla
        dispatch(fetchCategories());
    }, [dispatch]);

    // Filtros visuales
    const activeProducts = products.filter(p => p.active);
    const inactiveProducts = products.filter(p => !p.active);
    
    // Mapa para mostrar "Nombre Categoría" en vez de "ID"
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.description]));

    // --- MANEJO DEL FORMULARIO (CREAR / EDITAR) ---
    const handleSave = (formData, productId) => {
        // Nota: No pasamos token, el Thunk lo saca del state.auth
        if (productId) {
            // ACTUALIZAR
            dispatch(updateProduct({ id: productId, formData }))
                .unwrap()
                .then(() => {
                    toast.success("Producto actualizado con éxito.");
                    setShowFormModal(false);
                    dispatch(fetchProducts()); // Recargar lista
                })
                .catch((err) => toast.error(err || "Error al actualizar."));
        } else {
            // CREAR
            dispatch(createProduct(formData)) // formData solo (el thunk lo espera así)
                .unwrap()
                .then(() => {
                    toast.success("Producto creado con éxito.");
                    setShowFormModal(false);
                    dispatch(fetchProducts());
                })
                .catch((err) => toast.error(err || "Error al crear."));
        }
    };
    
    // --- MANEJO DE ACCIONES (BORRAR / REACTIVAR) ---
    
    const requestDelete = (product) => {
        setPendingAction({ type: 'delete', data: product });
        setShowConfirmModal(true);
    };

    const requestReactivate = (product) => {
        setPendingAction({ type: 'reactivate', data: product });
        setShowConfirmModal(true);
    };

    const executeConfirmedAction = () => {
        if (!pendingAction) return;

        const { type, data } = pendingAction;
        setShowConfirmModal(false);

        if (type === 'delete') {
            dispatch(deleteProduct(data.id))
                .unwrap()
                .then(() => {
                    toast.success("Producto eliminado correctamente.");
                    // Si tu reducer hace update optimista, genial. Si no, recargamos:
                    // dispatch(fetchProducts());
                })
                .catch((err) => toast.error(err || "No se pudo eliminar."));

        } else if (type === 'reactivate') {
            // Preparamos el objeto igual que antes
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
            
            // Reutilizamos updateProduct
            dispatch(updateProduct({ id: data.id, formData }))
                .unwrap()
                .then(() => {
                    toast.success("Producto reactivado.");
                    dispatch(fetchProducts());
                })
                .catch((err) => toast.error(err || "Error al reactivar."));
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

            {errorProducts && <div className="alert alert-danger">{errorProducts}</div>}

            {/* TABLA ACTIVOS */}
            <h4 className="mt-4">Productos Activos ({activeProducts.length})</h4>
            <div className="table-responsive">
                <table className="table table-striped align-middle">
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
                        {loadingProducts ? (
                            <tr><td colSpan="6" className="text-center py-4">Cargando...</td></tr>
                        ) : (
                            activeProducts.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td className="fw-medium">{p.name}</td>
                                    <td><span className="badge bg-light text-dark border">{categoryMap.get(p.categoryId) || 'N/A'}</span></td>
                                    <td>${p.price.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${p.stock < 5 ? 'bg-warning text-dark' : 'bg-success'}`}>{p.stock}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openFormModal(p)}>Editar</button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => requestDelete(p)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loadingProducts && activeProducts.length === 0 && !errorProducts && (
                            <tr><td colSpan="6" className="text-center text-muted">No hay productos activos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* ACORDEÓN ELIMINADOS */}
            <div className="accordion mt-5" id="inactiveProductsAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button collapsed bg-light text-secondary fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                        Productos inactivos ({inactiveProducts.length})
                    </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#inactiveProductsAccordion">
                        <div className="accordion-body">
                             {loadingProducts ? <p className="text-center">Cargando...</p> : (
                                inactiveProducts.length > 0 ? (
                                    <table className="table table-sm table-hover mb-0"> 
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
                                                    <td className="text-muted">#{p.id}</td>
                                                    <td className="text-decoration-line-through">{p.name}</td>
                                                    <td>{categoryMap.get(p.categoryId) || 'N/A'}</td>
                                                    <td>
                                                        <button className="btn btn-outline-success btn-sm" onClick={() => requestReactivate(p)}>
                                                            Restaurar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-muted mb-0 py-3">No hay productos inactivos.</p>
                                )
                             )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* MODALES */}
            {showFormModal && (
                <ProductForm 
                    product={editingProduct} 
                    onSave={handleSave} 
                    onHide={() => setShowFormModal(false)} 
                />
            )}
            
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Acción</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pendingAction?.type === 'delete' && (
                        <p>¿Estás seguro de que quieres eliminar <strong>{pendingAction.data.name}</strong>?</p>
                    )}
                    {pendingAction?.type === 'reactivate' && (
                        <p>¿Seguro que quieres restaurar <strong>{pendingAction.data.name}</strong>?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
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