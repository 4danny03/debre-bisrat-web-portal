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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Settings {
  church_name: string;
  church_address: string;
  phone_number: string;
  email: string;
  enable_donations: boolean;
  enable_membership: boolean;
  maintenance_mode: boolean;
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to get settings, create default if none exist
      let { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      // If no settings exist, create default ones
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from("site_settings").upsert({
        id: 1, // Use a constant ID since we only have one settings record
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
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
          <CardDescription>Enable or disable website features</CardDescription>
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
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
