
import { useState, useEffect } from "react";
import {
Card,
@@ -132,70 +131,8 @@ export default function Settings() {
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
      await loadSettings();
      checkStripeConfiguration();
} catch (error) {
console.error("Error loading settings:", error);
toast({
@@ -208,7 +145,66 @@ export default function Settings() {
}
};

  const handleGeneralSubmit = async (e: React.FormEvent) => {
  const loadSettings = async () => {
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
  };

const checkStripeConfiguration = () => {
if (!settings.enable_stripe) {
setStripeStatus('unconfigured');
@@ -233,7 +229,7 @@ export default function Settings() {
return key.startsWith('pk_test_') || key.startsWith('pk_live_');
};

  const handleSubmit = async (e: React.FormEvent) => {
  const handleGeneralSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (settings.enable_stripe && !validateStripeKey(settings.stripe_publishable_key)) {
@@ -350,6 +346,7 @@ export default function Settings() {
});
}
};

const handleDeleteSubscriber = async (id: string) => {
try {
await api.emailSubscribers.deleteSubscriber(id);
@@ -364,6 +361,8 @@ export default function Settings() {
description: "Failed to delete subscriber",
variant: "destructive",
});
    }
  };

const getStripeStatusBadge = () => {
switch (stripeStatus) {
@@ -414,29 +413,23 @@ export default function Settings() {
<Input
id="churchName"
value={settings.church_name}
                    onChange={(e) =>
                      handleChange("church_name", e.target.value)
                    }
                    onChange={(e: any) => handleChange("church_name", e.target.value)}
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
                    onChange={(e) => handleChange("church_address", e.target.value)}
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
                    onChange={(e) => handleChange("phone_number", e.target.value)}
/>
</div>
<div className="space-y-2">
@@ -468,9 +461,7 @@ export default function Settings() {
</div>
<Switch
checked={settings.enable_donations}
                    onCheckedChange={(checked) =>
                      handleChange("enable_donations", checked)
                    }
                    onCheckedChange={(checked) => handleChange("enable_donations", checked)}
/>
</div>
<div className="flex items-center justify-between">
@@ -482,9 +473,7 @@ export default function Settings() {
</div>
<Switch
checked={settings.enable_membership}
                    onCheckedChange={(checked) =>
                      handleChange("enable_membership", checked)
                    }
                    onCheckedChange={(checked) => handleChange("enable_membership", checked)}
/>
</div>
<div className="flex items-center justify-between">
@@ -496,9 +485,7 @@ export default function Settings() {
</div>
<Switch
checked={settings.maintenance_mode}
                    onCheckedChange={(checked) =>
                      handleChange("maintenance_mode", checked)
                    }
                    onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
/>
</div>
</CardContent>
@@ -532,19 +519,15 @@ export default function Settings() {
</div>
<Switch
checked={stripeSettings.enable_stripe}
                    onCheckedChange={(checked) =>
                      handleStripeChange("enable_stripe", checked)
                    }
                    onCheckedChange={(checked) => handleStripeChange("enable_stripe", checked)}
/>
</div>

<div className="space-y-2">
<Label htmlFor="stripeMode">Stripe Mode</Label>
<Select
value={stripeSettings.stripe_mode}
                    onValueChange={(value: "test" | "live") =>
                      handleStripeChange("stripe_mode", value)
                    }
                    onValueChange={(value: "test" | "live") => handleStripeChange("stripe_mode", value)}
>
<SelectTrigger>
<SelectValue />
@@ -562,12 +545,7 @@ export default function Settings() {
id="publishableKey"
type="password"
value={stripeSettings.stripe_publishable_key}
                    onChange={(e) =>
                      handleStripeChange(
                        "stripe_publishable_key",
                        e.target.value,
                      )
                    }
                    onChange={(e) => handleStripeChange("stripe_publishable_key", e.target.value)}
placeholder="pk_test_..."
/>
</div>
@@ -578,9 +556,7 @@ export default function Settings() {
id="secretKey"
type="password"
value={stripeSettings.stripe_secret_key}
                    onChange={(e) =>
                      handleStripeChange("stripe_secret_key", e.target.value)
                    }
                    onChange={(e) => handleStripeChange("stripe_secret_key", e.target.value)}
placeholder="sk_test_..."
/>
</div>
@@ -591,12 +567,7 @@ export default function Settings() {
id="webhookSecret"
type="password"
value={stripeSettings.stripe_webhook_secret}
                    onChange={(e) =>
                      handleStripeChange(
                        "stripe_webhook_secret",
                        e.target.value,
                      )
                    }
                    onChange={(e) => handleStripeChange("stripe_webhook_secret", e.target.value)}
placeholder="whsec_..."
/>
</div>
@@ -605,9 +576,7 @@ export default function Settings() {
<Label htmlFor="currency">Default Currency</Label>
<Select
value={stripeSettings.default_currency}
                    onValueChange={(value) =>
                      handleStripeChange("default_currency", value)
                    }
                    onValueChange={(value) => handleStripeChange("default_currency", value)}
>
<SelectTrigger>
<SelectValue />
@@ -617,495 +586,234 @@ export default function Settings() {
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
            {saving ? "Saving..." : "Save Stripe Settings"}
          </Button>
        </form>
      </TabsContent>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Email Settings"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
      <TabsContent value="email">
        <form onSubmit={handleEmailSubmit}>
          <Card className="mb-6">
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
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email & Newsletter Settings
</CardTitle>
<CardDescription>
                Manage your email newsletter subscribers
                Configure email notifications and newsletter system
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
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>Enable Newsletter System</Label>
                  <p className="text-sm text-gray-500">
                    Allow newsletter subscriptions and campaigns
                  </p>
                </div>
                <Switch
                  checked={emailSettings.enable_newsletters}
                  onCheckedChange={(checked) => handleEmailChange("enable_newsletters", checked)}
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
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => handleChange("from_email", e.target.value)}
                  placeholder="noreply@church.com"
                />
                <p className="text-sm text-gray-500">Email address used as sender</p>
                <Label htmlFor="newsletterFreq">Newsletter Frequency</Label>
                <Select
                  value={emailSettings.newsletter_frequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => handleEmailChange("newsletter_frequency", value)}
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
                  checked={emailSettings.auto_welcome_email}
                  onCheckedChange={(checked) => handleEmailChange("auto_welcome_email", checked)}
/>
</div>
              
              {settings.enable_stripe && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">SMTP Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
                    <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
<Input
                      id="stripeKey"
                      value={settings.stripe_publishable_key}
                      onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
                      placeholder="pk_test_... or pk_live_..."
                      className={!validateStripeKey(settings.stripe_publishable_key) && settings.stripe_publishable_key ? "border-red-500" : ""}
                      id="smtpHost"
                      value={emailSettings.smtp_host}
                      onChange={(e) => handleEmailChange("smtp_host", e.target.value)}
                      placeholder="smtp.gmail.com"
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
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={emailSettings.smtp_port}
                      onChange={(e) => handleEmailChange("smtp_port", parseInt(e.target.value))}
                      placeholder="587"
                    />
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtp_username}
                      onChange={(e) => handleEmailChange("smtp_username", e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtp_password}
                      onChange={(e) => handleEmailChange("smtp_password", e.target.value)}
                      placeholder="your-app-password"
                    />
                  </div>
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
    </div>

      <div className="mt-6">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
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