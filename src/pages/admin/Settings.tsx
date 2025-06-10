
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface Settings {
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

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    church_name: "",
    church_address: "",
    phone_number: "",
    email: "",
    admin_email: "",
    from_email: "",
    enable_donations: true,
    enable_membership: true,
    enable_email_notifications: true,
    enable_newsletter: true,
    enable_stripe: false,
    stripe_publishable_key: "",
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<'unconfigured' | 'configured' | 'testing'>('unconfigured');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

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
        error = null;
      }

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
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

  const checkStripeConfiguration = () => {
    if (!settings.enable_stripe) {
      setStripeStatus('unconfigured');
      return;
    }

    if (settings.stripe_publishable_key && settings.stripe_publishable_key.trim()) {
      if (settings.stripe_publishable_key.startsWith('pk_test_')) {
        setStripeStatus('testing');
      } else if (settings.stripe_publishable_key.startsWith('pk_live_')) {
        setStripeStatus('configured');
      } else {
        setStripeStatus('unconfigured');
      }
    } else {
      setStripeStatus('unconfigured');
    }
  };

  const validateStripeKey = (key: string) => {
    if (!key) return true; // Allow empty for now
    return key.startsWith('pk_test_') || key.startsWith('pk_live_');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.enable_stripe && !validateStripeKey(settings.stripe_publishable_key)) {
      toast({
        title: "Invalid Stripe Key",
        description: "Please enter a valid Stripe publishable key (starts with pk_test_ or pk_live_)",
        variant: "destructive",
      });
      return;
    }

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
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const getStripeStatusBadge = () => {
    switch (stripeStatus) {
      case 'configured':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Live Mode</Badge>;
      case 'testing':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Test Mode</Badge>;
      default:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => handleChange("from_email", e.target.value)}
                  placeholder="noreply@church.com"
                />
                <p className="text-sm text-gray-500">Email address used as sender</p>
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
                  onCheckedChange={(checked) => handleChange("enable_stripe", checked)}
                />
              </div>
              
              {settings.enable_stripe && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
                    <Input
                      id="stripeKey"
                      value={settings.stripe_publishable_key}
                      onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
                      placeholder="pk_test_... or pk_live_..."
                      className={!validateStripeKey(settings.stripe_publishable_key) && settings.stripe_publishable_key ? "border-red-500" : ""}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Your Stripe publishable key (starts with pk_test_ for testing or pk_live_ for production)
                      </p>
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
                        <strong>Test Mode:</strong> You're using test keys. No real payments will be processed.
                        Use test card number 4242424242424242 for testing.
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
  );
}
