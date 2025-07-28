import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { imageProcessor } from "@/lib/image/ImageProcessor";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  blur?: number;
  grayscale?: boolean;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  lowQualitySrc,
  width,
  height,
  quality,
  format,
  blur,
  grayscale,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);

  // Process image with our image processor
  useEffect(() => {
    let isMounted = true;

    const processImage = async () => {
      try {
        const options = { width, height, quality, format, blur, grayscale };
        const processed = await imageProcessor.loadImage(src, options);

        if (isMounted) {
          setOptimizedSrc(processed);
          if (!lowQualitySrc) {
            setCurrentSrc(processed);
          }
        }
      } catch (err) {
        console.error("Image processing error:", err);
        if (isMounted) {
          setOptimizedSrc(null);
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
    };
  }, [src, width, height, quality, format, blur, grayscale]);

  // Handle image loading
  useEffect(() => {
    if (!optimizedSrc) return;

    const img = new Image();
    img.src = optimizedSrc;

    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setLoaded(true);
    };

    img.onerror = () => {
      console.warn("Failed to load optimized image, falling back to original");
      setCurrentSrc(src);

      // Try loading the original image
      const fallbackImg = new Image();
      fallbackImg.src = src;

      fallbackImg.onload = () => {
        setLoaded(true);
      };

      fallbackImg.onerror = () => {
        setError(true);
      };
    };
  }, [optimizedSrc, src]);

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
          imageProcessor.preloadImage(nextSrc, {
            width,
            height,
            quality,
            format,
          });
        }
      }
    }
  }, [priority, src, width, height, quality, format]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          className,
        )}
      >
        <span className="text-sm text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      className={cn(
        "transition-opacity duration-300",
        !loaded && "filter blur-sm",
        className,
      )}
      {...props}
    />
  );
}
