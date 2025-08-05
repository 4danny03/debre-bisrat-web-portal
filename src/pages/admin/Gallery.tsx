import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // useCallback for stable function references
  const loadImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setImages(data || []);
    } catch (error) {
      console.error("Error loading images:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Fix: Remove stray bracket and ensure correct function closure
  const handleUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      if (!file) return;
      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `gallery/${Date.now()}.${fileExt}`;
        // Upload the file to the 'images' bucket
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath);
        const publicUrl = publicUrlData?.publicUrl;
        if (!publicUrl) throw new Error("Failed to get public URL for image");

        // Insert the image record into the gallery table
        const { error: dbError } = await supabase.from("gallery").insert([
          {
            title,
            description,
            image_url: publicUrl,
          },
        ]);
        if (dbError) throw dbError;
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
        loadImages();
        form.reset();
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [toast, loadImages],
  );

  const handleDelete = useCallback(
    async (image: GalleryImage) => {
      try {
        // Delete from storage
        const urlParts = image.image_url.split("/");
        const filePath = `gallery/${urlParts[urlParts.length - 1]}`;
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("images")
            .remove([filePath]);

          if (storageError)
            console.warn("Storage deletion failed:", storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from("gallery")
          .delete()
          .eq("id", image.id);

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
        loadImages();
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive",
        });
      }
    },
    [toast, loadImages],
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <ImagePlus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Input type="file" name="file" accept="image/*" required />
              </div>
              <div>
                <Input name="title" placeholder="Image Title" required />
              </div>
              <div>
                <Input name="description" placeholder="Image Description" />
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="object-cover rounded-lg w-full h-48"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-500">{image.description}</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
