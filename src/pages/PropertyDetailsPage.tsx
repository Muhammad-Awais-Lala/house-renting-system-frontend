import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, bookingService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, MapPin, Maximize, Home, Calendar, CheckCircle, AlertCircle, Info, Map as MapIcon, Star, X, Bed, Bath } from 'lucide-react';
import { Button } from '../components/Button';
import { PropertyMap } from '../components/PropertyMap';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        // Backend returns { success, property, reviews }
        const response = await propertyService.getById(id as string);
        setProperty(response.data.property);
        setReviews(response.data.reviews || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }
    setIsBooking(true);
    try {
      await bookingService.create({
        propertyId: id as string,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: bookingData.numberOfGuests,
        message: bookingData.message,
      });
      setIsBooked(true);
      setShowBookingModal(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-indigo-600 font-bold animate-pulse">Loading Details...</div>;
  if (!property) return <div className="p-12 text-center text-red-600">{error || 'Property not found.'}</div>;

  // Images are objects {url, publicId} — extract URLs
  const imageUrls: string[] = (property.images || [])
    .map((img: any) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' fill='%23f1f5f9'%3E%3Crect width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  const displayImages = imageUrls.length > 0 ? imageUrls : [fallback];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold uppercase text-xs tracking-widest">
        <ChevronLeft className="h-4 w-4" /> Go Back
      </button>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /><span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 border border-white">
            <img src={displayImages[0]} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = fallback; } }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {displayImages.slice(1, 4).map((url: string, i: number) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100">
                <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = fallback; } }} />
              </div>
            ))}
            {displayImages.length > 4 && (
              <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                +{displayImages.length - 4} More
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
              <Home className="h-3 w-3" />{property.propertyType} Rental
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5 text-sm font-medium"><MapPin className="h-4 w-4 text-indigo-500" />{property.location}</span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><Maximize className="h-4 w-4 text-indigo-500" />{property.propertySize} {property.sizeUnit || 'sqft'}</span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><Bed className="h-4 w-4 text-indigo-500" />{property.bedrooms} Beds</span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><Bath className="h-4 w-4 text-indigo-500" />{property.bathrooms} Baths</span>
              {property.averageRating > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {property.averageRating.toFixed(1)} ({property.totalReviews})
                </span>
              )}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 relative z-10">MONTHLY RENT</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-5xl font-black">Rs {property.price}</span>
              <span className="text-slate-400 font-bold text-lg">/ month</span>
            </div>
            <div className="mt-8 relative z-10">
              <Button className="w-full rounded-2xl py-4 bg-white text-slate-900 hover:bg-slate-100 font-black h-14" onClick={() => { if (!user) navigate('/login'); else setShowBookingModal(true); }} isLoading={isBooking} disabled={isBooked}>
                {isBooked ? <><CheckCircle className="mr-2 h-5 w-5" />REQUESTED</> : <><Calendar className="mr-2 h-5 w-5" />BOOK VISIT</>}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Info className="h-5 w-5 text-indigo-600" />About this property</h3>
            <p className="text-slate-600 leading-relaxed text-lg italic bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">"{property.description}"</p>
          </div>

          {property.amenities?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl border border-indigo-100 capitalize">{a}</span>
                ))}
              </div>
            </div>
          )}

          {property.latitude && property.longitude && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><MapIcon className="h-5 w-5 text-indigo-600" />Location</h3>
              <PropertyMap lat={property.latitude} lng={property.longitude} />
            </div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-12 pt-12 border-t">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Guest Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review: any) => (
              <div key={review._id} className="p-6 border border-slate-200 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}
                  </div>
                  {review.isVerifiedTenant && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">Verified</span>}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{review.title}</h4>
                <p className="text-slate-600 text-sm mb-3">{review.comment}</p>
                <p className="text-xs text-slate-400">by {review.tenantId?.firstName} {review.tenantId?.lastName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Book This Property</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                <input type="date" min={today} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={bookingData.checkInDate} onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                <input type="date" min={bookingData.checkInDate || today} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={bookingData.checkOutDate} onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests</label>
                <input type="number" min="1" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={bookingData.numberOfGuests} onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message (Optional)</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} placeholder="Introduce yourself..." value={bookingData.message} onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })} />
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleBooking} isLoading={isBooking}>Confirm Booking</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
