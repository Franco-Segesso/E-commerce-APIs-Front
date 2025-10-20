import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import lunchyLogo from "../assets/lunchy-logo.png";
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error('Credenciales inválidas.');
            const data = await response.json();
            login(data.access_token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        // 1. Contenedor principal para centrar todo en la página
        <div className="login-page-wrapper">
            
            {/* 2. Tarjeta principal dividida en dos */}
            <div className="login-card-split">
                
                {/* Panel Izquierdo: Branding y Visual */}
                <div className="login-left-panel">
                    <div className="mb-4">
                        <img src={lunchyLogo} alt="Lunchy Logo" style={{ width: '150px' }} />
                    </div>
                    <h1 className="h3 fw-bold text-success mb-2">¡Tu comida saludable!</h1>
                    <p className="lead text-dark-emphasis">
                        Ingresá para gestionar tus pedidos y disfrutar de nuestras ofertas.
                    </p>
                    {/* Aquí iría la imagen visual (como las verduras) si la tuvieras importada */}
                </div>

                {/* Panel Derecho: Formulario de Login */}
                <div className="login-right-panel">
                    <h2 className="h4 mb-4 fw-bold">Iniciar Sesión</h2>
                    <p className="mb-4 text-muted">¡Bienvenido de nuevo! Ingresá tus datos.</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Correo Electrónico</label>
                            <input 
                                type="email" 
                                className="form-control form-control-lg" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Contraseña</label>
                            <input 
                                type="password" 
                                className="form-control form-control-lg" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            
                        </div>
                        
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                        
                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-success btn-lg">
                                Ingresar
                            </button>
                        </div>
                    </form>
                    
                    <div className="text-center mt-3 pt-3 border-top">
                        <p className="mb-0">¿No tienes una cuenta? <Link to="/register" className="fw-bold">Registrate</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );



};

export default LoginPage;

