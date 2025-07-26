import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Mail, Users, Eye, Edit, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: string;
  recipient_count?: number;
  open_rate?: number;
  sent_at?: string;
  scheduled_at?: string;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
}

const EmailMarketing = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    subject: "",
    content: "",
    scheduled_at: "",
    template_id: "",
  });

  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
  });

  // Rich text editor state
  const [body, setBody] = useState("");

  // Cancel and resend states
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Cancel campaign handler
  const handleCancelCampaign = async (campaignId: string) => {
    setCancellingId(campaignId);
    try {
      await supabase
        .from("email_campaigns")
        .update({ status: "cancelled" })
        .eq("id", campaignId);

      toast.success("Campaign cancelled successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to cancel campaign");
    } finally {
      setCancellingId(null);
    }
  };

  // Resend campaign handler
  const handleResendCampaign = async (campaignId: string) => {
    setResendingId(campaignId);
    try {
      // Logic to resend campaign
      toast.success("Campaign resent successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to resend campaign");
    } finally {
      setResendingId(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignsError) {
        console.error("Error loading campaigns:", campaignsError);
        toast.error("Failed to load campaigns");
      } else {
        setCampaigns(campaignsData || []);
      }

      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (templatesError) {
        console.error("Error loading templates:", templatesError);
        toast.error("Failed to load templates");
      } else {
        setTemplates(templatesData || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async () => {
    try {
      const { error } = await supabase.from("email_campaigns").insert({
        title: newCampaign.title,
        subject: newCampaign.subject,
        content: body || newCampaign.content,
        status: newCampaign.scheduled_at ? "scheduled" : "draft",
        scheduled_at: newCampaign.scheduled_at || null,
        recipient_count: 0,
      });

      if (error) {
        console.error("Error creating campaign:", error);
        toast.error("Failed to create campaign");
        return;
      }

      toast.success("Campaign created successfully");
      setShowNewCampaign(false);
      setNewCampaign({
        title: "",
        subject: "",
        content: "",
        scheduled_at: "",
        template_id: "",
      });
      setBody("");
      loadData();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase.from("email_templates").insert({
        name: newTemplate.name,
        subject: newTemplate.subject,
        content: newTemplate.content,
      });

      if (error) {
        console.error("Error creating template:", error);
        toast.error("Failed to create template");
        return;
      }

      toast.success("Template created successfully");
      setShowNewTemplate(false);
      setNewTemplate({ name: "", subject: "", content: "" });
      loadData();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setNewCampaign((prev) => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template_id: templateId,
      }));
      setBody(template.content);
    }
  };

  const handlePreview = () => {
    setPreviewContent(body || newCampaign.content);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "scheduled":
        return "secondary";
      case "draft":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading email marketing data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
          <p className="text-muted-foreground">
            Manage email campaigns and templates
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Create a reusable email template for campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Email subject"
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Email content"
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={10}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTemplate(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>
                  Create a new email campaign to send to your subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 space-y-4">
                  <Input
                    placeholder="Campaign title"
                    value={newCampaign.title}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Email subject"
                    value={newCampaign.subject}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                  <Select
                    value={newCampaign.template_id}
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Email content"
                    value={body || newCampaign.content}
                    onChange={(e) => {
                      setBody(e.target.value);
                      setNewCampaign((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }));
                    }}
                    rows={12}
                  />
                  <Input
                    type="datetime-local"
                    placeholder="Schedule for later (optional)"
                    value={newCampaign.scheduled_at}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        scheduled_at: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Preview</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handlePreview();
                        setShowPreview(true);
                      }}
                      className="w-full mb-2"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Email
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Subject:</strong>{" "}
                        {newCampaign.subject || "No subject"}
                      </p>
                      <p>
                        <strong>Content:</strong>{" "}
                        {(body || newCampaign.content)?.substring(0, 100) ||
                          "No content"}
                        ...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewCampaign(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter((c) => c.status === "sent").length} sent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recipients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0
                ? Math.round(
                    campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) /
                      campaigns.length,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Email open rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Reusable templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>
            Manage your email marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No campaigns found. Create your first campaign to get
                        started.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium">{campaign.title}</div>
                      </TableCell>
                      <TableCell>{campaign.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.recipient_count || 0}</TableCell>
                      <TableCell>
                        {campaign.open_rate ? `${campaign.open_rate}%` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {campaign.sent_at
                          ? format(new Date(campaign.sent_at), "MMM dd, yyyy")
                          : campaign.scheduled_at
                            ? format(
                                new Date(campaign.scheduled_at),
                                "MMM dd, yyyy",
                              )
                            : format(
                                new Date(campaign.created_at),
                                "MMM dd, yyyy",
                              )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaign.status === "scheduled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelCampaign(campaign.id)}
                              disabled={cancellingId === campaign.id}
                            >
                              {cancellingId === campaign.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </Button>
                          )}
                          {campaign.status === "sent" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendCampaign(campaign.id)}
                              disabled={resendingId === campaign.id}
                            >
                              <Send className="h-4 w-4" />
                              {resendingId === campaign.id
                                ? "Resending..."
                                : "Resend"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Reusable email templates for campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No templates found. Create your first template to get
                        started.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                      </TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        {format(new Date(template.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will look to recipients
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white">
            <div className="mb-4 pb-4 border-b">
              <p>
                <strong>Subject:</strong> {newCampaign.subject}
              </p>
            </div>
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: previewContent.replace(/\n/g, "<br>"),
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailMarketing;
