import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, propertyService } from '../services/api';
import { Button } from '../components/Button';
import {
  Users, Building2, ShieldCheck, ArrowUpRight,
  BarChart3, AlertCircle, TrendingUp, Home,
  UserCheck, UserX, ChevronRight, RefreshCw
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  blockedUsers: number;
  totalProperties: number;
  activeProperties: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [usersRes, propertiesRes] = await Promise.all([
        userService.getAll(),
        propertyService.getAll({ limit: 1000 }),
      ]);

      const allUsers: any[] = usersRes.data.users || [];
      const allProps: any[] = propertiesRes.data.properties || propertiesRes.data || [];

      setStats({
        totalUsers: allUsers.length,
        totalLandlords: allUsers.filter((u: any) => u.role === 'landlord').length,
        totalTenants: allUsers.filter((u: any) => u.role === 'tenant').length,
        blockedUsers: allUsers.filter((u: any) => !u.isActive).length,
        totalProperties: propertiesRes.data.total ?? allProps.length,
        activeProperties: allProps.filter((p: any) => p.isAvailable).length,
      });

      // 5 most recently joined users
      const sorted = [...allUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentUsers(sorted.slice(0, 5));

      // 4 most recently added properties
      setRecentProperties(allProps.slice(0, 4));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    landlord: 'bg-indigo-100 text-indigo-700',
    tenant: 'bg-emerald-100 text-emerald-700',
  };

  const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23f1f5f9'%3E%3Crect width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white h-6 w-6" />
            </div>
            System Overview
          </h1>
          <p className="text-slate-500 mt-1">Real-time platform statistics and management hub.</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2 self-start sm:self-center">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />{error}
        </div>
      )}

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-indigo-600', sub: `${stats.blockedUsers} blocked` },
            { label: 'Landlords', value: stats.totalLandlords, icon: Home, color: 'bg-violet-600', sub: 'registered landlords' },
            { label: 'Tenants', value: stats.totalTenants, icon: UserCheck, color: 'bg-emerald-600', sub: 'registered tenants' },
            { label: 'Blocked Users', value: stats.blockedUsers, icon: UserX, color: 'bg-red-500', sub: 'suspended accounts' },
            { label: 'Total Listings', value: stats.totalProperties, icon: Building2, color: 'bg-amber-500', sub: `${stats.activeProperties} active` },
            { label: 'System Status', value: 'Healthy', icon: ShieldCheck, color: 'bg-teal-600', sub: 'all systems operational' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" /> Recent Users
            </h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse"/>)}</div>
          ) : recentUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No users yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentUsers.map(u => (
                <li key={u._id} className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/50">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                    {!u.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Blocked</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" /> Recent Listings
            </h2>
            <Link to="/admin/properties">
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse"/>)}</div>
          ) : recentProperties.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No properties yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentProperties.map(p => {
                const id = p._id || p.id;
                const img = p.images?.[0]?.url || p.images?.[0] || PLACEHOLDER_IMG;
                return (
                  <li key={id} className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/50">
                    <img src={img} alt={p.title} className="h-11 w-16 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500 truncate">{p.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-indigo-600">PKR {p.price?.toLocaleString()}</span>
                      <Link to={`/properties/${id}`} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-0.5">
                        View <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-white" />
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Users', desc: 'Block, remove or review users', href: '/admin/users', icon: Users },
            { label: 'Monitor Listings', desc: 'Review and remove properties', href: '/admin/properties', icon: Building2 },
            { label: 'My Profile', desc: 'Update your admin profile', href: '/profile', icon: ShieldCheck },
          ].map(action => (
            <Link key={action.label} to={action.href}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl p-4 group">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{action.label}</p>
                <p className="text-indigo-200 text-xs">{action.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-indigo-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
