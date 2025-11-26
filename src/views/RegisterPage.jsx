import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/AuthSlice';

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
    const [passwordStrength, setPasswordStrength] = useState('');
    const [localError, setLocalError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Estado Global
    const { loading, error, user } = useSelector((state) => state.auth);

    // 3. Redirección y Limpieza (Separados para evitar doble disparo)

    //Solo redirige si el usuario se registra/loguea exitosamente
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Solo limpia los errores cuando sales de la página (Unmount)
    useEffect(() => {
        return () => {
            dispatch(clearError());
        }
    }, [dispatch]);

    // Lógica para contraseña
    const calculateStrength = (password) => {
        const hasMinLength = password.length >= 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSymbol = /[!@#$%^&()_+.-]/.test(password); 

        if (hasMinLength && hasUpperCase && hasSymbol) return 'strong';
        if (hasMinLength && (hasUpperCase || hasSymbol)) return 'medium';
        if (password.length > 0) return 'weak';
        return '';
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            setPasswordStrength(calculateStrength(value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        // Validación Local antes de Redux
        if (passwordStrength !== 'strong') {
            setLocalError('La contraseña debe tener entre 6-20 caracteres, incluir al menos una mayúscula y un símbolo (!@#$%^&()_+.-).');
            return;
        }

        const registrationData = {
                ...formData,
                role: 'ROLE_USER',
        };

        // Despachar Thunk
        dispatch(registerUser(registrationData));
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-split">
                <div className="login-left-panel">
                    <div className="mb-4">
                        <img src={lunchyLogo} alt="Lunchy Logo" style={{ width: '150px' }} />
                    </div>
                    <h1 className="h3 fw-bold text-success mb-2">¡Comida Saludable y Fácil!</h1>
                    <p className="lead text-dark-emphasis">
                        Únete a la comunidad de Lunchy y empieza a disfrutar de tus planes de comidas.
                    </p>
                </div>

                <div className="login-right-panel">
                    <h2 className="h4 fw-bold text-center">Crear una Cuenta</h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Muestra error de Redux O error local de validación */}
                        <Alert message={error || localError} type="danger" />
                        
                        <div className="row">
                            <div className="col-md-6">
                                <Input id="firstname" label="Nombre" name="firstname" value={formData.firstname} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <Input id="lastname" label="Apellido" name="lastname" value={formData.lastname} onChange={handleChange} required />
                            </div>
                        </div>

                        <Input id="email" label="Correo Electrónico" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        
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