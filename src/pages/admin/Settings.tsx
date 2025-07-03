import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";

// Helper for Stripe key validation (replace with your own logic if needed)
function validateStripeKey(key: string) {
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

export default function Settings() {
  const [settings, setSettings] = useState({
    church_name: "",
    church_address: "",
    phone_number: "",
    email: "",
    admin_email: "",
    from_email: "noreply@example.com",
    enable_donations: true,
    enable_membership: true,
    enable_email_notifications: true,
    enable_newsletter: true,
    enable_stripe: false,
    stripe_publishable_key: "",
    maintenance_mode: false,
  });
  const [stripeSettings, setStripeSettings] = useState({
    enable_stripe: false,
    stripe_mode: "test",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    default_currency: "USD",
  });
  const [emailSettings, setEmailSettings] = useState({
    enable_newsletters: false,
    from_email: "",
    from_name: "",
    newsletter_frequency: "monthly",
    auto_welcome_email: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
  });
  const [subscribers, setSubscribers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("unconfigured");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    checkStripeConfiguration();
  }, [settings.enable_stripe, settings.stripe_publishable_key]);

  const loadSettings = async () => {
    try {
      setLoading(true);
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
            admin_email: "",
            from_email: "noreply@example.com",
            enable_donations: true,
            enable_membership: true,
            enable_email_notifications: true,
            enable_newsletter: true,
            enable_stripe: false,
            stripe_publishable_key: "",
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
      checkStripeConfiguration();
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error loading settings",
        description: "Failed to load settings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkStripeConfiguration = () => {
    if (!settings.enable_stripe) {
      setStripeStatus("unconfigured");
      return;
    }
    const key = settings.stripe_publishable_key.trim();
    if (key === "") {
      setStripeStatus("unconfigured");
    } else if (validateStripeKey(key)) {
      setStripeStatus("configured");
    } else {
      setStripeStatus("testing");
    }
  };

  // Add type annotations for handlers
  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };
  const handleStripeChange = (field: string, value: any) => {
    setStripeSettings((prev) => ({ ...prev, [field]: value }));
  };
  const handleEmailChange = (field: string, value: any) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (settings.enable_stripe && !validateStripeKey(settings.stripe_publishable_key)) {
      toast({
        title: "Invalid Stripe Key",
        description: "Please enter a valid Stripe publishable key.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await supabase
        .from("site_settings")
        .upsert([
          {
            id: 1,
            ...settings,
          },
        ])
        .select();
      await api.stripeSettings.updateSettings(stripeSettings);
      await api.emailSettings.updateSettings(emailSettings);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save settings data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await api.emailSubscribers.deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been removed",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error deleting subscriber",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const getStripeStatusBadge = () => {
    switch (stripeStatus) {
      case "configured":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            Configured
          </span>
        );
      case "testing":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
            Test Mode
          </span>
        );
      case "unconfigured":
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
            Unconfigured
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="payments">Payment Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic church information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    value={settings.church_name}
                    onChange={(e) => handleChange("church_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.church_address}
                    onChange={(e) => handleChange("church_address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Public Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => handleChange("admin_email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.from_email}
                    onChange={(e) => handleChange("from_email", e.target.value)}
                  />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email settings for notifications and newsletters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => handleChange("admin_email", e.target.value)}
                    placeholder="admin@church.com"
                  />
                  <p className="text-sm text-gray-500">Email to receive admin notifications</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.from_email}
                      onChange={(e) => handleEmailChange("from_email", e.target.value)}
                      placeholder="noreply@church.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.from_name}
                      onChange={(e) => handleEmailChange("from_name", e.target.value)}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Payment Settings
                  {getStripeStatusBadge()}
                </CardTitle>
                <CardDescription>Configure Stripe payment integration for donations and membership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Stripe Payments</Label>
                    <p className="text-sm text-gray-500">Allow online donations and membership payments via Stripe</p>
                    <Label>Auto Welcome Email</Label>
                    <p className="text-sm text-gray-500">
                      Send welcome email to new subscribers
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_stripe}
                    onCheckedChange={(checked) => handleChange("enable_stripe", checked)}
                  />
                </div>
                
                {settings.enable_stripe && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="test">Test</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                          </SelectContent>
                        </Select>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishableKey">Stripe Publishable Key</Label>
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
                      <Label htmlFor="secretKey">Stripe Secret Key</Label>
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
                      <Label htmlFor="webhookSecret">Stripe Webhook Secret</Label>
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

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Donations</Label>
                        <p className="text-sm text-gray-500">Allow visitors to make donations</p>
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
                        <p className="text-sm text-gray-500">Allow visitors to register for membership</p>
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
                        <p className="text-sm text-gray-500">Put the website in maintenance mode</p>
                      </div>
                      <Switch
                        checked={settings.maintenance_mode}
                        onCheckedChange={(checked) =>
                          handleChange("maintenance_mode", checked)
                        }
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Stripe Configuration Status</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li className="flex items-center">
                          {settings.enable_stripe ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : <AlertCircle className="w-4 h-4 mr-2 text-red-600" />}
                          Stripe integration {settings.enable_stripe ? 'enabled' : 'disabled'}
                        </li>
                        <li className="flex items-center">
                          {settings.stripe_publishable_key && validateStripeKey(settings.stripe_publishable_key) ? 
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : 
                            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                          }
                          Publishable key {settings.stripe_publishable_key && validateStripeKey(settings.stripe_publishable_key) ? 'configured' : 'missing or invalid'}
                        </li>
                        <li className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                          Secret key must be configured in Supabase Edge Function secrets
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Settings</CardTitle>
                <CardDescription>Enable or disable website features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Donations</Label>
                    <p className="text-sm text-gray-500">Allow visitors to make donations</p>
                  </div>
                  <Switch
                    checked={settings.enable_donations}
                    onCheckedChange={(checked) => handleChange("enable_donations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Membership</Label>
                    <p className="text-sm text-gray-500">Allow visitors to register for membership</p>
                  </div>
                  <Switch
                    checked={settings.enable_membership}
                    onCheckedChange={(checked) => handleChange("enable_membership", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications to admin</p>
                  </div>
                  <Switch
                    checked={settings.enable_email_notifications}
                    onCheckedChange={(checked) => handleChange("enable_email_notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Newsletter</Label>
                    <p className="text-sm text-gray-500">Allow newsletter subscriptions</p>
                  </div>
                  <Switch
                    checked={settings.enable_newsletter}
                    onCheckedChange={(checked) => handleChange("enable_newsletter", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put the website in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}