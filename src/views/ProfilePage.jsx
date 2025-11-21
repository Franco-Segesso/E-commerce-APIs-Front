import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import OrderDetailModal from '../components/OrderDetailModal.jsx';
import './ProfilePage.css';

// 1. Importamos Thunks y Selectores del UserSlice
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserOrders,
  selectUserProfile,
  selectUserOrders,
  selectUserLoading,
  resetOperationStatus
} from '../redux/slices/UserSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();

  // 2. Usamos los selectores
  const profile = useSelector(selectUserProfile);
  const orders = useSelector(selectUserOrders);
  const loading = useSelector(selectUserLoading);
  // Podemos leer el estado de operación directamente del slice si necesitamos feedback específico
  const { operationStatus, error } = useSelector((state) => state.user);

  // Estado local para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 3. Carga Inicial
  useEffect(() => {
    if (!profile) dispatch(fetchUserProfile());
    // Si no hay órdenes cargadas, las pedimos
    if (!orders || orders.length === 0) dispatch(fetchUserOrders());
  }, [dispatch, profile, orders]);

  // Rellenar formulario al tener datos
  useEffect(() => {
    if (profile) {
      setEditFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
    }
  }, [profile]);

  // Feedback de actualización
  useEffect(() => {
    if (operationStatus === 'success' && isEditing) {
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
      dispatch(resetOperationStatus());
    }
    if (operationStatus === 'error' && error) {
      toast.error(error);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, error, isEditing, dispatch]);

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(editFormData));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <div className="profile-page-wrapper py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <h2 className="mb-4 fw-bold text-dark">Mi Perfil</h2>

        <div className="row g-4">
          {/* TARJETA DATOS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title fw-bold mb-0">Mis Datos</h4>
                  {!isEditing && (
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setIsEditing(true)}>
                      Editar
                    </button>
                  )}
                </div>

                {loading && !profile ? (
                  <p>Cargando datos...</p>
                ) : isEditing ? (
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input className="form-control" name="firstName" value={editFormData.firstName} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Apellido</label>
                      <input className="form-control" name="lastName" value={editFormData.lastName} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} required />
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-success">Guardar</button>
                      <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="mb-1 text-muted small">Nombre Completo</p>
                    <p className="fw-medium fs-5">{profile?.firstName} {profile?.lastName}</p>
                    <hr />
                    <p className="mb-1 text-muted small">Email</p>
                    <p className="fw-medium">{profile?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TARJETA HISTORIAL */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h4 className="card-title fw-bold mb-4">Historial de Pedidos</h4>
                
                {loading && (!orders || orders.length === 0) ? (
                  <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
                ) : orders && orders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th># Orden</th>
                          <th>Fecha</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="fw-bold">#{order.id}</td>
                            <td>{order.date}</td>
                            <td>${order.totalPrice.toFixed(2)}</td>
                            <td className="text-end">
                              <button className="btn btn-link btn-sm text-decoration-none" onClick={() => handleViewDetails(order)}>
                                Ver Detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light rounded">
                    <p className="text-muted mb-0">Aún no has realizado pedidos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <OrderDetailModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
    </div>
  );
};

export default ProfilePage;