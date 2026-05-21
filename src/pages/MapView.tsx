import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { propertyService } from '../services/api';
import { MapPin, Home, DollarSign, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 160px)',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function MapView() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await propertyService.getAll();
        setProperties(data.filter(p => p.lat && p.lng));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

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
  if (!isLoaded || isLoading) return <div className="h-[600px] flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-[0.5em]">Global View Initializing...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <MapPin className="text-white h-6 w-6" />
             </div>
             Explore the Map
          </h1>
          <p className="text-slate-500 font-medium mt-1">Visualize all available rentals in the city.</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          options={{
             styles: [
               {
                 "featureType": "administrative",
                 "elementType": "labels.text.fill",
                 "stylers": [{ "color": "#444444" }]
               },
               {
                 "featureType": "landscape",
                 "elementType": "all",
                 "stylers": [{ "color": "#f2f2f2" }]
               },
               {
                 "featureType": "poi",
                 "elementType": "all",
                 "stylers": [{ "visibility": "off" }]
               },
               {
                 "featureType": "road",
                 "elementType": "all",
                 "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
               },
               {
                 "featureType": "road.highway",
                 "elementType": "all",
                 "stylers": [{ "visibility": "simplified" }]
               },
               {
                 "featureType": "road.arterial",
                 "elementType": "labels.icon",
                 "stylers": [{ "visibility": "off" }]
               },
               {
                 "featureType": "transit",
                 "elementType": "all",
                 "stylers": [{ "visibility": "off" }]
               },
               {
                 "featureType": "water",
                 "elementType": "all",
                 "stylers": [{ "color": "#e9e5dc" }, { "visibility": "on" }]
               }
             ]
          }}
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              onClick={() => setSelectedProperty(property)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/indigo-dot.png',
                scaledSize: new google.maps.Size(40, 40),
              }}
            />
          ))}

          {selectedProperty && (
            <InfoWindow
              position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="p-2 min-w-[200px]">
                <div className="mb-2 h-24 rounded-lg overflow-hidden">
                   <img src={selectedProperty.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-black text-slate-900 leading-tight mb-1">{selectedProperty.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                   <MapPin className="h-3 w-3" />
                   {selectedProperty.location}
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-black text-indigo-600">${selectedProperty.price}/mo</span>
                   <Link 
                     to={`/properties/${selectedProperty.id}`}
                     className="bg-indigo-600 text-white p-1 rounded-md hover:bg-slate-900 transition-colors"
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
  );
}
