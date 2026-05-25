import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import { Calendar, Home, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function LandlordBookingsPage() {
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

  const handleApprove = async (id: string) => {
    try {
      await bookingService.approve(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, bookingStatus: 'approved' } : b));
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await bookingService.reject(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, bookingStatus: 'rejected' } : b));
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert('Failed to reject booking');
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
    return <div className="p-12 text-center text-indigo-600 font-bold animate-pulse">Loading Requests...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Booking Requests</h1>
        <p className="text-slate-500 mt-1">Manage incoming booking requests for your properties.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Requests Yet</h2>
          <p className="text-slate-500 mb-6">You have no booking requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1 w-full flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden">
                    {booking.tenantId?.profileImage ? (
                      <img src={booking.tenantId.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-indigo-600">{booking.tenantId?.firstName?.[0]}{booking.tenantId?.lastName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{booking.tenantId?.firstName} {booking.tenantId?.lastName}</h3>
                    <p className="text-sm text-slate-500">{booking.tenantId?.email} • {booking.tenantId?.phoneNumber || 'No phone'}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider", getStatusColor(booking.bookingStatus))}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-4 w-4 text-indigo-500" />
                  <Link to={`/properties/${booking.propertyId?._id}`} className="font-bold text-indigo-600 hover:underline">
                    {booking.propertyId?.title || 'Unknown Property'}
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>

                {booking.messageToLandlord && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                      <FileText className="h-3 w-3" /> Message
                    </p>
                    <p className="text-sm text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                      "{booking.messageToLandlord}"
                    </p>
                  </div>
                )}
              </div>

              {booking.bookingStatus === 'pending' && (
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleReject(booking._id)}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 border-none" onClick={() => handleApprove(booking._id)}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve Request
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
