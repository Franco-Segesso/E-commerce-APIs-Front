import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';

import ProductPage from './views/ProductPage.jsx';
import ProductDetailPage from './views/ProductDetailPage.jsx';
import CartPage from './views/CartPage.jsx';
import LoginPage from './views/LoginPage.jsx';
import RegisterPage from './views/RegisterPage.jsx';
import AboutUsPage from './views/AboutUsPage.jsx'; // La ruta sigue aquí

const HomePage = () => (
    <div className="container text-center">
        <div className="p-5 mb-4 bg-light rounded-3">
            <h1 className="display-5 fw-bold">¡Bienvenido a MiTienda!</h1>
            <p className="col-md-8 fs-4 mx-auto">Los mejores productos, a un clic de distancia.</p>
            <Link className="btn btn-success btn-lg" to="/products">Ver Productos</Link>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <main className="d-flex flex-grow-1 align-items-center justify-content-center py-4">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/product/:productId" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/about" element={<AboutUsPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;