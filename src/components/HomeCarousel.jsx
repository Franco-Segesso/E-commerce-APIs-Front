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
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
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
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
         <Image
          src="src/assets/carouselImage2.avif"
          alt="Suplementos deportivos"
          className="d-block w-100"
          style={{ maxHeight: '500px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default HomeCarousel;