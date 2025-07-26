import React, { useState, useEffect } from "react";
import { imageProcessor } from "@/lib/image/ImageProcessor";

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onError?: () => void;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  ariaLabel?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = import.meta.env.BASE_URL + "images/gallery/church-service.jpg",
  alt,
  className = "",
  onError,
  width,
  height,
  quality = 80,
  priority = false,
  ariaLabel,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);

  // Process image with our image processor
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const processImage = async () => {
      try {
        const processed = await imageProcessor.loadImage(src, {
          width,
          height,
          quality,
        });

        if (isMounted) {
          setOptimizedSrc(processed);
          setImgSrc(processed);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Image processing error:", err);
        if (isMounted) {
          setOptimizedSrc(null);
          setIsLoading(false);
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
    };
  }, [src, width, height, quality]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      // Try to optimize the fallback image as well
      imageProcessor
        .loadImage(fallbackSrc, { width, height, quality })
        .then((optimizedFallback) => {
          setImgSrc(optimizedFallback);
          setHasError(true);
          onError?.();
        })
        .catch(() => {
          // If optimization fails, use the original fallback
          setImgSrc(fallbackSrc);
          setHasError(true);
          onError?.();
        });
    }
  };

  // Preload next images if this is a priority image
  useEffect(() => {
    if (priority && src) {
      // Find nearby images with the same pattern and preload them
      const srcPattern = src.replace(/\d+(\.\w+)$/, "");
      const srcExtension = src.match(/(\.\w+)$/)?.[1] || "";

      // Preload next 2 images if they follow a numeric pattern
      const match = src.match(/(\d+)(\.\w+)$/);
      if (match) {
        const currentNum = parseInt(match[1]);
        for (let i = 1; i <= 2; i++) {
          const nextSrc = `${srcPattern}${currentNum + i}${srcExtension}`;
          imageProcessor.preloadImage(nextSrc, { width, height, quality });
        }
      }
    }
  }, [priority, src, width, height, quality]);

  return (
    <div className="relative" role="region" aria-label={ariaLabel || alt}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse" aria-live="polite" role="status">
          <span className="sr-only">Loading image...</span>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        width={width}
        height={height}
        onLoad={() => setIsLoading(false)}
        aria-label={ariaLabel || alt}
      />
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80" aria-live="assertive" role="status">
          <span className="text-red-600 text-sm font-medium">Image failed to load. Showing fallback.</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
