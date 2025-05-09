
import React, { useState, useEffect } from 'react';

interface SlideProps {
  image: string;
  title: string;
  content: string;
}

interface ImageSliderProps {
  slides: SlideProps[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Auto advance slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="slider-content">
            <div className="slider-text">
              <h2 className="text-3xl font-serif mb-4 text-church-gold">{slide.title}</h2>
              <p className="text-lg">{slide.content}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="slider-nav">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={index === currentSlide ? 'active' : ''}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
