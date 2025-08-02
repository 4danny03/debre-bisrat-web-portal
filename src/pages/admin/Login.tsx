import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Persist login: check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (profile?.role === "admin") {
        navigate("/admin/dashboard");
      }
    };
    checkAdminSession();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // If profile doesn't exist, create one for the first user as admin
        const { count: existingProfilesCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (existingProfilesCount === 0) {
          // First user becomes admin
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: "admin",
            });

          if (createError) {
            console.error("Error creating admin profile:", createError);
            throw new Error("Failed to create admin profile");
          }

          console.log("Created first admin user");
        } else {
          throw new Error("Profile not found. Please contact administrator.");
        }
      } else if (profile?.role !== "admin") {
        throw new Error("Unauthorized. Admin access required.");
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin dashboard",
      });
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Check if this email was pre-authorized by an existing admin
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("email", email)
      .single();

    if (
      profileCheckError ||
      !existingProfile ||
      existingProfile.role !== "admin"
    ) {
      setError(
        "This email is not authorized for admin registration. Please contact an existing admin to add you.",
      );
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "admin", // This will be validated by security rules
          },
        },
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Update the existing profile with the user ID
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ id: user.id })
          .eq("email", user.email);

        if (profileError) throw profileError;

        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: window.location.origin + "/admin/reset-password",
        },
      );

      if (resetError) throw resetError;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send reset email",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center">
            Manage your church's digital presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="admin@church.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="admin@church.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your email must be pre-authorized by
                    an existing admin before you can register. Contact an admin
                    to add your email to the system first.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="admin@church.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="px-8 text-center text-sm text-gray-600">
            Secure access to manage church content, members, and settings
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
