import React from 'react';

// Recibe el 'message' y el 'type' (ej. 'danger', 'success', 'warning')
const Alert = ({ message, type = 'danger' }) => {
  // No renderiza nada si no hay mensaje
  if (!message) {
    return null;
  }

  return (
    // Usa clases de alerta de Bootstrap
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      {/* Botón opcional para cerrar la alerta (Bootstrap JS necesario) */}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  );
};

export default Alert;