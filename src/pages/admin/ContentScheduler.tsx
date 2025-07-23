import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Image,
  Play,
  Pause,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { api } from "@/integrations/supabase/api";

interface ScheduledContent {
  id: string;
  type: "event" | "sermon" | "email" | "post";
  title: string;
  content: any;
  scheduledFor: Date;
  status: "scheduled" | "published" | "failed" | "cancelled";
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  publishedAt?: Date;
}

export default function ContentScheduler() {
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ScheduledContent | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("scheduled");
  const { toast } = useToast();

  const [newContent, setNewContent] = useState({
    type: "event" as const,
    title: "",
    description: "",
    scheduledFor: "",
    scheduledTime: "",
    recurring: false,
    frequency: "weekly" as const,
    interval: 1,
    endDate: "",
    emailSubject: "",
    emailContent: "",
    eventLocation: "",
    eventTime: "",
    sermonPreacher: "",
    sermonAudioUrl: "",
  });

  useEffect(() => {
    loadScheduledContent();
    // Set up interval to check for content to publish
    const interval = setInterval(checkAndPublishContent, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadScheduledContent = async () => {
    try {
      setLoading(true);
      // In a real app, this would be stored in a dedicated table
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem("scheduledContent");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const processedContent = parsed.map((item: any) => ({
              ...item,
              scheduledFor: new Date(item.scheduledFor),
              createdAt: new Date(item.createdAt),
              publishedAt: item.publishedAt
                ? new Date(item.publishedAt)
                : undefined,
            }));
            setScheduledContent(processedContent);
          }
        } catch (error) {
          console.error("Error parsing scheduled content:", error);
          setScheduledContent([]);
        }
      }
    } catch (error) {
      console.error("Error loading scheduled content:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveScheduledContent = (content: ScheduledContent[]) => {
    localStorage.setItem("scheduledContent", JSON.stringify(content));
    setScheduledContent(content);
  };

  const checkAndPublishContent = async () => {
    if (!Array.isArray(scheduledContent)) return;

    const now = new Date();
    const toPublish = scheduledContent.filter(
      (item) =>
        item?.status === "scheduled" &&
        item?.scheduledFor &&
        item.scheduledFor <= now,
    );

    for (const item of toPublish) {
      if (item) {
        await publishContent(item);
      }
    }
  };

  const publishContent = async (content: ScheduledContent) => {
    try {
      let success = false;

      switch (content.type) {
        case "event":
          await api.events.createEvent(content.content);
          success = true;
          break;
        case "sermon":
          await api.sermons.createSermon(content.content);
          success = true;
          break;
        case "email":
          await supabase.from("email_campaigns").insert({
            ...content.content,
            status: "sent",
            sent_at: new Date().toISOString(),
          });
          success = true;
          break;
        default:
          success = false;
      }

      const updatedContent = scheduledContent.map((item) =>
        item.id === content.id
          ? {
              ...item,
              status: success ? ("published" as const) : ("failed" as const),
              publishedAt: success ? new Date() : undefined,
            }
          : item,
      );

      // Handle recurring content
      if (success && content.recurring) {
        const nextDate = calculateNextDate(
          content.scheduledFor,
          content.recurring,
        );
        if (
          !content.recurring.endDate ||
          nextDate <= content.recurring.endDate
        ) {
          const nextContent: ScheduledContent = {
            ...content,
            id: Date.now().toString() + Math.random(),
            scheduledFor: nextDate,
            status: "scheduled",
            publishedAt: undefined,
          };
          updatedContent.push(nextContent);
        }
      }

      saveScheduledContent(updatedContent);

      toast({
        title: success ? "Content Published" : "Publishing Failed",
        description: `${content.title} ${success ? "has been published" : "failed to publish"}`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error publishing content:", error);
      const updatedContent = scheduledContent.map((item) =>
        item.id === content.id ? { ...item, status: "failed" as const } : item,
      );
      saveScheduledContent(updatedContent);
    }
  };

  const calculateNextDate = (
    currentDate: Date,
    recurring: ScheduledContent["recurring"],
  ) => {
    if (!recurring) return currentDate;

    switch (recurring.frequency) {
      case "daily":
        return addDays(currentDate, recurring.interval);
      case "weekly":
        return addWeeks(currentDate, recurring.interval);
      case "monthly":
        return addMonths(currentDate, recurring.interval);
      default:
        return currentDate;
    }
  };

  const handleScheduleContent = async () => {
    if (!newContent.title || !newContent.scheduledFor) {
      toast({
        title: "Error",
        description: "Please provide title and scheduled date",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(
      `${newContent.scheduledFor}T${newContent.scheduledTime || "09:00"}`,
    );

    let contentData: any = {};

    switch (newContent.type) {
      case "event":
        contentData = {
          title: newContent.title,
          description: newContent.description,
          event_date: newContent.scheduledFor,
          event_time: newContent.eventTime,
          location: newContent.eventLocation,
        };
        break;
      case "sermon":
        contentData = {
          title: newContent.title,
          description: newContent.description,
          sermon_date: newContent.scheduledFor,
          preacher: newContent.sermonPreacher || "Pastor",
          audio_url: newContent.sermonAudioUrl,
        };
        break;
      case "email":
        contentData = {
          name: newContent.title,
          subject: newContent.emailSubject,
          content: newContent.emailContent,
        };
        break;
    }

    const scheduled: ScheduledContent = {
      id: Date.now().toString() + Math.random(),
      type: newContent.type,
      title: newContent.title,
      content: contentData,
      scheduledFor: scheduledDateTime,
      status: "scheduled",
      recurring: newContent.recurring
        ? {
            frequency: newContent.frequency,
            interval: newContent.interval,
            endDate: newContent.endDate
              ? new Date(newContent.endDate)
              : undefined,
          }
        : undefined,
      createdAt: new Date(),
    };

    const updatedContent = [...scheduledContent, scheduled];
    saveScheduledContent(updatedContent);

    toast({
      title: "Content Scheduled",
      description: `${newContent.title} has been scheduled for ${format(scheduledDateTime, "PPP p")}`,
    });

    // Reset form
    setNewContent({
      type: "event",
      title: "",
      description: "",
      scheduledFor: "",
      scheduledTime: "",
      recurring: false,
      frequency: "weekly",
      interval: 1,
      endDate: "",
      emailSubject: "",
      emailContent: "",
      eventLocation: "",
      eventTime: "",
      sermonPreacher: "",
      sermonAudioUrl: "",
    });
    setDialogOpen(false);
  };

  const handleCancelScheduled = (id: string) => {
    const updatedContent = scheduledContent.map((item) =>
      item.id === id ? { ...item, status: "cancelled" as const } : item,
    );
    saveScheduledContent(updatedContent);

    toast({
      title: "Content Cancelled",
      description: "Scheduled content has been cancelled",
    });
  };

  const handleDeleteScheduled = (id: string) => {
    const updatedContent = scheduledContent.filter((item) => item.id !== id);
    saveScheduledContent(updatedContent);

    toast({
      title: "Content Deleted",
      description: "Scheduled content has been deleted",
    });
  };

  const getStatusIcon = (status: ScheduledContent["status"]) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: ScheduledContent["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "sermon":
        return <FileText className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "post":
        return <Image className="h-4 w-4" />;
    }
  };

  const filteredContent = scheduledContent.filter((item) => {
    switch (activeTab) {
      case "scheduled":
        return item.status === "scheduled";
      case "published":
        return item.status === "published";
      case "failed":
        return item.status === "failed" || item.status === "cancelled";
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Content Scheduler
          </h1>
          <p className="text-gray-600 mt-1">
            Schedule and automate content publishing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Content</DialogTitle>
              <DialogDescription>
                Create content to be automatically published at a specific time
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select
                    value={newContent.type}
                    onValueChange={(value: any) =>
                      setNewContent((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="sermon">Sermon</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Content title"
                    value={newContent.title}
                    onChange={(e) =>
                      setNewContent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Content description"
                  value={newContent.description}
                  onChange={(e) =>
                    setNewContent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={newContent.scheduledFor}
                    onChange={(e) =>
                      setNewContent((prev) => ({
                        ...prev,
                        scheduledFor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-time">Scheduled Time</Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={newContent.scheduledTime}
                    onChange={(e) =>
                      setNewContent((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {newContent.type === "event" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      placeholder="Event location"
                      value={newContent.eventLocation}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          eventLocation: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-time">Event Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={newContent.eventTime}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          eventTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {newContent.type === "sermon" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sermon-preacher">Preacher</Label>
                    <Input
                      id="sermon-preacher"
                      placeholder="Preacher name"
                      value={newContent.sermonPreacher}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          sermonPreacher: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sermon-audio">Audio URL</Label>
                    <Input
                      id="sermon-audio"
                      placeholder="Audio file URL"
                      value={newContent.sermonAudioUrl}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          sermonAudioUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {newContent.type === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Email subject line"
                      value={newContent.emailSubject}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          emailSubject: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-content">Email Content</Label>
                    <Textarea
                      id="email-content"
                      placeholder="Email content"
                      value={newContent.emailContent}
                      onChange={(e) =>
                        setNewContent((prev) => ({
                          ...prev,
                          emailContent: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Recurring options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={newContent.recurring}
                    onCheckedChange={(checked) =>
                      setNewContent((prev) => ({ ...prev, recurring: checked }))
                    }
                  />
                  <Label htmlFor="recurring">Make this recurring</Label>
                </div>

                {newContent.recurring && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={newContent.frequency}
                        onValueChange={(value: any) =>
                          setNewContent((prev) => ({
                            ...prev,
                            frequency: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interval">Interval</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        value={newContent.interval}
                        onChange={(e) =>
                          setNewContent((prev) => ({
                            ...prev,
                            interval: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date (Optional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newContent.endDate}
                        onChange={(e) =>
                          setNewContent((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleContent}>
                  Schedule Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scheduled">
            Scheduled (
            {scheduledContent.filter((c) => c.status === "scheduled").length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published (
            {scheduledContent.filter((c) => c.status === "published").length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed/Cancelled (
            {
              scheduledContent.filter(
                (c) => c.status === "failed" || c.status === "cancelled",
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
            </div>
          ) : filteredContent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No {activeTab} content</p>
                <p className="text-sm text-gray-400 mt-1">
                  {activeTab === "scheduled"
                    ? "Schedule some content to get started"
                    : `No ${activeTab} content found`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {item.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Scheduled for: {format(item.scheduledFor, "PPP p")}
                          </p>
                          {item.recurring && (
                            <p className="text-xs text-blue-600">
                              Recurring: Every {item.recurring.interval}{" "}
                              {item.recurring.frequency}
                            </p>
                          )}
                          {item.publishedAt && (
                            <p className="text-xs text-green-600">
                              Published: {format(item.publishedAt, "PPP p")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm capitalize font-medium">
                          {item.status}
                        </span>
                        {item.status === "scheduled" && (
                          <div className="flex space-x-1 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelScheduled(item.id)}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Scheduled Content
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {item.title}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteScheduled(item.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {(item.status === "failed" ||
                          item.status === "cancelled") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Content
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {item.title}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteScheduled(item.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
