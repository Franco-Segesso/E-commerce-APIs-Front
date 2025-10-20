import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import logo from '../assets/lunchy.webp';
import profilePic from '../assets/profile-pic.png';
import cartIcon from '../assets/carrito.png';
import './NavBar.css';


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
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm"> {/* Fondo blanco y sombra */}
            <div className="container">
                {/* Logo a la izquierda */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={logo} alt="Lunchy Logo" height="30" className="me-2"/> {/* Usa el logo */}
                </Link>

                {/* Botón Toggler para móviles */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavContent" aria-controls="navbarNavContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido Colapsable */}
                <div className="collapse navbar-collapse" id="navbarNavContent">

                    {/* Links Centrales */}
                    <div className="navbar-nav mx-auto d-flex flex-row gap-2 justify-content-center">
                            {/* Usamos NavLink para el estilo 'active' */}
                        <NavLink className="nav-link nav-link-hover px-4" to="/products">
                            Productos
                        </NavLink>

                        <NavLink className="nav-link nav-link-hover px-4" to="/about">
                            Sobre Nosotros
                        </NavLink>
                        
                         {/* Link condicional al panel de Admin */}
                        {isAdmin && (
                             <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-bold text-success" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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

                    {/* Iconos a la Derecha */}
                    <ul className="navbar-nav ms-auto d-flex flex-row align-items-center gap-3">
                        {/* Carrito */}
                        <li className="nav-item">
                            <Link to="/cart" className="nav-link position-relative">
                                {/* Icono de Carrito */}
                                <img
                                        src={cartIcon}
                                        alt="carrito"
                                        height="24" // Ajusta el tamaño como necesites
                                    />
                                {totalItems > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6em' }}>
                                        {totalItems}
                                        <span className="visually-hidden">Productos en el carrito</span>
                                    </span>
                                )}
                            </Link>
                        </li>
                        {/* Usuario */}
                        {user ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle d-flex align-items-center navbar-user-display" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                     {/* Icono de Usuario */}
                                        <img
                                        src={profilePic}
                                        alt="Perfil"
                                        height="24" // Ajusta el tamaño como necesites
                                        className="rounded-circle me-1" // Opcional: hacerlo circular
                                    />
                                    {/* Mostramos el mail del usuario */}
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
                                <Link className="btn btn-outline-primary btn-sm" to="/login">Iniciar Sesión</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;