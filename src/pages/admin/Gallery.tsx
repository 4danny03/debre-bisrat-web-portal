import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ImagePlus, Trash2, Edit } from 'lucide-react';
import { useFirebase } from '@/integrations/firebase/context';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

export default function GalleryManager() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ id: string; url: string; title: string }>>([]);
  const { toast } = useToast();
  const { storage, db } = useFirebase();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const loadedImages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as { url: string; title: string }
      }));
      setImages(loadedImages);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Upload the file
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Save image metadata to database
      // Add to Firestore
      await addDoc(collection(db, 'gallery'), {
        url: downloadUrl,
        title: file.name,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      loadImages(); // Refresh the gallery
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error uploading image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', id));

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      loadImages(); // Refresh the gallery
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error deleting image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ImagePlus className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={image.url}
                  alt={image.title}
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{image.title}</span>
                <div className="space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
