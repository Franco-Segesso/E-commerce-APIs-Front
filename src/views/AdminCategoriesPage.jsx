import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para el formulario
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); // Guardamos la categoría que estamos editando

    const { authToken } = useAuth();

    // Función para recargar las categorías desde el backend
    const fetchCategories = () => {
        setLoading(true);
        fetch('http://localhost:4002/categories/all')
            .then(response => response.json())
            .then(data => {
                setCategories(data.content || []);
            })
            .catch(err => {
                console.error("Error al cargar categorías:", err);
                setError('No se pudieron cargar las categorías.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Cargar las categorías al montar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    const activeCategories = categories.filter(cat => cat.active);
    const inactiveCategories = categories.filter(cat => !cat.active);

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        setError(''); // para limpiar errores anteriores
        
        const isUpdating = editingCategory !== null;
        const url = isUpdating 
            ? `http://localhost:4002/categories/${editingCategory.id}` 
            : 'http://localhost:4002/categories';
        
        const method = isUpdating ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ description: newCategoryName })
        })
        .then(response => {
            if (!response.ok) {
                // Si la respuesta no es exitosa, lanzamos un error para que lo capture el .catch
                throw new Error(`Error al ${isUpdating ? 'actualizar' : 'crear'} la categoría.`);
            }
            // No necesitamos el JSON de respuesta, solo saber que funcionó
            return response;
        })
        .then(() => {
            alert(`Categoría ${isUpdating ? 'actualizada' : 'creada'} con éxito.`);
            // Limpiar formulario y recargar la lista de categorías
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
        });
    };


    const handleDelete = (categoryId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
            return;
        }
        setError('');

        fetch(`http://localhost:4002/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al eliminar la categoría.");
            }
            return response;
        })
        .then(() => {
            alert("Categoría eliminada con éxito.");
            fetchCategories(); // Recargamos la lista
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
        });
    };


    const handleReactivate = (category) => {
        if (!window.confirm(`¿Seguro que quieres reactivar la categoría "${category.description}"?`)) return;
        setError('');
        setLoading(true);

        fetch(`http://localhost:4002/categories/${category.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ description: category.description}) // Enviamos la misma descripción para reactivar
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.message || "Error al reactivar la categoría.");
                });
            }
            return response.json();
        })
        .then(() => {
            alert("Categoría reactivada con éxito.");
            fetchCategories(); // Recargamos la lista
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        }); 

    }

    const startEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.description);
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Gestión de Categorías</h2>

            {/* Formulario para crear / editar categorías */}
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

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tabla de categorias activas*/}
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
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                                </div>
                            </li>
                        ))
                    )}
                    { !loading && activeCategories.length === 0 && !error && (
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
                                                <button className="btn btn-outline-success btn-sm" onClick={() => handleReactivate(cat)} disabled={loading}>
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
        </div>
    );
};

export default AdminCategoriesPage;