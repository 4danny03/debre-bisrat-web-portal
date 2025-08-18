import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type Profile = {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
};

export default function AdminProfile(): JSX.Element {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/admin/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, phone, role")
          .eq("id", session.user.id)
          .single();

        if (error && (error as any).code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }

        if (data) {
          setProfile(data as Profile);
        } else {
          const insertBody = {
            id: session.user.id,
            email: session.user.email,
            full_name: (session.user.user_metadata as any)?.full_name || "",
            role: "admin",
          };
          const { error: insertError } = await supabase.from("profiles").insert(insertBody);
          if (insertError) console.error("Error creating profile:", insertError);
          setProfile(insertBody);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert([
        {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role || "admin",
        },
      ]);

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile");
      } else {
        toast.success("Profile updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="main" className="max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy mb-2">My Profile</h1>
      <p className="text-gray-600 mb-6">View and update your admin profile information</p>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (read-only)</Label>
            <Input id="email" value={profile.email || ""} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={profile.full_name || ""} onChange={(e) => handleChange("full_name", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={profile.role || "admin"} readOnly />
          </div>

          {/* Password change section */}
          <div className="pt-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            <p className="text-sm text-gray-500 mb-3">Update your account password. You will be asked to confirm your current password.</p>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="flex items-center justify-end space-x-2 mt-3">
              <Button variant="outline" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} disabled={changingPassword}>Reset</Button>
              <Button
                onClick={async () => {
                  // Client-side validation
                  if (!currentPassword || !newPassword || !confirmPassword) {
                    toast.error("Please fill all password fields");
                    return;
                  }
                  if (newPassword.length < 8) {
                    toast.error("New password must be at least 8 characters");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error("New password and confirmation do not match");
                    return;
                  }

                  setChangingPassword(true);
                  try {
                    // Re-authenticate by signing in with email + current password
                    const email = profile.email;
                    if (!email) {
                      toast.error("No email available for re-authentication");
                      setChangingPassword(false);
                      return;
                    }

                    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
                    if (signInError) {
                      console.error("Re-auth error:", signInError);
                      toast.error("Current password is incorrect");
                      setChangingPassword(false);
                      return;
                    }

                    // Update password
                    const { data, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
                    if (updateError) {
                      console.error("Error updating password:", updateError);
                      toast.error("Failed to update password");
                    } else {
                      toast.success("Password updated successfully");
                      // Clear fields
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to update password");
                  } finally {
                    setChangingPassword(false);
                  }
                }}
                disabled={changingPassword}
              >
                {changingPassword ? "Updating..." : "Change password"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={() => window.location.reload()} disabled={saving}>Reset</Button>
            <Button onClick={handleSave} disabled={saving || loading}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
