import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/AuthSlice';

import Input from '../components/Input'; 
import Button from '../components/Button'; 
import Alert from '../components/Alert'; 
import lunchyLogo from "../assets/lunchy-logo.png";
import './Login&RegisterPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(''); // Error local por si falla validación antes de Redux
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //Leemos el estado global
    const { loading, error, user } = useSelector((state) => state.auth);

    //Redirección si ya estás logueado
    useEffect(() => {
        if (user) {
            navigate('/');
        }
        
        return () => {
            dispatch(clearError());
        }
    }, [user, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');
        
        // Despachamos la acción
        dispatch(loginUser({ email, password }));
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-split">
                <div className="login-left-panel">
                    <div className="mb-4">
                        <img src={lunchyLogo} alt="Lunchy Logo" style={{ width: '150px' }} />
                    </div>
                    <h1 className="h3 fw-bold text-success mb-2">¡Tu comida saludable!</h1>
                    <p className="lead text-dark-emphasis">
                        Ingresá para gestionar tus pedidos y disfrutar de nuestras ofertas.
                    </p>
                </div>

                <div className="login-right-panel">
                    <h2 className="h4 mb-4 fw-bold">Iniciar Sesión</h2>
                    <p className="mb-4 text-muted">¡Bienvenido de nuevo! Ingresá tus datos.</p>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Mostramos error de Redux o local */}
                        <Alert message={error || localError} type="danger" />
                        
                        <Input 
                            label="Correo Electrónico" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <div className="mb-3">
                            <Input 
                                label="Contraseña" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="d-grid mt-4">
                            <Button type="submit" loading={loading} className="btn btn-success btn-lg">
                                Ingresar
                            </Button>
                        </div>
                    </form>
                    
                    <div className="text-center mt-4">
                        <p className="mb-0">
                            <small className="text-muted">
                                ¿No tienes una cuenta? <Link to="/register" className="fw-bold">Registrate</Link>
                            </small>
                        </p>
                    </div>

                    <div className="text-center mt-3 pt-3 border-secondary-subtle">
                        <p className="mb-0 text-muted">
                            <Link to="/" className="text-secondary fw-bold">
                                Continuar como invitado
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;