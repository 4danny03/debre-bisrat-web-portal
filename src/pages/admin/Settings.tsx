import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { ExternalLink, Plus, Trash2, Users, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../utils/api";
import { toast } from "../../hooks/use-toast";
import { supabase } from "../../lib/supabaseClient";

interface SiteSettings {
  id?: number;
  church_name: string;
  church_address: string;
  phone_number: string;
  email: string;
  admin_email: string;
  from_email: string;
  enable_donations: boolean;
  enable_membership: boolean;
  enable_email_notifications: boolean;
  enable_newsletter: boolean;
  enable_stripe: boolean;
  stripe_publishable_key: string;
  maintenance_mode: boolean;
}

interface StripeSettings {
  // Add actual fields as needed
  [key: string]: any;
}

interface EmailSettings {
  from_email?: string;
  from_name?: string;
  newsletter_frequency?: string;
  enable_newsletters?: boolean;
  auto_welcome_email?: boolean;
  smtp_host?: string;
  smtp_port?: number | null;
  smtp_username?: string;
  smtp_password?: string;
  [key: string]: any;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  subscribed_at: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>({
    church_name: "",
    church_address: "",
    phone_number: "",
    email: "",
    admin_email: "",
    from_email: "",
    enable_donations: false,
    enable_membership: false,
    enable_email_notifications: false,
    enable_newsletter: false,
    enable_stripe: false,
    stripe_publishable_key: "",
    maintenance_mode: false,
  });
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({});
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({});
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"configured" | "unconfigured" | "testing">("unconfigured");

  // Load all settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check Stripe configuration on settings change
  useEffect(() => {
    checkStripeConfiguration();
  }, [settings.enable_stripe, settings.stripe_publishable_key]);

  const loadSettings = async () => {
    try {
      let { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && typeof error === 'object' && 'code' in error && (error as any).code === "PGRST116") {
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

      // Load subscribers
      const subscribersData = await api.emailSubscribers.getSubscribers();
      setSubscribers(subscribersData || []);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const checkStripeConfiguration = () => {
    if (!settings.enable_stripe) {
      setStripeStatus('unconfigured');
    } else if (validateStripeKey(settings.stripe_publishable_key)) {
      setStripeStatus('configured');
    } else {
      setStripeStatus('testing');
    }
  };

  const validateStripeKey = (key: string) => {
    return key.startsWith('pk_test_') || key.startsWith('pk_live_');
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleEmailChange = (key: string, value: any) => {
    setEmailSettings({ ...emailSettings, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update site settings
      await supabase.from("site_settings").upsert(settings);

      // Update Stripe settings
      await api.stripeSettings.updateSettings(stripeSettings);

      // Update Email settings
      await api.emailSettings.updateSettings(emailSettings);

      toast({
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await api.emailSubscribers.deleteSubscriber(id);
      setSubscribers(subscribers.filter((subscriber) => subscriber.id !== id));
      toast({
        description: "Subscriber deleted",
      });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const handleUnsubscribe = async (email: string) => {
    try {
      await api.emailSubscribers.unsubscribe(email);
      setSubscribers(
        subscribers.map((subscriber) =>
          subscriber.email === email ? { ...subscriber, status: "unsubscribed" } : subscriber
        )
      );
      toast({
        description: "Unsubscribed successfully",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        description: "Failed to unsubscribe",
        variant: "destructive",
      });
    }
  };

  const getStripeStatusBadge = () => {
    switch (stripeStatus) {
      case 'configured':
        return <Badge variant="default">Stripe Configured</Badge>;
      case 'unconfigured':
        return <Badge variant="destructive">Stripe Unconfigured</Badge>;
      case 'testing':
        return <Badge variant="secondary">Stripe Testing</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="payments">Payment Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger> {/* Added missing tab trigger */}
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
                    value={settings.church_name || ""}
                    onChange={(e) => handleChange("church_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.church_address || ""}
                    onChange={(e) => handleChange("church_address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone_number || ""}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Public Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
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
                    value={settings.admin_email || ""}
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
                      value={emailSettings.from_email || ""}
                      onChange={(e) => handleEmailChange("from_email", e.target.value)}
                      placeholder="noreply@church.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.from_name || ""}
                      onChange={(e) => handleEmailChange("from_name", e.target.value)}
                      placeholder="St. Gabriel Church"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletterFreq">Newsletter Frequency</Label>
                  <Select
                    value={emailSettings.newsletter_frequency || ""}
                    onValueChange={(value) => handleEmailChange("newsletter_frequency", value)}
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
                    <p className="text-sm text-gray-500">Allow newsletter subscriptions and campaigns</p>
                  </div>
                  <Switch
                    checked={emailSettings.enable_newsletters || false}
                    onCheckedChange={(checked: boolean) => handleEmailChange("enable_newsletters", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Welcome Email</Label>
                    <p className="text-sm text-gray-500">Send welcome email to new subscribers</p>
                  </div>
                  <Switch
                    checked={emailSettings.auto_welcome_email || false}
                    onCheckedChange={(checked: boolean) => handleEmailChange("auto_welcome_email", checked)}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">SMTP Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtp_host || ""}
                        onChange={(e) => handleEmailChange("smtp_host", e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={emailSettings.smtp_port === undefined || emailSettings.smtp_port === null ? "" : emailSettings.smtp_port}
                        onChange={(e) => handleEmailChange("smtp_port", e.target.value === "" ? null : parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtp_username || ""}
                        onChange={(e) => handleEmailChange("smtp_username", e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtp_password || ""}
                        onChange={(e) => handleEmailChange("smtp_password", e.target.value)}
                        placeholder="your-app-password"
                      />
                    </div>
                  </div>
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
                  </div>
                  <Switch
                    checked={settings.enable_stripe}
                    onCheckedChange={(checked: boolean) => handleChange("enable_stripe", checked)}
                  />
                </div>
                {settings.enable_stripe && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
                      <Input
                        id="stripeKey"
                        value={settings.stripe_publishable_key || ""}
                        onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
                        placeholder="pk_test_... or pk_live_..."
                        className={!validateStripeKey(settings.stripe_publishable_key || "") && settings.stripe_publishable_key ? "border-red-500" : ""}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Your Stripe publishable key (starts with pk_test_ for testing or pk_live_ for production)</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Get Keys
                        </Button>
                      </div>
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
                    {stripeStatus === 'testing' && (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Test Mode:</strong> You're using test keys. No real payments will be processed. Use test card number 4242424242424242 for testing.
                        </p>
                      </div>
                    )}
                    {stripeStatus === 'configured' && (
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Live Mode:</strong> Real payments will be processed. Make sure your webhook endpoints are configured.
                        </p>
                      </div>
                    )}
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
                    onCheckedChange={(checked: boolean) => handleChange("enable_donations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Membership</Label>
                    <p className="text-sm text-gray-500">Allow visitors to register for membership</p>
                  </div>
                  <Switch
                    checked={settings.enable_membership}
                    onCheckedChange={(checked: boolean) => handleChange("enable_membership", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications to admin</p>
                  </div>
                  <Switch
                    checked={settings.enable_email_notifications}
                    onCheckedChange={(checked: boolean) => handleChange("enable_email_notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Newsletter</Label>
                    <p className="text-sm text-gray-500">Allow newsletter subscriptions</p>
                  </div>
                  <Switch
                    checked={settings.enable_newsletter}
                    onCheckedChange={(checked: boolean) => handleChange("enable_newsletter", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put the website in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked: boolean) => handleChange("maintenance_mode", checked)}
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
                <p className="text-center text-gray-500 py-8">No subscribers yet. Start collecting email addresses!</p>
              ) : (
                subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{subscriber.email}</p>
                          {subscriber.name && <p className="text-sm text-gray-500">{subscriber.name}</p>}
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
                        Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {subscriber.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => handleUnsubscribe(subscriber.email)}>
                          Unsubscribe
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSubscriber(subscriber.id)}>
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
    </div>
  );
}