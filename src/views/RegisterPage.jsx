import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RegisterPage = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstname, lastname, email, password, role: 'ROLE_USER' }),
            });

            if (!response.ok) {
                throw new Error('No se pudo completar el registro. El email ya podría estar en uso.');
            }

            const data = await response.json();
            login(data.access_token);
            navigate('/');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card p-4">
                <h2 className="text-center mb-4">Crear una Cuenta</h2>
                <form onSubmit={handleSubmit}>
                     <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Nombre</label>
                            <input type="text" className="form-control" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Apellido</label>
                            <input type="text" className="form-control" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">Registrarse</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;