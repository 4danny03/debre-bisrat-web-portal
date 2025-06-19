import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageSlider({
  images,
  autoPlay = false,
  interval = 3000,
}: ImageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(
    new Array(images.length).fill(false),
  );

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const autoAdvance = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 7000); // 7 seconds for better readability

    return () => clearInterval(autoAdvance);
  }, [autoPlay, images.length]);

  // Preload next image for better performance
  useEffect(() => {
    if (images.length > 0) {
      const nextIndex = (currentSlide + 1) % images.length;
      const img = new Image();
      img.src = images[nextIndex];
    }
  }, [currentSlide, images]);

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  const handleImageError = (index: number) => {
    console.warn(`Image at index ${index} failed to load.`);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? images.length - 1 : currentSlide - 1);
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide === images.length - 1 ? 0 : currentSlide + 1);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        No images available
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden rounded-2xl shadow-2xl border border-church-gold/20">
      <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy/5 via-transparent to-church-gold/5 pointer-events-none z-10"></div>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1200 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-110 pointer-events-none"
          }`}
        >
          {!imageLoaded[index] && index === currentSlide && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-church-burgundy/10 to-church-gold/10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-gold border-t-transparent"></div>
            </div>
          )}
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              imageLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
            loading={index === 0 ? "eager" : "lazy"}
          />
          {/* Reduced gradient overlay for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy/20 via-transparent to-church-gold/15"></div>

          {/* Content overlay with reduced opacity for better background visibility */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 md:p-8 z-20">
            <div className="text-center max-w-5xl mx-auto backdrop-blur-md bg-gradient-to-br from-church-burgundy/35 via-church-burgundy/25 to-church-burgundy/40 rounded-2xl p-8 md:p-10 border border-church-gold/40 shadow-2xl animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-br from-church-gold/8 via-transparent to-church-gold/4 rounded-2xl"></div>
              <div className="relative z-10">
                <h2
                  className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 text-church-gold font-serif"
                  style={{
                    textShadow:
                      "4px 4px 8px rgba(0,0,0,0.95), 2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {slide.title}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-church-gold to-transparent mx-auto mb-4 md:mb-6"></div>
                <p
                  className="text-base md:text-lg lg:text-xl xl:text-2xl text-center leading-relaxed font-medium text-white/98"
                  style={{
                    textShadow:
                      "3px 3px 6px rgba(0,0,0,0.9), 1px 1px 3px rgba(0,0,0,0.7)",
                  }}
                >
                  {slide.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-church-burgundy/80 hover:bg-church-burgundy/90 text-church-gold p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-church-gold/30 shadow-lg z-30"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-church-burgundy/80 hover:bg-church-burgundy/90 text-church-gold p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md border border-church-gold/30 shadow-lg z-30"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-400 ${
              index === currentSlide
                ? "w-4 h-4 md:w-5 md:h-5"
                : "w-3 h-3 md:w-4 md:h-4 hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`w-full h-full rounded-full transition-all duration-400 ${
                index === currentSlide
                  ? "bg-church-gold shadow-lg animate-pulse-glow"
                  : "bg-white/60 hover:bg-white/80 backdrop-blur-sm"
              }`}
            />
            {index === currentSlide && (
              <div className="absolute inset-0 rounded-full border-2 border-church-gold/50 animate-ping"></div>
            )}
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black/30 via-black/20 to-black/30">
        <div
          className="h-full bg-gradient-to-r from-church-gold via-church-gold/80 to-church-gold transition-all duration-500 ease-out shadow-sm"
          style={{
            width: `${((currentSlide + 1) / images.length) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
