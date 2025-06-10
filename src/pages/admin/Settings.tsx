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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/integrations/supabase/api";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Mail, Users, Send, Eye, Trash2, Plus } from "lucide-react";

interface Settings {
  church_name: string;
  church_address: string;
  phone_number: string;
  email: string;
  enable_donations: boolean;
  enable_membership: boolean;
  maintenance_mode: boolean;
}

interface StripeSettings {
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  stripe_mode: "test" | "live";
  enable_stripe: boolean;
  default_currency: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  enable_newsletters: boolean;
  newsletter_frequency: "daily" | "weekly" | "monthly";
  auto_welcome_email: boolean;
}

interface EmailSubscriber {
  id: string;
  email: string;
  name: string;
  status: "active" | "unsubscribed" | "bounced";
  subscribed_at: string;
  unsubscribed_at?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: "newsletter" | "welcome" | "notification" | "custom";
  is_active: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    church_name: "",
    church_address: "",
    phone_number: "",
    email: "",
    enable_donations: true,
    enable_membership: true,
    maintenance_mode: false,
  });
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    stripe_mode: "test",
    enable_stripe: false,
    default_currency: "USD",
  });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    from_email: "",
    from_name: "",
    enable_newsletters: false,
    newsletter_frequency: "weekly",
    auto_welcome_email: true,
  });
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);

      // Load general settings
      let { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code === "PGRST116") {
        const { data: newData, error: insertError } = await supabase
          .from("site_settings")
          .insert({
            id: 1,
            church_name: "St. Gabriel Ethiopian Orthodox Church",
            church_address: "",
            phone_number: "",
            email: "",
            enable_donations: true,
            enable_membership: true,
            maintenance_mode: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      }

      if (data) {
        setSettings(data);
      }

      // Load Stripe settings
      const stripeData = await api.stripeSettings.getSettings();
      if (stripeData) {
        setStripeSettings(stripeData);
      }

      // Load Email settings
      const emailData = await api.emailSettings.getSettings();
      if (emailData) {
        setEmailSettings(emailData);
      }

      // Load subscribers and templates
      const [subscribersData, templatesData] = await Promise.all([
        api.emailSubscribers.getSubscribers(),
        api.emailTemplates.getTemplates(),
      ]);

      setSubscribers(subscribersData || []);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from("site_settings").upsert({
        id: 1,
        ...settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "General settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.stripeSettings.updateSettings(stripeSettings);
      toast({
        title: "Success",
        description: "Stripe settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving Stripe settings:", error);
      toast({
        title: "Error",
        description: "Failed to save Stripe settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.emailSettings.updateSettings(emailSettings);
      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleStripeChange = (
    field: keyof StripeSettings,
    value: string | boolean,
  ) => {
    setStripeSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (
    field: keyof EmailSettings,
    value: string | boolean | number,
  ) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnsubscribe = async (email: string) => {
    try {
      await api.emailSubscribers.unsubscribe(email);
      await loadAllSettings(); // Refresh data
      toast({
        title: "Success",
        description: "Subscriber unsubscribed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unsubscribe user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await api.emailSubscribers.deleteSubscriber(id);
      await loadAllSettings(); // Refresh data
      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stripe">
            <CreditCard className="w-4 h-4 mr-2" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Subscribers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleGeneralSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic church information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    value={settings.church_name}
                    onChange={(e) =>
                      handleChange("church_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.church_address}
                    onChange={(e) =>
                      handleChange("church_address", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone_number}
                    onChange={(e) =>
                      handleChange("phone_number", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Feature Settings</CardTitle>
                <CardDescription>
                  Enable or disable website features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Donations</Label>
                    <p className="text-sm text-gray-500">
                      Allow visitors to make donations
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_donations}
                    onCheckedChange={(checked) =>
                      handleChange("enable_donations", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Membership</Label>
                    <p className="text-sm text-gray-500">
                      Allow visitors to register for membership
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_membership}
                    onCheckedChange={(checked) =>
                      handleChange("enable_membership", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Put the website in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) =>
                      handleChange("maintenance_mode", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save General Settings"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="stripe">
          <form onSubmit={handleStripeSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Stripe Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure Stripe for processing donations and payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label>Enable Stripe Payments</Label>
                    <p className="text-sm text-gray-500">
                      Allow Stripe payment processing
                    </p>
                  </div>
                  <Switch
                    checked={stripeSettings.enable_stripe}
                    onCheckedChange={(checked) =>
                      handleStripeChange("enable_stripe", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripeMode">Stripe Mode</Label>
                  <Select
                    value={stripeSettings.stripe_mode}
                    onValueChange={(value: "test" | "live") =>
                      handleStripeChange("stripe_mode", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Test Mode</SelectItem>
                      <SelectItem value="live">Live Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishableKey">Publishable Key</Label>
                  <Input
                    id="publishableKey"
                    type="password"
                    value={stripeSettings.stripe_publishable_key}
                    onChange={(e) =>
                      handleStripeChange(
                        "stripe_publishable_key",
                        e.target.value,
                      )
                    }
                    placeholder="pk_test_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={stripeSettings.stripe_secret_key}
                    onChange={(e) =>
                      handleStripeChange("stripe_secret_key", e.target.value)
                    }
                    placeholder="sk_test_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={stripeSettings.stripe_webhook_secret}
                    onChange={(e) =>
                      handleStripeChange(
                        "stripe_webhook_secret",
                        e.target.value,
                      )
                    }
                    placeholder="whsec_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={stripeSettings.default_currency}
                    onValueChange={(value) =>
                      handleStripeChange("default_currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Stripe Settings"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="email">
          <form onSubmit={handleEmailSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email & Newsletter Settings
                </CardTitle>
                <CardDescription>
                  Configure email notifications and newsletter system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label>Enable Newsletter System</Label>
                    <p className="text-sm text-gray-500">
                      Allow newsletter subscriptions and campaigns
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enable_newsletters}
                    onCheckedChange={(checked) =>
                      handleEmailChange("enable_newsletters", checked)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.from_email}
                      onChange={(e) =>
                        handleEmailChange("from_email", e.target.value)
                      }
                      placeholder="noreply@church.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.from_name}
                      onChange={(e) =>
                        handleEmailChange("from_name", e.target.value)
                      }
                      placeholder="St. Gabriel Church"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletterFreq">Newsletter Frequency</Label>
                  <Select
                    value={emailSettings.newsletter_frequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      handleEmailChange("newsletter_frequency", value)
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Welcome Email</Label>
                    <p className="text-sm text-gray-500">
                      Send welcome email to new subscribers
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.auto_welcome_email}
                    onCheckedChange={(checked) =>
                      handleEmailChange("auto_welcome_email", checked)
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">SMTP Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtp_host}
                        onChange={(e) =>
                          handleEmailChange("smtp_host", e.target.value)
                        }
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={emailSettings.smtp_port}
                        onChange={(e) =>
                          handleEmailChange(
                            "smtp_port",
                            parseInt(e.target.value),
                          )
                        }
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtp_username}
                        onChange={(e) =>
                          handleEmailChange("smtp_username", e.target.value)
                        }
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtp_password}
                        onChange={(e) =>
                          handleEmailChange("smtp_password", e.target.value)
                        }
                        placeholder="your-app-password"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Email Settings"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Email Subscribers ({subscribers.length})
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscriber
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your email newsletter subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscribers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No subscribers yet. Start collecting email addresses!
                  </p>
                ) : (
                  subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{subscriber.email}</p>
                            {subscriber.name && (
                              <p className="text-sm text-gray-500">
                                {subscriber.name}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              subscriber.status === "active"
                                ? "default"
                                : subscriber.status === "unsubscribed"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {subscriber.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Subscribed:{" "}
                          {new Date(
                            subscriber.subscribed_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {subscriber.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnsubscribe(subscriber.email)}
                          >
                            Unsubscribe
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
