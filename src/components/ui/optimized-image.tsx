import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  lowQualitySrc,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
    };
  }, [src]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          className
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
      className={cn(
        "transition-opacity duration-300",
        !loaded && "filter blur-sm",
        className
      )}
      {...props}
    />
  );
}
