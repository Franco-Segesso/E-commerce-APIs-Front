import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/AuthSlice'; // Importamos la acción
import logo from '../assets/lunchy.webp';
import profilePic from '../assets/profile-pic.png';
import cartIcon from '../assets/carrito.png';
import './NavBar.css';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Leemos Carrito
    const cartItems = useSelector((state) => state.cart.items);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Leemos Auth (Usuario y Roles)
    const { user } = useSelector((state) => state.auth);
    
    // 3. Calculamos si es Admin
    // (Asegúrate de que tu backend/decodificación devuelva los roles en esta estructura)
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.authorities?.includes('ROLE_ADMIN');

    const handleLogout = () => {
        dispatch(logout()); // Acción de Redux
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={logo} alt="Lunchy Logo" height="30" className="me-2"/>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNavContent">
                    <div className="navbar-nav mx-auto d-flex flex-row gap-2 justify-content-center">
                        <NavLink className="nav-link nav-link-hover px-4" to="/products">Productos</NavLink>
                        <NavLink className="nav-link nav-link-hover px-4" to="/about">Sobre Nosotros</NavLink>
                        
                        {/* Panel Admin condicional */}
                        {isAdmin && (
                             <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-bold text-success" href="#" role="button" data-bs-toggle="dropdown">
                                    Panel Admin
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to="/admin/categories">Categorías</Link></li>
                                    <li><Link className="dropdown-item" to="/admin/products">Productos</Link></li>
                                    <li><Link className="dropdown-item" to="/admin/orders">Órdenes</Link></li>
                                </ul>
                            </li>
                        )}
                    </div>

                    <ul className="navbar-nav ms-auto d-flex flex-row align-items-center gap-3">
                        <li className="nav-item">
                            <Link to="/cart" className="nav-link position-relative">
                                <img src={cartIcon} alt="carrito" height="24" />
                                {totalItems > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6em' }}>
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </li>
                        {user ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle d-flex align-items-center navbar-user-display" href="#" role="button" data-bs-toggle="dropdown">
                                        <img src={profilePic} alt="Perfil" height="24" className="rounded-circle me-1" />
                                    <span className="d-none d-lg-inline ms-1">{user.email}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/profile">Mi Perfil</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Cerrar Sesión</button></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="btn btn-primary" to="/login">Iniciar Sesión</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;