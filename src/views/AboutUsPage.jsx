import React from 'react';

const AboutUsPage = () => {
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card p-4 p-md-5 shadow-sm">
                        <div className="text-center mb-4">
                            <h2>Sobre Nosotros</h2>
                        </div>
                        <p className="lead text-center">
                            Somos un equipo de estudiantes apasionados por la tecnología y el desarrollo de software,
                            cursando la materia Aplicaciones Interactivas. Este E-commerce es el resultado de nuestro
                            esfuerzo y dedicación a lo largo del cuatrimestre.
                        </p>
                        
                        <hr className="my-4" />

                        <div className="row align-items-center">
                            {/* Columna de Información de Contacto */}
                            <div className="col-md-6">
                                <h4 className="mb-3">Información de Contacto</h4>
                                <ul className="list-unstyled">
                                    <li className="mb-3">
                                        <strong>📍 Ubicación:</strong>
                                        <p className="text-muted mb-0">Av. Callao 1240, Ciudad Autónoma de Buenos Aires</p>
                                    </li>
                                    <li className="mb-3">
                                        <strong>📞 Teléfono:</strong>
                                        <p className="text-muted mb-0">+54 11 1234-5678</p>
                                    </li>
                                    <li className="mb-3">
                                        <strong>✉️ Email:</strong>
                                        <p className="text-muted mb-0">contacto@mitienda.com</p>
                                    </li>
                                </ul>
                            </div>

                            {/* Columna del Mapa */}
                            <div className="col-md-6">
                                <div className="map-responsive">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.3886812750357!2d-58.39602092495908!3d-34.594331757001356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccabd958d6fa7%3A0x6080b2b2f9e812c3!2sAv.%20Callao%201240%2C%20C1023AAS%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1760466349680!5m2!1sen!2sar" 
                                    width="100%" 
                                    height="300" 
                                    style={{border:0}} 
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