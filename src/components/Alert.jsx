import React from 'react';

// Recibe el 'message' y el 'type'
const Alert = ({ message, type = 'danger' }) => {
  // Returnea 'null' si no hay mensaje
  if (!message) {
    return null;
  }

  return (
    // alerta de Bootstrap
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      {/* Botón opcional para cerrar la alerta */}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  );
};

export default Alert;