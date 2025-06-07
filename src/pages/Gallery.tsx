import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Image, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/integrations/supabase/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataRefresh } from "@/hooks/useDataRefresh";

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
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
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
    null,
  );
  const [galleryImages, setGalleryImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use actual images from public/images folder
  const fallbackImages = [
    {
      id: "gallery-1",
      title: language === "en" ? "Church Aerial View" : "የቤተክርስቲያን አየር ላይ እይታ",
      description:
        language === "en"
          ? "Beautiful aerial view of our church grounds"
          : "የቤተክርስቲያናችን ግቢ ውብ የአየር ላይ እይታ",
      image_url: "/images/gallery/church-aerial.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-2",
      title: language === "en" ? "Divine Liturgy Service" : "የቅዳሴ አገልግሎት",
      description:
        language === "en"
          ? "Sunday Divine Liturgy in progress"
          : "የእሁድ ቅዳሴ በሂደት ላይ",
      image_url: "/images/gallery/church-service.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-3",
      title: language === "en" ? "Timket Celebration" : "የጥምቀት በዓል",
      description:
        language === "en" ? "Annual Timket celebration" : "ዓመታዊ የጥምቀት በዓል",
      image_url: "/images/gallery/timket.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-4",
      title: language === "en" ? "Church Ceremony" : "የቤተክርስቲያን ሥርዓት",
      description:
        language === "en" ? "Special church ceremony" : "ልዩ የቤተክርስቲያን ሥርዓት",
      image_url: "/images/gallery/ceremony-1.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-5",
      title: language === "en" ? "Community Gathering" : "የማህበረሰብ ስብሰባ",
      description:
        language === "en"
          ? "Church community gathering"
          : "የቤተክርስቲያን ማህበረሰብ ስብሰባ",
      image_url: "/images/gallery/ceremony-2.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-6",
      title: language === "en" ? "Religious Ceremony" : "ሃይማኖታዊ ሥርዓት",
      description:
        language === "en"
          ? "Traditional religious ceremony"
          : "ባህላዊ ሃይማኖታዊ ሥርዓት",
      image_url: "/images/gallery/ceremony-3.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-7",
      title: language === "en" ? "Church Winter View" : "የቤተክርስቲያን የክረምት እይታ",
      description:
        language === "en"
          ? "Church building in winter"
          : "በክረምት ወቅት የቤተክርስቲያን ህንጻ",
      image_url: "/images/gallery/church-winter.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-8",
      title: language === "en" ? "Church Sanctuary" : "የቤተክርስቲያን መቅደስ",
      description:
        language === "en" ? "Interior view of the sanctuary" : "የመቅደሱ ውስጣዊ እይታ",
      image_url: "/images/gallery/church/sanctuary.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-9",
      title: language === "en" ? "Church Altar" : "የቤተክርስቲያን መሠዊያ",
      description: language === "en" ? "Sacred altar area" : "ቅዱስ መሠዊያ አካባቢ",
      image_url: "/images/gallery/church/altar.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-10",
      title: language === "en" ? "Timket Procession" : "የጥምቀት ሰልፍ",
      description:
        language === "en" ? "Traditional Timket procession" : "ባህላዊ የጥምቀት ሰልፍ",
      image_url: "/images/gallery/nd14_timket_09-3x1500-1.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-11",
      title: language === "en" ? "Church Community" : "የቤተክርስቲያን ማህበረሰብ",
      description:
        language === "en"
          ? "Church community members"
          : "የቤተክርስቲያን ማህበረሰብ አባላት",
      image_url: "/images/gallery/photo_2023-09-22_18-56-49.jpg",
      created_at: new Date().toISOString(),
    },
    {
      id: "gallery-12",
      title: language === "en" ? "Church Activities" : "የቤተክርስቲያን ስራዎች",
      description:
        language === "en"
          ? "Various church activities"
          : "የተለያዩ የቤተክርስቲያን ስራዎች",
      image_url: "/images/gallery/photo_2023-09-22_18-56-51.jpg",
      created_at: new Date().toISOString(),
    },
  ];

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const data = await api.gallery.getGalleryImages();

      if (data && data.length > 0) {
        setGalleryImages(data);
      } else {
        // Use fallback images if no database images
        setGalleryImages(fallbackImages);
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      // Use fallback images on error
      setGalleryImages(fallbackImages);
      setError(
        language === "en"
          ? "Failed to load some gallery images. Showing available images."
          : "አንዳንድ የጋለሪ ምስሎችን መጫን አልተቻለም። የሚገኙ ምስሎች ይታያሉ።",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, [language]);

  // Use enhanced data refresh hook
  const { manualRefresh, forceSyncData } = useDataRefresh(
    fetchGalleryImages,
    3 * 60 * 1000, // Refresh every 3 minutes
    [language],
    "gallery",
  );

  const handleManualRefresh = async () => {
    console.log("Manual refresh triggered for gallery");
    await manualRefresh();
    await forceSyncData();
  };

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
      (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length,
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
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="inline-flex items-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {language === "en" ? "Refresh Gallery" : "ጋለሪ አድስ"}
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              {error}
            </div>
          )}

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
