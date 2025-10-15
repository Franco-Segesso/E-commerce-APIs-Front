// src/views/HomePage.jsx
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useEffect, useState } from "react";

const heroBg = "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=1600&auto=format&fit=crop";
  



const newProducts = [
  { id: 5, name: "Cámara Action 4K", price: 219.99, discount: 0, imageBase64: "" },
  { id: 6, name: "Barra de Sonido", price: 149.99, discount: 0, imageBase64: "" },
  { id: 7, name: "Router Wi-Fi 6", price: 119.99, discount: 0, imageBase64: "" },
  { id: 8, name: "Monitor 27'' 144Hz", price: 299.99, discount: 0.1, imageBase64: "" },
];

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

async function productos_con_descuento(params) {
    const res = await fetch("http://localhost:4002/products/discounted");
    if (!res.ok) throw new Error("Error al cargar productos en oferta");
    const data = await res.json();
    return data.content;
}



const HomePage = () => {
    const [hotSale, setHotSale] = useState([]);
    const [loadingHot, setLoadingHot] = useState(true);
    const [errorHot, setErrorHot] = useState(null);

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


  return (
    <div className="homepage">

      {/* HERO*/}
      <section className="position-relative w-100 min-vh-50 d-flex align-items-center">
        {/* imagen de fondo */}
        <img
          src={heroBg}
          alt="Hero"
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
        />
        {/* overlay oscuro */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
        {/* contenido */}
        <div className="container position-relative text-white py-5">
          <div className="col-12 col-md-8 col-lg-6">
            <h1 className="display-5 fw-bold">Todo lo que querés, sin vueltas</h1>
            <p className="lead mb-4">
              Ofertas relámpago, lanzamientos frescos y envíos rápidos. El carrito no muerde.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/products" className="btn btn-success btn-lg">Ver productos</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOT SALE */}
        <section className="py-5">
        <div className="container-fluid px-4">
            <div className="d-flex align-items-end justify-content-between mb-3">
            <h2 className="h3 m-0">🔥 Hot Sale</h2>
            <Link to="/products" className="link-secondary">Ver todo</Link>
            </div>

            {/* ESTADO: Cargando */}
            {loadingHot && (
            <div className="text-center py-5 w-100">
                <div className="spinner-border text-success mb-3" role="status"></div>
                <p className="text-muted">Cargando productos en oferta...</p>
            </div>
            )}

            {/* ESTADO: Error */}
            {!loadingHot && errorHot && (
            <div className="alert alert-danger" role="alert">
                {errorHot}
            </div>
            )}

            {/* ESTADO: Éxito */}
            {!loadingHot && !errorHot && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {hotSale.length > 0 ? (
                hotSale.map(p => <ProductCard key={p.id} product={p} />)
                ) : (
                <p className="text-center text-muted w-100">No hay productos en oferta por el momento.</p>
                )}
            </div>
            )}
        </div>
        </section>


      {/* BANNER (sin gradientes, usando colores utilitarios) */}
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
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {newProducts.map(p => (<ProductCard key={p.id} product={p} />))}
          </div>
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
                      Lo mejor curado para vos. Explorá la categoría.
                    </p>
                    <Link to="/products" className="btn btn-outline-dark btn-sm">Ver productos</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-5">
        <div className="container-fluid px-4">
          <div className="rounded-3 p-4 p-md-5 bg-dark text-white">
            <div className="row g-3 align-items-center">
              <div className="col-lg-6">
                <h3 className="h4">Suscribite y recibí ofertas secretas</h3>
                <p className="mb-0 text-white-50">Nada de spam, sólo gangas esporádicas.</p>
              </div>
              <div className="col-lg-6">
                <form className="d-flex gap-2 flex-column flex-sm-row">
                  <input type="email" className="form-control form-control-lg" placeholder="tu@email.com" />
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
