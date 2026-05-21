import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

interface PropertyMapProps {
  lat: number;
  lng: number;
}

export function PropertyMap({ lat, lng }: PropertyMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  if (!apiKey) {
    return (
      <div className="h-[300px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 text-center gap-3">
         <MapPin className="h-6 w-6 text-indigo-400 opacity-50" />
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect Google Maps key to view location</p>
      </div>
    );
  }

  if (loadError) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold">API Project Error (Maps API not enabled)</div>;
  if (!isLoaded) return <div className="h-[300px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Location...</div>;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm transition-all hover:border-indigo-100">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={{ lat, lng }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          scrollwheel: false,
        }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}
