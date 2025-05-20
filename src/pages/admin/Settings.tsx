import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    churchName: '',
    churchAddress: '',
    phoneNumber: '',
    email: '',
    enableDonations: true,
    enableMembership: true,
    maintenanceMode: false,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update settings in Supabase
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1, // Using a single row for site settings
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Error saving settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Site Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your church website's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="churchName">Church Name</Label>
            <Input
              id="churchName"
              value={settings.churchName}
              onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="churchAddress">Address</Label>
            <Textarea
              id="churchAddress"
              value={settings.churchAddress}
              onChange={(e) => setSettings({ ...settings, churchAddress: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>Enable or disable website features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Donations</Label>
              <p className="text-sm text-muted-foreground">
                Allow visitors to make donations through the website
              </p>
            </div>
            <Switch
              checked={settings.enableDonations}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableDonations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Membership Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow visitors to register as members
              </p>
            </div>
            <Switch
              checked={settings.enableMembership}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableMembership: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the website in maintenance mode
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
