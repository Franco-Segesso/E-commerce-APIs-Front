
import React from 'react';  
import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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
import ProfilePage from './views/ProfilePage.jsx';

import HomePage from './views/HomePage.jsx';
import AboutUsPage from './views/AboutUsPage.jsx';

import AdminOrdersPage from './views/AdminOrdersPage.jsx';

// Este componente define la estructura estándar de las páginas (Navbar + Footer)
const SiteLayout = () => (
  <div className="d-flex flex-column min-vh-100">
    <Navbar />
    <main className="flex-grow-1 w-100">
      <Outlet /> {/* Aquí se renderizará la ruta anidada */}
    </main>
    <Footer />
  </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* 2. Rutas SIN LAYOUT (Pantalla Completa) */}
                {/* Estas rutas se renderizan solas, sin Navbar ni Footer */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Puedes mover /checkout aquí si quieres que sea full-screen como el login, pero lo dejamos en el layout por defecto */}
                
                {/* 3. Rutas CON LAYOUT (Navbar y Footer) */}
                <Route element={<SiteLayout />}>
                    {/* Rutas Públicas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    
                    {/* Rutas Protegidas (envueltas por SiteLayout y ProtectedRoute/AdminRoute) */}
                    <Route 
                        path="/checkout" 
                        element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/profile"
                        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                    />
                    
                    {/* Rutas de Administrador */}
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