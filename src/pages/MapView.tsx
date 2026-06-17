import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { propertyService } from '../services/api';
import { MapPin, Navigation, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PropertyCard } from '../components/PropertyCard';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 160px)',
};

// Default center (can be updated based on requirements, currently set to New York)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const libraries: "places"[] = ["places"];

// Helper function to calculate distance using Haversine formula (in kilometers)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapView() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters State
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchAddress, setSearchAddress] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch a large limit to allow local filtering
        const response = await propertyService.getAll({ limit: 1000 });
        const data = response.data.properties || response.data || [];
        // Important: use latitude and longitude to match backend model
        setAllProperties(data.filter((p: any) => p.latitude && p.longitude));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = () => {
    if (!searchAddress.trim() || !isLoaded) return;
    setIsSearching(true);

    const searchLower = searchAddress.toLowerCase();
    const matchingProperties = allProperties.filter(property =>
      property.location?.toLowerCase().includes(searchLower)
    );

    if (matchingProperties.length > 0) {
      const firstMatch = matchingProperties[0];
      setMapCenter({ lat: firstMatch.latitude, lng: firstMatch.longitude });
      mapRef.current?.panTo({ lat: firstMatch.latitude, lng: firstMatch.longitude });
      mapRef.current?.setZoom(12);
      setSelectedProperty(null);
      setIsSearching(false);
    } else {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        setIsSearching(false);
        if (status === 'OK' && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setMapCenter({ lat: lat(), lng: lng() });
          mapRef.current?.panTo({ lat: lat(), lng: lng() });
          mapRef.current?.setZoom(12);
          setSelectedProperty(null);
        } else {
          alert('Could not find this location. Please try a different address.');
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsSearching(false);
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newCenter);
          // setSearchAddress('My Current Location');
          mapRef.current?.panTo(newCenter);
          mapRef.current?.setZoom(12);
          setSelectedProperty(null);
        },
        () => {
          setIsSearching(false);
          alert('Unable to retrieve your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Filter properties by location string or within the selected radius
  const filteredProperties = useMemo(() => {
    if (searchAddress.trim()) {
      const searchLower = searchAddress.toLowerCase();
      return allProperties.filter(property =>
        property.location?.toLowerCase().includes(searchLower)
      );
    }

    return allProperties.filter((property) => {
      const distance = getDistance(
        mapCenter.lat,
        mapCenter.lng,
        property.latitude,
        property.longitude
      );
      return distance <= radiusKm;
    });
  }, [allProperties, mapCenter, radiusKm, searchAddress]);

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-12 bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-indigo-100/20">
        <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <MapPin className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Map Key Configuration Required</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">To visualize properties on the global map, please add your Google Maps API key as <code className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in the AI Studio Secrets panel.</p>
        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl text-left border border-indigo-100">
          <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">Enable Maps JavaScript API</p>
            <p className="text-xs text-slate-500">Go to Google Cloud Console &gt; APIs &amp; Services</p>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) return <div className="p-12 text-center text-red-600 font-bold uppercase tracking-widest">Error Loading Google Maps (API Project Error)</div>;
  if (!isLoaded || isLoading) return <div className="h-[600px] flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-[0.5em]">Map Initializing...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <MapPin className="text-white h-6 w-6" />
            </div>
            Explore the Map
          </h1>
          <p className="text-slate-500 font-medium mt-1">Discover properties around your desired location</p>
        </div>

        {/* Search & Location Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter location to search..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSearch} isLoading={isSearching}>
              Search
            </Button>
            <Button variant="outline" onClick={getUserLocation} title="Use My Location" className="px-3">
              <Navigation className="h-4 w-4 text-indigo-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-grow w-full">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-semibold text-slate-700">Search Radius</label>
            <span className="text-sm font-bold text-indigo-600">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <div className="flex-shrink-0 text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
          <span className="text-slate-900 font-bold">{filteredProperties.length}</span> properties found
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-grow pb-8">
        {/* Properties List Sidebar */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 no-scrollbar">
          {filteredProperties.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center h-48">
              <MapPin className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No properties found within this radius.</p>
              <p className="text-sm text-slate-400 mt-1">Try expanding your search radius or changing location.</p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property._id || property.id}
                onMouseEnter={() => {
                  mapRef.current?.panTo({ lat: property.latitude, lng: property.longitude });
                  setSelectedProperty(property);
                }}
              >
                <PropertyCard
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
              </div>
            ))
          )}
        </div>

        {/* Map Area */}
        <div className="w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative flex-grow min-h-[400px] lg:min-h-[calc(100vh-200px)]">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', minHeight: '400px' }}
            zoom={12}
            center={mapCenter}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              styles: [
                { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
                { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
                { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
                { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
                { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#e9e5dc" }, { "visibility": "on" }] }
              ],
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {/* Draw a circle to visualize the search radius */}
            {!searchAddress.trim() && (
              <Circle
                center={mapCenter}
                radius={radiusKm * 1000} // radius in meters
                options={{
                  strokeColor: '#4f46e5',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#4f46e5',
                  fillOpacity: 0.1,
                }}
              />
            )}

            {filteredProperties.map((property) => (
              <Marker
                key={property._id || property.id}
                position={{ lat: property.latitude, lng: property.longitude }}
                onClick={() => setSelectedProperty(property)}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/indigo-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            ))}

            {selectedProperty && (
              <InfoWindow
                position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
                onCloseClick={() => setSelectedProperty(null)}
              >
                <div className="p-2 min-w-[200px] max-w-[250px]">
                  <div className="mb-2 h-24 rounded-lg overflow-hidden relative group">
                    <img
                      src={selectedProperty.images?.[0]?.url || selectedProperty.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23f1f5f9'%3E%3Crect width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"}
                      alt=""
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-black text-slate-900 leading-tight mb-1 truncate">{selectedProperty.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-2 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedProperty.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-sm font-black text-indigo-600">PKR {selectedProperty.price}</span>
                    <Link
                      to={`/properties/${selectedProperty._id || selectedProperty.id}`}
                      className="bg-indigo-600 text-white p-1.5 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                      title="View Details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
