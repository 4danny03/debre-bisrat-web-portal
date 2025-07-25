import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const navigationItems = [
    { to: "/", icon: "Home", label: "Main Website", description: "Return to public site", isExternal: true },
    { to: "/admin/dashboard", icon: "LayoutDashboard", label: "Dashboard", description: "Overview and statistics" },
    { to: "/admin/events", icon: "Calendar", label: "Events", description: "Manage church events" },
    { to: "/admin/members", icon: "Users", label: "Members", description: "Manage church members" },
    { to: "/admin/gallery", icon: "Image", label: "Gallery", description: "Manage photo gallery" },
    { to: "/admin/testimonials", icon: "MessageSquare", label: "Testimonials", description: "Review testimonials" },
    { to: "/admin/prayer-requests", icon: "Heart", label: "Prayer Requests", description: "Manage prayer requests" },
    { to: "/admin/donations", icon: "DollarSign", label: "Donations", description: "Track donations" },
    { to: "/admin/appointments", icon: "CalendarCheck", label: "Appointments", description: "Manage appointment requests" },
    { to: "/admin/email-marketing", icon: "Mail", label: "Email Marketing", description: "Newsletter campaigns" },
    { to: "/admin/users", icon: "Users", label: "Users", description: "Manage admin users" },
    { to: "/admin/analytics", icon: "TrendingUp", label: "Analytics", description: "Data insights" },
    { to: "/admin/bulk-operations", icon: "Upload", label: "Bulk Operations", description: "Import/Export data" },
    { to: "/admin/content-scheduler", icon: "Clock", label: "Content Scheduler", description: "Schedule content" },
    { to: "/admin/system-health", icon: "Activity", label: "System Health", description: "System status & monitoring" },
    { to: "/admin/settings", icon: "Settings", label: "Settings", description: "System configuration" },
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
          "fixed inset-y-0 left-0 z-50 bg-church-burgundy text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-16" : "w-72",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-church-burgundy/20">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-church-gold">
                  Admin Panel
                </h1>
                <p className="text-sm text-white/70">Church Management</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {/* Desktop collapse toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-white hover:bg-church-burgundy/20"
                onClick={() => {
                  const newState = !sidebarCollapsed;
                  setSidebarCollapsed(newState);
                  localStorage.setItem(
                    "admin-sidebar-collapsed",
                    newState.toString(),
                  );
                }}
              >
                {sidebarCollapsed ? (
                  <Icons.ChevronRight className="w-5 h-5" />
                ) : (
                  <Icons.ChevronLeft className="w-5 h-5" />
                )}
              </Button>
              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-church-burgundy/20"
                onClick={() => setSidebarOpen(false)}
              >
                <Icons.X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            const isActive = location.pathname === item.to;

            // Only render Icon if it's a function and not the createLucideIcon utility
            function isLucideComponent(fn: unknown): fn is React.ComponentType<{ className?: string }> {
              return (
                typeof fn === "function" &&
                fn !== (Icons as any).createLucideIcon
              );
            }

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
                {isLucideComponent(Icon) ? (
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-church-gold" />
                ) : null}
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium text-church-gold">
                      {item.label}
                    </div>
                    <div className="text-xs text-white/50">
                      {item.description}
                    </div>
                  </div>
                )}
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
                {isLucideComponent(Icon) ? (
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 flex-shrink-0",
                      isActive
                        ? "text-church-burgundy"
                        : "text-white/70 group-hover:text-white",
                    )}
                  />
                ) : null}
                {!sidebarCollapsed && (
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
                        isActive
                          ? "text-church-burgundy/70"
                          : "text-white/50",
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
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
              <Icons.LogOut className="w-5 h-5 mr-3" />
              {!sidebarCollapsed && (
                <div className="text-left">
                  <div className="font-medium">Sign Out</div>
                  <div className="text-xs text-white/50">Exit admin panel</div>
                </div>
              )}
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
              <Icons.Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-church-burgundy">
              Admin Panel
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link
                to="/admin/dashboard"
                className="hover:text-church-burgundy"
              >
                Dashboard
              </Link>
              {location.pathname !== "/admin/dashboard" && (
                <>
                  <span>/</span>
                  <span className="text-church-burgundy font-medium capitalize">
                    {location.pathname.split("/").pop()?.replace("-", " ")}
                  </span>
                </>
              )}
            </nav>
          </div>

          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
