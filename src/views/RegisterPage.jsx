import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import Input from '../components/Input'; 
import Button from '../components/Button'; 
import Alert from '../components/Alert'; 
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';
import './Login&RegisterPage.css'; 
import lunchyLogo from "../assets/lunchy-logo.png"; 

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [passwordStrength, setPasswordStrength] = useState('');



    // Función para calcular que tan segura es la contraseña
    const calculateStrength = (password) => {
        const hasMinLength = password.length >= 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSymbol = /[!@#$%^&()_+.-]/.test(password); 

        if (hasMinLength && hasUpperCase && hasSymbol) {
            return 'strong';
        } else if (hasMinLength && (hasUpperCase || hasSymbol)) {
            return 'medium';
        } else if (password.length > 0) {
            return 'weak';
        } else {
            return ''; // Vacío si no hay contraseña
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (name === 'password') {
            setPasswordStrength(calculateStrength(value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validación de contraseña
        if (passwordStrength !== 'strong') {
            setError('La contraseña debe tener entre 6-20 caracteres, incluir al menos una mayúscula y un símbolo (!@#$%^&()_+.-).');
            return;
        }

        setLoading(true);

        const registrationData = {
                ...formData,
                role: 'ROLE_USER', // Rol por defecto
        };

        fetch('http://localhost:4002/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData),
        })
        .then(response => {
            if (!response.ok) {
                // Intentamos leer el mensaje de error del backend
                return response.json().then(errData => {
                    throw new Error(errData.message || 'No se pudo completar el registro.');
                }).catch(() => {
                     throw new Error('No se pudo completar el registro. El email ya podría estar en uso.');
                });
            }
            return response.json();
        })
        .then(data => {
            login(data.access_token); // Usamos la función login del AuthContext
            navigate('/'); // Redirigimos al inicio después del registro
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    return (
        // Contenedor principal que centra 
        <div className="login-page-wrapper">
            
            {/*Tarjeta principal dividida en dos */}
            <div className="login-card-split">
                
                {/*Panel Izquierdo: Branding y Visual  */}
                <div className="login-left-panel">
                    <div className="mb-4">
                        <img src={lunchyLogo} alt="Lunchy Logo" style={{ width: '150px' }} />
                    </div>
                    <h1 className="h3 fw-bold text-success mb-2">¡Comida Saludable y Fácil!</h1>
                    <p className="lead text-dark-emphasis">
                        Únete a la comunidad de Lunchy y empieza a disfrutar de tus planes de comidas.
                    </p>
                </div>

                {/* Panel Derecho: Formulario de Registro */}
                <div className="login-right-panel">
                    <h2 className="h4 fw-bold text-center">Crear una Cuenta</h2>
                    
                    <form onSubmit={handleSubmit}>
                        
                        <Alert message={error} type="danger" />
                        
                        {/* Nombre y Apellido*/}
                        <div className="row">
                            <div className="col-md-6">
                                <Input id="firstname" label="Nombre" name="firstname" value={formData.firstname} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <Input id="lastname" label="Apellido" name="lastname" value={formData.lastname} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Correo Electrónico */}
                        <Input id="email" label="Correo Electrónico" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        
                        {/* Contraseña y medidor de fuerza */}
                        <Input
                            id="password"
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            helpText="Entre 6-20 caracteres, con mayúscula y símbolo."
                            autoComplete="new-password"
                        />
                        <PasswordStrengthMeter strength={passwordStrength} />
                        
                        <div className="d-grid mt-4">
                            <Button type="submit" loading={loading} className="btn btn-success btn-lg">
                                Registrarse
                            </Button>
                        </div>
                    </form>
                    
                    {/* Link a Iniciar Sesión */}
                    <div className="text-center mt-4">
                        <p className="mb-0">
                            <small className="text-muted">
                                ¿Ya tienes una cuenta? <Link to="/login" className="fw-bold">Inicia Sesión</Link>
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;