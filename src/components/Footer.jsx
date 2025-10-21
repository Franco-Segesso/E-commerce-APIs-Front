import { Link } from "react-router-dom";
import logo from '../assets/logo-instagram.webp';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-lunchy text-center">
      <div className="container py-5">

        {/* Ícono de instagram */}
        <div className="d-flex justify-content-center gap-4 mb-4">
          <a href="https://www.instagram.com/lunchycorp/" target="_blank" rel="noopener noreferrer" className="social-circle">
            <img
                src={logo}
                alt="Instagram"
                className="mx-auto mb-3"
                style={{ width: '45px', height: '45px', objectFit: 'contain' }}
            />
          </a>

        </div>

        {/* Links de navegación */}
        <nav className="mb-4">
          <ul className="list-inline m-0">
            <li className="list-inline-item mx-3"><Link className="footer-link" to="/">Inicio</Link></li>
            <li className="list-inline-item mx-3"><Link className="footer-link" to="/products">Productos</Link></li>
            <li className="list-inline-item mx-3"><Link className="footer-link" to="/about">Sobre Nosotros</Link></li>
            
          </ul>
        </nav>

        <hr className="my-4 opacity-50" />

        {/* T&C y Cookies (es un agregado más visual que funcional) */}
        <div className="d-flex flex-column flex-md-row justify-content-center gap-4 small text-muted">
          <a href="" className="footer-legal">Términos & Condiciones</a>
          <a href="" className="footer-legal">Política de Cookies</a>
          <span>© {year} Lunchy</span>
        </div>
      </div>
    </footer>
  );
}

