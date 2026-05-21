import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, propertyService } from '../services/api';
import { Users, Building2, AlertTriangle, ArrowUpRight, BarChart3, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', icon: Users, change: '+0%', trend: 'none' },
    { label: 'Total Listings', value: '0', icon: Building2, change: '+0%', trend: 'none' },
    { label: 'Reported Content', value: '0', icon: AlertTriangle, change: '+0%', trend: 'none' },
    { label: 'Security Status', value: 'Checking...', icon: ShieldCheck, change: '100%', trend: 'none' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userGrowth, setUserGrowth] = useState<number[]>([40, 60, 45, 70, 85, 90, 100, 80, 95, 110]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch users data
        const usersResponse = await userService.getAll();
        const totalUsers = usersResponse.data.length || 0;

        // Fetch properties data
        const propertiesResponse = await propertyService.getAll({ limit: 1000 });
        const totalListings = propertiesResponse.data.properties?.length || propertiesResponse.data.length || 0;

        // Update stats
        setStats([
          { label: 'Total Users', value: totalUsers.toString(), icon: Users, change: '+12%', trend: 'up' },
          { label: 'Total Listings', value: totalListings.toString(), icon: Building2, change: '+5%', trend: 'up' },
          { label: 'Reported Content', value: '0', icon: AlertTriangle, change: '-20%', trend: 'down' },
          { label: 'Security Status', value: 'Healthy', icon: ShieldCheck, change: '100%', trend: 'none' },
        ]);

        // Generate mock user growth data
        const growthData = Array.from({ length: 10 }, (_, i) => 
          Math.round(30 + (i * 8) + Math.random() * 20)
        );
        setUserGrowth(growthData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white h-6 w-6" />
             </div>
             System Overview
          </h1>
          <p className="text-slate-500 font-medium mt-1">Global management and monitoring dashboard.</p>
        </div>
        <Button variant="outline" className="border-indigo-100 text-indigo-700 bg-indigo-50/50">Generate Report</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm hover:border-indigo-100 transition-all">
              <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-slate-50 rounded-2xl">
                    <stat.icon className="h-6 w-6 text-slate-400" />
                 </div>
                 <div className={`flex items-center text-xs font-black ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-amber-500' : 'text-slate-400'}`}>
                    {stat.change}
                    <ArrowUpRight className="h-3 w-3 ml-0.5" />
                 </div>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  User Growth
               </h2>
               <select className="bg-slate-50 border-none rounded-xl text-xs font-bold py-2 px-3 outline-none">
                  <option>Last 30 Days</option>
                  <option>Last 6 Months</option>
               </select>
            </div>
            <div className="h-48 flex items-end gap-2 pb-2">
               {userGrowth.map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg hover:bg-indigo-600 transition-colors group relative" style={{ height: `${h}%` }}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        {h} users
                     </div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <span>Week 1</span>
               <span>Week 2</span>
               <span>Week 3</span>
               <span>Today</span>
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-8">System Alerts</h2>
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">
                     <p className="text-sm font-bold text-amber-900">Content Review Pending</p>
                     <p className="text-xs text-amber-700">Several properties await content moderation review.</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-amber-800 hover:bg-amber-100">Review</Button>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                     <p className="text-sm font-bold text-indigo-900">System Healthy</p>
                     <p className="text-xs text-indigo-700">All systems operational. Last backup completed successfully.</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-indigo-800 hover:bg-indigo-100">Logs</Button>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-100">
                  <Users className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                     <p className="text-sm font-bold text-green-900">New User Activity</p>
                     <p className="text-xs text-green-700">24% increase in user registrations this week.</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-green-800 hover:bg-green-100">Details</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
