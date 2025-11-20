
import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import OrderDetailModal from '../components/OrderDetailModal.jsx'
import { toast } from 'react-toastify'



// Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProfile,
  updateProfile,
  fetchOrders,
  resetSaveSuccess,
  selectUserProfile,
  selectLoadingProfile,
  selectErrorProfile,
  selectSavingProfile,
  selectSaveError,
  selectSaveSuccess,
  selectOrders,
  selectLoadingOrders,
  selectErrorOrders,
} from '../redux/slices/UserSlice'

/**
 * Vista de perfil:
 * - Carga perfil y órdenes con thunks de Redux.
 * - Permite editar nombre y apellido.
 */
export default function ProfilePage() {
  const dispatch = useDispatch()

  // Estado global (Redux)
  const profile        = useSelector(selectUserProfile)
  const loadingProfile = useSelector(selectLoadingProfile)
  const errorProfile   = useSelector(selectErrorProfile)

  const savingProfile  = useSelector(selectSavingProfile)
  const saveError      = useSelector(selectSaveError)
  const saveSuccess    = useSelector(selectSaveSuccess)

  const orders         = useSelector(selectOrders)
  const loadingOrders  = useSelector(selectLoadingOrders)
  const errorOrders    = useSelector(selectErrorOrders)

  // Estado local (form y modal)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '' })
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Montaje: pedir perfil y órdenes
  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(fetchOrders())
  }, [dispatch])

  // Cuando llega el perfil, rellenar form
  useEffect(() => {
    if (profile) {
      setEditFormData({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
      })
    }
  }, [profile])

  // Feedback de guardado
  useEffect(() => {
    if (saveSuccess) {
      toast.success('Perfil actualizado con éxito.')
      setIsEditing(false)
      const t = setTimeout(() => dispatch(resetSaveSuccess()), 2000)
      return () => clearTimeout(t)
    }
  }, [saveSuccess, dispatch])

  // Error al guardar
  useEffect(() => {
    if (saveError) toast.error(saveError)
  }, [saveError])

  // Cambios en inputs del form
  const handleEditChange = (e) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Enviar actualización de perfil
  const handleUpdateProfile = (e) => {
    e.preventDefault()
    dispatch(updateProfile({
      firstName: editFormData.firstName,
      lastName:  editFormData.lastName,
    }))
  }

  // Ver detalle de una orden
  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  return (
    <div className="para-el-fondo">
      <div className="profile-page-container">
        <h2>Mi Perfil</h2>

        {errorProfile && <div className="alert alert-danger">{errorProfile}</div>}

        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Información Personal</h3>
            {!isEditing && (
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                Editar Datos
              </button>
            )}
          </div>

          {loadingProfile ? (
            <p>Cargando perfil...</p>
          ) : profile ? (
            isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="info-grid">
                  <div>
                    <label htmlFor="firstName" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="email-field">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      readOnly
                      disabled
                      className="form-control-plaintext bg-light p-2 rounded"
                      value={profile.email || ''}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={savingProfile}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div>
                  <label className="form-label">Nombre</label>
                  <div className="info-field-display">{profile.firstName}</div>
                </div>
                <div>
                  <label className="form-label">Apellido</label>
                  <div className="info-field-display">{profile.lastName}</div>
                </div>
                <div className="email-field">
                  <label className="form-label">Email</label>
                  <div className="info-field-display">{profile.email}</div>
                </div>
              </div>
            )
          ) : (
            <p>No se encontró el perfil.</p>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Historial de Pedidos</h3>
          </div>

          {errorOrders && <div className="alert alert-danger">{errorOrders}</div>}

          {loadingOrders ? (
            <p>Cargando órdenes...</p>
          ) : orders && orders.length > 0 ? (
            <div className="order-history-table">
              <div className="order-row order-header">
                <span>Número de Pedido</span>
                <span>Fecha</span>
                <span>Total</span>
                <span></span>
              </div>
              {orders.map((order) => (
                <div key={order.id} className="order-row">
                  <span className="fw-medium">#{order.id}</span>
                  <span>{order.date}</span>
                  <span>${Number(order.totalPrice).toFixed(2)}</span>
                  <span className="text-end">
                    <button
                      className="btn btn-link order-details-link p-0"
                      onClick={() => handleViewDetails(order)}
                    >
                      Ver Detalles
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>Todavía no has realizado ninguna orden.</p>
          )}
        </div>
      </div>

      <OrderDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        order={selectedOrder}
      />
    </div>
  )
}
