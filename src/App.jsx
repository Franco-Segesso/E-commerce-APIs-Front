import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Importamos el guardia

import ProductsPage from './views/ProductPage.jsx';
import ProductDetailPage from './views/ProductDetailPage.jsx';
import CartPage from './views/CartPage.jsx';
import LoginPage from './views/LoginPage.jsx';
import RegisterPage from './views/RegisterPage.jsx';
import CheckoutPage from './views/CheckoutPage.jsx'; // Importamos la nueva página
import AdminCategoriesPage from './views/AdminCategoriesPage.jsx';
import AdminRoute from './components/AdminRoute.jsx'; // Importamos el componente de ruta admin
import AdminProductsPage from './views/AdminProductsPage.jsx';

import HomePage from './views/HomePage.jsx';
import AboutUsPage from './views/AboutUsPage.jsx';

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <main className="flex-grow-1 py-4 w-100">
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:productId" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/about" element={<AboutUsPage />} />
                        
                        {/* Ruta Protegida */}
                        <Route 
                            path="/checkout" 
                            element={
                                <ProtectedRoute>
                                    <CheckoutPage />
                                </ProtectedRoute>
                            } 
                        />

                        <Route 
                            path="/admin/categories"
                            element={
                                <AdminRoute>
                                    <AdminCategoriesPage />
                                </AdminRoute>
                            }
                        />

                        <Route 
                            path="/admin/products"
                            element={
                                <AdminRoute>
                                    <AdminProductsPage />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;