import { useState, useEffect } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import { api } from "@/integrations/supabase/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm]);

  const loadEvents = async () => {
    try {
      const data = await api.events.getEvents();
      setEvents(data || []);
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
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredEvents(filtered);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await api.events.createEvent({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        event_date: formData.get("event_date") as string,
        event_time: (formData.get("event_time") as string) || null,
        location: (formData.get("location") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
        is_featured: formData.get("is_featured") === "on",
      });

      toast({
        title: "Success",
        description: "Event added successfully",
      });
      loadEvents();
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await api.events.updateEvent(editingEvent.id, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        event_date: formData.get("event_date") as string,
        event_time: (formData.get("event_time") as string) || null,
        location: (formData.get("location") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
        is_featured: formData.get("is_featured") === "on",
      });

      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      loadEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.events.deleteEvent(id);
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Events Management
          </h1>
          <p className="text-gray-600">
            Manage church events and announcements
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-church-burgundy hover:bg-church-burgundy/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">Event Time</Label>
                  <Input id="event_time" name="event_time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_featured" name="is_featured" />
                <Label htmlFor="is_featured">Featured Event</Label>
              </div>
              <Button type="submit" className="w-full">
                Add Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              {events.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => e.is_featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                events.filter((e) => new Date(e.event_date) >= new Date())
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter((e) => new Date(e.event_date) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
          <CardDescription>Manage your church events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(event.event_date), "MMM d, yyyy")}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center text-sm mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.event_time}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.location ? (
                        <div className="flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not specified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{event.title}
                                "? This action cannot be undone.
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
              No events found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_title">Event Title</Label>
                  <Input
                    id="edit_title"
                    name="title"
                    defaultValue={editingEvent.title}
                    required
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_event_date">Event Date</Label>
                  <Input
                    id="edit_event_date"
                    name="event_date"
                    type="date"
                    defaultValue={editingEvent.event_date.split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_event_time">Event Time</Label>
                  <Input
                    id="edit_event_time"
                    name="event_time"
                    type="time"
                    defaultValue={editingEvent.event_time || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_location">Location</Label>
                <Input
                  id="edit_location"
                  name="location"
                  defaultValue={editingEvent.location || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image_url">Image URL</Label>
                <Input
                  id="edit_image_url"
                  name="image_url"
                  type="url"
                  defaultValue={editingEvent.image_url || ""}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_featured"
                  name="is_featured"
                  defaultChecked={editingEvent.is_featured}
                />
                <Label htmlFor="edit_is_featured">Featured Event</Label>
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
