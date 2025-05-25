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
  Play,
  Pause,
  Upload,
  Star,
  Calendar,
  User,
  Book,
  Music,
} from "lucide-react";
import { api } from "@/integrations/supabase/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  scripture_reference: string | null;
  audio_url: string | null;
  preacher: string | null;
  sermon_date: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSermons();
  }, []);

  useEffect(() => {
    filterSermons();
  }, [sermons, searchTerm]);

  const loadSermons = async () => {
    try {
      const data = await api.sermons.getSermons();
      setSermons(data || []);
    } catch (error) {
      console.error("Error loading sermons:", error);
      toast({
        title: "Error",
        description: "Failed to load sermons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSermons = () => {
    let filtered = sermons;

    if (searchTerm) {
      filtered = filtered.filter(
        (sermon) =>
          sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.preacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.scripture_reference
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredSermons(filtered);
  };

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await api.sermons.createSermon({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        scripture_reference: formData.get("scripture_reference") as string,
        preacher: formData.get("preacher") as string,
        sermon_date: formData.get("sermon_date") as string,
        audio_url: formData.get("audio_url") as string,
        is_featured: formData.get("is_featured") === "on",
      });

      toast({
        title: "Success",
        description: "Sermon added successfully",
      });
      loadSermons();
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding sermon:", error);
      toast({
        title: "Error",
        description: "Failed to add sermon",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSermon) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await api.sermons.updateSermon(editingSermon.id, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        scripture_reference: formData.get("scripture_reference") as string,
        preacher: formData.get("preacher") as string,
        sermon_date: formData.get("sermon_date") as string,
        audio_url: formData.get("audio_url") as string,
        is_featured: formData.get("is_featured") === "on",
      });

      toast({
        title: "Success",
        description: "Sermon updated successfully",
      });
      loadSermons();
      setEditingSermon(null);
    } catch (error) {
      console.error("Error updating sermon:", error);
      toast({
        title: "Error",
        description: "Failed to update sermon",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSermon = async (id: string) => {
    try {
      await api.sermons.deleteSermon(id);
      toast({
        title: "Success",
        description: "Sermon deleted successfully",
      });
      loadSermons();
    } catch (error) {
      console.error("Error deleting sermon:", error);
      toast({
        title: "Error",
        description: "Failed to delete sermon",
        variant: "destructive",
      });
    }
  };

  const toggleAudio = (sermonId: string, audioUrl: string) => {
    if (playingAudio === sermonId) {
      // Pause current audio
      if (audioElements[sermonId]) {
        audioElements[sermonId].pause();
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
      }

      // Create or get audio element
      let audio = audioElements[sermonId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setPlayingAudio(null));
        setAudioElements((prev) => ({ ...prev, [sermonId]: audio }));
      }

      // Play new audio
      audio.play();
      setPlayingAudio(sermonId);
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
            Sermons Management
          </h1>
          <p className="text-gray-600">
            Manage church sermons and audio recordings
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-church-burgundy hover:bg-church-burgundy/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Sermon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSermon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preacher">Preacher</Label>
                  <Input id="preacher" name="preacher" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scripture_reference">
                    Scripture Reference
                  </Label>
                  <Input
                    id="scripture_reference"
                    name="scripture_reference"
                    placeholder="e.g., John 3:16"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sermon_date">Sermon Date</Label>
                  <Input
                    id="sermon_date"
                    name="sermon_date"
                    type="date"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio_url">Audio URL</Label>
                <Input
                  id="audio_url"
                  name="audio_url"
                  type="url"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_featured" name="is_featured" />
                <Label htmlFor="is_featured">Featured Sermon</Label>
              </div>
              <Button type="submit" className="w-full">
                Add Sermon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              {sermons.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Sermons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {sermons.filter((s) => s.is_featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sermons.filter((s) => s.audio_url).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                sermons.filter((s) => {
                  const sermonDate = new Date(s.sermon_date);
                  const now = new Date();
                  return (
                    sermonDate.getMonth() === now.getMonth() &&
                    sermonDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title, preacher, or scripture reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sermons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sermons ({filteredSermons.length})</CardTitle>
          <CardDescription>Manage your church sermons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Preacher</TableHead>
                  <TableHead>Scripture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Audio</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSermons.map((sermon) => (
                  <TableRow key={sermon.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sermon.title}</div>
                        {sermon.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {sermon.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sermon.preacher && (
                        <div className="flex items-center text-sm">
                          <User className="w-3 h-3 mr-1" />
                          {sermon.preacher}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {sermon.scripture_reference && (
                        <div className="flex items-center text-sm">
                          <Book className="w-3 h-3 mr-1" />
                          {sermon.scripture_reference}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(sermon.sermon_date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sermon.audio_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleAudio(sermon.id, sermon.audio_url!)
                          }
                        >
                          {playingAudio === sermon.id ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">No audio</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sermon.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSermon(sermon)}
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
                              <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{sermon.title}
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSermon(sermon.id)}
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
          {filteredSermons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sermons found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sermon Dialog */}
      <Dialog
        open={!!editingSermon}
        onOpenChange={() => setEditingSermon(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sermon</DialogTitle>
          </DialogHeader>
          {editingSermon && (
            <form onSubmit={handleUpdateSermon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_title">Title</Label>
                  <Input
                    id="edit_title"
                    name="title"
                    defaultValue={editingSermon.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_preacher">Preacher</Label>
                  <Input
                    id="edit_preacher"
                    name="preacher"
                    defaultValue={editingSermon.preacher || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  name="description"
                  defaultValue={editingSermon.description || ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_scripture_reference">
                    Scripture Reference
                  </Label>
                  <Input
                    id="edit_scripture_reference"
                    name="scripture_reference"
                    defaultValue={editingSermon.scripture_reference || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_sermon_date">Sermon Date</Label>
                  <Input
                    id="edit_sermon_date"
                    name="sermon_date"
                    type="date"
                    defaultValue={editingSermon.sermon_date.split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_audio_url">Audio URL</Label>
                <Input
                  id="edit_audio_url"
                  name="audio_url"
                  type="url"
                  defaultValue={editingSermon.audio_url || ""}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_featured"
                  name="is_featured"
                  defaultChecked={editingSermon.is_featured}
                />
                <Label htmlFor="edit_is_featured">Featured Sermon</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Update Sermon
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSermon(null)}
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
