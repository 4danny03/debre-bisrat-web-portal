import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  Calendar,
  Image,
  Settings,
  LogOut,
} from 'lucide-react';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />}>
              Dashboard
            </NavItem>
            <NavItem to="/admin/events" icon={<Calendar size={20} />}>
              Events
            </NavItem>
            <NavItem to="/admin/gallery" icon={<Image size={20} />}>
              Gallery
            </NavItem>
            <NavItem to="/admin/settings" icon={<Settings size={20} />}>
              Settings
            </NavItem>
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      <span className="mr-2">{icon}</span>
      {children}
    </Link>
  );
}
