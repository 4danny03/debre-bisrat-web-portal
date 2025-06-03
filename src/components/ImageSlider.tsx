import { useState, useEffect, type FC } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const nextSlide = () => {
    setCurrentSlide((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <h2 className="text-4xl font-bold mb-4 text-center">{slide.title}</h2>
            <p className="text-xl text-center max-w-2xl">{slide.content}</p>
          </div>
        </div>
      ))}
      
      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        →
      </button>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
