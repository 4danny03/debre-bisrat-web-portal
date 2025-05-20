import { useState, useEffect } from 'react';
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
import { useFirebase } from '@/integrations/firebase/context';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { db } = useFirebase();
  const [settings, setSettings] = useState({
    churchName: '',
    churchAddress: '',
    phoneNumber: '',
    email: '',
    enableDonations: true,
    enableMembership: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'site_settings', '1'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, [db, toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update settings in Firebase
      await setDoc(doc(db, 'site_settings', '1'), {
        ...settings,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error saving settings",
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
