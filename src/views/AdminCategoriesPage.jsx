import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

// 1. Importamos los Thunks
import { 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    reactivateCategory 
} from '../redux/slices/CategorySlice';

const AdminCategoriesPage = () => {
    const dispatch = useDispatch();

    // 2. Leemos el estado global
    // Asumimos que tu slice tiene: list, loading, error
    const { list: categories, loading, error } = useSelector((state) => state.categories);
    
    // Estados locales para UI (Formularios y Modales)
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); 
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // 3. Carga inicial
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Filtros visuales sobre la lista de Redux
    const activeCategories = categories.filter(cat => cat.active);
    const inactiveCategories = categories.filter(cat => !cat.active);

    // --- MANEJO DEL FORMULARIO (Crear / Editar) ---
    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        
        if (editingCategory) {
            // ACTUALIZAR
            dispatch(updateCategory({ id: editingCategory.id, description: newCategoryName }))
                .unwrap()
                .then(() => {
                    toast.success("Categoría actualizada con éxito.");
                    setNewCategoryName('');
                    setEditingCategory(null);
                    // No hace falta recargar si el reducer actualiza la lista, 
                    // pero por seguridad podemos llamar a fetchCategories()
                })
                .catch((err) => toast.error("Error al actualizar."));
        } else {
            // CREAR
            dispatch(createCategory({ description: newCategoryName }))
                .unwrap()
                .then(() => {
                    toast.success("Categoría creada con éxito.");
                    setNewCategoryName('');
                    dispatch(fetchCategories()); // Recargar lista para ver la nueva
                })
                .catch((err) => toast.error("Error al crear."));
        }
    };

    // --- MANEJO DEL MODAL DE CONFIRMACIÓN ---
    const requestDelete = (categoryId) => {
        setPendingAction({ type: 'delete', data: categoryId });
        setShowConfirmModal(true);
    };

    const requestReactivate = (category) => {
        setPendingAction({ type: 'reactivate', data: category });
        setShowConfirmModal(true);
    };

    const executeConfirmedAction = () => {
        if (!pendingAction) return;
        
        const { type, data } = pendingAction;
        setShowConfirmModal(false);

        if (type === 'delete') {
            // ELIMINAR
            dispatch(deleteCategory(data))
                .unwrap()
                .then(() => {
                    toast.success("Categoría eliminada con éxito.");
                    // El slice debería actualizar el estado 'active' a false localmente
                    // o podemos recargar: dispatch(fetchCategories());
                })
                .catch((err) => toast.error(err || "Error al eliminar la categoría."));

        } else if (type === 'reactivate') {
            // REACTIVAR
            // Usamos el thunk específico o updateCategory si el backend lo maneja igual
            dispatch(reactivateCategory(data))
                .unwrap()
                .then(() => {
                    toast.success("Categoría reactivada con éxito.");
                    dispatch(fetchCategories());
                })
                .catch((err) => toast.error(err || "Error al reactivar."));
        }
        
        setPendingAction(null);
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.description);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Gestión de Categorías</h2>

            {/* Formulario */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">
                        {editingCategory ? `Editando: ${editingCategory.description}` : 'Crear Nueva Categoría'}
                    </h5>
                    <form onSubmit={handleCreateOrUpdate}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nombre de la categoría"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required 
                            />
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {editingCategory ? 'Actualizar' : 'Crear'}
                            </button>
                            {editingCategory && (
                                <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Lista de Activas */}
            <h4 className="mt-4">Categorías Activas ({activeCategories.length})</h4>
            <div className="card shadow-sm">
                <ul className="list-group list-group-flush">
                    {loading && activeCategories.length === 0 ? (
                        <li className="list-group-item text-center py-3">Cargando...</li>
                    ) : (
                        activeCategories.map(cat => (
                            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span className="fw-medium">{cat.description}</span>
                                <div>
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(cat)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => requestDelete(cat.id)}>
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                    {!loading && activeCategories.length === 0 && !error && (
                        <li className="list-group-item text-center py-3 text-muted">No hay categorías activas.</li>
                    )}
                </ul>
            </div>

            {/* Lista de Eliminadas */}
            <div className="accordion mt-5" id="inactiveCategoriesAccordion">
                <div className="accordion-item border-0 shadow-sm">
                    <h2 className="accordion-header" id="headingInactive">
                    <button className="accordion-button collapsed bg-light text-secondary fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInactive">
                        Categorías inactivas ({inactiveCategories.length})
                    </button>
                    </h2>
                    <div id="collapseInactive" className="accordion-collapse collapse" data-bs-parent="#inactiveCategoriesAccordion">
                        <div className="accordion-body p-0">
                             {loading && inactiveCategories.length === 0 ? <p className="p-3 text-center">Cargando...</p> : (
                                inactiveCategories.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {inactiveCategories.map(cat => (
                                            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center bg-light">
                                                <span className="text-muted text-decoration-line-through">{cat.description}</span>
                                                <button className="btn btn-success btn-sm" onClick={() => requestReactivate(cat)} disabled={loading}>
                                                    Restaurar
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-3 text-center text-muted mb-0">No hay categorías inactivas.</p>
                                )
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Acción</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pendingAction?.type === 'delete' && (
                        <p>¿Estás seguro de que quieres eliminar esta categoría? Los productos asociados podrían quedar ocultos.</p>
                    )}
                    {pendingAction?.type === 'reactivate' && (
                        <p>¿Seguro que quieres reactivar la categoría "<strong>{pendingAction.data.description}</strong>"?</p>
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

export default AdminCategoriesPage;