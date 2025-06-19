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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Users, Send, Eye } from "lucide-react";

export default function EmailMarketing() {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const sendCampaign = async () => {
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
      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: newCampaign.name,
          subject: newCampaign.subject,
          content: newCampaign.content,
          status: "sending",
          recipient_count: subscribers.length,
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
        title: "Success",
        description: `Newsletter sent to ${subscribers.length} subscribers`,
      });

      setNewCampaign({ name: "", subject: "", content: "" });
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
  };

  if (loading) return <div>Loading...</div>;

  return (
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
                Send a newsletter to all subscribers
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
              <Button
                onClick={sendCampaign}
                disabled={sending}
                className="w-full"
              >
                {sending
                  ? "Sending..."
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscribers.map((subscriber: any) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {subscriber.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {subscriber.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Subscribed:{" "}
                        {new Date(
                          subscriber.subscription_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={subscriber.subscribed ? "default" : "secondary"}
                    >
                      {subscriber.subscribed ? "Active" : "Unsubscribed"}
                    </Badge>
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
              <CardDescription>View past newsletter campaigns</CardDescription>
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
                        {campaign.sent_at
                          ? `Sent: ${new Date(campaign.sent_at).toLocaleDateString()}`
                          : `Created: ${new Date(campaign.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          campaign.status === "sent"
                            ? "default"
                            : campaign.status === "sending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {campaign.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {campaign.sent_count || 0} /{" "}
                        {campaign.recipient_count || 0} sent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
