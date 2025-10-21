import React from 'react';

// Recibe props estándar de un input
const Input = ({ id, label, type = 'text', name, value, onChange, required, placeholder, helpText, autocomplete, ...props }) => {
  const inputId = id || name;

  return (
    <div className="mb-3"> {/* Contenedor estándar de Bootstrap para inputs */}
      {label && ( // Muestra el label solo si se proporciona
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        type={type}
        className="form-control" // Clase estándar de Bootstrap
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        aria-describedby={helpText ? `${inputId}Help` : undefined}
        autoComplete={autocomplete}
        {...props}
      />
      {helpText && ( // Muestra texto de ayuda si se proporciona
        <div id={`${inputId}Help`} className="form-text">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default Input;