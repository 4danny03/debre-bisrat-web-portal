import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Users, Send, Eye } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { XCircle, RefreshCw, BarChart2, Clock } from "lucide-react";

// Add types for state arrays
interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  subscription_date: string;
}
interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  recipient_count: number;
  sent_count?: number;
  sent_at?: string;
  created_at: string;
  scheduled_for?: string;
  open_rate?: number;
  click_rate?: number;
}
interface Template {
  id: string;
  name: string;
  template_type: string;
  content: string;
}

const AdminEmailMarketing: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
  });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  // Enhanced: filter, preview, and send to selected subscribers
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  // Cancel and resend states
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Filtered subscribers for search
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // useCallback for stable function reference
  const loadData = useCallback(async () => {
    try {
      const [subscribersData, campaignsData, templatesData] = await Promise.all(
        [
          supabase
            .from("newsletter_subscribers")
            .select("*")
            .eq("subscribed", true),
          supabase
            .from("email_campaigns")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("email_templates")
            .select("*")
            .eq("template_type", "newsletter"),
        ],
      );
      if (subscribersData.data) setSubscribers(subscribersData.data);
      if (campaignsData.data) setCampaigns(campaignsData.data);
      if (templatesData.data) setTemplates(templatesData.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load email marketing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // useCallback for sendCampaign
  const sendCampaign = useCallback(async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Create campaign record with scheduled_for if set
      // TODO: Integrate scheduledFor with backend
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: newCampaign.name,
          subject: newCampaign.subject,
          content: newCampaign.content,
          status: "sending",
          recipient_count: subscribers.length,
          scheduled_for: scheduledFor ? scheduledFor.toISOString() : null,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Send emails
      const { error: emailError } = await supabase.functions.invoke(
        "send-email",
        {
          body: {
            type: "newsletter",
            data: {
              content: newCampaign.content,
            },
            recipients: subscribers.map((sub: any) => sub.email),
          },
        },
      );

      if (emailError) throw emailError;

      // Update campaign status
      await supabase
        .from("email_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_count: subscribers.length,
        })
        .eq("id", campaign.id);

      toast({
        title: scheduledFor ? "Campaign Scheduled" : "Success",
        description: scheduledFor
          ? `Newsletter scheduled for ${scheduledFor.toLocaleString()}`
          : `Newsletter sent to ${subscribers.length} subscribers`,
      });

      setNewCampaign({ name: "", subject: "", content: "" });
      setScheduledFor(null);
      loadData();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [newCampaign, subscribers, toast, loadData, scheduledFor]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // TODO: Replace with actual API call to send email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Email Sent!",
        description: `Your email campaign has been sent to ${recipients === "all" ? "all subscribers" : recipients}`,
      });
      setSubject("");
      setBody("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Enhanced: Preview and send section
  const handleSelectSubscriber = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handlePreview = () => {
    setPreviewContent(body || newCampaign.content);
  };

  const handleSendEnhanced = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // Use selected or all
      const recipientList =
        recipients === "custom"
          ? subscribers.filter((s) => selectedSubscribers.includes(s.id)).map((s) => s.email)
          : recipients === "members"
          ? [] // TODO: fetch members
          : subscribers.map((s) => s.email);
      // Call backend function
      const response = await fetch("/functions/v1/email-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject,
          content: body,
          recipients: recipientList,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || "Send failed");
      toast({
        title: "Email Sent!",
        description: `Your email campaign has been sent to ${recipientList.length} recipients`,
      });
      setSubject("");
      setBody("");
      setSelectedSubscribers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Cancel campaign (stub)
  const handleCancelCampaign = async (id: string) => {
    setCancellingId(id);
    // TODO: Integrate with backend to cancel scheduled campaign
    setTimeout(() => {
      toast({
        title: "Campaign Cancelled",
        description: `Campaign ${id} cancelled (stubbed)`
      });
      setCancellingId(null);
      loadData();
    }, 1000);
  };

  // Resend campaign (stub)
  const handleResendCampaign = async (id: string) => {
    setResendingId(id);
    // TODO: Integrate with backend to resend campaign
    setTimeout(() => {
      toast({
        title: "Campaign Resent",
        description: `Campaign ${id} resent (stubbed)`
      });
      setResendingId(null);
      loadData();
    }, 1000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Marketing</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Campaigns Sent
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter((c) => c.status === "sent").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Email Templates
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaign" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campaign">Create Campaign</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="history">Campaign History</TabsTrigger>
          </TabsList>

          <TabsContent value="campaign">
            <Card>
              <CardHeader>
                <CardTitle>Create Newsletter Campaign</CardTitle>
                <CardDescription>
                  Send a newsletter to all subscribers or schedule for later
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Monthly Newsletter - January 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={newCampaign.subject}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Newsletter subject line"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    rows={10}
                    value={newCampaign.content}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Newsletter content..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (optional)</Label>
                  <DatePicker
                    id="schedule"
                    selected={scheduledFor}
                    onChange={setScheduledFor}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp"
                    placeholderText="Select date and time"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <Button
                  onClick={sendCampaign}
                  disabled={sending}
                  className="w-full"
                >
                  {sending
                    ? scheduledFor
                      ? "Scheduling..."
                      : "Sending..."
                    : scheduledFor
                      ? `Schedule for ${scheduledFor.toLocaleString()}`
                      : `Send to ${subscribers.length} Subscribers`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>
                  Manage your newsletter subscribers
                </CardDescription>
                <Input
                  placeholder="Search subscribers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSubscribers.map((subscriber: any) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">
                          {subscriber.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">{subscriber.email}</p>
                        <p className="text-xs text-gray-400">
                          Subscribed: {new Date(subscriber.subscription_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={() => handleSelectSubscriber(subscriber.id)}
                        />
                        <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                          {subscriber.subscribed ? "Active" : "Unsubscribed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>View past and scheduled newsletter campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-500">
                          {campaign.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {campaign.scheduled_for
                            ? `Scheduled: ${new Date(campaign.scheduled_for).toLocaleString()}`
                            : campaign.sent_at
                            ? `Sent: ${new Date(campaign.sent_at).toLocaleDateString()}`
                            : `Created: ${new Date(campaign.created_at).toLocaleDateString()}`}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            <BarChart2 className="inline w-3 h-3 mr-1" />
                            Open: {campaign.open_rate != null ? `${(campaign.open_rate * 100).toFixed(1)}%` : "-"}
                          </Badge>
                          <Badge variant="outline">
                            <BarChart2 className="inline w-3 h-3 mr-1" />
                            Click: {campaign.click_rate != null ? `${(campaign.click_rate * 100).toFixed(1)}%` : "-"}
                          </Badge>
                          <Badge variant={
                            campaign.status === "sent"
                              ? "default"
                              : campaign.status === "scheduled"
                                ? "secondary"
                                : campaign.status === "cancelled"
                                ? "destructive"
                                : "outline"
                          }>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex flex-col gap-2 items-end">
                        <p className="text-xs text-gray-400 mt-1">
                          {campaign.sent_count || 0} / {campaign.recipient_count || 0} sent
                        </p>
                        {campaign.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={cancellingId === campaign.id}
                            onClick={() => handleCancelCampaign(campaign.id)}
                          >
                            <XCircle className="inline w-4 h-4 mr-1" />
                            {cancellingId === campaign.id ? "Cancelling..." : "Cancel"}
                          </Button>
                        )}
                        {campaign.status === "sent" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resendingId === campaign.id}
                            onClick={() => handleResendCampaign(campaign.id)}
                          >
                            <RefreshCw className="inline w-4 h-4 mr-1" />
                            {resendingId === campaign.id ? "Resending..." : "Resend"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced: Preview and send section */}
        <div className="container mx-auto py-10 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Email Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSendEnhanced}>
                <div>
                  <label className="block font-medium mb-1">Recipients</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="members">Members Only</option>
                    <option value="custom">Custom Selection</option>
                  </select>
                </div>
                {recipients === "custom" && (
                  <div className="mb-2 text-xs text-gray-500">
                    {selectedSubscribers.length} selected
                  </div>
                )}
                <div>
                  <label className="block font-medium mb-1">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Message</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={8}
                    placeholder="Write your email content here..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handlePreview}>
                    Preview
                  </Button>
                  <Button type="submit" className="bg-church-burgundy" disabled={isSending}>
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </form>
              {previewContent && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold mb-2">Preview</h3>
                  <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-line">
                    <strong>Subject:</strong> {subject}
                    <br />
                    <strong>Message:</strong>
                    <br />
                    {previewContent}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEmailMarketing;
