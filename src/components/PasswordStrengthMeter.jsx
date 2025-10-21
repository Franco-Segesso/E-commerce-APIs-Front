import React from 'react';
import './PasswordStrength.css';

// Recibe la fortaleza ('weak', 'medium', 'strong')
const PasswordStrengthMeter = ({ strength }) => {
  let strengthClass = '';
  switch (strength) {
    case 'weak':
      strengthClass = 'strength-weak';
      break;
    case 'medium':
      strengthClass = 'strength-medium';
      break;
    case 'strong':
      strengthClass = 'strength-strong';
      break;
    default:
      strengthClass = ''; // Barra vacía si no hay fuerza
  }

  return (
    <div className="password-strength-meter">
      <div className={`password-strength-meter-bar ${strengthClass}`}></div>
    </div>
  );
};

export default PasswordStrengthMeter;