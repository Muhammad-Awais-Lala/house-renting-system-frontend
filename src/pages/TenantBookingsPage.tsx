import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import { Calendar, Home, MapPin, XCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function TenantBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await bookingService.getAll();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await bookingService.cancel(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, bookingStatus: 'cancelled' } : b));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-indigo-600 font-bold animate-pulse">Loading Your Bookings...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">Manage your property booking requests.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Bookings Yet</h2>
          <p className="text-slate-500 mb-6">You haven't requested to book any properties yet.</p>
          <Link to="/">
            <Button>Explore Properties</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                {booking.propertyId?.images?.[0] ? (
                  <img src={booking.propertyId.images[0].url || booking.propertyId.images[0]} alt="Property" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Home className="h-8 w-8" /></div>
                )}
              </div>
              
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link to={`/properties/${booking.propertyId?._id}`} className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {booking.propertyId?.title || 'Unknown Property'}
                  </Link>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", getStatusColor(booking.bookingStatus))}>
                    {booking.bookingStatus}
                  </span>
                </div>
                
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {booking.propertyId?.location || 'Unknown Location'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50 mt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Move-in Date</p>
                    <p className="font-medium text-slate-900">{new Date(booking.moveInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</p>
                    <p className="font-medium text-slate-900">{booking.duration}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Occupants</p>
                    <p className="font-medium text-slate-900">{booking.numberOfOccupants}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Landlord</p>
                    <p className="font-medium text-slate-900 truncate">{booking.landlordId?.firstName} {booking.landlordId?.lastName}</p>
                  </div>
                </div>
              </div>

              {booking.bookingStatus === 'pending' && (
                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 flex md:flex-col gap-2">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleCancel(booking._id)}>
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
