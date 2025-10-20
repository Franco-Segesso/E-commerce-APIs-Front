// src/views/HomePage.jsx
import newsletterLogo from "../assets/lunchy-logo.png";

import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useEffect, useState } from "react";
import HomeCarousel from "../components/HomeCarousel";

// Importá el logo (asegurate que el archivo exista en src/assets)


// --- Funciones para traer productos ---
async function productos_con_descuento() {
  const res = await fetch("http://localhost:4002/products/discounted");
  if (!res.ok) throw new Error("Error al cargar productos en oferta");
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.content ?? [];
  return list.slice(0, 4);
}

async function nuevos_ingresos() {
  const res = await fetch("http://localhost:4002/products");
  if (!res.ok) throw new Error("Error al cargar nuevos ingresos");
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.content ?? [];
  const sorted = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  return sorted.slice(0, 4);
}

async function enviarNewsletterEmail(email) {
  const payload = {
    toUser: [email],
    subject: "Gracias por suscribirte a Lunchy",
    message: "¡Hola! Te damos la bienvenida a Lunchy 🍽️. Pronto recibirás nuestras mejores ofertas y descuentos exclusivos."
  };

  try {
    const res = await fetch("http://localhost:4002/api/mail/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Error al enviar el email");
    }

    return await res.json();
  } catch (err) {
    console.error("Error al enviar el email:", err);
    throw err;
  }
}


// --- Componente principal ---
const HomePage = () => {
  const [hotSale, setHotSale] = useState([]);
  const [loadingHot, setLoadingHot] = useState(true);
  const [errorHot, setErrorHot] = useState(null);

  const [newProducts, setNewProducts] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [errorNew, setErrorNew] = useState(null);

  //Mail
  const [newsletterStatus, setNewsletterStatus] = useState(null); // "success" | "error"
  const [newsletterMsg, setNewsletterMsg] = useState("");

  // Manejar envío de newsletter
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const input = e.target.elements.email;
    const email = input.value.trim();

    if (!email) {
      setNewsletterStatus("error");
      setNewsletterMsg("Por favor, ingresá un correo válido.");
      return;
    }

    try {
      await enviarNewsletterEmail(email);
      setNewsletterStatus("success");
      setNewsletterMsg("¡Gracias por suscribirte! Te enviamos un correo de bienvenida.");
      input.value = "";
    } catch {
      setNewsletterStatus("error");
      setNewsletterMsg("No pudimos enviar el correo. Intentá nuevamente más tarde.");
    }
  };

  useEffect(() => {
    async function fetchHotSale() {
      try {
        setLoadingHot(true);
        setErrorHot(null);
        const data = await productos_con_descuento();
        setHotSale(data);
      } catch (error) {
        setErrorHot(error.message);
      } finally {
        setLoadingHot(false);
      }
    }
    fetchHotSale();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingNew(true);
        setErrorNew(null);
        const data = await nuevos_ingresos();
        setNewProducts(data);
      } catch (err) {
        setErrorNew(err.message || "Error desconocido");
      } finally {
        setLoadingNew(false);
      }
    })();
  }, []);

  return (
    <div className="homepage">
      {/* Carrusel principal */}
      <HomeCarousel />

      {/* HOT SALE con fondo verde y ondas (versión simple/infalible) */}
<section className="wave-wrap">
  {/* Onda superior */}
  <div className="wave-top">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path
        d="M0,64 C240,96 480,0 720,32 C960,64 1200,64 1440,32 L1440,100 L0,100 Z"
        fill="#dcf8eaff"   /* color fijo para asegurar visibilidad */
    
      />
    </svg>
  </div>

  {/* Cuerpo verde */}
  <div className="wave-body">
    <div className="container-fluid px-4">
      <div className="position-relative mb-3 text-center">
        <h2 className="h3 m-1 text-stroke-black text-center">Aprovechá Nuestras Ofertas</h2>

        <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                <Link to="/products" className="btn btn-verde">Ver Todo</Link>
              </div>
      </div>

      {loadingHot && (
        <div className="text-center py-5 w-100">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p className="text-light m-0">Cargando productos en oferta...</p>
        </div>
      )}

      {!loadingHot && errorHot && (
        <div className="alert alert-light bg-opacity-10 text-white border-0" role="alert">
          {errorHot}
        </div>
      )}

      {!loadingHot && !errorHot && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {hotSale.length > 0 ? (
            hotSale.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <p className="text-center text-light w-100 m-0">
              No hay productos en oferta por el momento.
            </p>
          )}
        </div>
      )}
    </div>
  </div>

  {/* Onda inferior */}
  <div className="wave-bottom">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path
        d="M0,0 L0,0 C240,32 480,100 720,68 C960,36 1200,36 1440,68 L1440,100 L0,100 Z"
        fill="#dcf8eaff"  /* color fijo para asegurar visibilidad */
      />
    </svg>
  </div>
</section>


      {/* Banner simple */}
      <section className="py-4">
        <div className="container-fluid px-4">
          <div
            className="p-4 p-md-5 rounded-3 text-center text-md-start text-white"
              style={{ backgroundColor: "#3b9168ff" }}
              >

            <div className="row align-items-center g-3">
              <div className="col-md">
                <h3 className="h3 mb-1">Envío gratis desde $50.000</h3>
                <p className="h5 mb-1 text-muted">Y devoluciones fáciles. Probá sin miedo.</p>
              </div>
              <div className="col-md-auto">
                <Link to="/products" className="btn btn-dark">Comprar ahora</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* NUEVOS INGRESOS */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-end justify-content-between mb-3">
            <h2 className="h3 m-0">Disfrutá de Nuevos Ingresos</h2>
            <div className="col-md-auto">
                <Link to="/products" className="btn btn-verde">Ver Todo</Link>
              </div>
          </div>

          {loadingNew && (
            <div className="text-center py-5 w-100">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="text-muted">Cargando nuevos ingresos...</p>
            </div>
          )}

          {!loadingNew && errorNew && (
            <div className="alert alert-danger" role="alert">
              {errorNew}
            </div>
          )}

          {!loadingNew && !errorNew && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {newProducts.length > 0 ? (
                newProducts.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <p className="text-center text-muted w-100">
                  No hay nuevos ingresos por el momento.
                </p>
              )}
            </div>
          )}
        </div>
      </section>


            

      {/* NEWSLETTER con imagen a la izquierda */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="rounded-4 p-4 p-md-5 newsletter-card text-dark">
            <div className="row g-4 align-items-center">
              {/* Imagen / logo a la izquierda */}
            < div className="col-12 col-md-auto text-center">
              {/* wrapper con tamaño fijo */}
              <div className="newsletter-avatar" style={{ width: 200, height: 200 }}>
                <img src={newsletterLogo} alt="Lunchy" />
              </div>
            </div>


              {/* Texto al centro */}
              <div className="col-12 col-md">
                <h3 className="h4 mb-1">Suscribite y recibí ofertas secretas</h3>
                <p className="mb-0 text-black-50">Nada de spam, sólo promos esporádicas.</p>
              </div>

              {/* Input y botón */}
              <div className="col-12 col-md-5">
                <form
                className="d-flex gap-2 flex-column flex-sm-row"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="tu@email.com"
                  required
                />
                <button type="submit" className="btn btn-success btn-lg">
                  Unirme
                </button>
              </form>
              {/* Mensaje de estado */}
              {newsletterStatus && (
                  <div
                    className={`mt-2 p-2 rounded-3 text-center ${
                      newsletterStatus === "success" ? "bg-success text-white" : "bg-danger text-white"
                    }`}
                  >
                    {newsletterMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
