import { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Save, Trash2 } from "lucide-react";

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  is_active: boolean;
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null,
  );
  const [newTemplate, setNewTemplate] = useState<EmailTemplate>({
    name: "",
    subject: "",
    content: "",
    template_type: "newsletter",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data as EmailTemplate[]) || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from("email_templates")
          .update(template)
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("email_templates")
          .insert([template]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      loadTemplates();
      setEditingTemplate(null);
      setNewTemplate({
        name: "",
        subject: "",
        content: "",
        template_type: "newsletter",
        is_active: true,
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Email Templates</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Create a new email template for various purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={newTemplate.template_type}
                onValueChange={(value) =>
                  setNewTemplate((prev) => ({ ...prev, template_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="donation_confirmation">
                    Donation Confirmation
                  </SelectItem>
                  <SelectItem value="admin_notification">
                    Admin Notification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={newTemplate.subject}
              onChange={(e) =>
                setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Email content (use {{variable}} for dynamic content)"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={newTemplate.is_active}
              onCheckedChange={(checked) =>
                setNewTemplate((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <Button onClick={() => saveTemplate(newTemplate)}>
            Create Template
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    Type: {template.template_type} | Status:{" "}
                    {template.is_active ? "Active" : "Inactive"}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTemplate(template.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {editingTemplate && editingTemplate.id === template.id && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={editingTemplate.subject}
                    onChange={(e) =>
                      setEditingTemplate((prev) =>
                        prev
                          ? {
                              ...prev,
                              subject: e.target.value,
                              name: prev.name ?? "",
                              content: prev.content ?? "",
                              template_type: prev.template_type ?? "newsletter",
                              is_active: prev.is_active ?? true,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    rows={6}
                    value={editingTemplate.content}
                    onChange={(e) =>
                      setEditingTemplate((prev) =>
                        prev
                          ? {
                              ...prev,
                              content: e.target.value,
                              name: prev.name ?? "",
                              subject: prev.subject ?? "",
                              template_type: prev.template_type ?? "newsletter",
                              is_active: prev.is_active ?? true,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      editingTemplate && saveTemplate(editingTemplate)
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTemplate(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
