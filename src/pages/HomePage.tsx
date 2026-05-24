import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { Search, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export default function HomePage() {
  const [properties, setProperties] = useState < any[] > ([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
  }, [searchTerm, filterType, minPrice, maxPrice]);

  // Backend enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'penthouse']
  const propertyTypes = ['All', 'apartment', 'house', 'studio', 'penthouse', 'condo', 'townhouse'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find your next home</h1>
          <p className="text-slate-500">Discover handpicked rentals</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Price"
            className="w-20 bg-white border border-slate-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="w-20 bg-white border border-slate-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        {propertyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm border-2 capitalize ${filterType === type
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
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
        <div className="py-20 text-center">
          <div className="inline-flex h-16 w-16 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No properties found</h2>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}