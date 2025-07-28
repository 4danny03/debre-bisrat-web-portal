import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/auth/AuthService";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  ariaLabel?: string;
}

export default function AdminAuthGuard({ children, ariaLabel }: AdminAuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setIsAuthorized(false);
        navigate("/admin/login");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkAdminAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAuth = async () => {
    try {
      setLoading(true);
      const isAdmin = await authService.isAdmin();

      if (!isAdmin) {
        navigate("/admin/login");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Error checking admin auth:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
        aria-label={ariaLabel || "Verifying admin access"}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-church-burgundy" aria-hidden="true" />
          <span className="text-gray-600">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <div role="region" aria-label={ariaLabel || "Admin content"}>{children}</div>;
}
