import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client"; // <-- Supabase client import

interface GalleryImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ src, alt, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Image className="h-10 w-10 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
};

interface ImageModalProps {
  image: {
    src: string;
    title: string;
    description: string;
    onNext: () => void;
    onPrevious: () => void;
  } | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-church-gold transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <button
          onClick={image.onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-church-gold transition-colors p-2"
          aria-label="Previous image"
        >
          <ChevronLeft size={40} />
        </button>
        <button
          onClick={image.onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-church-gold transition-colors p-2"
          aria-label="Next image"
        >
          <ChevronRight size={40} />
        </button>
        <img
          src={image.src}
          alt={image.title}
          className="max-h-[90vh] w-auto max-w-full object-contain"
        />
      </div>
    </div>
  );
};

interface GalleryImageData {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

const Gallery: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [galleryImages, setGalleryImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback images for when DB fetch fails or returns empty
  const baseUrl = import.meta.env.BASE_URL;
  const fallbackImages = React.useMemo(
    () => [
      // Your fallback images here, same as before...
      {
        id: "gallery-1",
        title:
          language === "en" ? "Church Aerial View" : "የቤተክርስቲያን አየር ላይ እይታ",
        description:
          language === "en"
            ? "Beautiful aerial view of our church grounds"
            : "የቤተክርስቲያናችን ግቢ ውብ የአየር ላይ እይታ",
        image_url: baseUrl + "images/gallery/church-aerial.jpg",
        created_at: new Date().toISOString(),
      },
      // ... add others as needed ...
    ],
    [language, baseUrl]
  );

  const fetchGalleryImages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setGalleryImages(data);
      } else {
        setGalleryImages(fallbackImages);
      }
    } catch (err) {
      console.error("Failed to fetch gallery images", err);
      setGalleryImages(fallbackImages);
    } finally {
      setLoading(false);
    }
  }, [fallbackImages]);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages, language]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
  };

  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const selectedImage =
    selectedImageIndex !== null
      ? {
          src: galleryImages[selectedImageIndex].image_url,
          title: galleryImages[selectedImageIndex].title,
          description: galleryImages[selectedImageIndex].description || "",
          onNext: handleNext,
          onPrevious: handlePrevious,
        }
      : null;

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Image className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {t("gallery_title")}
            </h1>
            <p className="max-w-2xl mx-auto text-lg mb-4">
              {t("gallery_description")}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-square w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, i) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <GalleryImage
                        src={image.image_url}
                        alt={image.title}
                        onClick={() => handleImageClick(i)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h3 className="text-white text-sm font-medium truncate">
                          {image.title}
                        </h3>
                        {image.description && (
                          <p className="text-white/80 text-xs truncate">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImageIndex(null)}
      />
    </Layout>
  );
};

export default Gallery;
