import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Calendar,
  Image,
  Users,
  Activity,
  MessageSquare,
  Heart,
  DollarSign,
  Menu,
  X,
  Settings,
  LogOut,
  Users as UsersIcon,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist, create one for first user as admin
        const { count: adminCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (adminCount === 0) {
          // First user becomes admin
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: "admin",
            });

          if (createError) {
            console.error("Error creating admin profile:", createError);
            await supabase.auth.signOut();
            navigate("/admin/login");
            return;
          }
        } else {
          await supabase.auth.signOut();
          navigate("/admin/login");
          return;
        }
      } else if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const navigationItems = [
    {
      to: "/",
      icon: Home,
      label: "Main Website",
      description: "Return to public site",
      isExternal: true,
    },
    {
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Overview and statistics",
    },
    {
      to: "/admin/events",
      icon: Calendar,
      label: "Events",
      description: "Manage church events",
    },
    {
      to: "/admin/sermons",
      icon: Activity,
      label: "Sermons",
      description: "Manage sermons and audio",
    },
    {
      to: "/admin/members",
      icon: Users,
      label: "Members",
      description: "Manage church members",
    },
    {
      to: "/admin/gallery",
      icon: Image,
      label: "Gallery",
      description: "Manage photo gallery",
    },
    {
      to: "/admin/testimonials",
      icon: MessageSquare,
      label: "Testimonials",
      description: "Review testimonials",
    },
    {
      to: "/admin/prayer-requests",
      icon: Heart,
      label: "Prayer Requests",
      description: "Manage prayer requests",
    },
    {
      to: "/admin/donations",
      icon: DollarSign,
      label: "Donations",
      description: "Track donations",
    },
    {
      to: "/admin/settings",
      icon: Settings,
      label: "Settings",
      description: "System configuration",
    },
    {
      to: "/admin/health",
      icon: Activity,
      label: "Health Check",
      description: "System status",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-church-burgundy text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-church-burgundy/20">
            <div>
              <h1 className="text-xl font-bold text-church-gold">
                Admin Panel
              </h1>
              <p className="text-sm text-white/70">Church Management</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-church-burgundy/20"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return item.isExternal ? (
                <a
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors group",
                    "text-white/90 hover:bg-church-burgundy/20 hover:text-white bg-church-burgundy/10",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-church-gold" />
                  <div className="flex-1">
                    <div className="font-medium text-church-gold">
                      {item.label}
                    </div>
                    <div className="text-xs text-white/50">
                      {item.description}
                    </div>
                  </div>
                </a>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors group",
                    isActive
                      ? "bg-church-gold text-church-burgundy"
                      : "text-white/90 hover:bg-church-burgundy/20 hover:text-white",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 flex-shrink-0",
                      isActive
                        ? "text-church-burgundy"
                        : "text-white/70 group-hover:text-white",
                    )}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium",
                        isActive ? "text-church-burgundy" : "text-white",
                      )}
                    >
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isActive ? "text-church-burgundy/70" : "text-white/50",
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-church-burgundy/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:text-white hover:bg-church-burgundy/20"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-white/50">Exit admin panel</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-church-burgundy">
              Admin Panel
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
