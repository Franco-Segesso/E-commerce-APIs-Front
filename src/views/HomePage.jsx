import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';

// 1. Imports de Redux
import { useSelector, useDispatch } from 'react-redux';
import { fetchHotSale, fetchNewArrivals } from '../redux/slices/ProductSlice';

// Componentes
import ProductCard from "../components/ProductCard.jsx";
import HomeCarousel from "../components/HomeCarousel.jsx";
import lunchyLogo from "../assets/lunchy-logo.png";

const HomePage = () => {
  const dispatch = useDispatch();

  // 2. Leemos los estados ESPECÍFICOS del Home
  const { 
    hotSaleList, 
    newArrivalsList, 
    loadingHome 
  } = useSelector((state) => state.products);

  // Estado local para el input de email
  const [email, setEmail] = useState("");
  // NUEVO: Estado para saber si se está enviando el mail
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Disparamos las acciones al montar
// Efecto para Hot Sale
useEffect(() => {
  if (hotSaleList.length === 0) {
      dispatch(fetchHotSale());
  }
}, [dispatch, hotSaleList.length]); // Solo vigila hotSaleList

// Efecto para Nuevos Ingresos
useEffect(() => {
  if (newArrivalsList.length === 0) {
      dispatch(fetchNewArrivals());
  }
}, [dispatch, newArrivalsList.length]); // Solo vigila newArrivalsList

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Ingresa un email válido");

    // Activamos el estado de carga
    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:4002/api/mail/sendMessage", {
            toUser: [email],
            subject: "¡Bienvenido a Lunchy!",
            
            message: "¡Hola! Te damos la bienvenida a Lunchy 🌱. Pronto recibirás nuestras mejores ofertas y descuentos exclusivos.\n\n\n\nLunchy Corp — Departamento de Atención al Cliente\nlunchycorp@gmail.com \n+54 11 1234-5678 \nAv. Callao 1240, CABA \nInstagram: @lunchycorp \n— \nGracias por confiar en nosotros."
      });
      
      toast.success("¡Suscripción exitosa! Revisa tu correo.");
      setEmail("");
      
    } catch (error) {
      toast.error("Error al suscribirse. Intenta luego.");
    } finally {
      // Desactivamos el estado de carga, pase lo que pase
      setIsSubmitting(false);
    }
  };

  const Loader = () => (
    <div className="text-center py-5 w-100">
        <div className="spinner-border text-success" role="status"></div>
        <p className="text-muted mt-2">Preparando el menú...</p>
    </div>
  );

  return (
    <div className="homepage">
      <HomeCarousel />

      {/* --- SECCIÓN HOT SALE (Con Ondas) --- */}
      <section className="wave-wrap">
        <div className="wave-top">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,64 1440,32 L1440,100 L0,100 Z" fill="#dcf8eaff" />
            </svg>
        </div>

        <div className="wave-body">
            <div className="container-fluid px-4">
            <div className="position-relative mb-4 text-center">
                <h2 className="h3 fw-bold text-dark"> Aprovechá Nuestras Ofertas</h2>
                <div className="position-absolute end-0 top-50 translate-middle-y me-3 d-none d-md-block">
                    <Link to="/products" className="btn btn-verde btn-sm">Ver Todo</Link>
                </div>
            </div>

            {loadingHome && hotSaleList.length === 0 ? <Loader /> : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {hotSaleList.length > 0 ? (
                      hotSaleList
                      .filter(p => p.active && p.stock > 0)
                        .map(p => <ProductCard key={p.id} product={p} />)
                    ) : (
                        <p className="text-center w-100 text-muted">No hay ofertas por el momento.</p>
                    )}
                </div>
            )}
            </div>
        </div>

        <div className="wave-bottom">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 L0,0 C240,32 480,100 720,68 C960,36 1200,36 1440,68 L1440,100 L0,100 Z" fill="#dcf8eaff" />
            </svg>
        </div>
      </section>

      {/* --- BANNER ENVÍO --- */}
      <section className="py-4">
        <div className="container-fluid px-4">
          <div className="p-5 rounded-4 text-center text-md-start text-white shadow-sm" style={{ backgroundColor: "#3b9168" }}>
            <div className="row align-items-center g-3">
              <div className="col-md">
                <h3 className="fw-bold">Envío gratis desde $50.000</h3>
                <p className="lead mb-0">Comé rico y saludable sin moverte de casa.</p>
              </div>
              <div className="col-md-auto">
                <Link to="/products" className="btn btn-dark btn-lg">Comprar ahora</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NUEVOS INGRESOS --- */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <h2 className="h3 fw-bold m-0"> Nuevos Ingresos</h2>
            <Link to="/products" className="link-success text-decoration-none fw-bold">Ver todo →</Link>
          </div>

          {loadingHome && newArrivalsList.length === 0 ? <Loader /> : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {newArrivalsList.length > 0 ? (
                    newArrivalsList
                    .filter(p => p.active && p.stock > 0)
                    .map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                    <p className="text-center w-100 text-muted">Pronto tendremos novedades.</p>
                )}
            </div>
          )}
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="py-5 bg-light">
        <div className="container px-4">
          <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm">
            <div className="row align-items-center g-4">
                <div className="col-md-auto text-center">
                    <img src={lunchyLogo} alt="Lunchy" width="120" className="mb-3 mb-md-0" />
                </div>
                <div className="col-md">
                    <h3 className="fw-bold">Únete al Club Lunchy</h3>
                    <p className="text-muted mb-0">Recibe descuentos exclusivos y menús semanales.</p>
                </div>
                <div className="col-md-5">
                    <form className="d-flex gap-2" onSubmit={handleNewsletterSubmit}>
                        <input 
                            type="email" 
                            className="form-control form-control-lg" 
                            placeholder="tu@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting} // Deshabilitamos el input también
                        />
                        <button 
                            type="submit" 
                            className="btn btn-success btn-lg"
                            disabled={isSubmitting} // Deshabilitamos el botón
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Enviando...
                                </>
                            ) : (
                                'Suscribirse'
                            )}
                        </button>
                    </form>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;