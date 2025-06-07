import { useState, useEffect, type FC } from "react";

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
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>(
    {},
  );

  useEffect(() => {
    if (slides.length === 0) return;

    // Auto advance slides every 6 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
    if (index === 0) {
      setIsLoading(false);
      setError(null);
    }
  };

  const handleImageError = (index: number) => {
    console.error(`Failed to load image at index ${index}`);
    setImageLoaded((prev) => ({ ...prev, [index]: false }));
    if (index === 0) {
      setIsLoading(false);
      setError("Failed to load image");
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-church-burgundy/20 to-church-gold/20 flex items-center justify-center">
        <p className="text-church-burgundy text-lg">No slides available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-2xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          {!imageLoaded[index] && index === currentSlide && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-church-burgundy/10 to-church-gold/10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-gold border-t-transparent"></div>
            </div>
          )}
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              imageLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
            loading={index === 0 ? "eager" : "lazy"}
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 md:p-8">
            <div className="text-center max-w-4xl mx-auto backdrop-blur-sm bg-gradient-to-r from-church-burgundy/80 to-church-burgundy/60 rounded-xl p-6 md:p-8 border border-church-gold/30">
              <h2
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 text-church-gold"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                {slide.title}
              </h2>
              <p
                className="text-base md:text-lg lg:text-xl xl:text-2xl text-center leading-relaxed font-medium text-white"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
              >
                {slide.content}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows - more subtle design */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Previous image"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Next image"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots indicator - blended design */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-church-gold scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/70 hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar - more subtle */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20">
        <div
          className="h-full bg-church-gold transition-all duration-300 ease-linear"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ImageSlider;
