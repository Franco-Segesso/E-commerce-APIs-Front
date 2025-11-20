import React from 'react';  
import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProductsPage from './views/ProductPage.jsx';
import ProductDetailPage from './views/ProductDetailPage.jsx';
import CartPage from './views/CartPage.jsx';
import LoginPage from './views/LoginPage.jsx';
import RegisterPage from './views/RegisterPage.jsx';
import CheckoutPage from './views/CheckoutPage.jsx';
import AdminCategoriesPage from './views/AdminCategoriesPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminProductsPage from './views/AdminProductsPage.jsx';
import ProfilePage from './views/ProfilePage.jsx';

import HomePage from './views/HomePage.jsx';
import AboutUsPage from './views/AboutUsPage.jsx';

import AdminOrdersPage from './views/AdminOrdersPage.jsx';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './redux/slices/AuthSlice.jsx';


const SiteLayout = () => ( // Define la estructura estándar de las páginas (Navbar + Footer)
  <div className="d-flex flex-column min-vh-100">
    <Navbar />
    <main className="flex-grow-1 w-100">
      <Outlet /> 
    </main>
    <Footer />
  </div>
);

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);
    return (
        <BrowserRouter>

        {/* 2. AGREGA EL TOASTCONTAINER AQUÍ (puede ir antes o después de Routes) */}
                    <ToastContainer 
                        position="bottom-right" 
                        autoClose={3000} 
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
        

            <Routes>
                
                {/* Rutas SIN LAYOUT. Estas rutas son renderizadas sin NavBar y sin Footer */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                
                {/* Rutas CON LAYOUT. Estas rutas son renderizadas con Navbar y Footer */}
                <Route element={<SiteLayout />}>

                    {/* Rutas Públicas, no hace falta iniciar sesión para visualizarlas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    
                    {/* Rutas Protegidas. Solamente los usuarios logeados deben de poder visualizarlas */}
                    <Route 
                        path="/checkout" 
                        element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/profile"
                        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                    />
                    
                    {/* Rutas de Administrador. Solamente el usuario con rol ADMIN debe de poder visualizarlas */}
                    <Route 
                        path="/admin/categories"
                        element={<AdminRoute><AdminCategoriesPage /></AdminRoute>}
                    />
                    <Route 
                        path="/admin/products"
                        element={<AdminRoute><AdminProductsPage /></AdminRoute>}
                    />
                    <Route 
                        path="/admin/orders"
                        element={<AdminRoute><AdminOrdersPage /></AdminRoute>}
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;