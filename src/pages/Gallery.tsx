import React, { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
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

const Gallery: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const galleryImages = [
    {
      src: "/images/gallery/church-aerial.jpg",
      title: language === 'en' ? "Church Building" : "ቤተክርስቲያን",
      description: ""
    },
    {
      src: "/images/gallery/church-service.jpg",
      title: language === 'en' ? "Church Service" : "የቤተክርስቲያን አገልግሎት",
      description: ""
    },
    {
      src: "/images/gallery/timket.jpg",
      title: language === 'en' ? "Timket" : "ጥምቀት",
      description: ""
    },
    {
      src: "/images/gallery/ceremony-1.jpg",
      title: language === 'en' ? "Ceremony" : "ስርዓተ ክብር",
      description: ""
    },
    {
      src: "/images/gallery/ceremony-2.jpg",
      title: language === 'en' ? "Ceremony" : "ስርዓተ ክብር",
      description: ""
    },
    {
      src: "/images/gallery/ceremony-3.jpg",
      title: language === 'en' ? "Ceremony" : "ስርዓተ ክብር",
      description: ""
    }
  ];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
  };

  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const selectedImage = selectedImageIndex !== null ? {
    ...galleryImages[selectedImageIndex],
    onNext: handleNext,
    onPrevious: handlePrevious,
  } : null;

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Image className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">{t("gallery_title")}</h1>
            <p className="max-w-2xl mx-auto text-lg">{t("gallery_description")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <GalleryImage 
                      src={image.src} 
                      alt={image.title}
                      onClick={() => handleImageClick(i)} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
