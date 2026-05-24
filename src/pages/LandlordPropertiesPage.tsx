import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/api';
import { Button } from '../components/Button';
import { PropertyForm } from '../components/PropertyForm';
import {
  Plus,
  MapPin,
  Maximize,
  Trash2,
  Edit3,
  MoreVertical,
  Search,
  Filter,
  Building2,
  Bed,
  Bath,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandlordPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      // Use dedicated landlord endpoint instead of fetching all and filtering client-side
      const { data } = await propertyService.getLandlordProperties(user._id);
      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load properties');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const handleAdd = async (data: any, newFiles?: File[], _deletedIds?: string[]) => {
    // landlordId is set server-side from req.user.id (JWT) — no need to send it
    await propertyService.create(data, newFiles);
    await fetchProperties();
    setIsFormOpen(false);
  };

  const handleUpdate = async (data: any, newFiles?: File[], deletedPublicIds?: string[]) => {
    await propertyService.update(editingProperty._id, data, newFiles, deletedPublicIds);
    await fetchProperties();
    setEditingProperty(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await propertyService.delete(id);
      await fetchProperties();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(p =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inline SVG data URI used as the "no image" placeholder – works offline,
  // never triggers network errors, and stops the onError infinite-loop.
  const NO_IMAGE_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23f1f5f9'%3E%3Crect width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Helper: get first image URL from the images array (objects with {url, publicId})
  const getImageUrl = (property: any) =>
    property.images?.[0]?.url || NO_IMAGE_PLACEHOLDER;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Properties</h1>
          <p className="text-slate-500 font-medium">Manage and monitor your rental listings.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 pr-6">
          <Plus className="h-5 w-5" />
          Add Property
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          <input
            type="text"
            placeholder="Search your listings..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="bg-white border-2 border-slate-100 rounded-2xl px-6 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredProperties.map((property) => (
            <div key={property._id} className="bg-white group rounded-3xl border-2 border-slate-50 p-4 flex flex-col md:flex-row items-center gap-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all">
              <div className="h-32 w-full md:w-32 rounded-2xl overflow-hidden shadow-inner bg-slate-100 flex-shrink-0">
                <img
                  src={getImageUrl(property)}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    // Guard: only replace once to prevent infinite loop
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = NO_IMAGE_PLACEHOLDER;
                    }
                  }}
                  alt={property.title}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {property.propertyType}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">
                    {property.isAvailable ? 'Active' : 'Unavailable'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{property.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    {property.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize className="h-4 w-4 text-indigo-500" />
                    {property.propertySize} sqft
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-indigo-500" />
                    {property.bedrooms} bd
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-indigo-500" />
                    {property.bathrooms} ba
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center md:pr-4">
                <div className="text-2xl font-black text-slate-900 mb-4">
                  ${property.price}<span className="text-slate-400 text-xs font-bold leading-none">/mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setEditingProperty(property)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(property._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-slate-50">
                    <MoreVertical className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-slate-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No Properties Listed</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            You haven't added any properties yet. Start your journey as a landlord by adding your first listing.
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="rounded-2xl px-8 shadow-lg shadow-indigo-100">
            Add First Listing
          </Button>
        </div>
      )}

      {/* Modal Forms */}
      {isFormOpen && (
        <PropertyForm
          title="Add New Listing"
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingProperty && (
        <PropertyForm
          title="Edit Listing"
          initialData={editingProperty}
          onCancel={() => setEditingProperty(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
