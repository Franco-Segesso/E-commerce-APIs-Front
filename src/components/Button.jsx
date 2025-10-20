import React from 'react';

// Recibe 'loading', 'children' (el texto del botón) y otros props estándar de button
const Button = ({ children, loading = false, type = 'button', className = 'btn btn-primary', disabled, ...props }) => {
  return (
    <button
      type={type}
      className={className} // Permite personalizar las clases del botón (ej. btn-success, btn-lg)
      disabled={loading || disabled} // Deshabilita si está cargando o si se pasa 'disabled'
      {...props}
    >
      {loading ? (
        <>
          {/* Spinner de Bootstrap */}
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {/* Texto opcional durante la carga */}
          <span className="ms-2">Cargando...</span>
        </>
      ) : (
        children // Muestra el texto normal del botón
      )}
    </button>
  );
};

export default Button;