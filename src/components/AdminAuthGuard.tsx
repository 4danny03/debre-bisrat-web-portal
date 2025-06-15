
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAuthorized(false);
          navigate("/admin/login");
        } else if (event === 'SIGNED_IN') {
          checkAdminAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to verify session");
      }

      if (!session?.user) {
        console.log("No session found, redirecting to login");
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        
        // If profile doesn't exist, check if this is the first user
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (countError) {
          console.error("Count error:", countError);
          throw new Error("Failed to verify user permissions");
        }

        if (count === 0) {
          // First user becomes admin
          console.log("Creating admin profile for first user");
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: "admin",
            });

          if (createError) {
            console.error("Error creating admin profile:", createError);
            throw new Error("Failed to create admin profile");
          }

          setIsAuthorized(true);
        } else {
          throw new Error("User profile not found");
        }
      } else if (profile?.role === "admin") {
        setIsAuthorized(true);
      } else {
        throw new Error("Insufficient permissions - admin access required");
      }
    } catch (error) {
      console.error("Error checking admin auth:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-church-burgundy" />
              <span className="text-gray-600">Verifying access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">Access Denied</span>
              </div>
              <p className="text-sm text-gray-600">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate("/admin/login")}
                  className="w-full bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  Go to Login
                </Button>
                <Button 
                  onClick={checkAdminAuth}
                  variant="outline"
                  className="w-full"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
