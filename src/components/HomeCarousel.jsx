import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';

function HomeCarousel() {
  return (
    <Carousel>
      <Carousel.Item>
        <Image
          src="src/assets/carouselImage1.avif"
          alt="Comida saludable y nutritiva"
          className="d-block w-100"
          style={{ maxHeight: '500px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h3>Las mejores comidas</h3>
          <p>Disfruta de una selección de las mejores comidas saludables y nutritivas.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <Image
          src="src/assets/carouselImage2.avif"
          alt="Comida saludable y nutritiva"
          className="d-block w-100"
          style={{ maxHeight: '500px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h3>Las mejores ensaladas</h3>
          <p>Disfruta de una selección de las mejores ensaladas frescas y saludables.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
         <Image
          src="src/assets/carouselImage3.avif"
          alt="Suplementos deportivos"
          className="d-block w-100"
          style={{ maxHeight: '500px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h3>Alcanza tus objetivos</h3>
          <p>
            Encuentra los mejores alimentos para mejorar tu rendimiento y alcanzar tus objetivos.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default HomeCarousel;