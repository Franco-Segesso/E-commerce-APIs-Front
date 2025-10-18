// src/views/HomePage.jsx
import newsletterLogo from "../assets/lunchy-logo.png";

import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useEffect, useState } from "react";
import HomeCarousel from "../components/HomeCarousel";

// Importá el logo (asegurate que el archivo exista en src/assets)



const categories = [
  {
    title: "Audio",
    img: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Wearables",
    img: "https://images.unsplash.com/photo-1557180295-76eee20ae8aa?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Gaming",
    img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
  },
];

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

// --- Componente principal ---
const HomePage = () => {
  const [hotSale, setHotSale] = useState([]);
  const [loadingHot, setLoadingHot] = useState(true);
  const [errorHot, setErrorHot] = useState(null);

  const [newProducts, setNewProducts] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [errorNew, setErrorNew] = useState(null);

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

      {/* HOT SALE */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-end justify-content-between mb-3">
            <h2 className="h3 m-0">🔥 Hot Sale</h2>
            <Link to="/products" className="link-secondary">Ver todo</Link>
          </div>

          {loadingHot && (
            <div className="text-center py-5 w-100">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="text-muted">Cargando productos en oferta...</p>
            </div>
          )}

          {!loadingHot && errorHot && (
            <div className="alert alert-danger" role="alert">
              {errorHot}
            </div>
          )}

          {!loadingHot && !errorHot && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {hotSale.length > 0 ? (
                hotSale.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <p className="text-center text-muted w-100">
                  No hay productos en oferta por el momento.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Banner simple */}
      <section className="py-4">
        <div className="container-fluid px-4">
          <div className="p-4 p-md-5 rounded-3 text-center text-md-start bg-warning-subtle">
            <div className="row align-items-center g-3">
              <div className="col-md">
                <h3 className="h4 mb-1">Envío gratis desde $50.000</h3>
                <p className="mb-0 text-muted">Y devoluciones fáciles. Probá sin miedo.</p>
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
            <h2 className="h3 m-0">🆕 Nuevos ingresos</h2>
            <Link to="/products" className="link-secondary">Ver todo</Link>
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

      {/* CATEGORÍAS DESTACADAS */}
      <section className="py-5 bg-light">
        <div className="container-fluid px-4">
          <h2 className="h3 mb-4">Categorías destacadas</h2>
          <div className="row g-4 row-cols-1 row-cols-md-3">
            {categories.map((c, i) => (
              <div className="col" key={i}>
                <div className="card border-0 shadow-sm h-100 overflow-hidden">
                  <div className="ratio ratio-21x9">
                    <img src={c.img} alt={c.title} className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title mb-1">{c.title}</h5>
                    <p className="card-text text-muted">
                      Explorá la categoría.
                    </p>
                    <Link to="/products" className="btn btn-outline-dark btn-sm">Ver productos</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER con imagen a la izquierda */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="rounded-4 p-4 p-md-5 bg-dark text-white">
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
                <p className="mb-0 text-white-50">Nada de spam, sólo gangas esporádicas.</p>
              </div>

              {/* Input y botón */}
              <div className="col-12 col-md-5">
                <form className="d-flex gap-2 flex-column flex-sm-row">
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="tu@email.com"
                  />
                  <button type="button" className="btn btn-success btn-lg">Unirme</button>
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
