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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="space-y-2">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavItem>
          <NavItem to="/admin/events" icon={<Calendar className="w-5 h-5" />}>
            Events
          </NavItem>
          <NavItem to="/admin/gallery" icon={<Image className="w-5 h-5" />}>
            Gallery
          </NavItem>
          <NavItem to="/admin/settings" icon={<Settings className="w-5 h-5" />}>
            Settings
          </NavItem>
        </nav>
        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
    >
      {icon}
      <span className="ml-3">{children}</span>
    </Link>
  );
}
