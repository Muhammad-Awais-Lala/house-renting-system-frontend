import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { Search, Filter, SlidersHorizontal, AlertCircle, MapPin, BedDouble, Bath, X, Home } from 'lucide-react';
import { Button } from '../components/Button';

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError('');

        const filters: any = {};
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (searchTerm) filters.search = searchTerm;
        if (filterType !== 'All') filters.propertyType = filterType;
        if (location) filters.location = location;
        if (bedrooms) filters.bedrooms = parseInt(bedrooms);
        if (bathrooms) filters.bathrooms = parseInt(bathrooms);

        const response = await propertyService.getAll(filters);
        setProperties(response.data.properties || response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load properties');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType, minPrice, maxPrice, location, bedrooms, bathrooms]);

  // Backend enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'penthouse']
  const propertyTypes = ['All', 'apartment', 'house', 'studio', 'penthouse', 'condo', 'townhouse'];

  const clearFilters = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setFilterType('All');
  };

  const hasActiveFilters = location || minPrice || maxPrice || bedrooms || bathrooms || filterType !== 'All';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find your next home</h1>
          <p className="text-slate-500">Discover handpicked rentals for your perfect stay</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={showFilters ? "primary" : "outline"} 
            className="gap-2 transition-all shadow-sm relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 absolute -top-1 -right-1 border-2 border-white animate-pulse"></span>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties by title..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-base hover:border-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm hover:bg-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Price Range (PKR)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm hover:bg-white"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm hover:bg-white"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-indigo-500" />
                Bedrooms
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none hover:bg-white cursor-pointer"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Bath className="h-4 w-4 text-indigo-500" />
                Bathrooms
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none hover:bg-white cursor-pointer"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                >
                  <option value="">Any Bathrooms</option>
                  <option value="1">1+ Bathroom</option>
                  <option value="2">2+ Bathrooms</option>
                  <option value="3">3+ Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
              <span className="text-sm text-slate-500 font-medium">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-2 font-medium"
              >
                <X className="h-4 w-4" /> Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar items-center">
        <Home className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
        {propertyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm border-2 capitalize ${
              filterType === type
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id || property.id}
              id={property._id || property.id}
              title={property.title}
              price={property.price}
              location={property.location}
              size={property.propertySize}
              type={property.propertyType}
              image={property.images?.[0]?.url || property.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23f1f5f9'%3E%3Crect width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              rating={property.averageRating}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="inline-flex h-20 w-20 bg-slate-50 rounded-full items-center justify-center mb-6">
            <Filter className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No properties found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            We couldn't find any properties matching your exact criteria. Try adjusting your search or filters to see more results.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}