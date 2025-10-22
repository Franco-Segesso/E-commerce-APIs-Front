import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';

function HomeCarousel() { // Componente del carrusel de la página principal
  return (
    <Carousel>
      <Carousel.Item className="hero-slide">
        <Image
          src="src/assets/carouselImage1.avif"
          alt="Comida saludable y nutritiva"
          className="d-block w-100 hero-img"
        />
        <Carousel.Caption>
          <h3>Comé rico, viví ligero</h3>
          <p>Disfruta de una selección de las mejores comidas saludables y nutritivas.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item className="hero-slide">
        <Image
          src="src/assets/carouselImage2.avif"
          alt="Comida saludable y nutritiva"
          className="d-block w-100 hero-img"
        />
        <Carousel.Caption>
          <h3>Energía que se cocina</h3>
          <p>Platos balanceados y sabrosos para todos los días.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item className="hero-slide">
        <Image
          src="src/assets/photo6.jpg"
          alt="Suplementos deportivos"
          className="d-block w-100 hero-img"
        />
        <Carousel.Caption>
          <h3>Alcanza tus objetivos</h3>
          <p>
            Más proteína, mejor rendimiento. Sentí la diferencia.
          </p>
        </Carousel.Caption>
      </Carousel.Item>

    </Carousel>
  );
}

export default HomeCarousel;