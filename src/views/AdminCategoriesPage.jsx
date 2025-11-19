import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el formulario
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); 

    // Estados para el Modal de Confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const { authToken } = useAuth();

    // Helper para peticiones seguras
    const safeFetch = async (url, options) => {
        const response = await fetch(url, options);
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(data.message || data.error || `Error en la petición (${response.status})`);
        }
        return data;
    };

    const fetchCategories = () => {
        setLoading(true);
        safeFetch('http://localhost:4002/categories/all')
            .then(data => {
                setCategories(data.content || []);
            })
            .catch(err => {
                console.error("Error al cargar categorías:", err);
                toast.error(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const activeCategories = categories.filter(cat => cat.active);
    const inactiveCategories = categories.filter(cat => !cat.active);

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        
        const isUpdating = editingCategory !== null;
        const url = isUpdating 
            ? `http://localhost:4002/categories/${editingCategory.id}` 
            : 'http://localhost:4002/categories';
        
        const method = isUpdating ? 'PUT' : 'POST';
        
        safeFetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ description: newCategoryName })
        })
        .then(() => {
            toast.success(`Categoría ${isUpdating ? 'actualizada' : 'creada'} con éxito.`);
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        })
        .catch(err => {
            console.error(err);
            toast.error(err.message);
        });
    };

    // Funciones para abrir el modal de confirmación
    const requestDelete = (categoryId) => {
        setPendingAction({ type: 'delete', data: categoryId });
        setShowConfirmModal(true);
    };

    const requestReactivate = (category) => {
        setPendingAction({ type: 'reactivate', data: category });
        setShowConfirmModal(true);
    };

    // Ejecutar la acción confirmada
    const executeConfirmedAction = () => {
        if (!pendingAction) return;
        const { type, data } = pendingAction;
        setShowConfirmModal(false);

        if (type === 'delete') {
            fetch(`http://localhost:4002/categories/${data}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            .then(async response => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || "Error al eliminar la categoría.");
                }
            })
            .then(() => {
                toast.success("Categoría eliminada con éxito.");
                fetchCategories(); 
            })
            .catch(err => {
                toast.error(err.message);
            });
        } else if (type === 'reactivate') {
             safeFetch(`http://localhost:4002/categories/${data.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ description: data.description}) 
            })
            .then(() => {
                toast.success("Categoría reactivada con éxito.");
                fetchCategories();
            })
            .catch(err => {
                console.error(err);
                toast.error(err.message);
            }); 
        }
        setPendingAction(null);
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.description);
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Gestión de Categorías</h2>

            {/* Formulario */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">{editingCategory ? 'Editando Categoría' : 'Crear Nueva Categoría'}</h5>
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
                            <button className="btn btn-primary" type="submit">
                                {editingCategory ? 'Actualizar' : 'Crear'}
                            </button>
                            {editingCategory && (
                                <button className="btn btn-secondary" type="button" onClick={() => { setEditingCategory(null); setNewCategoryName(''); }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Tabla de categorias activas */}
            <h4 className="mt-4">Categorías Activas ({activeCategories.length})</h4>
            <div className="card">
                <div className="card-header">
                    Categorías Existentes
                </div>
                <ul className="list-group list-group-flush">
                    {loading ? <li className="list-group-item">Cargando...</li> : (
                        activeCategories.map(cat => (
                            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {cat.description}
                                <div>
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(cat)}>Editar</button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => requestDelete(cat.id)}>Eliminar</button>
                                </div>
                            </li>
                        ))
                    )}
                    { !loading && activeCategories.length === 0 && (
                        <li className="list-group-item text-center">No hay categorías activas.</li>
                    )}
                </ul>
            </div>

            {/* Desplegable para Categorías Eliminadas */}
            <div className="accordion mt-5" id="inactiveCategoriesAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingInactive">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInactive" aria-expanded="false" aria-controls="collapseInactive">
                        Categorías Eliminadas ({inactiveCategories.length})
                    </button>
                    </h2>
                    <div id="collapseInactive" className="accordion-collapse collapse" aria-labelledby="headingInactive" data-bs-parent="#inactiveCategoriesAccordion">
                        <div className="accordion-body">
                             {loading ? <p>Cargando...</p> : (
                                inactiveCategories.length > 0 ? (
                                    <ul className="list-group">
                                        {inactiveCategories.map(cat => (
                                            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {cat.description}
                                                <button className="btn btn-outline-success btn-sm" onClick={() => requestReactivate(cat)} disabled={loading}>
                                                    Reactivar
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No hay categorías eliminadas.</p>
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
                    {pendingAction && pendingAction.type === 'delete' && (
                        <p>¿Estás seguro de que quieres eliminar esta categoría?</p>
                    )}
                    {pendingAction && pendingAction.type === 'reactivate' && (
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