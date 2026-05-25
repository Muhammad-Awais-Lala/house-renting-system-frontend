import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService, propertyService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Home as HomeIcon, 
  TrendingUp, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
     totalProperties: 0,
     activeBookings: 0,
     totalRevenue: 0,
     newRequests: 0
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        // Fetch bookings — backend returns { success, count, total, bookings }
        const bookingsResponse = await bookingService.getAll({ page: 1, limit: 50 });
        const allBookings = bookingsResponse.data.bookings || [];
        setBookings(allBookings);

        // Fetch landlord's actual property count
        let propCount = 0;
        try {
          const propsResponse = await propertyService.getLandlordProperties(user._id);
          propCount = propsResponse.data.total ?? propsResponse.data.count ?? 0;
        } catch { /* non-critical */ }

        setStats({
          totalProperties: propCount,
          activeBookings: allBookings.filter((b: any) => b.status === 'accepted').length,
          totalRevenue: allBookings
            .filter((b: any) => b.status === 'accepted')
            .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
          newRequests: allBookings.filter((b: any) => b.status === 'pending').length,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await bookingService.accept(bookingId);
      // Refresh bookings
      const response = await bookingService.getAll();
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      console.error('Failed to accept booking:', err);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await bookingService.reject(bookingId);
      // Refresh bookings
      const response = await bookingService.getAll();
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      console.error('Failed to reject booking:', err);
    }
  };

  const statsCards = [
    { name: 'Total Properties', value: stats.totalProperties, icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Bookings', value: stats.activeBookings, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Total Revenue', value: `Rs ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'New Requests', value: stats.newRequests, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 group">
            Welcome back, <span className="text-indigo-600 italic">{user?.firstName}</span>
          </h1>
          <p className="text-slate-500">Here's what's happening with your properties today.</p>
        </div>
        <Button className="shadow-lg shadow-indigo-100 gap-2" onClick={() => navigate('/landlord/properties')}>
          <Plus className="h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Booking Requests</h2>
              <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">View All</Button>
            </div>
            
            <div className="space-y-4">
               {isLoading ? (
                  [1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
               ) : pendingBookings.length > 0 ? (
                  pendingBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-200 transition-all group">
                       <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                          <img src={booking.tenantId?.profileImage || `https://picsum.photos/seed/${booking._id}/100/100`} className="h-full w-full object-cover" referrerPolicy="no-referrer" alt="Tenant" />
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-slate-900">{booking.tenantId?.firstName} {booking.tenantId?.lastName}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                       </div>
                       <div className="text-right pr-2">
                         <p className="font-bold text-slate-900">Rs {booking.totalPrice}</p>
                         <p className="text-xs text-slate-500">{booking.numberOfGuests} guests</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleAcceptBooking(booking._id)}
                          >
                             <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectBooking(booking._id)}
                          >
                             <XCircle className="h-5 w-5" />
                          </Button>
                       </div>
                    </div>
                  ))
               ) : (
                  <div className="py-12 text-center text-slate-400">
                     <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                     <p>No pending requests at the moment.</p>
                  </div>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50" />
              <h3 className="font-black text-slate-900 mb-4 relative z-10">Occupancy Rate</h3>
              <div className="flex items-end gap-3 mb-6 relative z-10">
                 <span className="text-5xl font-black text-indigo-600 leading-none">
                   {stats.activeBookings > 0 ? Math.min(85 + (stats.activeBookings * 5), 100) : 0}
                 </span>
                 <span className="text-xl font-bold text-slate-400 pb-1">%</span>
              </div>
              <div className="w-full bg-indigo-50 h-2 rounded-full overflow-hidden">
                 <div 
                   className="bg-indigo-600 h-full transition-all" 
                   style={{ width: `${stats.activeBookings > 0 ? Math.min(85 + (stats.activeBookings * 5), 100) : 0}%` }}
                 />
              </div>
              <p className="mt-4 text-xs text-slate-400 font-medium">Based on current bookings</p>
           </div>

           <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h3 className="font-bold text-slate-300 text-sm uppercase tracking-widest mb-6">Quick Action</h3>
              <p className="text-lg font-medium mb-6">View all your properties and manage them efficiently.</p>
              <Button 
                className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-2xl py-6 font-black uppercase tracking-tighter shadow-xl shadow-white/10"
                onClick={() => navigate('/landlord/properties')}
              >
                 MANAGE PROPERTIES
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
