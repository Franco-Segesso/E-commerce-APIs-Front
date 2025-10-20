import React from 'react';

const AboutUsPage = () => {
    return (
        <div className="about-us-wrapper">
            {/* INICIO DE LA SECCIÓN DE ONDA (Estructura de 3 partes replicada) */}
            <section className="wave-wrap">
                
                {/* 1. Onda superior (AHORA MÁS GRANDE con viewBox y path ajustados) */}
                <div className="wave-top wave-top-about">
                    {/* viewBox: Ajustado a 1440 de ancho y 150 de alto (antes 100)
                        path d: Modificado para una curva más pronunciada */}
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> {/* Aumentado el height del viewBox */}
                        <path
                            d="M0,96 C240,128 480,32 720,64 C960,96 1200,96 1440,64 L1440,150 L0,150 Z" /* Ajustado para una curva más alta */
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>

                {/* 2. Cuerpo Verde (Contiene el Título y Badges, usa el CSS de ajuste) */}
                <div className="wave-body about-wave-body text-center" style={{ backgroundColor: '#dcf8eaff' }}>
                    {/* Agregamos un translateY para subir el contenido dentro de la onda más grande */}
                    <div style={{ transform: 'translateY(-2rem)' }}> 
                        <h1 className="display-4 fw-bold text-dark mb-3">Sobre Nosotros</h1>
                        <p className="lead text-dark-emphasis mx-auto" style={{ maxWidth: '800px' }}>
                            Donde la tecnología se encuentra con el bienestar, creando una experiencia tan fresca como nuestra comida.
                        </p>
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <span className="badge rounded-pill p-3 fs-6" style={{ backgroundColor: '#4F9D60', color: 'white' }}>#Lunchy</span>
                            <span className="badge rounded-pill p-3 fs-6" style={{ backgroundColor: '#8BC34A', color: 'white' }}>#AplicacionesInteractivas</span>
                            <span className="badge rounded-pill p-3 fs-6" style={{ backgroundColor: '#6ACCCF', color: 'white' }}>#DesarrolloWeb</span>
                        </div>
                    </div>
                </div>

                {/* 3. Onda inferior (AHORA MÁS GRANDE con viewBox y path ajustados) */}
                <div className="wave-bottom wave-bottom-about">
                    {/* viewBox: Ajustado a 1440 de ancho y 150 de alto (antes 100)
                        path d: Modificado para una curva más pronunciada */}
                    <svg viewBox="0 0 1440 150" preserveAspectRatio="none"> {/* Aumentado el height del viewBox */}
                        <path
                            d="M0,0 L0,0 C240,64 480,150 720,118 C960,86 1200,86 1440,118 L1440,150 L0,150 Z" /* Ajustado para una curva más alta */
                            fill="#dcf8eaff"
                        />
                    </svg>
                </div>
            </section>
            {/* FIN DE LA SECCIÓN DE ONDA */}

            {/* 4. CONTENIDO PRINCIPAL: La tarjeta BLANCA que se superpone a la onda. */}
            <div className="container about-card-superposition mb-5"> 
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Tarjeta Principal */}
                        <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4 bg-white">
                            
                            {/* --- BLOQUE 1: NUESTRA HISTORIA / EQUIPO --- */}
                            <div className="row g-5 align-items-center mb-5">
                                <div className="col-md-12 text-center">
                                    <h2 className="fw-bolder text-info mb-3">Historia: El Equipo Detrás de Lunchy</h2>
                                    <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
                                        Somos un equipo de **estudiantes apasionados por la tecnología y el desarrollo de software**, cursando la materia **Aplicaciones Interactivas**. Este E-commerce es el resultado de nuestro esfuerzo y dedicación a lo largo del cuatrimestre, aplicando principios de diseño y programación para crear una plataforma tan robusta como intuitiva.
                                    </p>
                                </div>
                            </div>

                            <hr className="my-5 border-success opacity-25" />

                            {/* --- BLOQUE 2: CONTACTO --- */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bolder text-dark mb-4">Conectemos</h2>
                            </div>
                            <div className="row justify-content-center g-4 mb-5">
                                <div className="col-md-4">
                                    <div className="card h-100 p-4 shadow-sm rounded-4 border-0 text-center bg-light">
                                        <div className="fs-2 text-success mb-3">📍</div>
                                        <h5 className="fw-bold text-dark">Ubicación</h5>
                                        <p className="text-muted mb-0">Av. Callao 1240, CABA</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card h-100 p-4 shadow-sm rounded-4 border-0 text-center bg-light">
                                        <div className="fs-2 text-info mb-3">📞</div>
                                        <h5 className="fw-bold text-dark">Teléfono</h5>
                                        <p className="text-muted mb-0">+54 11 1234-5678</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card h-100 p-4 shadow-sm rounded-4 border-0 text-center bg-light">
                                        <div className="fs-2 text-warning mb-3">✉️</div>
                                        <h5 className="fw-bold text-dark">Email</h5>
                                        <p className="text-muted mb-0">lunchycorp@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mapa */}
                            <div className="map-responsive rounded-4 shadow-sm overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.1485600649733!2d-58.3965578!3d-34.6001099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac813580517%3A0x94f1c3f25c276332!2sAv.%20Callao%201240%2C%20C1024AAZ%20CABA!5e0!3m2!1ses-419!2sar!4v1701389073105!5m2!1ses-419!2sar"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;