import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import {
  X, MapPin, DollarSign, Maximize, Type, Bed, Bath,
  ImagePlus, Trash2, AlertCircle, CheckCircle2, Upload
} from 'lucide-react';
import { MapSelector } from './MapSelector';

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any, newFiles?: File[], deletedPublicIds?: string[]) => Promise<void>;
  onCancel: () => void;
  title: string;
}

/** A unified item in the preview list */
type PreviewItem =
  | { kind: 'existing'; url: string; publicId: string }
  | { kind: 'new'; file: File; previewUrl: string; id: string };

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const AMENITY_OPTIONS = [
  'wifi', 'parking', 'gym', 'pool', 'balcony', 'garden',
  'ac', 'heating', 'washer', 'dishwasher', 'fireplace',
];

function uid() {
  return Math.random().toString(36).slice(2);
}

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
    availableFrom: initialData?.availableFrom
      ? new Date(initialData.availableFrom).toISOString().split('T')[0]
      : '',
  });

  // Build initial preview list from existing images
  const [previews, setPreviews] = useState<PreviewItem[]>(() =>
    (initialData?.images || []).map((img: any) => ({
      kind: 'existing' as const,
      url: img.url,
      publicId: img.publicId,
    }))
  );

  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /** Validate + add files incrementally */
  const addFiles = useCallback((rawFiles: FileList | File[]) => {
    setValidationError('');
    const incoming = Array.from(rawFiles);
    const errors: string[] = [];

    const valid = incoming.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errors.push(`"${f.name}" is not a supported image type.`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`"${f.name}" exceeds the ${MAX_SIZE_MB} MB size limit.`);
        return false;
      }
      return true;
    });

    if (errors.length) {
      setValidationError(errors.join(' '));
    }

    setPreviews((prev) => {
      const slots = MAX_IMAGES - prev.length;
      if (slots <= 0) {
        setValidationError(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return prev;
      }
      const toAdd = valid.slice(0, slots);
      if (valid.length > slots) {
        setValidationError(`Only ${slots} more image(s) can be added (max ${MAX_IMAGES}).`);
      }
      const newItems: PreviewItem[] = toAdd.map((file) => ({
        kind: 'new',
        file,
        previewUrl: URL.createObjectURL(file),
        id: uid(),
      }));
      return [...prev, ...newItems];
    });

    // Reset input so same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removePreview = (item: PreviewItem) => {
    setValidationError('');
    if (item.kind === 'existing') {
      setDeletedPublicIds((prev) => [...prev, item.publicId]);
      setPreviews((prev) => prev.filter((p) => !(p.kind === 'existing' && p.publicId === item.publicId)));
    } else {
      URL.revokeObjectURL(item.previewUrl);
      setPreviews((prev) => prev.filter((p) => !(p.kind === 'new' && p.id === item.id)));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.latitude || !formData.longitude) {
      setError('Please pin the location on the map.');
      return;
    }
    if (validationError) return;

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        propertyType: formData.propertyType,
        description: formData.description,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        propertySize: Number(formData.propertySize),
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        amenities: formData.amenities,
        availableFrom: formData.availableFrom || undefined,
      };

      const newFiles = previews
        .filter((p): p is Extract<PreviewItem, { kind: 'new' }> => p.kind === 'new')
        .map((p) => p.file);

      await onSubmit(payload, newFiles.length > 0 ? newFiles : undefined, deletedPublicIds);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save property');
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = MAX_IMAGES - previews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Global error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input type="text" name="title" required placeholder="e.g. Modern Ocean View Villa"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.title} onChange={handleChange} />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Price ($ / Month)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input type="number" name="price" required min="0" placeholder="1500"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.price} onChange={handleChange} />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Type</label>
              <select name="propertyType"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                value={formData.propertyType} onChange={handleChange}>
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
                <input type="text" name="location" required placeholder="Metropolis, NY"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.location} onChange={handleChange} />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Size (sqft)</label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input type="number" name="propertySize" required min="0" placeholder="1200"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.propertySize} onChange={handleChange} />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Bedrooms</label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input type="number" name="bedrooms" required min="0" placeholder="2"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.bedrooms} onChange={handleChange} />
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Bathrooms</label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input type="number" name="bathrooms" required min="0" placeholder="1"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  value={formData.bathrooms} onChange={handleChange} />
              </div>
            </div>

            {/* Available From */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Available From (Optional)</label>
              <input type="date" name="availableFrom"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                value={formData.availableFrom} onChange={handleChange} />
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
                initialLocation={formData.latitude && formData.longitude
                  ? { lat: formData.latitude, lng: formData.longitude }
                  : undefined}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea name="description" rows={4} required
                placeholder="Talk about the amazing features of your property..."
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 px-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
                value={formData.description} onChange={handleChange} />
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border-2 ${
                      formData.amenities.includes(amenity)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200'
                    }`}>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── IMAGE MANAGEMENT ─────────────────────────────────── */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Property Images
              </label>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                previews.length >= MAX_IMAGES
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-slate-50 text-slate-400'
              }`}>
                {previews.length} / {MAX_IMAGES}
              </span>
            </div>

            {/* Validation error */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {validationError}
              </div>
            )}

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((item, idx) => {
                  const src = item.kind === 'existing' ? item.url : item.previewUrl;
                  const key = item.kind === 'existing' ? item.publicId : item.id;
                  const isFirst = idx === 0;
                  return (
                    <div key={key}
                      className={`relative group rounded-2xl overflow-hidden bg-slate-100 aspect-video shadow-sm border-2 transition-all ${
                        isFirst ? 'border-indigo-300' : 'border-transparent hover:border-indigo-100'
                      }`}>
                      <img src={src} alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      {/* Cover badge */}
                      {isFirst && (
                        <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      {/* Existing badge */}
                      {item.kind === 'existing' && (
                        <span className="absolute bottom-2 left-2 bg-black/40 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Saved
                        </span>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removePreview(item)}
                        className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drop-zone / Add button */}
            {previews.length < MAX_IMAGES ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-8 cursor-pointer transition-all select-none ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
                }`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'
                }`}>
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-indigo-500" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-indigo-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-600">
                    {isDragging ? 'Drop images here' : 'Click or drag images here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    JPEG, PNG, WebP, GIF · Max {MAX_SIZE_MB} MB each · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl text-slate-400 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Maximum of {MAX_IMAGES} images reached. Remove one to add another.
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
          {/* ── END IMAGE MANAGEMENT ─────────────────────────────── */}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="px-8 py-3 rounded-2xl shadow-lg shadow-indigo-100"
            >
              {initialData ? 'Update Property' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}