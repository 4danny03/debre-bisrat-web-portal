import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, AuthUser } from "@/lib/auth/AuthService";
import "@/lib/auth/strategies";

export const useAdminAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setIsAdmin(false);
        navigate("/admin/login");
      } else if (event === "SIGNED_IN" && session) {
        await checkUserRole();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const { success, session } = await authService.getSession();

      if (success && session) {
        await checkUserRole();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const { success, user, error } = await authService.getCurrentUser();

      if (success && user) {
        setUser(user);
        const isUserAdmin = user.role === "admin";
        setIsAdmin(isUserAdmin);

        if (!isUserAdmin) {
          navigate("/admin/login");
        }
      } else {
        console.error("Error getting current user:", error);
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { success, error } = await authService.signOut();
      if (!success) {
        console.error("Error signing out:", error);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.authenticate("emailPassword", {
        email,
        password,
      });

      if (result.success && result.user) {
        setUser(result.user);
        setIsAdmin(result.user.role === "admin");
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error during login",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    signOut,
    login,
  };
};
