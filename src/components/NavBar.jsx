import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/lunchy.webp';


const Navbar = () => {
    const { cartItems } = useCart();
    const { user, logout, isAdmin} = useAuth();
    const navigate = useNavigate();

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container-fluid">
                
                <Link
                    className="navbar-brand p-0 me-3 d-flex align-items-center"
                    to="/"
                    aria-label="Lunchy"
                >
                    <img src={logo} alt="" style={{ height: 36, width: 'auto' }} />
                </Link>



                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Productos</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">Sobre Nosotros</Link>
                        </li>


                         {isAdmin && (

                         <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle fw-bold text-success" href="#" role="button" data-bs-toggle="dropdown">
                                Panel Admin
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to="/admin/categories">Gestionar Categorías</Link></li>
                                <li><Link className="dropdown-item" to="/admin/products">Gestionar Productos</Link></li>
                            </ul>
                        </li>
                        
                         )}
                    </ul>
                </div>



                <div className="d-flex align-items-center">
                    <Link to="/cart" className="btn btn-outline-dark me-2">
                        🛒 Carrito
                        <span className="badge bg-dark text-white ms-1 rounded-pill">{totalItems}</span>
                    </Link>
                    {user ? (
                        <div className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                {user.email}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#">Mi Perfil</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;