import React from 'react';  

const AboutUsPage = () => {
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Aplicamos el estilo de tarjeta con sombra y padding del ejemplo */}
                    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-3">
                        <div className="text-center mb-4">
                            {/* Usamos tipografía más grande y gruesa, como en el ejemplo */}
                            <h2 className="display-5 fw-bolder">Sobre Nosotros</h2>
                        </div>
                        <p className="lead text-center text-muted mb-0">
                            Somos un equipo de estudiantes apasionados por la tecnología y el desarrollo de software,
                            cursando la materia Aplicaciones Interactivas. Este E-commerce es el resultado de nuestro
                            esfuerzo y dedicación a lo largo del cuatrimestre.
                        </p>
                        
                        <hr className="my-4 my-md-5" />

                        <div className="row align-items-center">
                            {/* --- Columna de Información de Contacto (Tu estructura) --- */}
                            <div className="col-md-6">
                                <h4 className="fw-bold mb-4">Información de Contacto</h4>
                                <ul className="list-unstyled">
                                    <li className="mb-3 d-flex align-items-start">
                                        <strong className="me-2">📍</strong>
                                        <div>
                                            <span className="fw-medium">Ubicación:</span>
                                            <p className="text-muted mb-0">Av. Callao 1240, CABA</p>
                                        </div>
                                    </li>
                                    <li className="mb-3 d-flex align-items-start">
                                        <strong className="me-2">📞</strong>
                                        <div>
                                            <span className="fw-medium">Teléfono:</span>
                                            <p className="text-muted mb-0">+54 11 1234-5678</p>
                                        </div>
                                    </li>
                                    <li className="mb-3 d-flex align-items-start">
                                        <strong className="me-2">✉️</strong>
                                        <div>
                                            <span className="fw-medium">Email:</span>
                                            <p className="text-muted mb-0">lunchy@gmail.com</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* --- Columna del Mapa (Tu estructura) --- */}
                            <div className="col-md-6">
                                {/* Agregamos bordes redondeados y una sombra sutil al mapa */}
                                <div className="map-responsive rounded-3 shadow-sm overflow-hidden">
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.3886812750357!2d-58.39602092495908!3d-34.594331757001356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccabd958d6fa7%3A0x6080b2b2f9e812c3!2sAv.%20Callao%201240%2C%20C1023AAS%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1760466349680!5m2!1sen!2sar" 
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
        </div>
    );
};

export default AboutUsPage;