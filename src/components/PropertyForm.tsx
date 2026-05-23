import React, { useState } from 'react';
import { Button } from './Button';
import { X, MapPin, DollarSign, Maximize, Type, Bed, Bath } from 'lucide-react';
import { MapSelector } from './MapSelector';

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  title: string;
}

const AMENITY_OPTIONS = ['wifi', 'parking', 'gym', 'pool', 'balcony', 'garden', 'ac', 'heating', 'washer', 'dishwasher', 'fireplace'];

export function PropertyForm({ initialData, onSubmit, onCancel, title }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    location: initialData?.location || '',
    propertySize: initialData?.propertySize || '',
    propertyType: initialData?.propertyType || 'apartment',
    description: initialData?.description || '',
    bedrooms: initialData?.bedrooms || '',
    bathrooms: initialData?.bathrooms || '',
    amenities: initialData?.amenities || [] as string[],
    latitude: initialData?.latitude || null as number | null,
    longitude: initialData?.longitude || null as number | null,
    availableFrom: initialData?.availableFrom ? new Date(initialData.availableFrom).toISOString().split('T')[0] : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.latitude || !formData.longitude) {
      setError('Please pin the location on the map.');
      return;
    }

    setIsLoading(true);
    try {
      // Send as JSON — backend reads from req.body (no multer needed without files)
      const payload = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        propertySize: Number(formData.propertySize),
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        amenities: formData.amenities,
        availableFrom: formData.availableFrom || undefined,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Modern Ocean View Villa"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Price ($ / Month)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  placeholder="1500"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Type</label>
              <select
                name="propertyType"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                value={formData.propertyType}
                onChange={handleChange}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="penthouse">Penthouse</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Metropolis, NY"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Size (sqft)</label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="number"
                  name="propertySize"
                  required
                  min="0"
                  placeholder="1200"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.propertySize}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Bedrooms</label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="number"
                  name="bedrooms"
                  required
                  min="0"
                  placeholder="2"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Bathrooms</label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="number"
                  name="bathrooms"
                  required
                  min="0"
                  placeholder="1"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Available From */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Available From (Optional)</label>
              <input
                type="date"
                name="availableFrom"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                value={formData.availableFrom}
                onChange={handleChange}
              />
            </div>

            {/* Map */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Pin Location on Map
                {formData.latitude && formData.longitude && (
                  <span className="ml-2 text-emerald-500 normal-case font-medium">✓ Location set</span>
                )}
              </label>
              <MapSelector
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Talk about the amazing features of your property..."
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border-2 ${
                      formData.amenities.includes(amenity)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} className="px-8 py-3 rounded-2xl shadow-lg shadow-indigo-100">
              {initialData ? 'Update Property' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
