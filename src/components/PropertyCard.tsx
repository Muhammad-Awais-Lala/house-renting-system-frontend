import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Home as HomeIcon, Bed, Bath, Star } from 'lucide-react';
import { Button } from './Button';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  size: number | string;
  type: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  rating?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id, title, price, location, size, type, image, bedrooms, bathrooms, rating
}) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23f1f5f9'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
            }
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            ${price}/mo
          </span>
        </div>
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <HomeIcon className="h-3 w-3" />
          {type}
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </p>

        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            {size && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                {size} sqft
              </span>
            )}
            {bedrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {bedrooms}
              </span>
            )}
            {bathrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {bathrooms}
              </span>
            )}
          </div>
          <Link to={`/properties/${id}`}>
            <Button size="sm" variant="outline">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
