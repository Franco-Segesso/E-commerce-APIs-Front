import React, { useState, useEffect } from 'react';
// 1. REDUX
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../redux/slices/ProductSlice';
import { fetchCategories } from '../redux/slices/CategorySlice';

import ProductForm from '../components/ProductForm.jsx';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const AdminProductsPage = () => {
    const dispatch = useDispatch();

    // 2. ESTADO GLOBAL
    // Leemos productos y sus estados de carga desde productSlice
    const { list: products, loading: loadingProducts, error: errorProducts } = useSelector((state) => state.products);
    // Leemos categorías desde categorySlice (para el dropdown y para mostrar el nombre en la tabla)
    const { list: categories } = useSelector((state) => state.categories);

    // Estados locales (solo para la Interfaz de Usuario)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 

    // 3. CARGA INICIAL DE DATOS
    useEffect(() => {
        // Pedimos productos y categorías al montar el componente
        dispatch(fetchProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

    // Filtros visuales sobre la lista que ya tenemos en memoria
    const activeProducts = products.filter(p => p.active);
    const inactiveProducts = products.filter(p => !p.active);
    
    // Mapa auxiliar para mostrar el nombre de la categoría rápido
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.description]));

    // --- MANEJO DEL FORMULARIO (CREAR / EDITAR) ---
    const handleSave = (formData, productId) => {
        // Nota: Ya no pasamos 'token'. El Thunk lo saca del store (authSlice).
        
        if (productId) {
            // ACTUALIZAR
            dispatch(updateProduct({ id: productId, formData }))
                .unwrap()
                .then(() => {
                    toast.success("Producto actualizado con éxito.");
                    setShowFormModal(false);
                    //dispatch(fetchProducts()); // Recargamos la lista para ver los cambios frescos
                })
                .catch((err) => toast.error(err || "Error al actualizar."));
        } else {
            // CREAR
            dispatch(createProduct(formData))
                .unwrap()
                .then(() => {
                    toast.success("Producto creado con éxito.");
                    setShowFormModal(false);
                    dispatch(fetchProducts()); // Recargamos la lista
                })
                .catch((err) => toast.error(err || "Error al crear."));
        }
    };
    
    // --- MANEJO DE CONFIRMACIONES (BORRAR / REACTIVAR) ---
    
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
        setShowConfirmModal(false); // Cerramos el modal inmediatamente

        if (type === 'delete') {
            // ELIMINAR
            dispatch(deleteProduct(data.id))
                .unwrap()
                .then(() => {
                    toast.success("Producto eliminado correctamente.");
                    //dispatch(fetchProducts()); // Recargamos para que desaparezca de la lista de activos
                })
                .catch((err) => toast.error(err || "No se pudo eliminar."));

        } else if (type === 'reactivate') {
            // REACTIVAR
            // Preparamos los datos para reactivar (active: true)
            const productData = {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                price: data.price,
                stock: data.stock,
                discount: data.discount,
                active: true
            };
            
            // Como tu backend espera multipart, enviamos FormData
            const formData = new FormData();
            formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
            
            // Reutilizamos el thunk de updateProduct
            dispatch(updateProduct({ id: data.id, formData }))
                .unwrap()
                .then(() => {
                    toast.success("Producto reactivado.");
                    dispatch(fetchProducts()); // Recargamos para que aparezca en activos
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

            {/* Mostramos errores globales si existen */}
            {errorProducts && <div className="alert alert-danger">{errorProducts}</div>}

            {/* TABLA DE PRODUCTOS ACTIVOS */}
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
                            <tr><td colSpan="6" className="text-center py-4">Cargando productos...</td></tr>
                        ) : (
                            activeProducts.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td className="fw-medium">{p.name}</td>
                                    {/* Usamos el mapa para mostrar el nombre de la categoría */}
                                    <td><span className="badge bg-light text-dark border">{categoryMap.get(p.categoryId) || 'N/A'}</span></td>
                                    <td>${p.price.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${p.stock < 5 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openFormModal(p)}>Editar</button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => requestDelete(p)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loadingProducts && activeProducts.length === 0 && !errorProducts && (
                            <tr><td colSpan="6" className="text-center text-muted py-3">No hay productos activos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* ACORDEÓN DE ELIMINADOS */}
            <div className="accordion mt-5" id="inactiveProductsAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button collapsed bg-light text-secondary fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                        🗑️ Papelera de Reciclaje ({inactiveProducts.length})
                    </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#inactiveProductsAccordion">
                        <div className="accordion-body p-0">
                             {loadingProducts && inactiveProducts.length === 0 ? <p className="text-center py-3">Cargando...</p> : (
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
                                                    <td className="text-muted ps-3">#{p.id}</td>
                                                    <td className="text-decoration-line-through">{p.name}</td>
                                                    <td>{categoryMap.get(p.categoryId) || 'N/A'}</td>
                                                    <td>
                                                        <button className="btn btn-success btn-sm" onClick={() => requestReactivate(p)}>
                                                            Restaurar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-muted mb-0 py-3">La papelera está vacía.</p>
                                )
                             )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* MODAL DE FORMULARIO */}
            {showFormModal && (
                <ProductForm 
                    product={editingProduct} 
                    onSave={handleSave} 
                    onHide={() => setShowFormModal(false)} 
                />
            )}
            
            {/* MODAL DE CONFIRMACIÓN */}
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