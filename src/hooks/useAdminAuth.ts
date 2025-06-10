import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminUser extends User {
  role?: string;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setIsAdmin(false);
        navigate("/admin/login");
      } else if (event === "SIGNED_IN" && session) {
        await checkUserRole(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await checkUserRole(session.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setLoading(false);
    }
  };

  const checkUserRole = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist, check if this is the first user
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (count === 0) {
          // First user becomes admin
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              role: "admin",
            });

          if (!createError) {
            setUser({ ...user, role: "admin" });
            setIsAdmin(true);
          }
        }
      } else if (profile?.role === "admin") {
        setUser({ ...user, role: profile.role });
        setIsAdmin(true);
      } else {
        setUser(user);
        setIsAdmin(false);
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    isAdmin,
    signOut,
  };
};
