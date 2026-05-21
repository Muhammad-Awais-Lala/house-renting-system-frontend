import React, { useState } from 'react';
import { recommendationService, propertyService } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { Sparkles, Send, BrainCircuit, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export default function RecommendationPage() {
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setError('');
    
    try {
      const filters: any = {};
      if (budget) filters.budget = parseInt(budget);
      if (location) filters.location = location;
      if (bedrooms) filters.bedrooms = parseInt(bedrooms);

      // Try AI recommendations first, fall back to filter if not available
      try {
        const { data } = await recommendationService.getRecommendations(filters);
        setRecommendations(data.properties || []);
      } catch (err) {
        // Fall back to basic filtering
        const { data } = await propertyService.getAll({
          minPrice: filters.budget ? 0 : undefined,
          maxPrice: filters.budget,
          location: filters.location,
          bedrooms: filters.bedrooms,
        });
        setRecommendations(data.properties || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
      setRecommendations([]);
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-8 opacity-10">
           <BrainCircuit className="h-64 w-64" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold mb-6">
            <Sparkles className="h-4 w-4" />
            AI-POWERED INSIGHTS
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Find the perfect <br /> match for your lifestyle.
          </h1>
          <p className="text-indigo-100 text-lg mb-8 opacity-90">
            Our intelligent engine analyzes thousands of listings to find properties that fit your budget and preferences perfectly.
          </p>

          <form onSubmit={handleGetRecommendations} className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl shadow-indigo-900/20">
            <div className="flex-1 px-4 py-2 border-r border-slate-100 hidden md:block">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BUDGET</label>
              <input 
                type="number" 
                placeholder="e.g. 2000" 
                className="w-full border-none p-0 text-slate-900 font-bold focus:ring-0 placeholder:text-slate-300"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="flex-1 px-4 py-2 border-r border-slate-100 hidden md:block">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">LOCATION</label>
              <input 
                type="text" 
                placeholder="e.g. Downtown" 
                className="w-full border-none p-0 text-slate-900 font-bold focus:ring-0 placeholder:text-slate-300"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex-1 px-4 py-2 hidden md:block">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BEDROOMS</label>
              <input 
                type="number" 
                placeholder="e.g. 2" 
                className="w-full border-none p-0 text-slate-900 font-bold focus:ring-0 placeholder:text-slate-300"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>
            
            {/* Mobile inputs */}
            <div className="md:hidden flex flex-col gap-2 p-2">
                <input 
                    type="number" 
                    placeholder="Budget" 
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Location" 
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="Bedrooms" 
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                />
            </div>

            <Button type="submit" className="md:w-32 py-4 h-full rounded-xl" isLoading={isSearching}>
              Analyze
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
            <span className="text-sm font-medium text-slate-500">{recommendations.length} matches found</span>
          </div>

          {isSearching ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
               ))}
             </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((property) => (
                <PropertyCard
                  key={property._id || property.id}
                  id={property._id || property.id}
                  title={property.title}
                  price={property.price}
                  location={property.location}
                  size={property.propertySize}
                  type={property.propertyType}
                  image={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  rating={property.averageRating}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-500">No specific matches found. Try broadening your criteria.</p>
            </div>
          )}
          
          {recommendations.length > 0 && (
            <div className="mt-12">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Similar Properties</h3>
                <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                  {recommendations.slice(0, 4).map(p => (
                     <div key={p._id || p.id} className="min-w-[300px] w-80 flex-shrink-0">
                        <PropertyCard 
                          id={p._id || p.id}
                          title={p.title}
                          price={p.price}
                          location={p.location}
                          size={p.propertySize}
                          type={p.propertyType}
                          image={p.images?.[0] || 'https://via.placeholder.com/300x200'} 
                          bedrooms={p.bedrooms}
                          bathrooms={p.bathrooms}
                        />
                     </div>
                  ))}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
