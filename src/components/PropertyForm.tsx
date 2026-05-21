import React, { useState } from 'react';
import { Button } from './Button';
import { X, Upload, MapPin, DollarSign, Maximize, Type } from 'lucide-react';
import { MapSelector } from './MapSelector';

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export function PropertyForm({ initialData, onSubmit, onCancel, title }: PropertyFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    price: '',
    location: '',
    size: '',
    type: 'Apartment',
    description: '',
    images: ['https://picsum.photos/seed/newprop/800/600'],
    features: [],
    lat: null,
    lng: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev: any) => ({ ...prev, lat, lng }));
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Price ($ / Month)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="1500"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Type</label>
              <select
                name="type"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>

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

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Size (sqft)</label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="text"
                  name="size"
                  required
                  placeholder="1200 sqft"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.size}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Pin Target Location</label>
              <MapSelector 
                onLocationSelect={handleLocationSelect} 
                initialLocation={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
              />
            </div>

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

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Images</label>
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((img: string, i: number) => (
                  <div key={i} className="aspect-square relative group rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <button type="button" className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all bg-slate-50/50">
                  <Upload className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase">Add Image</span>
                </button>
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
