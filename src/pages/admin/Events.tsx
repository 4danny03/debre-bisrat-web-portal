import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Upload,
  Loader2,
  Users,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  category: string | null;
  max_attendees: number | null;
  registration_required: boolean;
  registration_deadline: string | null;
  featured: boolean;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  defaultImageUrl?: string | null;
  onRemove?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  defaultImageUrl,
  onRemove,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultImageUrl || null,
  );
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error } = await supabase.storage
        .from("events")
        .upload(filePath, file);

      if (error) throw error;

      setProgress(100);
      const { data: { publicUrl } } = supabase.storage
        .from("events")
        .getPublicUrl(filePath);

      onFileUpload(publicUrl);
      toast({
        title: "Upload successful",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    if (onRemove) onRemove();
  };

  useEffect(() => {
    if (defaultImageUrl) {
      setPreviewUrl(defaultImageUrl);
    }
  }, [defaultImageUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {previewUrl && (
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        )}
        <Button
          type="button"
          onClick={uploadFile}
          disabled={!file || uploading}
          variant="secondary"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </div>

      {uploading && <Progress value={progress} className="h-2" />}

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;

      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleAddEvent = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const user = (await supabase.auth.getUser()).data.user;

      try {
        const { error } = await supabase.from("events").insert([
          {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            event_date: formData.get("event_date") as string,
            event_time: formData.get("event_time") as string || null,
            end_date: formData.get("end_date") as string || null,
            end_time: formData.get("end_time") as string || null,
            location: formData.get("location") as string || null,
            category: formData.get("category") as string || null,
            max_attendees: formData.get("max_attendees") 
              ? parseInt(formData.get("max_attendees") as string) 
              : null,
            registration_required: formData.get("registration_required") === "on",
            registration_deadline: formData.get("registration_deadline") as string || null,
            featured: formData.get("featured") === "on",
            image_url: uploadedImageUrl,
            created_by: user?.id || null,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event added successfully",
        });
        loadEvents();
        setIsAddDialogOpen(false);
        setUploadedImageUrl(null);
        form.reset();
      } catch (error) {
        console.error("Error adding event:", error);
        toast({
          title: "Error",
          description: "Failed to add event",
          variant: "destructive",
        });
      }
    },
    [uploadedImageUrl, toast, loadEvents],
  );

  const handleUpdateEvent = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingEvent) return;
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
        const imageUrlToUse = uploadedImageUrl || currentImageUrl;

        const { error } = await supabase
          .from("events")
          .update({
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            event_date: formData.get("event_date") as string,
            event_time: formData.get("event_time") as string || null,
            end_date: formData.get("end_date") as string || null,
            end_time: formData.get("end_time") as string || null,
            location: formData.get("location") as string || null,
            category: formData.get("category") as string || null,
            max_attendees: formData.get("max_attendees") 
              ? parseInt(formData.get("max_attendees") as string) 
              : null,
            registration_required: formData.get("registration_required") === "on",
            registration_deadline: formData.get("registration_deadline") as string || null,
            featured: formData.get("featured") === "on",
            image_url: imageUrlToUse,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingEvent.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event updated successfully",
        });
        loadEvents();
        setEditingEvent(null);
        setUploadedImageUrl(null);
        setCurrentImageUrl(null);
      } catch (error) {
        console.error("Error updating event:", error);
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive",
        });
      }
    },
    [editingEvent, uploadedImageUrl, currentImageUrl, toast, loadEvents],
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      try {
        // First get the event to check for image
        const { data: eventData, error: fetchError } = await supabase
          .from("events")
          .select("image_url")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        // Delete image from storage if exists
        if (eventData?.image_url) {
          const urlParts = eventData.image_url.split("/");
          const filePath = urlParts.slice(urlParts.indexOf("events")).join("/");
          await supabase.storage.from("events").remove([filePath]);
        }

        // Delete event from database
        const { error: deleteError } = await supabase
          .from("events")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        loadEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
      }
    },
    [toast, loadEvents],
  );

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setCurrentImageUrl(event.image_url);
    setUploadedImageUrl(null);
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setCurrentImageUrl(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-church-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-gray-600">Manage all church events</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-screen">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title*</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Start Date*</Label>
                  <Input id="event_date" name="event_date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">Start Time</Label>
                  <Input id="event_time" name="event_time" type="time" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" name="end_time" type="time" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input 
                    id="max_attendees" 
                    name="max_attendees" 
                    type="number" 
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input 
                    id="registration_deadline" 
                    name="registration_deadline" 
                    type="date" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Image</Label>
                <FileUpload onFileUpload={setUploadedImageUrl} />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="registration_required" name="registration_required" />
                  <Label htmlFor="registration_required">Registration Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="featured" name="featured" />
                  <Label htmlFor="featured">Featured Event</Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Add Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => e.featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => new Date(e.event_date) >= new Date()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Require Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter((e) => e.registration_required).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events by title, description, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Events ({filteredEvents.length})</CardTitle>
          <CardDescription>Manage your church events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {event.image_url ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {event.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(event.event_date), "MMM d, yyyy")}
                        {event.event_time && (
                          <>
                            <Clock className="w-4 h-4 ml-3 mr-2" />
                            {event.event_time.substring(0, 5)}
                          </>
                        )}
                      </div>
                      {event.end_date && (
                        <div className="text-sm mt-1">
                          Ends: {format(new Date(event.end_date), "MMM d, yyyy")}
                          {event.end_time && ` at ${event.end_time.substring(0, 5)}`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.location || "-"}
                    </TableCell>
                    <TableCell>
                      {event.category ? (
                        <Badge variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {event.category}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {event.registration_required ? (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.max_attendees ? `${event.max_attendees} max` : "Required"}
                        </div>
                      ) : (
                        "Not required"
                      )}
                    </TableCell>
                    <TableCell>
                      {event.featured ? (
                        <Badge variant="secondary">Featured</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{event.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-screen">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_title">Event Title*</Label>
                  <Input
                    id="edit_title"
                    name="title"
                    defaultValue={editingEvent.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    name="description"
                    defaultValue={editingEvent.description || ""}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_event_date">Start Date*</Label>
                  <Input
                    id="edit_event_date"
                    name="event_date"
                    type="date"
                    defaultValue={editingEvent.event_date.split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_event_time">Start Time</Label>
                  <Input
                    id="edit_event_time"
                    name="event_time"
                    type="time"
                    defaultValue={editingEvent.event_time || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_end_date">End Date</Label>
                  <Input
                    id="edit_end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editingEvent.end_date?.split("T")[0] || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_end_time">End Time</Label>
                  <Input
                    id="edit_end_time"
                    name="end_time"
                    type="time"
                    defaultValue={editingEvent.end_time || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_location">Location</Label>
                  <Input
                    id="edit_location"
                    name="location"
                    defaultValue={editingEvent.location || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_category">Category</Label>
                  <Input
                    id="edit_category"
                    name="category"
                    defaultValue={editingEvent.category || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_max_attendees">Max Attendees</Label>
                  <Input
                    id="edit_max_attendees"
                    name="max_attendees"
                    type="number"
                    min="0"
                    defaultValue={editingEvent.max_attendees?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_registration_deadline">Registration Deadline</Label>
                  <Input
                    id="edit_registration_deadline"
                    name="registration_deadline"
                    type="date"
                    defaultValue={editingEvent.registration_deadline?.split("T")[0] || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Image</Label>
                <FileUpload
                  onFileUpload={setUploadedImageUrl}
                  defaultImageUrl={currentImageUrl}
                  onRemove={handleRemoveImage}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_registration_required"
                    name="registration_required"
                    defaultChecked={editingEvent.registration_required}
                  />
                  <Label htmlFor="edit_registration_required">Registration Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_featured"
                    name="featured"
                    defaultChecked={editingEvent.featured}
                  />
                  <Label htmlFor="edit_featured">Featured Event</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Update Event
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEvent(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}