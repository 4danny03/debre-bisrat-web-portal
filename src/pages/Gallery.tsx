
import React, { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GalleryImage: React.FC<{src: string; alt: string}> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
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

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  
  // Placeholder image URLs - replace with actual church images in production
  const churchImages = [
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
    "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb"
  ];
  
  const congregationImages = [
    "https://images.unsplash.com/photo-1551038247-3d9af20df552",
    "https://images.unsplash.com/photo-1466442929976-97f336a657be"
  ];
  
  const celebrationImages = [
    "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e",
    "https://images.unsplash.com/photo-1551038247-3d9af20df552"
  ];
  
  const communityImages = [
    "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625"
  ];

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Image className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">{t("gallery_title")}</h1>
            <p className="max-w-2xl mx-auto text-lg">{t("gallery_description")}</p>
          </div>
          
          <Tabs defaultValue="church" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="church">{t("church_building")}</TabsTrigger>
              <TabsTrigger value="congregation">{t("congregation")}</TabsTrigger>
              <TabsTrigger value="celebrations">{t("celebrations")}</TabsTrigger>
              <TabsTrigger value="community">{t("community_events")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="church" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {churchImages.map((src, i) => (
                  <Card key={`church-${i}`} className="overflow-hidden">
                    <CardContent className="p-2">
                      <GalleryImage src={src} alt={`Church Building ${i+1}`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="congregation" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {congregationImages.map((src, i) => (
                  <Card key={`congregation-${i}`} className="overflow-hidden">
                    <CardContent className="p-2">
                      <GalleryImage src={src} alt={`Congregation ${i+1}`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="celebrations" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {celebrationImages.map((src, i) => (
                  <Card key={`celebrations-${i}`} className="overflow-hidden">
                    <CardContent className="p-2">
                      <GalleryImage src={src} alt={`Celebration ${i+1}`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityImages.map((src, i) => (
                  <Card key={`community-${i}`} className="overflow-hidden">
                    <CardContent className="p-2">
                      <GalleryImage src={src} alt={`Community Event ${i+1}`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
