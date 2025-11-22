import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import OrderDetailModal from '../components/OrderDetailModal.jsx';
import './ProfilePage.css';

// Imágenes (Asegúrate de que existan en tu carpeta assets)
import profilePic from '../assets/profile-pic.png'; 
import emptyCartIcon from '../assets/carrito.png'; 

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
  
  const { operationStatus, error } = useSelector((state) => state.user);

  // Estado local
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 3. Carga Inicial
  useEffect(() => {
    if (!profile) {
        dispatch(fetchUserProfile());
    }
    // Evitamos el loop del admin: solo carga órdenes si no se han cargado previamente (o al montar)
    dispatch(fetchUserOrders());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

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
    <div className="profile-page-wrapper py-5">
      <div className="container">
        
        {/* Título Principal */}
        <div className="mb-5">
            <h2 className="profile-title">Mi Cuenta</h2>
            <p className="text-muted">Gestiona tus datos personales y revisa tus compras recientes.</p>
        </div>

        <div className="row g-4">
          
          {/* --- COLUMNA IZQUIERDA: DATOS DEL USUARIO --- */}
          <div className="col-lg-4">
            <div className="profile-card h-100">
              
              {/* Decoración Verde Superior + Avatar */}
              <div className="user-card-header-bg">
                 {!isEditing && (
                    <button className="btn-edit-floating shadow-sm" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                 )}
              </div>
              
              <div className="card-body px-4 pb-4 pt-0 text-center">
                <div className="user-avatar-container">
                    <img src={profilePic} alt="Profile" className="profile-avatar-lg" />
                </div>

                {/* Estado de carga */}
                {loading && !profile ? (
                  <div className="py-4"><div className="spinner-border text-success"></div></div>
                ) : isEditing ? (
                  /* --- MODO EDICIÓN --- */
                  <form onSubmit={handleUpdate} className="text-start mt-3 animate__animated animate__fadeIn">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Nombre</label>
                      <input 
                        className="form-control profile-input" 
                        name="firstName" 
                        value={editFormData.firstName} 
                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Apellido</label>
                      <input 
                        className="form-control profile-input" 
                        name="lastName" 
                        value={editFormData.lastName} 
                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="d-grid gap-2 mt-4">
                      <button type="submit" className="btn btn-success shadow-sm">Guardar Cambios</button>
                      <button type="button" className="btn btn-light text-muted" onClick={() => setIsEditing(false)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  /* --- MODO VISUALIZACIÓN --- */
                  <div className="mt-2">
                    <h4 className="fw-bold text-dark mb-1">
                        {profile?.firstName} {profile?.lastName}
                    </h4>
                    
                    {/* BADGE CONDICIONAL */}
                    <span className={`badge mb-4 border ${profile?.role === 'ROLE_ADMIN' ? 'bg-success text-white' : 'bg-light text-secondary'}`}>
                        {profile?.role === 'ROLE_ADMIN' ? 'Admin' : 'Cliente Lunchy'}
                    </span>

                    <div className="text-start mt-3 px-2">
                        <div className="mb-3">
                            <div className="user-info-label">Email</div>
                            <div className="user-info-value text-truncate" title={profile?.email}>
                                {profile?.email}
                            </div>
                        </div>
                        {/* Aquí podrías agregar más datos como teléfono o dirección si los tuvieras */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: HISTORIAL DE PEDIDOS --- */}
          <div className="col-lg-8">
            <div className="profile-card h-100">
              <div className="history-header d-flex justify-content-between align-items-center">
                <h4 className="history-title">Historial de Pedidos</h4>
                {orders && orders.length > 0 && (
                    <span className="badge bg-success rounded-pill">{orders.length} pedidos</span>
                )}
              </div>
              
              <div className="card-body p-0">
                {loading && (!orders || orders.length === 0) ? (
                  <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                ) : orders && orders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table custom-table">
                      <thead>
                        <tr>
                          <th scope="col">Orden</th>
                          <th scope="col">Fecha</th>
                          <th scope="col">Total</th>
                          <th scope="col" className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                                <span className="order-id-badge">#{order.id}</span>
                            </td>
                            <td>{order.date}</td>
                            <td className="fw-bold text-dark">${order.totalPrice.toFixed(2)}</td>
                            <td className="text-end">
                              <button 
                                className="btn-view-details" 
                                onClick={() => handleViewDetails(order)}
                              >
                                Ver Detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* --- ESTADO VACÍO (SIN ÓRDENES) --- */
                  <div className="empty-state-container">
                    <img src={emptyCartIcon} alt="Sin pedidos" width="80" className="empty-state-icon" />
                    <h5 className="text-muted fw-bold mt-3">Aún no has realizado pedidos</h5>
                    <p className="text-secondary small mb-0">Tus compras pasadas aparecerán aquí.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Detalles (Sin cambios visuales internos, usa Bootstrap modal por defecto) */}
      <OrderDetailModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
    </div>
  );
};

export default ProfilePage;