import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Button } from './Button';

const libraries: Libraries = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};
const center = {
  lat: 40.7128,
  lng: -74.0060,
};

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

export function MapSelector({ onLocationSelect, initialLocation }: MapSelectorProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(initialLocation || null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarker(newPos);
      onLocationSelect(newPos.lat, newPos.lng);
    }
  }, [onLocationSelect]);

  const onSelectFromAutocomplete = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarker(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
        map?.panTo(newPos);
      }
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarker(newPos);
          onLocationSelect(newPos.lat, newPos.lng);
          map?.panTo(newPos);
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  if (!apiKey) {
    return (
      <div className="p-8 bg-slate-900 rounded-3xl border-2 border-indigo-500/30 text-center space-y-4">
        <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <MapPin className="text-indigo-400 h-6 w-6" />
        </div>
        <h3 className="text-white font-black text-lg">Google Maps Key Missing</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Please add <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to your Secrets in AI Studio Settings.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-3xl border-2 border-red-100 space-y-3">
        <p className="font-black">Map Loading Error</p>
        <p className="text-xs leading-relaxed">
          The Google Maps API returned a project error (ApiProjectMapError). Ensure <strong>Maps JavaScript API</strong> is enabled in your Google Cloud Console.
        </p>
        <a 
          href="https://developers.google.com/maps/documentation/javascript/error-messages#api-project-map-error" 
          target="_blank" 
          rel="noreferrer"
          className="inline-block text-xs underline font-bold"
        >
          View Documentation
        </a>
      </div>
    );
  }
  if (!isLoaded) return <div className="h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold">Initializing Map...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onSelectFromAutocomplete}
          >
            <input
              type="text"
              placeholder="Search for address..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold placeholder:text-slate-300"
            />
          </Autocomplete>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          className="rounded-2xl gap-2 font-bold whitespace-nowrap"
          onClick={getUserLocation}
        >
          <Navigation className="h-4 w-4" />
          Current Location
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={marker || center}
          onClick={onMapClick}
          onLoad={(map) => setMap(map)}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
        
        {!marker && (
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-slate-600 shadow-sm">
              Click on the map to select a location
            </div>
          </div>
        )}
      </div>

      {marker && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl text-indigo-700">
          <MapPin className="h-4 w-4" />
          <span className="text-xs font-bold">
            Selected: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
