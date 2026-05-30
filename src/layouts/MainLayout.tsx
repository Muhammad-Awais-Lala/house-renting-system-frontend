import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  Search,
  MessageSquare,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Sparkles,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tenantNav = [
    { name: 'Explore', href: '/', icon: Home },
    { name: 'Map View', href: '/map', icon: MapIcon },
    { name: 'AI Recommendations', href: '/recommendations', icon: Sparkles },
    { name: 'My Bookings', href: '/bookings', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const landlordNav = [
    { name: 'Dashboard', href: '/landlord/dashboard', icon: LayoutDashboard },
    { name: 'My Properties', href: '/landlord/properties', icon: Building2 },
    { name: 'Bookings', href: '/landlord/bookings', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Properties', href: '/admin/properties', icon: Building2 },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const currentNav = user?.role === 'tenant' ? tenantNav :
    user?.role === 'landlord' ? landlordNav : adminNav;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-right border-slate-200 shadow-sm">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              HouseIntel
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {currentNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === item.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 transform md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">HouseIntel</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        <nav className="px-4 py-6 space-y-1">
          {currentNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg",
                location.pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-slate-200">
          <button
            className="md:hidden p-2 text-slate-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search rentals..."
                className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </Button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 shadow-sm md:hidden">
              <img src={user?.avatar} alt={user?.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
