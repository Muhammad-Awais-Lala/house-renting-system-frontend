import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { 
  Building2, Sparkles, MapPin, ShieldCheck, 
  MessageCircle, Search, Compass, Star, ArrowRight,
  TrendingUp, Users, ChevronRight, Play, CheckCircle2 
} from 'lucide-react';
import { propertyService } from '../services/api';

const TYPE_COLORS: Record<string, string> = {
  apartment: 'bg-blue-100 text-blue-700',
  house: 'bg-green-100 text-green-700',
  studio: 'bg-orange-100 text-orange-700',
  penthouse: 'bg-purple-100 text-purple-700',
};

const FEATURED_PROPERTIES = [
  {
    id: 'f1',
    title: 'Smart Tech Apartment',
    location: 'Sector F-11, Islamabad',
    price: 85000,
    bedrooms: 2,
    bathrooms: 2,
    type: 'apartment',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'f2',
    title: 'Luxury Family House',
    location: 'DHA Phase 6, Lahore',
    price: 180000,
    bedrooms: 4,
    bathrooms: 4,
    type: 'house',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'f3',
    title: 'Cozy Modern Studio',
    location: 'Clifton Block 5, Karachi',
    price: 45000,
    bedrooms: 1,
    bathrooms: 1,
    type: 'studio',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');
  const [mockSearch, setMockSearch] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await propertyService.getAll({ limit: 3 });
        if (res.data && res.data.properties) {
          setProperties(res.data.properties);
          setTotalProperties(res.data.total || res.data.properties.length);
        } else if (Array.isArray(res.data)) {
          setProperties(res.data.slice(0, 3));
          setTotalProperties(res.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch real properties for landing page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const displayedProperties = properties.length > 0 ? properties : FEATURED_PROPERTIES;

  const getPropertyImage = (p: any) => {
    if (p.image) return p.image; // fallback mockup
    const imgObj = p.images?.[0];
    if (!imgObj) return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
    return typeof imgObj === 'string' ? imgObj : imgObj.url || imgObj;
  };

  const getPropertyType = (p: any) => {
    return p.propertyType || p.type || 'apartment';
  };

  const getPropertyRating = (p: any) => {
    return p.averageRating !== undefined ? p.averageRating : p.rating || 4.8;
  };


  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION WITH RICH GRADIENTS & MICRO-ANIMATIONS */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-indigo-300/20 to-violet-300/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left (Text & Call-To-Actions) */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold tracking-wide animate-bounce hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                AI-Powered Smart Recommendations Included
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Find Your Ideal Rental{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Intelligently.
                </span>
              </h1>

              {/* Subdescription */}
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The modern renting platform utilizing cognitive matchmaking, verified map integration, and real-time chat. Seamlessly connect tenants and landlords without friction.
              </p>

              {/* Mock Search / CTA */}
              <div className="max-w-xl mx-auto lg:mx-0 bg-white p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 flex items-center gap-2 px-3.5">
                  <Search className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter city or area (e.g. Islamabad, Clifton)..."
                    className="w-full text-slate-800 text-sm outline-none placeholder-slate-400 font-semibold"
                    value={mockSearch}
                    onChange={(e) => setMockSearch(e.target.value)}
                  />
                </div>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl sm:rounded-2xl px-6 py-3 font-bold flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/15">
                    Start Searching
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600">{totalProperties || '12'}+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Rentals Listed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600">99.2%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Match Accuracy</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600">2.4k+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Happy Tenants</div>
                </div>
              </div>
            </div>

            {/* Hero Right (Premium Graphics & Interactive Device Mockup) */}
            <div className="lg:col-span-5 relative hidden md:block">
              {/* Outer Decorative Shape */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl transform rotate-3 scale-95 opacity-5 shadow-2xl" />
              
              {/* Main Graphic Container */}
              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Floating Widget 1: AI Match Score */}
                <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur px-4 py-3.5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Compatibility</div>
                    <div className="text-sm font-black text-slate-800">98% Perfect Match</div>
                  </div>
                </div>

                {/* Floating Widget 2: Map Location Marker */}
                <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur px-4 py-3.5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Map Verification</div>
                    <div className="text-sm font-black text-slate-800">Verified Coordinates</div>
                  </div>
                </div>

                {/* Graphic Visual Representation of Property Card */}
                <div className="rounded-2xl overflow-hidden relative group">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                    alt="Stunning Property Preview"
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                    <div className="space-y-1.5 text-white">
                      <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-extrabold uppercase">
                        Premium House
                      </span>
                      <h4 className="font-bold text-lg">Gulberg Greens, Islamabad</h4>
                      <p className="text-xs text-slate-200">PKR 145,000 / month</p>
                    </div>
                  </div>
                </div>

                {/* Micro details panel */}
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    Flexible Leases
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    Direct Messaging
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Core Platform Features</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Renting Made Intelligent & Painless
            </h3>
            <p className="text-base text-slate-500 leading-relaxed font-medium">
              We replace tedious listing searches with state-of-the-art tools designed specifically for college students, families, and busy landlords.
            </p>
          </div>

          {/* Grid of features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: AI Recommendation */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:bg-white hover:border-slate-200/60 transition-all duration-300 group space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform text-indigo-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">AI Compatibility Engine</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Provide your preferences (budget range, unit size, bedrooms, desired amenities) and our smart recommendation engine returns a custom list rated by compatibility.
              </p>
              <Link to="/services" className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                Learn how it works <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Feature 2: Interactive Location Pinning */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:bg-white hover:border-slate-200/60 transition-all duration-300 group space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform text-violet-600">
                <Compass className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Advanced Map View</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Landlords pin exact property coordinates on Google Maps during creation. Tenants can browse properties on a rich visual map layout, selecting markers instantly.
              </p>
              <Link to="/services" className="inline-flex items-center gap-1.5 text-violet-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                Explore coordinates <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Feature 3: Real-Time Chats */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:bg-white hover:border-slate-200/60 transition-all duration-300 group space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-fuchsia-50 flex items-center justify-center group-hover:scale-110 transition-transform text-fuchsia-600">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Real-Time Messaging</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Connect instantly through direct messaging. Landlords and tenants negotiate leases, ask details, and share terms without using external, unmonitored services.
              </p>
              <Link to="/services" className="inline-flex items-center gap-1.5 text-fuchsia-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                Learn about chat <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SECTION: TOGGLE USER ROLE AND SEE HOW THEY BENEFIT */}
      <section className="py-20 bg-slate-50/50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">Tailored Experiences</h3>
              <h4 className="text-3xl font-black text-slate-900 leading-tight">
                Designed for both Renters and Landlords
              </h4>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Toggle your role below to explore how HouseIntel simplifies your specific tasks and streamlines your renting goals.
              </p>
              
              {/* Role Toggle Selector */}
              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl max-w-xs border border-slate-300/40">
                <button
                  onClick={() => setActiveTab('tenant')}
                  className={`flex-1 py-3 text-center font-bold text-sm rounded-xl transition-all ${
                    activeTab === 'tenant'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  I'm a Tenant
                </button>
                <button
                  onClick={() => setActiveTab('landlord')}
                  className={`flex-1 py-3 text-center font-bold text-sm rounded-xl transition-all ${
                    activeTab === 'landlord'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  I'm a Landlord
                </button>
              </div>
            </div>

            {/* Right Interactive Card Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/70 p-8 shadow-xl shadow-slate-100 flex flex-col md:flex-row gap-8">
              {activeTab === 'tenant' ? (
                <>
                  <div className="flex-1 space-y-5">
                    <h5 className="text-xl font-bold text-indigo-600">Ultimate Renter Convenience</h5>
                    <ul className="space-y-4 text-sm font-semibold text-slate-600">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        AI matching cuts browsing time by 80%
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        Schedule lease moves & manage occupancy details
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        Read feedback & star reviews from prior tenants
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        Pay or negotiate via monitored agreements
                      </li>
                    </ul>
                    <Link to="/register" className="inline-block mt-4">
                      <Button className="bg-slate-900 text-white rounded-xl font-bold px-5 py-2.5 flex items-center gap-2 group">
                        Search Houses Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block w-48 h-48 bg-indigo-50 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80" 
                      alt="Happy Tenant" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 space-y-5">
                    <h5 className="text-xl font-bold text-violet-600">Powerful Property Management</h5>
                    <ul className="space-y-4 text-sm font-semibold text-slate-600">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        Upload multiple images directly to Cloudinary
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        Map coordinate selection during creation
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        Manage tenant occupancy & booking pipelines
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        Minimize vacancy time via AI suggestion feeds
                      </li>
                    </ul>
                    <Link to="/register" className="inline-block mt-4">
                      <Button className="bg-slate-900 text-white rounded-xl font-bold px-5 py-2.5 flex items-center gap-2 group">
                        List Your Rental <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block w-48 h-48 bg-violet-50 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=400&q=80" 
                      alt="Landlord Dashboard" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 4. SHOWCASE FEATURED PROPERTIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-16">
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Recent Listings</h2>
              <h3 className="text-3xl font-black text-slate-900">Explore Featured Rentals</h3>
            </div>
            <Link to="/login">
              <Button variant="outline" className="rounded-xl font-bold px-5 py-2.5 flex items-center gap-1.5 group">
                Browse Full Catalog <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedProperties.map((p) => (
              <div key={p._id || p.id} className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                
                {/* Image */}
                <div className="relative h-48 sm:h-52 overflow-hidden flex-shrink-0">
                  <img
                    src={getPropertyImage(p)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${TYPE_COLORS[getPropertyType(p)] || 'bg-slate-100 text-slate-700'}`}>
                      {getPropertyType(p)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-indigo-700 shadow-sm">
                    PKR {p.price.toLocaleString()}/mo
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-ellipsis overflow-hidden whitespace-nowrap">
                    <MapPin className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                    {p.location}
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1 mb-2">
                    {p.title}
                  </h4>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-4">
                    <span>{p.bedrooms} Beds</span>
                    <span className="text-slate-300">•</span>
                    <span>{p.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1 font-bold text-sm text-slate-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {getPropertyRating(p)}
                    </div>
                    <Link to="/login" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. BRAND STATEMENT / FINAL CTA */}
      <section className="py-24 bg-gradient-to-tr from-indigo-900 to-slate-950 text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/10 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8 relative">
          <h2 className="text-xs font-black tracking-widest text-indigo-400 uppercase">Interactive Prototyping</h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
            Ready to Experience the Difference?
          </h3>
          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create a mock account to test AI suggestions, chat system configurations, and real property coordinates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-2xl px-8 py-3.5 font-bold shadow-lg shadow-indigo-500/25">
                Register An Account
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl px-8 py-3.5 font-bold">
                Access Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
