import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Home as HomeIcon } from 'lucide-react';
import { Button } from './Button';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  size: string;
  type: string;
  image: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ id, title, price, location, size, type, image }) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            ${price}/mo
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <HomeIcon className="h-3 w-3" />
          {type}
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {location}
        </p>
        
        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
            <Maximize className="h-4 w-4" />
            {size}
          </div>
          <Link to={`/properties/${id}`}>
            <Button size="sm" variant="outline">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
